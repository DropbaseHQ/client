import casbin
from server import crud
from server.utils.connect import SQLALCHEMY_DATABASE_URL
from server.utils.casbin_sqlalchemy_adaptor import Adapter
from server.models import Policy

adapter = Adapter(SQLALCHEMY_DATABASE_URL, db_class=Policy)
enforcer = casbin.Enforcer("server/utils/casbin_model.conf", adapter, True)


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
