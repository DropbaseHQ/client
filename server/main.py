from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from server import endpoints
from server.utils.exception_handlers import catch_exceptions_middleware

load_dotenv()


app = FastAPI()

# app.middleware("http")(catch_exceptions_middleware)

# origins = ["https://dropbase.io"]
origins = ["*"]


### ROUTES ###

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.source_router)
app.include_router(endpoints.user_router)
app.include_router(endpoints.role_router)
app.include_router(endpoints.workspace_router)
app.include_router(endpoints.app_router)
app.include_router(endpoints.sqls_router)
app.include_router(endpoints.functions_router)
app.include_router(endpoints.components_router)
app.include_router(endpoints.table_router)
app.include_router(endpoints.task_router)


@app.get("/")
async def root():
    return {"message": "Dropbase backend 0.1"}
