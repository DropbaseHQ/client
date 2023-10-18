import secrets

from server import crud


def get_workspace_users(db, workspace_id):
    workspace_user = crud.workspace.get_workspace_users(db, workspace_id)
    return workspace_user


def get_workspace_groups(db, workspace_id):
    workspace_group = crud.workspace.get_workspace_groups(db, workspace_id)
    return workspace_group


def add_user_to_workspace(db, workspace_id, user_email, role_id):
    try:
        user = crud.user.get_user_by_email(db, user_email)
        if not user:
            raise Exception("User does not exist")
        workspace_user = crud.user_role.create(
            db,
            obj_in={"user_id": user.id, "workspace_id": workspace_id, "role_id": role_id},
            auto_commit=False,
        )

        target_role = crud.role.get_object_by_id_or_404(db, id=role_id)
        crud.policy.create(
            db,
            obj_in={
                "ptype": "g",
                "v0": user.id,
                "v1": target_role.name,
                "workspace_id": workspace_id,
            },
            auto_commit=False,
        )
        db.commit()
        return workspace_user
    except Exception as e:
        db.rollback()
        raise e


def add_token_to_workspace(db, workspace_id):
    try:
        workspace = crud.workspace.get_object_by_id_or_404(db, workspace_id)
        workspace.api_token = secrets.token_urlsafe(32)
        db.commit()
        return workspace.api_token
    except Exception as e:
        db.rollback()
        raise e
