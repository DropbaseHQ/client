from sqlalchemy.orm import Session
from server.models import Policy, UserGroup
from server.schemas import PolicyTemplate
from server.schemas.group import (
    AddGroupPolicyRequest,
    RemoveGroupPolicyRequest,
    UpdateGroupPolicyRequest,
)

from server.utils.permissions.casbin_utils import get_contexted_enforcer
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
            db.query(Policy).filter(
                Policy.ptype == "g", Policy.v0 == str(user_id), Policy.v1 == str(group.id)
            ).filter(Policy.workspace_id == str(group.workspace_id)).delete()

            # Remove the user from the group in user_group table
            db.query(UserGroup).filter(
                UserGroup.user_id == str(user_id), UserGroup.group_id == str(group.id)
            ).delete()

            db.commit()

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def add_policies(db: Session, group_id: str, request: AddGroupPolicyRequest):
        group = crud.group.get_object_by_id_or_404(db, id=group_id)
        try:
            # Add policies to policy table
            for policy in request.policies:
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
    def remove_policies(db: Session, group_id: str, request: RemoveGroupPolicyRequest):
        group = crud.group.get_object_by_id_or_404(db, id=group_id)
        try:
            # Remove policies from policy table
            for policy in request.policies:
                db.query(Policy).filter(
                    Policy.v1 == str(group.id),
                    Policy.v2 == policy.resource,
                    Policy.v3 == policy.action,
                ).filter(Policy.workspace_id == str(group.workspace_id)).delete()

            db.commit()

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def update_policy(db: Session, group_id: str, request: UpdateGroupPolicyRequest):
        group = crud.group.get_object_by_id_or_404(db, id=group_id)
        try:
            # Query if the policy exists in the policy table
            existing_policy = (
                db.query(Policy)
                .filter(
                    Policy.ptype == "p",
                    Policy.v1 == str(group.id),
                    Policy.v2 == request.resource,
                    Policy.v3 == request.action,
                )
                .filter(Policy.workspace_id == str(group.workspace_id))
                .one_or_none()
            )
            if existing_policy and request.effect == "deny":
                # Remove the policy from the policy table
                db.query(Policy).filter(
                    Policy.v1 == str(group.id),
                    Policy.v2 == request.resource,
                    Policy.v3 == request.action,
                ).filter(Policy.workspace_id == str(group.workspace_id)).delete()

            elif not existing_policy and request.effect == "allow":
                # Add the policy to the policy table
                crud.policy.create(
                    db,
                    obj_in=Policy(
                        ptype="p",
                        v0=10,
                        v1=group.id,
                        v2=request.resource,
                        v3=request.action,
                        workspace_id=group.workspace_id,
                    ),
                    auto_commit=False,
                )

            db.commit()
            return {"message": "success"}
        except Exception as e:
            db.rollback()
            raise e


def get_group(db: Session, group_id: str):
    """Returns all permissions for a group."""
    group = crud.group.get_object_by_id_or_404(db, id=group_id)
    enforcer = get_contexted_enforcer(db, group.workspace_id)
    permissions = enforcer.get_filtered_policy(1, str(group.id))
    formatted_permissions = []
    for permission in permissions:
        formatted_permissions.append(
            {
                "group_id": permission[1],
                "resource": permission[2],
                "action": permission[3],
            }
        )
    return {"group": group, "permissions": formatted_permissions}


def delete_group(db: Session, group_id: str):
    try:
        # Delete user group associations
        db.query(UserGroup).filter(UserGroup.group_id == str(group_id)).delete()

        # Delete group policies
        db.query(Policy).filter(Policy.v1 == str(group_id)).delete()

        # Delete group
        crud.group.remove(db, id=str(group_id), auto_commit=False)

        db.commit()
    except Exception as e:
        db.rollback
        raise e
