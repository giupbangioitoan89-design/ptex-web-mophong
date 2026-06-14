---
version: alpha
name: PTex Math Simulation Design System
description: A premium glassmorphic dark mode design system optimized for high school math visualization, featuring clear Vietnamese typography and clean KaTeX mathematical layout.

colors:
  primary: "#6366f1" # Indigo-500: Primary branding color, action buttons, active nodes
  primary-light: "#a5b4fc" # Indigo-300: Hover highlights and primary border glowing edges
  primary-dark: "#4f46e5" # Indigo-600: Deep branding tones, pressed/active states
  accent: "#c084fc" # Purple-400: Highlights, double-angle/symmetry lines, vector curves
  bg-primary: "#0c0c1d" # Deep Space Navy: Main background, creates a high-contrast premium feel
  bg-card: "rgba(255, 255, 255, 0.035)" # Semi-transparent white: Base glass card background
  bg-card-hover: "rgba(255, 255, 255, 0.07)" # Hover card background
  text-primary: "#f1f5f9" # Slate-100: Core readable text color
  text-secondary: "#94a3b8" # Slate-400: Secondary text, subtitles, readouts labels
  text-muted: "#64748b" # Slate-500: Disabled text, axes numbers, background labels
  glass-bg: "rgba(255, 255, 255, 0.05)" # Glass background for control overlays
  glass-border: "rgba(255, 255, 255, 0.08)" # Frosted border overlay
  grade-10: "#34d399" # Emerald: Secondary color representing Grade 10 curriculum
  grade-11: "#60a5fa" # Blue-400: Secondary color representing Grade 11 curriculum
  grade-12: "#f87171" # Red-400: Secondary color representing Grade 12 curriculum

typography:
  fontFamily: "var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif"
  fontFamilyMath: "KaTeX_Main, KaTeX_Math, 'Times New Roman', serif"
  h1:
    fontSize: "1.88rem"
    fontWeight: "700"
    lineHeight: "1.25"
  h2:
    fontSize: "1.4rem"
    fontWeight: "600"
    lineHeight: "1.3"
  body-md:
    fontSize: "0.88rem"
    lineHeight: "1.6"
  readout-label:
    fontSize: "0.82rem"
    fontWeight: "500"
  readout-value:
    fontSize: "0.88rem"
    fontWeight: "700"

rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"

components:
  card-insight:
    backgroundColor: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.03))"
    borderColor: "rgba(99, 102, 241, 0.22)"
    borderRadius: "{rounded.lg}"
    padding: "{spacing.lg}"
  control-bar:
    backgroundColor: "{colors.glass-bg}"
    borderColor: "{colors.glass-border}"
    borderRadius: "{rounded.md}"
    padding: "{spacing.md}"
---

# PTex Design System Specification

Welcome to the **PTex Math Simulation Design System**. This document serves as a layout and UI contract to guide AI coding agents when building or editing components for this project.

---

## 🌌 1. Design & Visual Philosophy
PTex uses a **Premium Glassmorphic Deep Space Dark Mode** aesthetic. The UI must feel alive, clean, and highly educational, keeping geometric boards center-stage while presenting details, stats, and poems in structured overlay cards.

### Core Visual Principles:
- **Depth**: Card elements float on top of a deep space background using semi-transparent gradients, thin glass borders, and soft glowing drop shadows.
- **Micro-Animations**: Hover states should feel organic. Buttons, select inputs, and list items have subtle scale transitions and translation displacements (e.g. sliding $2px$ to the right).
- **Responsive Layout**: Two-column split layout on desktop (visual board on the left, readouts panel on the right) collapsing into a stacked linear layout on mobile viewports.

---

## 🎨 2. Color System
PTex avoids flat colors in favor of vibrant, tailored HSL values:
- **Interactive Tones**: Indigo (`#6366f1`) is the core interaction driver (primary actions). Violet/Purple (`#a855f7` / `#c084fc`) is used to draw secondary/auxiliary lines, vectors, and symmetry markers.
- **Curriculum Colors**: Grade levels are color-coded (Grade 10: Emerald, Grade 11: Blue, Grade 12: Red) to orient students immediately.
- **Contrast**: The main background uses a very dark deep space blue (`#0c0c1d`) with glowing decorative floating orbs behind elements, ensuring high readability and a beautiful aesthetic.

---

## 🔠 3. Typography & Vietnamese Font Support
To prevent issues with Vietnamese diacritic positioning (e.g. double marks, overlapping characters, or unexpected spacing shifts in words like "dấu", "sầu", "lẻ", "chẵn"), **strictly follow these rules**:

- **Font Family**: Always use **Inter** (`var(--font-inter)`) as the primary font for all user-interface elements, markdown descriptions, explanations, and labels. Do NOT fall back to generic serif fonts in Vietnamese prose.
- **Font Styling**: Avoid excessive font weights or italic styles on fallback system fonts. Stick to standard `font-weight: 500` or `600` on Inter.

---

## 📐 4. KaTeX Mathematical Formulas Guidelines
Mathematical formulas must render in high-fidelity using KaTeX. To keep them looking beautiful and fitting on all device displays:
1. **KaTeX Delimiters**: Use single dollar signs (`$...$`) for inline math (e.g., $y = f(x)$) and double dollar signs (`$$...$$`) for block equations.
2. **Formula Spacing & Layout**:
   - Avoid long, horizontally-extended equations. They clip on mobile screens.
   - Use the `aligned` environment (`\begin{aligned} ... \end{aligned}`) inside block equations to break multi-line equations cleanly at their equals signs:
     ```latex
     \begin{aligned}
     \sin 2a &= 2\sin a\cos a \\
     \cos 2a &= \cos^2 a - \sin^2 a
     \end{aligned}
     ```
3. **Escaping Backslashes**:
   - When writing equations inside JavaScript strings in `route.ts`, backslashes must be double-escaped:
     - Write `\\sin` for `\sin`
     - Write `\\\\` for `\\` (newlines in math blocks)
     - Write `\\frac{a}{b}` for `\frac{a}{b}`

---

## 🧱 5. UI Components

### A. The Visual Board (`jxgbox`)
- Rendered inside a client-side sandbox iframe using **JSXGraph**.
- **Coordinate Centering**: Bounding boxes must shift coordinate centers slightly downward to leave a clear spacing buffer at the top of the canvas, preventing geometric circles/labels from overlapping the bottom edge of the compact control bar.
- **Axis Labels**: Axes must have prominent KaTeX labels (e.g., label the horizontal axis as **$\cos$** or **$x$** and the vertical axis as **$\sin$** or **$y$**).

### B. Compact Control Bar
- The controls (sliders, select menus, checkboxes) overlay the bottom section of the graph using a frosted glass background (`--glass-bg` with `--glass-border` and `backdrop-filter: blur()`).
- **One-row Sliders**: Sliders must layout label, play/pause trigger, value indicator, and range input on a single compact line to maximize vertical graph space.
- **Conditional Visibility (`showIf`)**: Use the `showIf` field on controls in `route.ts` to show/hide sliders dynamically depending on the selected mode, preventing overflow of irrelevant parameters.

### C. Key Insights ("Điểm chính") Cards
- Standardised card container using the `card-insight` specs:
  - Shaded linear gradient background: `linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.03))`
  - Glowing thin border: `1px solid rgba(99, 102, 241, 0.22)`
  - Sub-items are rendered as individual card row entries with chevron rotation micro-animations on hover.
  - Poetry mnemonic blocks use a gold highlight (`#fef08a`) and a stand-alone display equation card.

---

## 🚫 6. Do's and Don'ts for AI Coding Agents

- **DO** use the `showReadouts` callback inside JSXGraph `initSimulation` and `updateSimulation` to send structured rows back to the React UI instead of drawing ugly text readouts on the canvas.
- **DO** use prefixed parameter states (e.g. `t_spring`, `t_tide`) when a simulation has multiple sub-modes with different coordinate ranges, avoiding range clamps carrying over.
- **DO** ensure vertical asymptotes on graphs (like tan or cot) are visually plotted as thin red dashed lines and mathematically hidden/disabled when the respective mode is inactive.
- **DON'T** write plain, unescaped backslashes inside mathematical content in `route.ts` as it will break KaTeX rendering on build time.
- **DON'T** use Tailwind utilities directly for custom card styling inside the simulation area. Always refer back to the custom properties in `globals.css` to preserve the brand system's integrity.
