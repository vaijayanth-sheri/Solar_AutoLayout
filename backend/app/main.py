from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import exports, inverters, layout, modules, yield_routes

app = FastAPI(title="Solar Auto Layout API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(layout.router, prefix="/api")
app.include_router(yield_routes.router, prefix="/api")
app.include_router(inverters.router, prefix="/api")
app.include_router(modules.router, prefix="/api")
app.include_router(exports.router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
