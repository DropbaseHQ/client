from server import crud


def get_workspace_users(db, workspace_id):
    workspace_user = crud.workspace.get_workspace_users(db, workspace_id)
    return workspace_user


def get_workspace_groups(db, workspace_id):
    workspace_group = crud.workspace.get_workspace_groups(db, workspace_id)
    return workspace_group


def add_user_to_workspace(db, workspace_id, user_email, role_id):
    user = crud.user.get_user_by_email(db, user_email)
    if not user:
        raise Exception("User does not exist")
    workspace_user = crud.user_role.create(
        db, obj_in={"user_id": user.id, "workspace_id": workspace_id, "role_id": role_id}
    )
    return workspace_user
