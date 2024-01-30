from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_jwt_auth.exceptions import AuthJWTException

from server import endpoints
from server.endpoints import worker as worker_routers
from server.utils.authentication import get_current_user

# from server.utils.exception_handlers import catch_exceptions_middleware

load_dotenv()


app = FastAPI()
worker_app = FastAPI()
worker_app.include_router(worker_routers.misc_router)
worker_app.include_router(worker_routers.worker_status_router)


app.mount("/worker", worker_app)


# app.middleware("http")(catch_exceptions_middleware)

# origins = ["https://dropbase.io"]
# origins = ["*"]
origins = [
    "http://127.0.0.1:3030",
    "https://dev.dropbase.io",
    "https://www.dev.dropbase.io",
    "http://localhost:3030",
    "http://www.localhost:3030",
]

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

app.include_router(endpoints.user_router)
app.include_router(endpoints.group_router)
app.include_router(endpoints.token_router)
app.include_router(require_authentication_routes)


@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(_: Request, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/")
async def root():
    return {"message": "Dropbase backend 0.2.0"}
