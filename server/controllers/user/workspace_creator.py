import secrets
from sqlalchemy.orm import Session
from server.schemas.workspace import CreateWorkspace
from server.schemas.user_role import CreateUserRole
from server.models import Policy, Token

from server import crud


class WorkspaceCreator:
    admin_role_id = "00000000-0000-0000-0000-000000000001"
    workspace_id = None

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = str(user_id)

    def _create_workspace(self, workspace_name: str = "workspace1"):
        workspace_obj = CreateWorkspace(
            name=workspace_name,
            active=True,
        )
        workspace = crud.workspace.create(
            db=self.db, obj_in=workspace_obj, auto_commit=False
        )
        self.db.flush()
        self.workspace_id = workspace.id
        return workspace

    def _create_user_role(self):
        role_obj = CreateUserRole(
            user_id=self.user_id,
            workspace_id=self.workspace_id,
            role_id=self.admin_role_id,
        )
        default_admin_role = crud.user_role.create(
            self.db, obj_in=role_obj, auto_commit=False
        )
        self.db.flush()

        return default_admin_role

    def _create_default_user_policies(self, admin_role_id: str):
        admin_role = crud.role.get(self.db, id=admin_role_id)
        return crud.policy.create(
            self.db,
            obj_in=Policy(
                ptype="g",
                v0=self.user_id,
                v1=admin_role.name,
                workspace_id=self.workspace_id,
            ),
            auto_commit=False,
        )

    def _create_demo_app(self):
        demo_app = crud.app.create(
            self.db,
            obj_in={
                "name": "demo",
                "workspace_id": self.workspace_id,
                "is_draft": False,
            },
            auto_commit=False,
        )
        self.db.flush()
        demo_page = crud.page.create(
            self.db,
            obj_in={
                "name": "page1",
                "app_id": demo_app.id,
            },
            auto_commit=False,
        )
        self.db.flush()
        crud.files.create(
            self.db,
            obj_in={
                "name": "data",
                "page_id": demo_page.id,
                "type": "data_fetcher",
            },
            auto_commit=False,
        )
        self.db.flush()
        table_property = {"name": "table1", "code": "", "type": "postgres"}
        crud.tables.create(
            self.db,
            obj_in={
                "name": "table1",
                "page_id": demo_page.id,
                "property": table_property,
            },
            auto_commit=False,
        )

        return demo_app

    def _create_token(self):
        token = secrets.token_urlsafe(32)
        new_token = crud.token.create(
            self.db,
            obj_in={
                "token": token,
                "name": "default",
                "user_id": self.user_id,
                "workspace_id": self.workspace_id,
            },
            auto_commit=False,
        )
        self.db.flush()
        return new_token

    def _update_workspace_token(self, token: Token):
        crud.token.reset_workspace_selected_token(
            self.db, workspace_id=self.workspace_id
        )
        crud.token.update_by_pk(
            self.db, pk=token.id, obj_in={"is_selected": True}, auto_commit=False
        )

    def create(self, workspace_name: str = None, auto_commit: bool = False):
        try:
            workspace = self._create_workspace()
            admin_role = self._create_user_role()
            self._create_default_user_policies(admin_role_id=admin_role.role_id)
            self._create_demo_app()
            token = self._create_token()
            self._update_workspace_token(token=token)
            if auto_commit:
                self.db.commit()
            return workspace
        except Exception as e:
            self.db.rollback()
            raise e
