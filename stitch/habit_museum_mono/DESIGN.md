# Design System Strategy: The Curated Silence

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**

This design system is not a utility; it is a gallery. Moving away from the "app-like" density of traditional SaaS, this system adopts the visual language of high-end editorial houses and luxury maisons. It prioritizes the "silent" intervals between elements—massive white space, architectural alignments, and a total absence of decorative noise. 

The aesthetic is rooted in **Organic Brutalism**. We reject the "friendly" web of rounded corners and playful icons in favor of a prestigious, sharp, and uncompromising layout. Every element must feel like it was placed by a curator on a gallery wall. If an element does not serve a functional or structural purpose, it is removed. We use intentional asymmetry and varying typographical scales to guide the eye, creating a prestigious rhythm that feels both modern and timeless.

---

## 2. Colors & Surface Logic
The palette is a sophisticated range of bone, parchment, and espresso. It is designed to feel warm yet clinical, like a sunlit architectural studio.

### The "No-Decoration" Rule
Colors must never be used for decoration. They are structural. 
- **Surface (#FFFCF7):** The primary canvas. It represents the "wall" of the gallery.
- **Surface-Container-Low (#FCF9F3):** Used for subtle sectioning where content needs to feel slightly more grounded.
- **On-Surface (#373831) & Primary (#715A46):** These are our "Espresso" and "Tobacco" tones. They are used for high-contrast communication and prestigious accents.

### The "Architectural Line"
While traditional systems use borders to create boxes, this design system uses the **Hairline 1px Border (`outline-variant` - #BABAB0)** to define axes. Think of these as drafting lines on a floor plan. 
- **Prohibit sectioning with borders:** Do not use 1px solid borders to create "sections." Boundaries must be defined through background color shifts (e.g., a `surface-container-low` section sitting on a `surface` background).
- **The "Ghost Border":** If a border is required for input fields or primary CTA containers, it must be the 1px hairline in `outline-variant`. Do not use 100% black or high-contrast espresso for borders.

---

## 3. Typography: The Editorial Voice
Typography is the primary vehicle for the brand’s soul. We use a high-contrast pairing of a prestigious Serif and a technical Sans-Serif.

### Display & Headlines (The Voice)
- **Font:** Cormorant Garamond / Newsreader.
- **Styling:** All Caps. 
- **Letter Spacing:** `0.25em`.
- **Purpose:** These are the "labels" in the gallery. Use `display-lg` and `headline-lg` to create massive focal points. The wide letter-spacing creates a sense of "expensive" air, forcing the reader to slow down and admire the form of the words.

### UI & Labels (The Technicality)
- **Font:** Inter / Helvetica Neue.
- **Styling:** All Caps for labels and buttons.
- **Letter Spacing:** `0.15em` minimum.
- **Purpose:** Functional text. By keeping UI text in a clean, uppercase Sans-Serif with wide spacing, we maintain the architectural feel even in small functional elements.

---

## 4. Elevation & Depth
In this system, "Elevation" is a misnomer. We do not use Z-axis shadows. We use **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. To make a card feel interactive or distinct, place a `surface-container-lowest` card on a `surface-container-low` section. This creates a "soft lift" that feels like layered paper rather than floating plastic.
- **Shadow Prohibition:** Standard drop shadows are strictly forbidden. They introduce "fuzziness" that contradicts our sharp, architectural goal.
- **Glassmorphism:** To create a sense of premium "objects," use semi-transparent `surface` colors with a high `backdrop-blur` for navigation bars or floating menus. This allows the content beneath to bleed through as a blur of color, maintaining the "silent" aesthetic while adding depth.

---

## 5. Components
All components follow the **Square Edge Rule**: `Border-Radius: 0px` across all scales.

### Buttons
- **Primary:** Espresso background (`primary`), Bone text (`on-primary`). No icons. Square edges.
- **Secondary:** Hairline border (`outline-variant`), Espresso text. 
- **Tertiary/Ghost:** Text-only, uppercase, `0.15em` letter spacing. Use a simple underline (1px) for hover states.
- **Padding:** Exaggerated horizontal padding (e.g., 32px or 48px) to emphasize the architectural width.

### Input Fields
- **Style:** Square-edged containers with a 1px hairline border (`outline-variant`). 
- **Focus State:** Border color shifts to `primary` (Espresso). No "glow" or shadow.
- **Labels:** Always `label-sm`, All Caps, `0.15em` letter spacing, placed outside the input box.

### Cards & Lists
- **Rule:** Forbid the use of divider lines between list items. Use vertical white space to separate content.
- **Layout:** Cards should not have shadows. Define them by a subtle background shift (e.g., `surface-container-high`) or a hairline border.

### Navigation
- **The "No-Icon" Rule:** Icons are strictly forbidden. Navigation must be entirely text-based. Instead of a "Home" icon, use the word "HOME." This reinforces the editorial, high-fashion aesthetic found in brands like Celine.

---

## 6. Do's and Don'ts

### Do
- **Embrace Asymmetry:** Place text off-center or use wide margins to create a custom, editorial feel.
- **Use Massive White Space:** If a section feels "full," it is likely too crowded. Increase the padding by 2x.
- **Maintain Sharpness:** Ensure every corner is a 90-degree angle.

### Don't
- **No Icons:** Do not use 'hamburger' menus, 'search' magnifying glasses, or 'arrow' icons. Use text labels.
- **No Shadows:** Do not use any form of `box-shadow` or `drop-shadow`.
- **No Rounded Corners:** `0px` is the only permissible value for border-radius.
- **No Decorative Graphics:** Avoid patterns, flourishes, or "visual fluff." Let the typography and the space do the work.

### Accessibility Note
Because we are using low-contrast hairline borders, ensure that your typography (`on-surface`) maintains a high contrast ratio against the background. Rely on the Espresso (`#3D2B1A`) for all critical reading paths.