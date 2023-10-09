from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.group import CreateGroup, UpdateGroup, AddUser, RemoveUser
from server.schemas import PolicyTemplate
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db
from server.controllers.group import GroupController


group_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.WORKSPACE)

router = APIRouter(prefix="/group", tags=["group"])


@router.get("/{group_id}")
def get_group(group_id: UUID, db: Session = Depends(get_db)):
    return crud.group.get_object_by_id_or_404(db, id=group_id)


@router.post("/")
def create_group(request: CreateGroup, db: Session = Depends(get_db)):
    return crud.group.create(db, obj_in=request)


@router.put("/{group_id}")
def update_group(group_id: UUID, request: UpdateGroup, db: Session = Depends(get_db)):
    return crud.group.update_by_pk(db, pk=group_id, obj_in=request)


@router.delete("/{group_id}")
def delete_group(group_id: UUID, db: Session = Depends(get_db)):
    return crud.group.remove(db, id=group_id)


@router.post("/add_user/{group_id}")
def add_user_to_group(group_id: UUID, request: AddUser, db: Session = Depends(get_db)):
    return GroupController.add_user(db, group_id, request.user_id)


@router.post("/remove_user/{group_id}")
def remove_user_from_group(group_id: UUID, request: RemoveUser, db: Session = Depends(get_db)):
    return GroupController.remove_user(db, group_id, request.user_id)


@router.post("/add_policies/{group_id}")
def add_policies_to_group(group_id: UUID, policies: List[PolicyTemplate], db: Session = Depends(get_db)):
    return GroupController.add_policies(db, group_id, policies)


@router.post("/remove_policies/{group_id}")
def remove_policies_from_group(
    group_id: UUID, policies: List[PolicyTemplate], db: Session = Depends(get_db)
):
    return GroupController.remove_policies(db, group_id, policies)
