from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from server import endpoints
from server.utils.exception_handlers import catch_exceptions_middleware
from server.utils.auth import get_current_user

load_dotenv()


app = FastAPI()

# app.middleware("http")(catch_exceptions_middleware)

# origins = ["https://dropbase.io"]
origins = ["http://127.0.0.1:3000"]


### ROUTES ###

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

require_authentication_routes = APIRouter(dependencies=[Depends(get_current_user)])
require_authentication_routes.include_router(endpoints.source_router)
require_authentication_routes.include_router(endpoints.role_router)
require_authentication_routes.include_router(endpoints.workspace_router)
require_authentication_routes.include_router(endpoints.app_router)
require_authentication_routes.include_router(endpoints.page_router)
require_authentication_routes.include_router(endpoints.action_router)
require_authentication_routes.include_router(endpoints.sqls_router)
require_authentication_routes.include_router(endpoints.functions_router)
require_authentication_routes.include_router(endpoints.components_router)
require_authentication_routes.include_router(endpoints.table_router)
require_authentication_routes.include_router(endpoints.task_router)

app.include_router(endpoints.user_router)
app.include_router(require_authentication_routes)


@app.get("/")
async def root():
    return {"message": "Dropbase backend 0.1"}
