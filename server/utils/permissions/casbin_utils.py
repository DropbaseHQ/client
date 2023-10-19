import casbin
from casbin import persist
from pathlib import Path
from uuid import UUID
from sqlalchemy.orm import Session
from server import crud
from server.utils.connect import SQLALCHEMY_DATABASE_URL
from server.utils.permissions.casbin_sqlalchemy_adaptor import Adapter
from server.models import Policy

adapter = Adapter(SQLALCHEMY_DATABASE_URL, db_class=Policy)
enforcer = casbin.Enforcer(
    str(Path(__file__).parent.absolute().joinpath("./casbin_model.conf")), adapter, True
)
enforcer.auto_build_role_links = True


def load_specific_policies(policies):
    for policy in policies:
        try:
            persist.load_policy_line(str(policy), enforcer.model)
        except Exception as e:
            print("Error loading policy", e)


def unload_specific_policies(policies):
    for policy in policies:
        unload_policy_line(str(policy), enforcer.model)


def get_contexted_enforcer(db, workspace_id):
    # Refreshes policy. Allows dynamic policy changes while deployed.
    enforcer.load_policy()

    # Load workspace policies
    policies = crud.workspace.get_workspace_policies(db, workspace_id)
    formatted_policies = [str(policy).split(", ")[1:] for policy in policies]
    enforcer.add_policies(formatted_policies)
    # load_specific_policies(formatted_policies)

    # Load grouping policies
    grouping_policies = crud.workspace.get_workspace_grouping_policies(db, workspace_id)
    formatted_groups = [str(g_policy).split(", ")[1:] for g_policy in grouping_policies]
    enforcer.add_grouping_policies(formatted_groups)

    return enforcer


def enforce_action(db, user_id, workspace_id, resource, action, resource_crud, resource_id=None):
    enforcer = get_contexted_enforcer(db, workspace_id)

    try:
        if resource_id:
            # Check if user has permission to perform action on specific resource
            if enforcer.enforce(str(user_id), resource_id, action):
                return True
            # Check if user has permission to perform action parent app
            if hasattr(resource_crud, "get_app_id"):
                app_id = resource_crud.get_app_id(db, resource_id)
                if enforcer.enforce(str(user_id), str(app_id), action):
                    return True

        # Check if user themselves has permission to perform action on resource
        if enforcer.enforce(str(user_id), resource, action):
            return True

        # role = crud.user_role.get_user_role(db, user_id, workspace_id)
        # return enforcer.enforce(role.name, resource, action)
        return False
    except Exception as e:
        print("Permission enforcement error", e)
    # finally:
    #     if formatted_policies:
    #         unload_specific_policies(formatted_policies)


def add_policy(db: Session, role_id: UUID, resource, action):
    policy = Policy(role_id=role_id, resource=resource, action=action)
    db.add(policy)
    db.commit()
    return policy


def update_policy(db, policy_id, role=None, resource=None, action=None):
    policy: Policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if role:
        policy.v0 = role
    if resource:
        policy.v1 = resource
    if action:
        policy.v2 = action
    db.commit()
    return policy


def unload_policy_line(line, model):
    """unloads a text line by removing a policy rule from the model."""

    if line == "":
        return

    if line[:1] == "#":
        return

    stack = []
    tokens = []
    for c in line:
        if c == "[" or c == "(":
            stack.append(c)
            tokens[-1] += c
        elif c == "]" or c == ")":
            stack.pop()
            tokens[-1] += c
        elif c == "," and len(stack) == 0:
            tokens.append("")
        else:
            if len(tokens) == 0:
                tokens.append(c)
            else:
                tokens[-1] += c

    tokens = [x.strip() for x in tokens]

    key = tokens[0]
    sec = key[0]

    if sec not in model.model.keys():
        return

    if key not in model.model[sec].keys():
        return

    policy_to_remove = tokens[1:]

    # Find and remove the policy rule from the model's memory
    try:
        model.model[sec][key].policy.remove(policy_to_remove)
    except ValueError:
        # Handle the case where the policy rule is not found
        pass
