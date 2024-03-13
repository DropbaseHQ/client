import logging
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_jwt_auth.exceptions import AuthJWTException

from server import endpoints
from server.endpoints import worker as worker_routers
from server.utils.authentication import get_current_user, verify_worker_token

load_dotenv()

spam_urls = ["/health/", "/health"]


class LogSpamFilter(logging.Filter):
    def filter(self, record):
        for url in spam_urls:
            if url in record.args:
                return False
        return True


logger = logging.getLogger("uvicorn.access")
logger.addFilter(LogSpamFilter())

app = FastAPI()
worker_app = FastAPI()

require_token_routes = APIRouter(dependencies=[Depends(verify_worker_token)])
require_token_routes.include_router(worker_routers.misc_router)
require_token_routes.include_router(worker_routers.app_router)
require_token_routes.include_router(worker_routers.page_router)
worker_app.include_router(worker_routers.worker_status_router)
worker_app.include_router(require_token_routes)

app.mount("/worker", worker_app)

origins = ["*"]

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
app.include_router(endpoints.url_mapping_router)
app.include_router(endpoints.app_router)
app.include_router(require_authentication_routes)


@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(_: Request, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/")
async def root():
    return {"message": "Dropbase backend 0.2.0"}
