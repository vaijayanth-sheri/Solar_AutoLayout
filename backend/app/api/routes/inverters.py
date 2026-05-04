from fastapi import APIRouter, HTTPException

from app.models.schemas import InverterSelection, InverterSuggestRequest
from app.services.inverter import suggest_inverter, get_inverters

router = APIRouter(prefix="/inverters", tags=["inverters"])


@router.get("", response_model=list[InverterSelection])
def list_inverters():
    return get_inverters()

@router.post("/suggest", response_model=InverterSelection)
def suggest_inverter_endpoint(payload: InverterSuggestRequest):
    try:
        suggestion = suggest_inverter(float(payload.systemKw), payload.targetRatio)
        if not suggestion:
            raise HTTPException(status_code=404, detail="No inverter suggestion found.")
        return suggestion
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
