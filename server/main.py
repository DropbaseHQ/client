from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from server import endpoints

load_dotenv()

app = FastAPI()

origins = ["/"]
origins.extend(["*"])


### ROUTES ###

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.source_router)


@app.get("/")
async def root():
    return {"message": "Dropmail backend 0.1"}
