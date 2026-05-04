from fastapi import APIRouter, HTTPException
import requests

from app.models.schemas import LayoutRequest, LayoutResult
from app.services.layout import generate_layout

router = APIRouter(prefix="/layout", tags=["layout"])


@router.post("/generate", response_model=LayoutResult)
def generate_layout_endpoint(payload: LayoutRequest):
    try:
        return generate_layout(payload.drawing, payload.sizing, payload.module, payload.constraints)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="PVGIS request failed.") from exc
