from fastapi import APIRouter, Depends

from server.utils.authorization import RESOURCES, AuthZDepFactory

source_authorizer = AuthZDepFactory(default_resource_type=RESOURCES.SOURCE)

router = APIRouter(prefix="/source", tags=["source"], dependencies=[Depends(source_authorizer)])


@router.get("/")
def get_sources():
    # get source list from worker
    pass
