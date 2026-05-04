from typing import List, Tuple, Dict
import requests

from app.core.config import PVGIS_BASE_URL, DEFAULT_TILT, DEFAULT_AZIMUTH
from app.models.schemas import YieldResult


def _call_pvgis(
    lat: float, 
    lon: float, 
    peak_power: float, 
    tilt: float = DEFAULT_TILT, 
    azimuth: float = DEFAULT_AZIMUTH,
    system_loss: float = 14.0,
    albedo: float = 0.2
) -> dict:
    aspect = azimuth - 180
    params = {
        "lat": lat,
        "lon": lon,
        "peakpower": peak_power,
        "loss": system_loss,
        "angle": tilt,
        "aspect": aspect,
        "albedo": albedo,
        "mountingplace": "free",
        "outputformat": "json"
    }
    response = requests.get(PVGIS_BASE_URL, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def _parse_pvgis(data: dict) -> Dict:
    outputs = data.get("outputs", {})
    totals = outputs.get("totals", {}).get("fixed", {})
    annual = totals.get("E_y")
    pr = totals.get("PR", 0)
    monthly_entries = outputs.get("monthly", {}).get("fixed", [])
    monthly = [entry.get("E_m", 0) for entry in monthly_entries]
    if annual is None:
        raise ValueError("PVGIS response missing annual energy.")
    if len(monthly) != 12:
        monthly = (monthly + [0] * 12)[:12]
    return {
        "annual": float(annual),
        "monthly": [float(v) for v in monthly],
        "pr": float(pr)
    }


def estimate_yield(
    lat: float, 
    lon: float, 
    system_kw: float, 
    tilt: float, 
    azimuth: float,
    system_loss: float = 14.0,
    albedo: float = 0.2,
    ac_kw: float = 0.0
) -> YieldResult:
    raw_data = _call_pvgis(lat, lon, system_kw, tilt, azimuth, system_loss, albedo)
    parsed = _parse_pvgis(raw_data)
    
    annual_kwh = parsed["annual"]
    specific_yield = annual_kwh / system_kw if system_kw > 0 else 0
    
    # PR calculation requested: PR = Specific Yield / 1100 (default reference)
    performance_ratio = specific_yield / 1100
    # Constrain to realistic PR values for decision support
    performance_ratio = max(0.7, min(0.9, performance_ratio))
    
    # Capacity Factor = Annual Energy / (DC Capacity * 8760)
    capacity_factor = (annual_kwh / (system_kw * 8760)) * 100 if system_kw > 0 else 0
    
    # CO2 calculation requested: 0.4 kg/kWh
    co2_kg = annual_kwh * 0.4
    trees = co2_kg / 21.0
    
    # Loss breakdown updated with user provided system loss
    total_loss = system_loss
    
    # DC/AC Ratio
    dc_ac_ratio = system_kw / ac_kw if ac_kw > 0 else 0
    
    # Peak/Low Month
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_data = parsed["monthly"]
    peak_month = months[monthly_data.index(max(monthly_data))]
    low_month = months[monthly_data.index(min(monthly_data))]
    
    # Insight text
    if performance_ratio < 0.75:
        insight = "System underperforming"
    elif performance_ratio <= 0.85:
        insight = "Moderate performance"
    else:
        insight = "High performance"
    
    return YieldResult(
        annualKwh=annual_kwh,
        monthlyKwh=parsed["monthly"],
        specificYield=specific_yield,
        performanceRatio=performance_ratio,
        capacityFactor=capacity_factor,
        totalLossPercent=total_loss,
        co2SavingsKg=co2_kg,
        treesEquivalent=trees,
        acCapacityKw=ac_kw,
        dcAcRatio=dc_ac_ratio,
        peakMonth=peak_month,
        lowMonth=low_month,
        systemInsight=insight
    )


def estimate_annual_kwh_per_kwp(lat: float, lon: float) -> float:
    raw_data = _call_pvgis(lat, lon, 1.0)
    parsed = _parse_pvgis(raw_data)
    return parsed["annual"]
