import casbin
from uuid import UUID
from sqlalchemy.orm import Session
from server import crud
from server.utils.connect import SQLALCHEMY_DATABASE_URL
from server.utils.permissions.casbin_sqlalchemy_adaptor import Adapter
from server.models import Policy

adapter = Adapter(SQLALCHEMY_DATABASE_URL, db_class=Policy)
enforcer = casbin.Enforcer("server/utils/permissions/casbin_model.conf", adapter, True)


def enforce_action(db, user_id, workspace_id, resource, action):
    role = crud.user_role.get_user_role(db, user_id, workspace_id)
    policies = crud.role.get_role_policies(db, role.id)
    formatted_policies = [str(policy).split(", ")[1:] for policy in policies]

    try:
        enforcer.add_policies(formatted_policies)
        return enforcer.enforce(role.name, resource, action)

    except Exception as e:
        print("Permission enforcement error", e)
    finally:
        enforcer.remove_policies(formatted_policies)


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
