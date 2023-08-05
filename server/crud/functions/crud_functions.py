from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import Functions
from server.schemas.functions import CreateFunctions, UpdateFunctions


class CRUDFunctions(CRUDBase[Functions, CreateFunctions, UpdateFunctions]):
    pass


functions = CRUDFunctions(Functions)
