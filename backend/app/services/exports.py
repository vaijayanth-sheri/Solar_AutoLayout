import io
import json
import csv
from typing import Tuple
from PIL import Image, ImageDraw
import ezdxf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

from app.models.schemas import ExportRequest, LayoutResult


def _layout_bounds(layout: LayoutResult) -> Tuple[float, float, float, float]:
    xs = []
    ys = []
    for panel in layout.panels:
        for x, y in panel.polygon:
            xs.append(x)
            ys.append(y)
    if not xs or not ys:
        return (0, 0, 1, 1)
    return min(xs), min(ys), max(xs), max(ys)


def export_json(payload: ExportRequest) -> bytes:
    return json.dumps(payload.model_dump(by_alias=True)).encode("utf-8")


def export_csv(layout: LayoutResult) -> bytes:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["panel_id", "x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4"])
    for panel in layout.panels:
        row = [panel.id]
        for x, y in panel.polygon:
            row.extend([x, y])
        writer.writerow(row)
    return output.getvalue().encode("utf-8")


def export_dxf(layout: LayoutResult) -> bytes:
    doc = ezdxf.new(setup=True)
    msp = doc.modelspace()
    for panel in layout.panels:
        points = panel.polygon + [panel.polygon[0]]
        msp.add_lwpolyline(points, close=True)
    buffer = io.StringIO()
    doc.write(buffer)
    return buffer.getvalue().encode("utf-8")


def export_png(layout: LayoutResult) -> bytes:
    minx, miny, maxx, maxy = _layout_bounds(layout)
    width = max(maxx - minx, 1)
    height = max(maxy - miny, 1)
    scale = min(1000 / width, 700 / height)
    img_w = int(width * scale) + 40
    img_h = int(height * scale) + 40
    image = Image.new("RGB", (img_w, img_h), "white")
    draw = ImageDraw.Draw(image)

    for panel in layout.panels:
        pts = [
            (
                int((x - minx) * scale) + 20,
                int((y - miny) * scale) + 20
            )
            for x, y in panel.polygon
        ]
        draw.polygon(pts, outline="#2563EB", fill="#DBEAFE")

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def export_pdf(payload: ExportRequest) -> bytes:
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(40, height - 50, "Solar Auto Layout Report")
    pdf.setFont("Helvetica", 10)

    if payload.layout:
        pdf.drawString(40, height - 80, f"Panel count: {payload.layout.panelCount}")
        pdf.drawString(40, height - 95, f"Coverage: {payload.layout.coveragePercent:.2f}%")
        pdf.drawString(40, height - 110, f"System size: {payload.layout.systemSizeKw:.2f} kWp")
    if payload.yieldResult:
        pdf.drawString(40, height - 140, f"Annual energy: {payload.yieldResult.annualKwh:.0f} kWh")

    pdf.showPage()
    pdf.save()
    return buffer.getvalue()
