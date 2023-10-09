from sqlalchemy.orm import Session
from server.models import Policy
from server.schemas import PolicyTemplate
from server import crud
from typing import List


class GroupController:
    """Controls group CRUD operations.
    We use a class for this because we cannot just use the crud functions for user_group.
    To allow efficient permission checking, we need to give casbin information about what a user
    inherits. This means we need to add/update/delete "g" type policies to our policy table whenever
    we add/update/delete a user_group.
    """

    @staticmethod
    def add_user(db: Session, group_id: str, user_id: str):
        group = crud.group.get_object_by_id_or_404(db, id=group_id)
        try:
            # Are there any existing user_group policies for this user in this workspace IN the policy table?
            existing_group_policy = (
                db.query(Policy)
                .filter(Policy.ptype == "g", Policy.v0 == str(user_id), Policy.v1 == str(group.id))
                .filter(Policy.workspace_id == str(group.workspace_id))
                .one_or_none()
            )
            if not existing_group_policy:
                # If not, create one
                crud.policy.create(
                    db,
                    obj_in=Policy(
                        ptype="g",
                        v0=str(user_id),
                        v1=group.id,
                        workspace_id=group.workspace_id,
                    ),
                    auto_commit=False,
                )

            # Add the user to the group
            crud.user_group.create(
                db,
                obj_in={"user_id": user_id, "group_id": group_id},
                auto_commit=False,
            )

            db.commit()

        except Exception as e:
            db.rollback()
            print("error", e)
            raise e

    @staticmethod
    def remove_user(db: Session, group_id: str, user_id: str):
        group = crud.group.get_object_by_id_or_404(db, id=group_id)
        try:
            # Remove the user from the group in policy table
            crud.policy.remove(
                db,
                obj_in=Policy(
                    ptype="g",
                    v0=user_id,
                    v1=group.id,
                    workspace_id=group.workspace_id,
                ),
                auto_commit=False,
            )

            # Remove the user from the group in user_group table
            crud.user_group.remove(
                db,
                obj_in={"user_id": user_id, "group_id": group_id},
                auto_commit=False,
            )

            db.rollback()

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def add_policies(db: Session, group_id: str, policies: List[PolicyTemplate]):
        group = crud.group.get_object_by_id_or_404(db, id=group_id)
        try:
            # Add policies to policy table
            for policy in policies:
                crud.policy.create(
                    db,
                    obj_in=Policy(
                        ptype="p",
                        v0=10,
                        v1=group.id,
                        v2=policy.resource,
                        v3=policy.action,
                        workspace_id=group.workspace_id,
                    ),
                    auto_commit=False,
                )

            db.commit()

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def remove_policies(db: Session, group_id: str, policies: List[PolicyTemplate]):
        group = crud.group.get_object_by_id_or_404(db, id=group_id)
        try:
            # Remove policies from policy table
            for policy in policies:
                db.query(Policy).filter(
                    Policy.v1 == str(group.id),
                    Policy.v2 == policy.resource,
                    Policy.v3 == policy.action,
                ).filter(Policy.workspace_id == str(group.workspace_id)).delete()

            db.commit()

        except Exception as e:
            db.rollback()
            raise e
