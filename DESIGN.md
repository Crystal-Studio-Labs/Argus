---
theme: "argus-mythological-brutalism"
tokens:
  colors:
    argus_purple: "#7C3AED"      # Argus 100-Eye Royal Purple
    argus_purple_glow: "#A855F7" # Electric Purple Accent
    atlas_cyan: "#06B6D4"        # Atlas Visual Topology Cyan
    athena_emerald: "#10B981"    # Athena Shield Compliance Green
    hermes_gold: "#F59E0B"       # Hermes Warning Gold
    brand_black: "#000000"       # Stark Black Borders
    brand_white: "#FFFFFF"       # Crisp White Text
    canvas_bg: "#090D16"         # Deep Observatory Void Canvas
    card_bg: "#111827"           # Surface Panel
    border_subtle: "rgba(124, 58, 237, 0.3)" # Subtle Purple Frame Border
  typography:
    display: "Syne, Impact, sans-serif"
    body: "Inter, System-UI, sans-serif"
    mono: "JetBrains Mono, monospace"
  borders:
    brutalist: "3px solid #000000"
    industrial: "1px solid rgba(124, 58, 237, 0.3)"
  shadows:
    hard_pop: "6px 6px 0px #000000"
    purple_glow: "0 0 20px rgba(124, 58, 237, 0.25)"
---

# DESIGN.md: ARGUS Mythological Brutalism System

This specification fuses high-contrast Industrial Brutalism with the **ARGUS Project Vibe & Greek Mythology** color palette.

## 1. Visual Identity & Rationale
* **The Concept**: "Mythological Cyber-Observatory." 
* **The Vibe**: Deep royal purple, cyber cyan, emerald compliance green, and golden warning accents set against a stark midnight void canvas.
* **Depth Philosophy**: Industrial 3D block offset shadows (`6px 6px 0px #000000`) and sharp grid line framing.

---

## 2. Color Palette & Greek Mapping
* **Argus Royal Purple (`#7C3AED` / `#A855F7`)**: Core brand color representing the 100-eyed all-seeing guardian. Used for primary buttons, highlights, and headers.
* **Atlas Cyber Cyan (`#06B6D4` / `#00F0FF`)**: Secondary accent representing git control flow maps and visual topology flowcharts.
* **Athena Aegis Emerald (`#10B981`)**: Representing architectural compliance, shield armor, and passing builds.
* **Hermes Warning Gold (`#F59E0B`)**: Representing swift debt alerts, `// TODO` scanners, and security warnings.
* **Midnight Observatory Void (`#090D16` / `#111827`)**: Ultra-dark canvas background.

---

## 3. Component Specifications

### Buttons & Interactive States
* **Primary Interactive**: Features heavy 3px black perimeter outline with physical 3D drop-down translation on hover.
  ```css
  .btn-purple {
    background: #7C3AED;
    color: #FFFFFF;
    border: 3px solid #000000;
    box-shadow: 6px 6px 0px #000000;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  .btn-purple:hover {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0px #000000;
  }
  ```
