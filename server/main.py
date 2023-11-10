from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_jwt_auth.exceptions import AuthJWTException

from server import endpoints
from server.endpoints import worker as worker_routers
from server.utils.authentication import get_current_user
from server.utils.exception_handlers import catch_exceptions_middleware

load_dotenv()


app = FastAPI()
worker_app = FastAPI()
worker_app.include_router(worker_routers.app_router)
worker_app.include_router(worker_routers.table_router)
worker_app.include_router(worker_routers.misc_router)
worker_app.include_router(worker_routers.file_router)
worker_app.include_router(worker_routers.widget_router)
worker_app.include_router(worker_routers.components_router)
worker_app.include_router(worker_routers.sync_router)


app.mount("/worker", worker_app)


# app.middleware("http")(catch_exceptions_middleware)

# origins = ["https://dropbase.io"]
origins = [
    "http://127.0.0.1:3000",
    "https://dev.dropbase.io",
    "https://www.dev.dropbase.io",
    "http://localhost:3000",
    "http://www.localhost:3000",
]


### ROUTES ###

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

require_authentication_routes = APIRouter(dependencies=[Depends(get_current_user)])
require_authentication_routes.include_router(endpoints.role_router)
require_authentication_routes.include_router(endpoints.workspace_router)
require_authentication_routes.include_router(endpoints.app_router)
require_authentication_routes.include_router(endpoints.page_router)
require_authentication_routes.include_router(endpoints.columns_router)

app.include_router(endpoints.user_router)
app.include_router(endpoints.group_router)
app.include_router(endpoints.token_router)
app.include_router(endpoints.widget_router)
app.include_router(endpoints.components_router)
app.include_router(endpoints.tables_router)
app.include_router(endpoints.files_router)
app.include_router(require_authentication_routes)


@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(_: Request, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/")
async def root():
    return {"message": "Dropbase backend 0.1"}
