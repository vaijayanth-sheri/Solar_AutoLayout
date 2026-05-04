"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { StepHeader } from "../ui/step-header";
import { Card } from "../ui/card";
import { ToggleButtons } from "../ui/toggle-buttons";
import { InputField } from "../ui/input-field";
import { InfoBox } from "../ui/info-box";
import { useProjectStore } from "../../lib/store/projectStore";

const DrawingMap = dynamic(() => import("../map/DrawingMap").then((mod) => mod.DrawingMap), {
  ssr: false
});

export function Step1Drawing() {
  const drawing = useProjectStore((state) => state.draft.drawing);
  const updateDrawingDraft = useProjectStore((state) => state.updateDrawingDraft);
  const [drawType, setDrawType] = useState<"installable" | "obstacle" | "reference">("installable");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        updateDrawingDraft({
          ...drawing!,
          mapCenter: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
        });
      } else {
        alert("Location not found.");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching location.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!drawing) return null;

  const modeOptions = [
    { label: "Map Mode", value: "map" },
    { label: "Image Mode", value: "image" }
  ];

  const drawOptions = drawing.mode === "image"
    ? [
        { label: "Installable Area", value: "installable" },
        { label: "Obstacles", value: "obstacle" },
        { label: "Reference Line", value: "reference" }
      ]
    : [
        { label: "Installable Area", value: "installable" },
        { label: "Obstacles", value: "obstacle" }
      ];

  useEffect(() => {
    if (drawing.mode === "map" && drawType === "reference") {
      setDrawType("installable");
    }
  }, [drawing.mode, drawType]);

  const imageHint = useMemo(
    () =>
      drawing.image
        ? `Image loaded (${drawing.image.width} x ${drawing.image.height}px)`
        : "Upload a site image for CRS.Simple overlay.",
    [drawing.image]
  );

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        updateDrawingDraft({
          ...drawing,
          image: { dataUrl, width: img.width, height: img.height }
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Step 1 - Mode & Drawing"
        subtitle="Define the installable area, obstacles, and scale reference."
      />
      <div className="rounded-none bg-amber-50 p-4 border-2 border-amber-200">
        <p className="text-sm font-bold text-amber-800">
          ⚠️ Note: This tool currently works optimally with flat roofs.
        </p>
      </div>
      <Card className="space-y-6">
        <ToggleButtons
          label="Select Mode"
          options={modeOptions}
          value={drawing.mode}
          onChange={(value) =>
            updateDrawingDraft({
              ...drawing,
              mode: value as "map" | "image"
            })
          }
        />
        {drawing.mode === "map" ? (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <InputField
                label="Search Location"
                placeholder="Address, city, postal code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="rounded-none bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-none transition hover:opacity-90 disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        ) : null}
        {drawing.mode === "image" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Upload Site Image"
              type="file"
              accept="image/*"
              hint={imageHint}
              onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
            />
            <InputField
              label="Reference Line Length (m)"
              type="number"
              min={0}
              value={drawing.referenceLengthM ?? ""}
              onChange={(event) =>
                updateDrawingDraft({
                  ...drawing,
                  referenceLengthM: event.target.value === "" ? null : Number(event.target.value)
                })
              }
              hint="Use the blue line to calibrate image scale."
            />
            <InputField
              label="Image North Alignment (Degrees)"
              type="number"
              min={0}
              max={359}
              value={drawing.imageBearing ?? 0}
              onChange={(event) =>
                updateDrawingDraft({
                  ...drawing,
                  imageBearing: event.target.value === "" ? 0 : Number(event.target.value)
                })
              }
              hint="0 = Top is North. Used to align panels accurately on the image."
            />
          </div>
        ) : null}
        <ToggleButtons
          label="Drawing Mode"
          options={drawOptions}
          value={drawType}
          onChange={(value) => setDrawType(value as "installable" | "obstacle" | "reference")}
        />
        <InfoBox
          title="Color Legend"
          description={`Installable area = green, Obstacles = red${drawing.mode === "image" ? ", Reference line = blue" : ""}.`}
        />
        <DrawingMap
          drawing={drawing}
          drawType={drawType}
          onChange={({ installable, obstacles, referenceLine }) =>
            updateDrawingDraft({
              ...drawing,
              installable,
              obstacles,
              referenceLine
            })
          }
          onMapCenterChange={(center) =>
            updateDrawingDraft({
              ...drawing,
              mapCenter: center
            })
          }
        />
      </Card>
    </div>
  );
}
