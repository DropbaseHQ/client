from sqlalchemy.orm import Session
from typing import Protocol
from server.utils.authorization import resource_query_mapper
from server.models import Policy, UserGroup, User
from server.constants import ALLOWED_ACTIONS
from server import crud


class UpdatePolicyRequest(Protocol):
    resource: str
    action: str


class PolicyUpdater:
    def __init__(
        self,
        db: Session,
        subject_id: str,
        workspace_id: str,
        request: UpdatePolicyRequest,
    ):
        self.db = db
        self.subject_id = subject_id
        self.request = request
        self.workspace_id = workspace_id

    def get_existing_policies(self):
        # Query if the policy exists in the policy table
        existing_policies: list[Policy] = (
            self.db.query(Policy)
            .filter(
                Policy.ptype == "p",
                Policy.v1 == str(self.subject_id),
                Policy.v2 == self.request.resource,
            )
            .filter(Policy.workspace_id == str(self.workspace_id))
            .all()
        )
        return existing_policies

    def remove_existing_policies(self):
        return (
            self.db.query(Policy)
            .filter(
                Policy.v1 == str(self.subject_id),
                Policy.v2 == self.request.resource,
            )
            .filter(Policy.workspace_id == self.workspace_id)
            .delete()
        )

    def remove_disallowed_actions(
        self, existing_policies: list[Policy], updated_list_of_actions: list[str]
    ):
        for policy in existing_policies:
            if policy.v3 not in updated_list_of_actions:
                crud.policy.remove(self.db, id=policy.id, auto_commit=False)

    def _add_policy(self, action: str):
        crud.policy.create(
            self.db,
            obj_in=Policy(
                ptype="p",
                v0=10,
                v1=str(self.subject_id),
                v2=str(self.request.resource),
                v3=action,
                workspace_id=self.workspace_id,
            ),
            auto_commit=False,
        )

    def add_diff_policies(self, updated_list_of_actions: list[str], stored_actions: list[str]):
        print("updated_list_of_actions", updated_list_of_actions)
        print("stored_actions", stored_actions)
        for action in updated_list_of_actions:
            if action not in stored_actions:
                self._add_policy(action)

    def add_new_policies(self, updated_list_of_actions: list[str]):
        for action in updated_list_of_actions:
            self._add_policy(action)

    def update_policy(self):
        try:
            existing_policies = self.get_existing_policies()
            updated_list_of_actions = ALLOWED_ACTIONS[ALLOWED_ACTIONS.index(self.request.action) :]

            if existing_policies:
                # Remove all policies if the action is none
                if self.request.action == "none":
                    self.remove_existing_policies()

                # Update the action if the action is not none
                elif self.request.action in ALLOWED_ACTIONS:
                    stored_actions = [policy.v3 for policy in existing_policies]

                    self.remove_disallowed_actions(existing_policies, updated_list_of_actions)
                    self.add_diff_policies(updated_list_of_actions, stored_actions)
            else:
                # Create a new policy if the action is not none and there is no existing policy
                if self.request.action in ALLOWED_ACTIONS:
                    self.add_new_policies(updated_list_of_actions)
            self.db.commit()
            return {"message": "Policy updated!"}
        except Exception as e:
            self.db.rollback()
            raise e
