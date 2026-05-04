from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.models.schemas import ExportRequest
from app.services.exports import export_csv, export_dxf, export_json, export_pdf, export_png

router = APIRouter(prefix="/exports", tags=["exports"])


@router.post("/{format}")
def export_format(format: str, payload: ExportRequest):
    if not payload.layout:
        raise HTTPException(status_code=400, detail="Layout is required for export.")

    if format == "json":
        content = export_json(payload)
        return Response(content, media_type="application/json")
    if format == "csv":
        content = export_csv(payload.layout)
        return Response(content, media_type="text/csv")
    if format == "dxf":
        content = export_dxf(payload.layout)
        return Response(content, media_type="application/dxf")
    if format == "png":
        content = export_png(payload.layout)
        return Response(content, media_type="image/png")
    if format == "pdf":
        content = export_pdf(payload)
        return Response(content, media_type="application/pdf")

    raise HTTPException(status_code=400, detail="Unsupported export format.")
