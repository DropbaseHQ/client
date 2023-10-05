from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.controllers.functions import get_ui_functions
from server.schemas.functions import CreateFunctions, UpdateFunctions
from server.utils.authorization import RESOURCES, AuthZDepFactory
from server.utils.connect import get_db


function_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.FUNCTIONS)
router = APIRouter(
    prefix="/functions",
    tags=["functions"],
    dependencies=[Depends(function_authorizer)],
)


@router.get("/{functions_id}")
def get_functions(functions_id: UUID, db: Session = Depends(get_db)):
    return crud.functions.get_object_by_id_or_404(db, id=functions_id)


# We overwrite the default resource type here because only page_id is available in the request body
@router.post("/", dependencies=[Depends(function_authorizer.use_params(resource_type=RESOURCES.PAGE))])
def create_functions(request: CreateFunctions, db: Session = Depends(get_db)):
    if request.name is None:
        page_funcs = crud.functions.get_page_functions(db, page_id=request.page_id)
        request.name = "function " + str(len(page_funcs) + 1)
    if request.code is None:
        request.code = """def action() -> State:
    state.widget.customer.message = "Hello world!
    return state"""
    return crud.functions.create(db, obj_in=request)


@router.put("/{functions_id}")
def update_functions(functions_id: UUID, request: UpdateFunctions, db: Session = Depends(get_db)):
    return crud.functions.update_by_pk(db=db, pk=functions_id, obj_in=request)


@router.delete("/{functions_id}")
def delete_functions(functions_id: UUID, db: Session = Depends(get_db)):
    return crud.functions.remove(db, id=functions_id)


# TODO: Does it make more sense to put these in the page endpoint?
@router.get(
    "/page/{page_id}",
    dependencies=[Depends(function_authorizer.use_params(resource_type=RESOURCES.PAGE))],
)
def get_page_functions(page_id: UUID, db: Session = Depends(get_db)):
    return crud.functions.get_page_functions(db, page_id=page_id)


@router.get(
    "/page/ui/{page_id}",
    dependencies=[Depends(function_authorizer.use_params(resource_type=RESOURCES.PAGE))],
)
def get_page_ui_functions(page_id: UUID, db: Session = Depends(get_db)):
    return get_ui_functions(db, page_id=page_id)
