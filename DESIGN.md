---
theme: "industrial-brutalism"
tokens:
  colors:
    brand_pink: "#FF90E8"        # High-contrast accent pink
    brand_black: "#000000"       # Pure stark black
    brand_white: "#FFFFFF"       # Crisp paper white
    canvas_bg: "#0A0A0A"         # Dark canvas
    card_bg: "#161617"           # Surface layer
    border_subtle: "#2C2C2E"     # Industrial 1px border
    neon_green: "#A3E635"        # Tech green indicator
  typography:
    display: "Syne, Impact, sans-serif"
    body: "Inter, System-UI, sans-serif"
    mono: "JetBrains Mono, monospace"
  borders:
    brutalist: "3px solid #000000"
    industrial: "1px solid #2C2C2E"
  shadows:
    hard_pop: "6px 6px 0px #000000"
    soft_glow: "0 0 20px rgba(163, 226, 53, 0.15)"
---

# DESIGN.md: ARGUS Industrial Design System

This specification defines the high-contrast, developer-centric, dark terminal aesthetic for ARGUS.

## 1. Visual Identity & Rationale
* **The Concept**: "Industrial Brutalism." 
* **The Atmosphere**: The interface must feel like a premium, high-utility developer tool wrapped in high-contrast print media geometry. 
* **Depth Philosophy**: Flat planes only. Do not use gradients, blurs, or smooth box-shadows. Use stark 1px grid lines or heavy 3D offset blocks to separate structural areas.

---

## 2. Component Specifications

### Layout Canvases
* **Base Canvas**: Deep `#0A0A0A` base canvas. Nested layouts step up to `#161617`. No structural blurs are allowed.

### Structural Borders & Framing
* **The Divider Rule**: Elements are separated by a sharp, crisp line. 
* Use `border: 1px solid #2C2C2E` for sub-sections to match server-infrastructure tone.
* Use `border: 3px solid #000000` for primary components to channel ink-heavy geometric frames.

### Buttons & Interactive States
* **Primary Interactive**: Must feature a heavy 3px black perimeter outline.
* **The Hover Blueprint**: When a user hovers over an interactive tile, it does not glow or fade. It physically drops down and to the right via a transform shift, counter-acting a solid block offset shadow.
* **Action Code**:
  ```css
  .button-primary {
    background: var(--brand_pink);
    border: 3px solid #000000;
    box-shadow: 6px 6px 0px #000000;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  .button-primary:hover {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0px #000000;
  }
  ```

### Typography Rules
* **Headings (H1, H2)**: Enforce strict uppercase treatments with zero tracking (`0em`) so letterforms pack tightly together.
* **Infrastructure Log Outputs**: Technical tables, deployment statuses, and numeric values must use a monospace font family like JetBrains Mono. Prefix these blocks with a small status indicator dot using neon green (`#A3E635`).

---

## 3. UI Micro-Patterns

### Product & Service Cards
* Cards sit entirely flush to the grid. 
* Avoid rounded container capsules. Keep corner radiuses locked sharply between `0px` and `4px`.
* Treat headers as independent structural blocks with a solid fill background, creating a distinct "header tab" effect above the card data.

### Status Indicators
* **Live / Active Deployment**: A solid `#A3E635` circular badge with zero outer radial pulse animation.
* **Draft / Suspended State**: A raw matte black block fill.
