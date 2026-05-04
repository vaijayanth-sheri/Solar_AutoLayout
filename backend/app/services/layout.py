from math import ceil
from typing import List, Optional
from shapely.geometry import box, Polygon
from shapely.affinity import rotate

from app.models.schemas import Constraints, DrawingData, LayoutResult, ModuleSelection, PanelLayout, SizingIntent
from app.services.geometry import prepare_installable_area, convert_panels_to_drawing_coords
from app.services.yield_engine import estimate_annual_kwh_per_kwp


def _calculate_target_count(
    sizing: SizingIntent,
    module: ModuleSelection,
    drawing: DrawingData
) -> Optional[int]:
    if sizing.type == "max_fill":
        return None
    if sizing.type == "panel_count":
        return int(sizing.value or 0)
    panel_kw = module.powerW / 1000
    if panel_kw <= 0:
        raise ValueError("Module power must be positive.")
    if sizing.type == "kwp":
        return ceil((sizing.value or 0) / panel_kw)
    if sizing.type == "kwh":
        if not sizing.value:
            raise ValueError("Target kWh value is required.")
        if not drawing.location:
            raise ValueError("Location is required for kWh sizing.")
        annual_per_kw = estimate_annual_kwh_per_kwp(drawing.location.lat, drawing.location.lon)
        if annual_per_kw <= 0:
            raise ValueError("Unable to compute yield per kWp.")
        required_kwp = sizing.value / annual_per_kw
        return ceil(required_kwp / panel_kw)
    return None


def _generate_grid(
    area: Polygon,
    panel_w: float,
    panel_h: float,
    constraints: Constraints,
    image_bearing: float = 0.0
) -> List[PanelLayout]:
    centroid = area.centroid
    effective_azimuth = constraints.azimuth - image_bearing
    rotated_area = rotate(area, -effective_azimuth, origin=centroid)
    minx, miny, maxx, maxy = rotated_area.bounds
    panels: List[PanelLayout] = []
    row = 0
    y = miny
    while y + panel_h <= maxy:
        col = 0
        x = minx
        while x + panel_w <= maxx:
            rect = box(x, y, x + panel_w, y + panel_h)
            if rotated_area.covers(rect):
                true_rect = rotate(rect, effective_azimuth, origin=centroid)
                panels.append(
                    PanelLayout(
                        id=f"panel-{len(panels) + 1}",
                        polygon=[list(pt) for pt in true_rect.exterior.coords[:-1]]
                    )
                )
            x += panel_w + constraints.panelSpacingX
            col += 1
            if constraints.thermalCols > 0 and col % constraints.thermalCols == 0:
                x += constraints.thermalGapM
        y += panel_h + constraints.panelSpacingY
        row += 1
        if constraints.thermalRows > 0 and row % constraints.thermalRows == 0:
            y += constraints.thermalGapM
    return panels


def generate_layout(
    drawing: DrawingData,
    sizing: SizingIntent,
    module: ModuleSelection,
    constraints: Constraints
) -> LayoutResult:
    area = prepare_installable_area(drawing, constraints)

    panel_w = module.widthM
    panel_h = module.heightM
    if constraints.moduleOrientation == "landscape":
        panel_w, panel_h = panel_h, panel_w

    panels = _generate_grid(
        area, 
        panel_w, 
        panel_h, 
        constraints, 
        image_bearing=drawing.imageBearing or 0.0
    )

    target_count = _calculate_target_count(sizing, module, drawing)
    if target_count is not None:
        panels = panels[: max(target_count, 0)]

    panels = convert_panels_to_drawing_coords(panels, drawing)

    panel_count = len(panels)
    system_size_kw = (panel_count * module.powerW) / 1000
    coverage = 0.0
    if area.area > 0:
        coverage = (panel_count * panel_w * panel_h) / area.area * 100

    return LayoutResult(
        panels=panels,
        panelCount=panel_count,
        coveragePercent=coverage,
        systemSizeKw=system_size_kw
    )
