import casbin
from casbin import persist
from uuid import UUID
from sqlalchemy.orm import Session
from server import crud
from server.utils.connect import SQLALCHEMY_DATABASE_URL
from server.utils.permissions.casbin_sqlalchemy_adaptor import Adapter
from server.models import Policy

adapter = Adapter(SQLALCHEMY_DATABASE_URL, db_class=Policy)
enforcer = casbin.Enforcer("server/utils/permissions/casbin_model.conf", adapter, True)


def load_specific_policies(policies):
    for policy in policies:
        persist.load_policy_line(str(policy), enforcer.model)


def unload_specific_policies(policies):
    for policy in policies:
        unload_policy_line(str(policy), enforcer.model)


def enforce_action(db, user_id, workspace_id, resource, action):
    role = crud.user_role.get_user_role(db, user_id, workspace_id)
    formatted_policies = None
    try:
        if not role.is_default:
            policies = crud.role.get_role_policies(db, role.id)
            formatted_policies = [str(policy) for policy in policies]
            load_specific_policies(formatted_policies)
        loaded_policies = enforcer.get_policy()
        return enforcer.enforce(role.name, resource, action)

    except Exception as e:
        print("Permission enforcement error", e)
    finally:
        if formatted_policies:
            unload_specific_policies(formatted_policies)
        policies = enforcer.get_policy()


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
