# Design System Documentation: High-End Editorial

## 1. Overview & Creative North Star
### The Digital Curator
This design system is not a utility; it is a gallery. Inspired by the tactile precision of Bottega Veneta and the aromatic minimalism of Aesop, this system treats every user habit as a precious artifact. We move away from the "app-like" feel of rounded buttons and bouncy animations, moving instead toward the static, permanent authority of a museum catalog.

**The signature is defined by tension:** the tension between the organic warmth of the ivory palette and the rigid, uncompromising squareness of the layout. We do not use icons. We do not use shadows. We rely on massive whitespace (The "Breath of the Curator") and sophisticated typography to command attention.

---

## 2. Colors & Tonal Architecture
The palette is a monochromatic study in warmth. It avoids the sterile "tech blue" or "pure white" in favor of textures that feel like heavy linen and sand.

### Surface Hierarchy & Nesting
To achieve luxury, we must stop using lines to solve layout problems. While hairline borders are permitted for specific functional separators, the architecture of the interface is defined by **Tonal Layering**.

*   **Base Layer:** `surface` (#FAF7F2) – The gallery wall.
*   **Secondary Layer:** `surface-container-low` (#F6F3EE) – Used for subtle sectioning of the page.
*   **Active/Inset Layer:** `surface-container-highest` (#E5E2DD) – Used for focused content areas.

**The "Glass & Gradient" Rule:** 
To prevent the layout from feeling "flat" or "dead," use semi-transparent versions of `surface_container_lowest` (#FFFFFF) with a 20px backdrop blur for floating navigation bars or modal overlays. This creates a "frosted glass" effect that feels expensive and integrated.

**Signature Textures:** 
For main CTA backgrounds, utilize a subtle linear gradient from `primary` (#261707) to `primary_container` (#3D2B1A). This 1% shift in value provides a "visual soul" that solid hex codes lack.

---

## 3. Typography: The Editorial Voice
Typography is our primary tool for navigation. In the absence of icons, the weight, style, and casing of our type must do the heavy lifting.

*   **Display & Headlines:** `Playfair Display` (Serif). This is our "Art Label." Use the 400 weight for headers. Use *Italics* sparingly to denote sub-titles or secondary thoughts within a headline.
*   **UI & Utility:** `Inter`. This is our "Curator's Note." 
    *   **Buttons/Inputs:** Inter 400.
    *   **Labels:** Inter 10px, 0.2em letter-spacing, Uppercase. Use `on_secondary_container` (#755f42) for these labels to ensure they feel like metadata, not primary content.

---

## 4. Elevation & Depth
Traditional elevation (Z-axis) is strictly prohibited. There are no shadows in this museum. Depth is achieved through the **Layering Principle**.

*   **Tonal Stacking:** Place a `surface_container_lowest` card on top of a `surface_container` background. The 1% difference in "ivory" creates a soft, natural lift that mimics fine paper stacked on a desk.
*   **The Ghost Border:** For accessibility in forms, use the `outline_variant` token at 20% opacity. This creates a "suggestion" of a boundary without the visual clutter of a solid line.
*   **Hairline Rules:** Use a 1px solid line (`outline_variant`) only for horizontal breaks between list items or to define the bottom-border of an input. Never use four-sided boxes for sectioning.

---

## 5. Components

### Buttons
All buttons are strictly square (0px radius).
*   **Primary:** Solid `primary_container` (#3D2B1A) with `surface` (#FAF7F2) text.
*   **Secondary:** 1px `outline` (#80756d) border with `primary` (#261707) text. 
*   **Interaction:** On hover/press, the background should shift to `secondary` (#715b3e).

### Inputs
*   **Styling:** A single bottom border (1px hairline) using `outline_variant`. No background fill. 
*   **Labels:** Always use the "Section Label" style (10px, Uppercase, 0.2em spacing) positioned 8px above the input line.
*   **Error State:** Change the bottom border to `error` (#BA1A1A). The error text should be Inter 11px.

### Text-Only Navigation (The "No-Icon" Rule)
Icons are replaced by text labels. 
*   **Menu:** "MENU" (Inter 10px, Uppercase)
*   **Back:** "BACK" (Inter 10px, Uppercase)
*   **Search:** "SEARCH" (Inter 10px, Uppercase)
This forces the user to read the interface, creating a slower, more intentional "museum" pace.

### Cards & Lists
*   **Cards:** No shadows. No borders. Use `surface_container_low` for the card body. 
*   **Spacing:** Use a 48px or 64px vertical margin between sections. Massive whitespace is the indicator of luxury. If the design feels "empty," you are doing it correctly.

---

## 6. Do's and Don'ts

### Do
*   **Use Asymmetry:** Place headlines off-center to create an editorial, magazine-like feel.
*   **Embrace Italics:** Use Playfair Display Italic for large numbers (e.g., habit streaks) to make them look like calligraphy.
*   **Strict Alignment:** Since there are no boxes to contain elements, your vertical grid alignment must be perfect.

### Don't
*   **No Rounded Edges:** Even 2px of rounding destroys the architectural integrity of this system. Keep it at 0px.
*   **No Icons:** Do not use "X" for close or "Chevron" for back. Use "CLOSE" and "BACK."
*   **No "Pure" Grey:** Never use #000000 or #808080. Always use the warm-tinted tokens (`on_surface_variant`, `primary`, etc.) to maintain the heat of the design.
*   **No Dividers for Sectioning:** Rely on 64px+ whitespace to separate major sections before reaching for a hairline divider.