PRODUCT REQUIREMENTS DOCUMENT (PRD)



Product Name: Solar Panel Auto Layout Tool

Version: 2.0 (Refined – UI \& Architecture Aligned)

Status: Development Ready

Audience: AI Engineering Agents, Developers, Technical Managers



1\. PRODUCT DEFINITION



The system is a web-based solar planning tool that enables users to:



Define installation areas using:

Uploaded images OR

Interactive maps

Configure solar system parameters

Automatically generate:

Panel layout

Energy estimation

Equipment suggestion

Export professional outputs



2\. SYSTEM ARCHITECTURE OVERVIEW



The system consists of three clearly separated layers:



Frontend (React UI)

&#x20;       ↓

Backend API (FastAPI)

&#x20;       ↓

Computation Engines (Geometry, Energy, Export)



Each layer must be implemented independently with strict separation of concerns.



3\. FRONTEND REQUIREMENTS (MODERN UI SYSTEM)



3.1 Technology Stack (STRICT)

Framework: React (Next.js, TypeScript)

Styling: Tailwind CSS (mandatory)

UI Components: modern component system (e.g., shadcn/ui or equivalent)

State Management: Zustand

Validation: Zod

API Calls: Axios

Map \& Drawing:

Leaflet (react-leaflet)

leaflet-draw



3.2 UI DESIGN PRINCIPLES

The UI must:

Be modern, clean, and visually engaging

Follow SaaS-grade design standards

Use:

Soft shadows

Rounded cards

Clear spacing

Visual hierarchy

Avoid:

Dense forms

Legacy UI styles

Plain HTML layouts



3.3 COLOR SYSTEM

Background: light neutral (#F7F7F9)

Surface: white (#FFFFFF)

Primary: blue (#2563EB)

Accent: teal/green (#10B981)

Warning: amber (#F59E0B)

Error: red (#EF4444)

Text: dark grey (#111827)



3.4 LAYOUT STRUCTURE

Left Sidebar (Navigation Only)

Vertical stepper

Shows all steps (1–8)

Highlights current step

Clickable navigation

Main Content Area

Central workspace

Uses card-based layout

Displays only current step content

Bottom Action Bar

Sticky footer

Contains:

Save

Save + Next



3.5 INTERACTION MODEL (MANDATORY)

No automatic updates

No real-time recalculation

All changes applied ONLY when:

→ User clicks Save or Save + Next



3.6 CORE UI COMPONENTS

Must include reusable components:

Card

Step Header

Section Header

Input Field

Dropdown

Slider

Toggle Buttons

Alert Box

Info Box

Loading Indicator

Chart (for energy)

3.7 DRAWING SYSTEM

Map Mode

OpenStreetMap tiles

Polygon drawing

Obstacle drawing

Reference line

Image Mode

Image overlay using CRS.Simple

Same drawing tools as map

Visual Rules

Installable area: green

Obstacles: red

Reference line: blue

4\. BACKEND REQUIREMENTS (CORE ENGINE)

4.1 Technology Stack (STRICT)

Framework: FastAPI

Geometry:

Shapely

PyProj

Data:

Pandas

Export:

ezdxf (DXF)

ReportLab (PDF)

Pillow (PNG)

4.2 DATA SOURCES (FREE ONLY)

PVGIS → energy estimation

PVLib CEC dataset → modules \& inverters

OpenStreetMap → map data

4.3 CORE SYSTEM MODULES

4.3.1 Geometry Engine



Must:



Convert all inputs to metric coordinates

Process polygons

Apply buffers:

Obstacles

Edge clearance

Generate valid installation area

4.3.2 Layout Engine



Must:



Generate grid-based panel placement

Apply:

Panel spacing

Orientation (0° / 90°)

Thermal gaps

Thermal Gap Logic

After N rows → skip gap

After M columns → skip gap

4.3.3 Yield Engine

Use PVGIS API

Input:

Location

System size

Output:

Annual energy

Monthly profile

4.3.4 Inverter Engine (MVP)

Rule-based logic:

DC/AC ratio

Basic MPPT matching

4.3.5 Export Engine



Must support:



DXF → panel layout

PDF → full report

PNG → visual layout

CSV → coordinates

JSON → full project



5\. USER JOURNEY (STEP-BY-STEP FLOW)



This section defines the exact interaction flow. Each step must connect logically to the next.



Step 1: Mode \& Drawing

Purpose



Define installation geometry.



User Actions

Select mode (Image or Map)

Draw:

Installable area

Obstacles

Reference line

Output

GeoJSON

Scale reference

Dependency



Required for all subsequent steps.



Step 2: Sizing Intent

Purpose



Define system target.



Options



User selects ONE:



kWp

kWh/year

Panel count

Max fill

Output



Sizing constraint



Dependency



Used in layout generation.



Step 3: Module Selection

Purpose



Define panel characteristics.



Options

Select from dataset

Custom input

Output



Panel dimensions and power



Dependency



Used in layout + yield



Step 4: Inverter Configuration

Purpose



Define or suggest inverter



Options

Auto suggestion

Manual selection

Output



Inverter configuration



Dependency



Used in reporting



Step 5: Constraints

Purpose



Define layout rules



Inputs

Panel spacing

Obstacle buffer

Edge clearance

Thermal gaps

Defaults (Germany)

Edge: 0.4 m

Obstacle: 0.3 m

Thermal: 10 rows / 20 columns / 0.08 m

Dependency



Used in layout engine



Step 6: Layout Generation

Purpose



Compute panel placement



System Actions

Process geometry

Apply constraints

Generate layout

Output

Panel coordinates

Panel count

Coverage %

Dependency



Feeds into yield and report



Step 7: Yield \& Report

Purpose



Estimate energy and summarize system



System Actions

Call PVGIS

Compute yield

Output

Annual energy

Monthly breakdown

Summary report data

Step 8: Export

Purpose



Deliver outputs



Options

DXF

PDF

PNG

CSV

JSON



6\. NON-FUNCTIONAL REQUIREMENTS

Layout generation < 5 seconds

UI must remain responsive

System must be modular

Clear error handling required

No UI blocking operations



7\. DEVELOPMENT PHASES

Phase 1

Setup project structure

Phase 2

Build full frontend workflow

Use mock backend

Phase 3

Implement backend logic

Integrate APIs

Enable exports



8\. SYSTEM GUARANTEES



The system must:

Complete full workflow without interruption

Maintain data consistency across steps

Produce usable engineering outputs

Be deployable using only free resources



9\. FINAL OUTPUT EXPECTATION

The system must deliver:

Interactive UI

Accurate layout

Energy estimation

Equipment suggestion

Exportable report

