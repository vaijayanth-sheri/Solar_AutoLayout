from fastapi import APIRouter
from typing import List

from app.models.schemas import ModuleSelection
from app.services.modules import get_modules

router = APIRouter(prefix="/modules", tags=["modules"])


@router.get("", response_model=List[ModuleSelection])
def list_modules():
    return get_modules()
