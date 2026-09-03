from fastapi import FastAPI

from .config import Settings
from .correlation import CorrelationMiddleware
from .health import router as health_router
from .logging_config import configure_logging


settings = Settings()
configure_logging(settings.log_level)

app = FastAPI(title="LostLink AI Inference Service", version="0.0.0")
app.add_middleware(CorrelationMiddleware)
app.include_router(health_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        log_config=None,
    )
