from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import UserRole, Workspace, Policy, Group, User, Role
from server.schemas.workspace import CreateWorkspace, UpdateWorkspace


class CRUDWorkspace(CRUDBase[Workspace, CreateWorkspace, UpdateWorkspace]):
    def get_user_workspaces(self, db: Session, user_id: UUID) -> List[Workspace]:
        return (
            db.query(Workspace)
            .join(UserRole, UserRole.workspace_id == Workspace.id)
            .filter(UserRole.user_id == user_id)
            .all()
        )

    def get_workspace_id(self, db: Session, workspace_id: UUID) -> str:
        return (db.query(Workspace.id).filter(Workspace.id == workspace_id).one()).id

    def get_workspace_policies(self, db: Session, workspace_id: UUID):
        return (
            db.query(Policy)
            .filter(Policy.workspace_id == workspace_id)
            .filter(Policy.ptype.startswith("p"))
            .all()
        )

    def get_workspace_grouping_policies(self, db: Session, workspace_id: UUID):
        return (
            db.query(Policy)
            .filter(Policy.workspace_id == workspace_id)
            .filter(Policy.ptype.startswith("g"))
            .all()
        )

    # def get_workspace_users(self, db: Session, workspace_id: UUID):
    #     sql = """
    #         SELECT
    #             u.id AS user_id,
    #             u.email,
    #             r.name AS role_name,
    #             ARRAY_AGG(DISTINCT g.id) AS group_ids,
    #             ARRAY_AGG(DISTINCT g.name) AS group_names
    #         FROM "user" AS u
    #         LEFT JOIN user_role AS ur ON u.id = ur.user_id
    #         LEFT JOIN role AS r ON ur.role_id = r.id
    #         LEFT JOIN "user_group" AS ug ON u.id = ug.user_id
    #         LEFT JOIN "group" AS g ON ug.group_id = g.id
    #         WHERE ur.workspace_id = :workspace_id
    #         AND g.workspace_id = :workspace_id
    #         GROUP BY u.id, u.email, r.name
    #     """
    #     return db.execute(sql, {"workspace_id": workspace_id}).all()
    def get_workspace_users(self, db: Session, workspace_id: UUID):
        return (
            db.query(User)
            .join(UserRole, UserRole.user_id == User.id)
            .join(Role, Role.id == UserRole.role_id)
            .filter(UserRole.workspace_id == workspace_id)
            .with_entities(User.id, User.email, User.name, Role.name.label("role_name"))
            .all()
        )

    def get_workspace_groups(self, db: Session, workspace_id: UUID):
        return db.query(Group).filter(Group.workspace_id == workspace_id).all()

    def get_oldest_user(self, db: Session, workspace_id: UUID):
        return (
            db.query(UserRole)
            .join(User, User.id == UserRole.user_id)
            .filter(UserRole.workspace_id == workspace_id)
            .order_by(UserRole.date)
            .with_entities(User.id, User.email)
            .first()
        )


workspace = CRUDWorkspace(Workspace)
