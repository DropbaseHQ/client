from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_jwt_auth.exceptions import AuthJWTException

from server import endpoints
from server.utils.authentication import get_current_user
from server.utils.exception_handlers import catch_exceptions_middleware

load_dotenv()


app = FastAPI()

# app.middleware("http")(catch_exceptions_middleware)

# origins = ["https://dropbase.io"]
origins = ["http://127.0.0.1:3000", "https://dev.dropbase.io", "http://localhost:3000"]


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
require_authentication_routes.include_router(endpoints.widget_router)
require_authentication_routes.include_router(endpoints.tables_router)
require_authentication_routes.include_router(endpoints.columns_router)
require_authentication_routes.include_router(endpoints.functions_router)
require_authentication_routes.include_router(endpoints.components_router)
require_authentication_routes.include_router(endpoints.task_router)

app.include_router(endpoints.user_router)
app.include_router(require_authentication_routes)


@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(_: Request, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/")
async def root():
    return {"message": "Dropbase backend 0.1"}
