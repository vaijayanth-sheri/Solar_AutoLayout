from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class PolygonFeature(BaseModel):
    id: str
    coordinates: List[List[float]]


class LineFeature(BaseModel):
    id: str
    coordinates: List[List[float]]


class ImageMeta(BaseModel):
    dataUrl: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class Location(BaseModel):
    lat: float
    lon: float


class DrawingData(BaseModel):
    mode: Literal["map", "image"]
    installable: List[PolygonFeature]
    obstacles: List[PolygonFeature] = Field(default_factory=list)
    referenceLine: Optional[LineFeature] = None
    referenceLengthM: Optional[float] = None
    location: Optional[Location] = None
    image: Optional[ImageMeta] = None
    imageBearing: Optional[float] = 0.0
    mapCenter: Optional[List[float]] = None


class SizingIntent(BaseModel):
    type: Literal["kwp", "kwh", "panel_count", "max_fill"]
    value: Optional[float] = None


class ModuleSelection(BaseModel):
    id: str
    name: str
    manufacturer: Optional[str] = None
    powerW: float
    widthM: float
    heightM: float
    source: Literal["dataset", "custom"]


class InverterSelection(BaseModel):
    mode: Literal["auto", "manual"]
    inverterId: Optional[str] = None
    name: Optional[str] = None
    acPowerW: Optional[float] = None
    dcAcRatio: Optional[float] = None
    targetRatio: Optional[float] = None
    mpptCount: Optional[int] = None


class Constraints(BaseModel):
    moduleOrientation: Literal["portrait", "landscape"]
    azimuth: float
    tilt: float
    panelSpacingX: float
    panelSpacingY: float
    obstacleBufferM: float
    edgeClearanceM: float
    thermalRows: int
    thermalCols: int
    thermalGapM: float
    albedo: float = Field(0.2, ge=0, le=1)
    systemLossPercent: float = Field(14.0, ge=0, le=100)


class PanelLayout(BaseModel):
    id: str
    polygon: List[List[float]]


class LayoutResult(BaseModel):
    panels: List[PanelLayout]
    panelCount: int
    coveragePercent: float
    systemSizeKw: float


class YieldResult(BaseModel):
    annualKwh: float
    monthlyKwh: List[float]
    specificYield: float = 0.0
    performanceRatio: float = 0.0
    capacityFactor: float = 0.0
    totalLossPercent: float = 0.0
    co2SavingsKg: float = 0.0
    treesEquivalent: float = 0.0
    acCapacityKw: float = 0.0
    dcAcRatio: float = 0.0
    peakMonth: str = ""
    lowMonth: str = ""
    systemInsight: str = ""


class LayoutRequest(BaseModel):
    drawing: DrawingData
    sizing: SizingIntent
    module: ModuleSelection
    constraints: Constraints


class YieldRequest(BaseModel):
    layout: LayoutResult
    constraints: Constraints
    location: Optional[Location] = None
    inverter: Optional[InverterSelection] = None


class ExportRequest(BaseModel):
    drawing: Optional[DrawingData] = None
    sizing: Optional[SizingIntent] = None
    module: Optional[ModuleSelection] = None
    inverter: Optional[InverterSelection] = None
    constraints: Optional[Constraints] = None
    layout: Optional[LayoutResult] = None
    yieldResult: Optional[YieldResult] = Field(default=None, alias="yield")
    model_config = ConfigDict(populate_by_name=True)


class InverterSuggestRequest(BaseModel):
    systemKw: float
    targetRatio: float = 1.2
    module: Optional[ModuleSelection] = None
