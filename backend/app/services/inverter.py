from typing import Optional, List
from pvlib import pvsystem

from app.models.schemas import InverterSelection

def get_inverters() -> List[InverterSelection]:
    data = pvsystem.retrieve_sam("cecinverter")
    df = data.T if hasattr(data, "T") else data
    df = df.reset_index().rename(columns={"index": "name"})
    df = df[df["Paco"] > 0]
    
    inverters: List[InverterSelection] = []
    for _, row in df.iterrows():
        inverters.append(
            InverterSelection(
                mode="manual",
                inverterId=str(row["name"]),
                name=str(row["name"]),
                acPowerW=float(row["Paco"]),
                dcAcRatio=None,
                mpptCount=None
            )
        )
    return inverters


def suggest_inverter(system_kw: float, target_ratio: float = 1.2) -> Optional[InverterSelection]:
    if system_kw <= 0:
        raise ValueError("System size must be positive.")

    system_w = system_kw * 1000
    data = pvsystem.retrieve_sam("cecinverter")
    df = data.T if hasattr(data, "T") else data
    df = df.reset_index().rename(columns={"index": "name"})
    df = df[df["Paco"] > 0].copy()
    df["ratio"] = system_w / df["Paco"]
    df["ratio_delta"] = (df["ratio"] - target_ratio).abs()

    best = df.sort_values(["ratio_delta", "Paco"]).iloc[0]

    return InverterSelection(
        mode="auto",
        inverterId=str(best.get("name")),
        name=str(best.get("name")),
        acPowerW=float(best.get("Paco")),
        dcAcRatio=float(best.get("ratio")),
        mpptCount=None
    )
