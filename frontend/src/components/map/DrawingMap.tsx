"use client";

import { useEffect, useMemo, useRef } from "react";
import { FeatureGroup, ImageOverlay, MapContainer, TileLayer, useMap, Polygon } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { FeatureGroup as LeafletFeatureGroup, LatLngLiteral, Map } from "leaflet";
import L from "leaflet";
import "leaflet-draw";
import type { DrawingData, LineFeature, PolygonFeature, PanelLayout } from "../../lib/types";

type DrawType = "installable" | "obstacle" | "reference";

interface DrawingMapProps {
  drawing: DrawingData;
  drawType?: DrawType;
  onChange?: (data: { installable: PolygonFeature[]; obstacles: PolygonFeature[]; referenceLine: LineFeature | null }) => void;
  onMapCenterChange?: (center: [number, number]) => void;
  readonly?: boolean;
  layoutPanels?: PanelLayout[];
}

const DRAW_COLORS: Record<DrawType, string> = {
  installable: "#10B981",
  obstacle: "#EF4444",
  reference: "#2563EB"
};

const defaultCenter: LatLngLiteral = { lat: 52.52, lng: 13.405 };

function extractFeatures(group: LeafletFeatureGroup) {
  const installable: PolygonFeature[] = [];
  const obstacles: PolygonFeature[] = [];
  let referenceLine: LineFeature | null = null;

  group.eachLayer((layer: any) => {
    const type = layer.options?.customType as DrawType | undefined;
    const featureId = layer.options?.featureId as string | undefined;
    if (layer instanceof L.Polygon) {
      const rings = layer.getLatLngs()[0] as L.LatLng[];
      const coordinates = rings.map((point) => [point.lat, point.lng] as [number, number]);
      const item = { id: featureId ?? crypto.randomUUID(), coordinates };
      if (type === "obstacle") {
        obstacles.push(item);
      } else {
        installable.push(item);
      }
    } else if (layer instanceof L.Polyline && type === "reference") {
      const coords = (layer.getLatLngs() as L.LatLng[]).map((point) => [point.lat, point.lng] as [number, number]);
      referenceLine = { id: featureId ?? crypto.randomUUID(), coordinates: coords };
    }
  });

  return { installable, obstacles, referenceLine };
}

function MapController({ center, mode, onMapCenterChange }: { center: LatLngLiteral; mode: string, onMapCenterChange?: (c: [number, number]) => void }) {
  const map = useMap();
  useEffect(() => {
    if (mode === "map") {
      const current = map.getCenter();
      if (current.distanceTo(center) > 5) {
        map.flyTo(center, 19, { animate: true, duration: 0.5 });
      }
    }
  }, [center.lat, center.lng, map, mode]);

  useEffect(() => {
    const handleMoveEnd = () => {
      if (mode === "map" && onMapCenterChange) {
        const c = map.getCenter();
        onMapCenterChange([c.lat, c.lng]);
      }
    };
    map.on("moveend", handleMoveEnd);
    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, mode, onMapCenterChange]);

  return null;
}

export function DrawingMap({ drawing, drawType, onChange, onMapCenterChange, readonly, layoutPanels }: DrawingMapProps) {
  const featureGroupRef = useRef<LeafletFeatureGroup>(null);
  const mapRef = useRef<Map | null>(null);

  const mapCenter = useMemo(() => {
    if (drawing.mode === "image" && drawing.image) {
      return { lat: drawing.image.height / 2, lng: drawing.image.width / 2 };
    }
    if (drawing.mapCenter) {
      return { lat: drawing.mapCenter[0], lng: drawing.mapCenter[1] };
    }
    return defaultCenter;
  }, [drawing.image, drawing.mapCenter, drawing.mode]);

  useEffect(() => {
    if (readonly) return;
    const group = featureGroupRef.current;
    if (!group) return;
    group.clearLayers();

    drawing.installable.forEach((polygon) => {
      const layer = L.polygon(polygon.coordinates, { color: DRAW_COLORS.installable });
      layer.options.customType = "installable";
      layer.options.featureId = polygon.id;
      group.addLayer(layer);
    });

    drawing.obstacles.forEach((polygon) => {
      const layer = L.polygon(polygon.coordinates, { color: DRAW_COLORS.obstacle });
      layer.options.customType = "obstacle";
      layer.options.featureId = polygon.id;
      group.addLayer(layer);
    });

    if (drawing.referenceLine) {
      const layer = L.polyline(drawing.referenceLine.coordinates, { color: DRAW_COLORS.reference });
      layer.options.customType = "reference";
      layer.options.featureId = drawing.referenceLine.id;
      group.addLayer(layer);
    }
  }, [drawing.installable, drawing.obstacles, drawing.referenceLine, readonly]);

  useEffect(() => {
    if (drawing.mode === "image" && drawing.image && mapRef.current) {
      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [drawing.image.height, drawing.image.width]
      ];
      mapRef.current.fitBounds(bounds, { padding: [0, 0] });
    }
  }, [drawing.mode, drawing.image]);

  const handleCreated = (event: any) => {
    const layer = event.layer as any;
    layer.options.customType = drawType;
    layer.options.featureId = crypto.randomUUID();
    if (layer.setStyle && drawType) {
      layer.setStyle({ color: DRAW_COLORS[drawType] });
    }
    const group = featureGroupRef.current;
    if (!group || !onChange) return;
    onChange(extractFeatures(group));
  };

  const handleEdited = () => {
    const group = featureGroupRef.current;
    if (!group || !onChange) return;
    onChange(extractFeatures(group));
  };

  const handleDeleted = () => {
    const group = featureGroupRef.current;
    if (!group || !onChange) return;
    onChange(extractFeatures(group));
  };

  const drawOptions = useMemo(
    () => ({
      polygon: drawType !== "reference",
      polyline: drawType === "reference",
      rectangle: false,
      circle: false,
      marker: false,
      circlemarker: false
    }),
    [drawType]
  );

  return (
    <MapContainer
      key={drawing.mode}
      ref={mapRef}
      center={mapCenter}
      zoom={drawing.mode === "image" ? 0 : 19}
      zoomSnap={drawing.mode === "image" ? 0 : 1}
      minZoom={drawing.mode === "image" ? -10 : 0}
      maxZoom={drawing.mode === "image" ? 10 : 22}
      className="h-[520px] w-full rounded-none border-2 border-slate-200"
      {...(drawing.mode === "image" ? { crs: L.CRS.Simple } : {})}
    >
      <MapController center={mapCenter} mode={drawing.mode} onMapCenterChange={onMapCenterChange} />
      {drawing.mode === "map" ? (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      ) : null}
      {drawing.mode === "image" && drawing.image ? (
        <ImageOverlay
          url={drawing.image.dataUrl}
          bounds={[
            [0, 0],
            [drawing.image.height, drawing.image.width]
          ]}
        />
      ) : null}
      {readonly ? (
        <>
          {drawing.installable.map((polygon) => (
            <Polygon
              key={polygon.id}
              positions={polygon.coordinates}
              pathOptions={{ color: DRAW_COLORS.installable, fillColor: DRAW_COLORS.installable, fillOpacity: 0.2, weight: 2 }}
            />
          ))}
          {drawing.obstacles.map((polygon) => (
            <Polygon
              key={polygon.id}
              positions={polygon.coordinates}
              pathOptions={{ color: DRAW_COLORS.obstacle, fillColor: DRAW_COLORS.obstacle, fillOpacity: 0.2, weight: 2 }}
            />
          ))}
        </>
      ) : (
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={drawOptions}
            edit={{ edit: true, remove: true }}
          />
        </FeatureGroup>
      )}
      {layoutPanels?.map((panel) => (
        <Polygon
          key={panel.id}
          positions={panel.polygon}
          pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.7, weight: 1 }}
        />
      ))}
    </MapContainer>
  );
}
