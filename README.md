# Solar AutoLayout Tool

A professional-grade solar engineering tool for automated PV layout generation and yield analysis. This tool allows users to draw site boundaries on maps or uploaded images, automatically place solar modules, size inverters, and calculate high-fidelity energy yields using PVGIS data.

## 🚀 Features

- **Hybrid Drawing Modes**: Draw site boundaries using OpenStreetMap/Satellite imagery or upload custom site plans as images.
- **Automated Layout Engine**: Intelligent panel placement considering setbacks, thermal gaps, and orientation (Portrait/Landscape).
- **Comprehensive Database**: Integrated PVLib CEC database for thousands of modules and inverters.
- **Expert Yield Analytics**: Detailed decision-support dashboard featuring:
  - Performance Ratio (PR)
  - Capacity Factor
  - Specific Yield (kWh/kWp)
  - Engineering Loss Modeling
  - Environmental Impact (CO2 savings & Tree equivalents)
- **Multi-Format Export**: Export your designs to DXF, PDF, CSV, and JSON.

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python API framework.
- **Shapely**: Advanced geometric operations and polygon manipulation.
- **PVLib**: Industry-standard solar performance modeling.
- **Uvicorn**: ASGI server for production.

### Frontend
- **Next.js**: React framework for the user interface.
- **TailwindCSS**: Modern styling for a premium SaaS aesthetic.
- **Leaflet & Leaflet-Draw**: Interactive mapping and boundary definition.
- **Lucide React**: Clean, professional iconography.

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The backend will run on `http://localhost:8000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## ⚙️ Configuration

Create a `.env` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_API=false
```

## 📄 License
This project is licensed under the MIT License.
