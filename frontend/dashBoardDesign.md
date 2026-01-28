# The "Paper Workspace" Design Playbook
*A design system blending Neo-Brutalism, Artsy Sketchbook vibes, and Functional UI.*
*Updated: December 2025 - Refined for strategic use of brutalist elements*

## 1. Core Philosophy
The interface should feel like a **digital workspace made of physical materials**. It combines the tactility of paper, the boldness of a marker pen, and the creativity of a sketchbook - but with **intentional restraint** to avoid visual fatigue.

**Key Principles:**
- **Hierarchy through contrast**: Bold elements should highlight what matters
- **Breathing room**: Not everything needs thick borders and shadows
- **Strategic brutalism**: Use heavy styling for primary actions and key containers only
- **Keyterms**: Cartoonist, Authentic, Neo-Brutalist, Playful, "Ink & Paper", Balanced

---

## 2. Color System

### Base Layers (The Paper)
Avoid pure white (`#FFFFFF`). Use warm, creamy off-whites to simulate paper.
- **Main Background**: `#FFFEF8` (Cream) - The canvas
- **Secondary Background**: `#FFFDF5` (Warm Notepad)
- **Card Background**: `#FFFFFF` (Stark White for contrast against cream)

### The Ink
All structural elements use pure black to mimic ink outlines.
- **Primary Borders/Text**: `#000000`
- **Subtle Borders**: `#E5E5E5` or `border-gray-200` (for non-critical divisions)

### The Highlighters (Accents)
Use punchy, saturated "marker" colors for focal points.
- **Yellow (Attention)**: `#FFD028` or `bg-yellow-300`
- **Blue (Action)**: `#3B82F6`
- **Purple (Focus)**: `#A855F7`
- **Orange (Energy)**: `#F97316`

**Rule:** Use accent colors sparingly - shadows, hover states, or single focal elements per view.

---

## 3. Typography

### Headlines
**Font**: `Tanker-Regular` (Condensed, Heavy Sans-serif)
**Style**: Uppercase, Massive, Tight Tracking
**Usage**: Page titles, major section headers only
**Example**:
```css
font-family: 'Tanker-Regular', sans-serif;
font-weight: 900;
text-transform: uppercase;
letter-spacing: -0.05em;
font-size: 3-5rem; /* Use sparingly for impact */
```

### Subheadings
**Font**: Inter or system sans-serif
**Style**: Bold weight, normal case
**Usage**: Section titles, card headers
**Example**:
```css
font-family: 'Inter', sans-serif;
font-weight: 700;
font-size: 1.25-1.5rem;
```

### Body Copy
**Font**: Standard Sans-serif (Inter/Arial)
**Style**: Clean, medium weight (400-500)
**Tip**: Use `font-bold` (700) for labels and emphasis

---

## 4. Component Styling - The Strategic Approach

### When to Use Heavy Brutalist Styling:

#### ✅ **Primary Actions & Key Containers**
Use thick borders + hard shadows on:
- Main CTA buttons
- Primary navigation cards (work mode selectors, main booking cards)
- Modal dialogs and overlays
- Stats cards on dashboard

**Style:**
```css
border-[3px] border-black
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
rounded-2xl
```

#### ✅ **Interactive Elements That Need Emphasis**
- Booking cards in grid view
- Space cards that users click
- Active state indicators

**Hover Effect:**
```css
hover:-translate-y-1
hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
```

---

### When to Use Subtle Styling:

#### ⚪ **Secondary Elements**
Use minimal or no shadows on:
- Command palette (clean, floating feel)
- Dropdown menus and popovers
- List items and table rows
- Form inputs (use simple borders)
- Secondary buttons

**Style:**
```css
border-2 border-gray-200  /* or border-black with no shadow */
rounded-xl
/* NO shadow */
```

#### ⚪ **Overlays & Floating UI**
- Pomodoro timer overlay
- Command palette
- Notification panels
- Toast messages

**Reasoning:** These elements float above content, so heavy shadows create visual clutter.

---

### The "Ink Outline" Rule (Refined)

**Primary Elements:**
- `border-[3px] border-black` - For primary containers and CTAs

**Secondary Elements:**
- `border-2 border-black` or `border-2 border-gray-300` - For less important divisions

**Subtle Elements:**
- `border border-gray-200` - For internal dividers, form fields

---

### The "Hard Shadow" Rule (Strategic Use)

**Use shadows for:**
- Cards you can click/interact with
- Primary buttons
- Elements that need to "pop" from the background

**Skip shadows for:**
- Floating overlays (already elevated by backdrop)
- Inline buttons and links
- List items and table cells
- Panels with borders (border alone provides enough definition)

**Shadow Syntax:**
```css
/* Primary */
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]

/* Hover */
shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]

/* Accent color shadows (use sparingly) */
shadow-[4px_4px_0px_0px_rgb(255,208,40)] /* Yellow */
```

---

## 5. Buttons - Hierarchy System

### Primary Button (High Emphasis)
Use for main actions: "Book Now", "Confirm", "Start"
```jsx
<button className="
  px-6 py-3 
  bg-black text-white 
  border-[3px] border-black 
  rounded-xl 
  font-bold
  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
  hover:-translate-y-1 
  hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
  active:translate-y-0 
  active:shadow-none
">
  Primary Action
</button>
```

### Secondary Button (Medium Emphasis)
Use for alternative actions: "Cancel", "View Details"
```jsx
<button className="
  px-6 py-3 
  bg-white text-black 
  border-2 border-black 
  rounded-xl 
  font-bold
  /* NO SHADOW - cleaner look */
  hover:bg-gray-100
  active:bg-gray-200
">
  Secondary Action
</button>
```

### Tertiary Button (Low Emphasis)
Use for navigation, filters, minor actions
```jsx
<button className="
  px-4 py-2 
  bg-transparent text-gray-600 
  border-2 border-transparent 
  rounded-lg 
  font-medium
  hover:bg-gray-100 
  hover:border-gray-200
">
  Tertiary Action
</button>
```

---

## 6. Textures & Decorative Elements

### Background Patterns (Always Subtle)
Use CSS gradients to create paper-like texture without overwhelming content.

**Dot Grid (Primary Background):**
```css
background-color: #FFFEF8;
background-image: radial-gradient(#E5E5E5 1px, transparent 1px);
background-size: 24px 24px;
```

**Notebook Lines (Alternate):**
```css
background-image: linear-gradient(#E5E7EB 1px, transparent 1px);
background-size: 100% 32px;
```

### "Doodle" Details (Use Sparingly)
Add human imperfection only to hero elements or empty states.
- **Wavy Underlines**: `decoration-wavy` on special headings
- **Rotated Elements**: `rotate-[-1deg]` on featured cards only
- **Hand-drawn accents**: SVG illustrations for empty states

---

## 7. Icons

Use **Lucide React** icons with bold strokes to match ink aesthetic.
- **Stroke Width**: `2.5-3px` (Bold) for primary icons
- **Stroke Width**: `2px` (Regular) for secondary icons
- **Size**: `20-24px` is standard, `16-18px` for compact UI

```jsx
<Calendar size={24} strokeWidth={3} />  /* Primary icon */
<Settings size={20} strokeWidth={2} />  /* Secondary icon */
```

---

## 8. Layout Principles

### Spacing (Generous)
Give elements room to breathe - especially important with bold borders.
- **Section gaps**: `gap-8` (32px) or `gap-12` (48px)
- **Card padding**: `p-6` (24px) or `p-8` (32px)
- **Button padding**: `px-6 py-3` (24px × 12px)

### Grid Systems
Use consistent grid spacing:
- **2-column**: `grid-cols-1 xl:grid-cols-2 gap-8`
- **3-column**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **4-column**: `grid-cols-2 lg:grid-cols-4 gap-4`

### Border Radius Hierarchy
- **Large containers/cards**: `rounded-2xl` (16px) or `rounded-[32px]`
- **Buttons/inputs**: `rounded-xl` (12px)
- **Small elements**: `rounded-lg` (8px)
- **Pills/badges**: `rounded-full`

---

## 9. Animation Principles

### Micro-interactions (Everywhere)
Keep transitions snappy and purposeful.
```css
transition-all duration-300
```

### Portal Animations (Special Overlays)
Use GSAP for dramatic entrances:
- Pomodoro timer: Circle clip-path expansion
- Command palette: Circle from center
- Modals: Slide + fade

```javascript
gsap.fromTo(element, 
  { clipPath: 'circle(0% at 50% 50%)' },
  { clipPath: 'circle(150% at 50% 50%)', duration: 0.4, ease: 'power2.out' }
);
```

### Hover States
- **Heavy elements**: Translate up + increase shadow
- **Light elements**: Background color change only

---

## 10. Real-World Examples

### ✅ Good Use of Heavy Brutalism:
```jsx
/* Main booking card - clickable, important */
<div className="
  bg-white 
  border-[3px] border-black 
  rounded-2xl 
  p-6 
  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
  hover:-translate-y-1 
  hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
  cursor-pointer
">
  <h3 className="font-black text-xl">Hot Desk 1.3</h3>
</div>
```

### ✅ Good Use of Subtle Styling:
```jsx
/* Command palette - floating, should feel light */
<div className="
  bg-white 
  border-[3px] border-black 
  rounded-2xl 
  overflow-hidden
  /* NO SHADOW - already floating above backdrop */
">
  <input className="border-none" />
</div>
```

### ❌ Overuse to Avoid:
```jsx
/* DON'T apply shadows to every single list item */
<li className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">  /* ❌ Too much */
  List item
</li>

/* Instead, use subtle borders */
<li className="border-b border-gray-200 py-3">  /* ✅ Clean */
  List item
</li>
```

---

## 11. Design Checklist

Before applying brutalist styling, ask:
- [ ] Is this element primary/interactive? → Use heavy borders + shadow
- [ ] Is this element secondary/informational? → Use light borders, no shadow
- [ ] Is this a floating overlay? → Skip shadows (backdrop provides elevation)
- [ ] Does this create visual clutter? → Simplify
- [ ] Can users focus on the content? → If not, reduce decoration

---

## 12. Component Library Reference

| Component Type | Border | Shadow | Radius | Use Case |
|---------------|--------|--------|---------|----------|
| **Primary Card** | 3px black | 4px hard | rounded-2xl | Stats, booking cards |
| **Secondary Card** | 2px gray | None | rounded-xl | List items, info panels |
| **Primary Button** | 3px black | 4px hard | rounded-xl | Main CTAs |
| **Secondary Button** | 2px black | None | rounded-xl | Alternative actions |
| **Input Field** | 2px gray | None | rounded-lg | Forms |
| **Floating Panel** | 3px black | None | rounded-2xl | Overlays, modals |
| **Badge/Tag** | 2px black | None | rounded-full | Labels, status |

---

**Last Updated:** December 9, 2025
**Design Philosophy:** Bold where it matters, restrained everywhere else.
