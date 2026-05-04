"use client";

import { useState } from "react";
import { StepHeader } from "../ui/step-header";
import { Card } from "../ui/card";
import { InfoBox } from "../ui/info-box";
import { InputField } from "../ui/input-field";
import { EnergyChart } from "../ui/energy-chart";
import { useProjectStore } from "../../lib/store/projectStore";
import { api } from "../../lib/api";

export function Step7Yield() {
  const drawing = useProjectStore((state) => state.draft.drawing);
  const layout = useProjectStore((state) => state.saved.layout ?? state.draft.layout);
  const constraints = useProjectStore((state) => state.saved.constraints ?? state.draft.constraints);
  const inverter = useProjectStore((state) => state.saved.inverter ?? state.draft.inverter);
  const updateDrawingDraft = useProjectStore((state) => state.updateDrawingDraft);
  const updateConstraintsDraft = useProjectStore((state) => state.updateConstraintsDraft);
  const yieldResult = useProjectStore((state) => state.saved.yield ?? state.draft.yield);
  const setYieldResult = useProjectStore((state) => state.setYieldResult);
  const saveSection = useProjectStore((state) => state.saveSection);
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!drawing) return null;

  const handleCalculate = async () => {
    if (!layout || !constraints || !drawing.location) {
      setError("Please ensure location and layout are defined.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.estimateYield(layout, constraints, drawing.location, inverter ?? undefined);
      setYieldResult(result);
      saveSection("yield");
    } catch (e) {
      console.error(e);
      setError("Failed to calculate yield. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSearch = () => {
    // Mock geocoding
    const lat = 52.5 + Math.random() * 0.1;
    const lon = 13.4 + Math.random() * 0.1;
    updateDrawingDraft({
      ...drawing,
      location: { lat, lon }
    });
  };

  if (!drawing) return null;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Step 7 - Yield & Report"
        subtitle="Estimate energy output using PVGIS and summarize results."
      />
      <Card className="space-y-6">
        {drawing.mode === "image" && (
          <div className="space-y-4 rounded-none border-2 border-slate-100 bg-slate-50 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Site Location Configuration</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <InputField
                  label="Search Address"
                  placeholder="Enter site address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  hint="Type an address to simulate geocoding."
                />
              </div>
              <div className="flex items-end pb-1">
                <button
                  onClick={handleAddressSearch}
                  className="h-[42px] w-full rounded-none border-2 border-slate-900 bg-white px-4 text-sm font-bold hover:bg-slate-50"
                >
                  Locate Site
                </button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Latitude"
                type="number"
                value={drawing.location?.lat ?? ""}
                onChange={(event) =>
                  updateDrawingDraft({
                    ...drawing,
                    location: {
                      lat: Number(event.target.value),
                      lon: drawing.location?.lon ?? 0
                    }
                  })
                }
              />
              <InputField
                label="Longitude"
                type="number"
                value={drawing.location?.lon ?? ""}
                onChange={(event) =>
                  updateDrawingDraft({
                    ...drawing,
                    location: {
                      lat: drawing.location?.lat ?? 0,
                      lon: Number(event.target.value)
                    }
                  })
                }
              />
            </div>
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mt-6">Panel Configuration</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <InputField
                label="Tilt (Elevation)"
                type="number"
                value={constraints?.tilt ?? 20}
                onChange={(event) =>
                  constraints && updateConstraintsDraft({ ...constraints, tilt: Number(event.target.value) })
                }
              />
              <InputField
                label="Azimuth"
                type="number"
                value={constraints?.azimuth ?? 180}
                onChange={(event) =>
                  constraints && updateConstraintsDraft({ ...constraints, azimuth: Number(event.target.value) })
                }
                hint="180 = South"
              />
              <InputField
                label="Albedo"
                type="number"
                step={0.01}
                value={constraints?.albedo ?? 0.2}
                onChange={(event) =>
                  constraints && updateConstraintsDraft({ ...constraints, albedo: Number(event.target.value) })
                }
              />
              <InputField
                label="System Loss (%)"
                type="number"
                value={constraints?.systemLossPercent ?? 14}
                onChange={(event) =>
                  constraints && updateConstraintsDraft({ ...constraints, systemLossPercent: Number(event.target.value) })
                }
              />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-y-2 border-slate-100 py-6 md:flex-row">
          <div className="flex-1">
            <h4 className="font-bold text-slate-900">Yield Estimation</h4>
            <p className="text-sm text-slate-500">
              Calculate annual energy generation using PVGIS data based on your specific layout and location.
            </p>
          </div>
          <button
            onClick={handleCalculate}
            disabled={loading || !layout || !drawing.location}
            className="rounded-none bg-brand-primary px-8 py-3 font-bold text-white shadow-none transition-all hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {loading ? "Calculating..." : yieldResult ? "Recalculate Yield" : "Calculate Yield"}
          </button>
        </div>

        {error && (
          <div className="rounded-none bg-red-50 p-4 text-sm text-red-700 border-2 border-red-100">
            {error}
          </div>
        )}

        {yieldResult && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* System Summary (Top Section) */}
            <div className="rounded-none border-2 border-slate-900 bg-slate-900 p-6 text-white">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Capacity</p>
                  <p className="text-3xl font-black">{layout?.systemSizeKw.toFixed(2)} <span className="text-sm font-normal text-slate-400">kWp DC</span></p>
                </div>
                <div className="h-12 w-px bg-slate-700 hidden md:block" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inverter Output</p>
                  <p className="text-xl font-bold">{yieldResult.acCapacityKw?.toFixed(1)} <span className="text-xs font-normal text-slate-400">kW AC</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">DC/AC Ratio</p>
                  <p className="text-xl font-bold">{yieldResult.dcAcRatio?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Module Count</p>
                  <p className="text-xl font-bold">{layout?.panelCount} <span className="text-xs font-normal text-slate-400">Units</span></p>
                </div>
              </div>
            </div>

            {/* Performance Indicators Dashboard */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-none border-2 border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Annual Energy</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{yieldResult.annualKwh.toLocaleString()} <span className="text-xs font-normal">kWh</span></p>
              </div>
              <div className="rounded-none border-2 border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Specific Yield</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{yieldResult.specificYield?.toFixed(0)} <span className="text-xs font-normal">kWh/kWp</span></p>
              </div>
              <div className="rounded-none border-2 border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Performance Ratio</p>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 border ${
                    yieldResult.systemInsight === "High performance" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    yieldResult.systemInsight === "Moderate performance" ? "bg-amber-50 border-amber-200 text-amber-700" :
                    "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    {yieldResult.systemInsight}
                  </span>
                </div>
                <p className="mt-1 text-2xl font-black text-slate-900">{(yieldResult.performanceRatio! * 100).toFixed(1)} <span className="text-xs font-normal">%</span></p>
              </div>
              <div className="rounded-none border-2 border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Capacity Factor</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{yieldResult.capacityFactor?.toFixed(1)} <span className="text-xs font-normal">%</span></p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Monthly Energy distribution</h4>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase text-slate-400">Peak Month</p>
                      <p className="text-xs font-bold text-slate-700">{yieldResult.peakMonth}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase text-slate-400">Low Month</p>
                      <p className="text-xs font-bold text-slate-700">{yieldResult.lowMonth}</p>
                    </div>
                  </div>
                </div>
                <div className="h-[300px]">
                  <EnergyChart monthlyKwh={yieldResult.monthlyKwh} />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700">Engineering Loss insights</h4>
                  <div className="space-y-3 rounded-none border-2 border-slate-100 bg-slate-50 p-5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">System Availability</span>
                      <span className="font-bold text-slate-700">98.0%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Combined Thermal & Wiring</span>
                      <span className="font-bold text-slate-700">8.0%</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-200 pt-2 mt-2">
                      <span className="font-bold text-slate-900 uppercase tracking-tighter">Total Modeled loss</span>
                      <span className="font-bold text-slate-900">{yieldResult.totalLossPercent?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700">Environmental Impact</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-none border-2 border-emerald-100 bg-emerald-50/50 p-4 flex items-center gap-4">
                      <div className="text-2xl">🌳</div>
                      <div>
                        <p className="text-xl font-black text-emerald-900">{yieldResult.treesEquivalent?.toFixed(0)}</p>
                        <p className="text-[10px] font-bold uppercase text-emerald-600">Trees Equivalent</p>
                      </div>
                    </div>
                    <div className="rounded-none border-2 border-blue-100 bg-blue-50/50 p-4 flex items-center gap-4">
                      <div className="text-2xl">☁️</div>
                      <div>
                        <p className="text-xl font-black text-blue-900">{(yieldResult.co2SavingsKg! / 1000).toFixed(1)} <span className="text-xs font-normal">t/year</span></p>
                        <p className="text-[10px] font-bold uppercase text-blue-600">CO2 Emissions Avoided</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
