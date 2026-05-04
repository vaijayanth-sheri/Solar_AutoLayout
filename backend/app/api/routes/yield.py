from fastapi import APIRouter, HTTPException
import requests

from app.models.schemas import YieldRequest, YieldResult
from app.services.yield_engine import estimate_yield

router = APIRouter(prefix="/yield", tags=["yield"])


@router.post("/estimate", response_model=YieldResult)
def estimate_yield_endpoint(payload: YieldRequest):
    location = payload.location
    if not location:
        raise HTTPException(status_code=400, detail="Location is required for yield estimation.")
    try:
        annual, monthly = estimate_yield(location.lat, location.lon, payload.layout.systemSizeKw)
        return YieldResult(annualKwh=annual, monthlyKwh=monthly)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="PVGIS request failed.") from exc
