from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server import endpoints

load_dotenv()


app = FastAPI()


origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]


### ROUTES ###

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.tunnel_router)


@app.get("/")
async def root():
    return {"message": "Dropbase worker proxy backend"}
