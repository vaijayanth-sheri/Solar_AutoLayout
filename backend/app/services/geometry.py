from typing import Tuple
from shapely.geometry import Polygon
from shapely.ops import unary_union
from pyproj import Transformer
from math import hypot

from app.models.schemas import DrawingData, Constraints


def _to_metric_from_map(drawing: DrawingData) -> Tuple[Polygon, Polygon]:
    # transformer expects (lng, lat) for XY
    transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)

    def project_coords(coords):
        # coords is [[lat, lng], ...]
        return [transformer.transform(lng, lat) for lat, lng in coords]

    installable_polygons = [Polygon(project_coords(poly.coordinates)) for poly in drawing.installable]
    obstacles_polygons = [Polygon(project_coords(poly.coordinates)) for poly in drawing.obstacles]
    return _union_and_clean(installable_polygons), _union_and_clean(obstacles_polygons)


def _to_metric_from_image(drawing: DrawingData) -> Tuple[Polygon, Polygon]:
    if not drawing.referenceLine or not drawing.referenceLengthM:
        raise ValueError("Image mode requires reference line and length.")

    line_coords = drawing.referenceLine.coordinates
    if len(line_coords) < 2:
        raise ValueError("Reference line must contain at least two points.")

    # line_coords is [[lat, lng], ...] which is [[y, x], ...]
    (y1, x1), (y2, x2) = line_coords[0], line_coords[-1]
    pixel_distance = hypot(x2 - x1, y2 - y1)
    if pixel_distance == 0:
        raise ValueError("Reference line length cannot be zero.")

    scale = drawing.referenceLengthM / pixel_distance

    def project_to_metric(coords):
        # Input coords is [[lat, lng], ...]
        # We want metric (x, y) where x is horizontal (lng) and y is vertical (lat)
        return [(lng * scale, lat * scale) for lat, lng in coords]

    installable_polygons = [Polygon(project_to_metric(poly.coordinates)) for poly in drawing.installable]
    obstacles_polygons = [Polygon(project_to_metric(poly.coordinates)) for poly in drawing.obstacles]
    return _union_and_clean(installable_polygons), _union_and_clean(obstacles_polygons)


def convert_panels_to_drawing_coords(panels: list, drawing: DrawingData) -> list:
    if drawing.mode == "map":
        transformer = Transformer.from_crs("EPSG:3857", "EPSG:4326", always_xy=True)
        def inv_project(coords):
            return [transformer.transform(x, y)[::-1] for x, y in coords]
    else:
        line_coords = drawing.referenceLine.coordinates
        (y1, x1), (y2, x2) = line_coords[0], line_coords[-1]
        scale = drawing.referenceLengthM / hypot(x2 - x1, y2 - y1)
        def inv_project(coords):
            # coords is [[x_metric, y_metric], ...]
            # return [[lat, lng], ...] where lat=y_metric/scale, lng=x_metric/scale
            return [[y / scale, x / scale] for x, y in coords]

    for panel in panels:
        panel.polygon = inv_project(panel.polygon)
    return panels


def _union_and_clean(polygons):
    if not polygons:
        return Polygon()
    merged = unary_union(polygons)
    if merged.is_empty:
        return Polygon()
    if merged.geom_type == "Polygon":
        return merged.buffer(0)
    return unary_union([geom.buffer(0) for geom in merged.geoms])


def prepare_installable_area(drawing: DrawingData, constraints: Constraints) -> Polygon:
    if drawing.mode == "map":
        installable, obstacles = _to_metric_from_map(drawing)
    else:
        installable, obstacles = _to_metric_from_image(drawing)

    if installable.is_empty:
        raise ValueError("Installable area is empty after processing.")

    buffered_installable = installable.buffer(-constraints.edgeClearanceM)
    if buffered_installable.is_empty:
        raise ValueError("Edge clearance removes all installable area.")

    if obstacles.is_empty:
        return buffered_installable

    buffered_obstacles = obstacles.buffer(constraints.obstacleBufferM)
    final_area = buffered_installable.difference(buffered_obstacles)
    if final_area.is_empty:
        raise ValueError("Obstacles remove all installable area.")
    return final_area
