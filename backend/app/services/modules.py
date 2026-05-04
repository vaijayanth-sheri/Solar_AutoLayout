from typing import List
import re
from pvlib import pvsystem

from app.models.schemas import ModuleSelection


def get_modules(limit: int = 100) -> List[ModuleSelection]:
    try:
        data = pvsystem.retrieve_sam("cecmod")
        df = data.T if hasattr(data, "T") else data
    except Exception:
        return []

    # Identify power column
    pwr_col = "STC" if "STC" in df.columns else None
    if not pwr_col and "V_mp_ref" in df.columns and "I_mp_ref" in df.columns:
        df["STC"] = df["V_mp_ref"] * df["I_mp_ref"]
        pwr_col = "STC"
    
    if not pwr_col:
        # Fallback to Paco or similar if it's actually an inverter file or different schema
        return []

    # Sort and slice to keep it responsive
    df = df.sort_values(pwr_col, ascending=False).head(limit)

    modules: List[ModuleSelection] = []
    for name, row in df.iterrows():
        # Dimensions: CEC often uses 'A_c' (Area) instead of L/W
        # Or Length and Width in mm or meters
        w = row.get("Width") or row.get("width")
        h = row.get("Length") or row.get("length")
        area = row.get("A_c")
        
        if w and h:
            # If values are > 10, they are likely in mm. If < 10, they are in meters.
            width_m = float(w) / 1000 if float(w) > 10 else float(w)
            height_m = float(h) / 1000 if float(h) > 10 else float(h)
        elif area:
            # Assume 1.7:1 aspect ratio if only area is known
            area_m2 = float(area)
            width_m = (area_m2 / 1.7) ** 0.5
            height_m = width_m * 1.7
        else:
            # Standard 400W module size as default
            width_m = 1.0
            height_m = 1.7

        # Extract manufacturer name from index string
        # Names are usually Manufacturer_Model or Manufacturer Model
        name_str = str(name)
        # Split by first underscore or space
        parts = re.split(r'[_ ]', name_str, maxsplit=1)
        manufacturer = parts[0] if parts else "Unknown"

        modules.append(
            ModuleSelection(
                id=str(name),
                name=str(name),
                manufacturer=manufacturer,
                powerW=float(row[pwr_col]),
                widthM=width_m,
                heightM=height_m,
                source="dataset"
            )
        )
    return modules
