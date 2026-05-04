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
        ac_kw = 0.0
        if payload.inverter and payload.inverter.acPowerW:
            ac_kw = payload.inverter.acPowerW / 1000
        return estimate_yield(
            lat=location.lat, 
            lon=location.lon, 
            system_kw=payload.layout.systemSizeKw,
            tilt=payload.constraints.tilt,
            azimuth=payload.constraints.azimuth,
            system_loss=payload.constraints.systemLossPercent,
            albedo=payload.constraints.albedo,
            ac_kw=ac_kw
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="PVGIS request failed.") from exc
