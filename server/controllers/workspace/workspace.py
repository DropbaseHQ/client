from server import crud


def get_workspace_users(db, workspace_id):
    workspace_user = crud.workspace.get_workspace_users(db, workspace_id)
    return workspace_user


def get_workspace_groups(db, workspace_id):
    workspace_group = crud.workspace.get_workspace_groups(db, workspace_id)
    return workspace_group
