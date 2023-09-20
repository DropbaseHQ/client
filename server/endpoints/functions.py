from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server import crud
from server.schemas.functions import CreateFunctions, UpdateFunctions
from server.utils.authorization import RESOURCES, generate_resource_dependency
from server.utils.connect import get_db

authorize_functions_actions = generate_resource_dependency(RESOURCES.FUNCTIONS)
router = APIRouter(
    prefix="/functions", tags=["functions"], dependencies=[Depends(authorize_functions_actions)]
)


@router.get("/{functions_id}")
def get_functions(functions_id: UUID, db: Session = Depends(get_db)):
    return crud.functions.get_object_by_id_or_404(db, id=functions_id)


@router.post("/")
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


@router.get("/page/{page_id}")
def get_page_functions(page_id: UUID, db: Session = Depends(get_db)):
    return crud.functions.get_page_functions(db, page_id=page_id)
