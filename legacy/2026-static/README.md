# SMUN React

React + Vite conversion of the SMUN redesign. Preserves six committee briefs, all Secretariat records, speech timer, delegate queue and committee resources.

## Stack
- React 19.3.1, Vite 8.3.8, React plugin 6.3.0
- GSAP 3.15.1 + ScrollTrigger
- OGL 1.0.11 for RippleDistortion
- React Bits: GlowCursor, RippleDistortion, OptionWheel, DriftWall and GradientASCII

## Run
Use Node 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Build with `npm run build`; preview using `npm run preview`.

## Responsive effects
GlowCursor is disabled for touch-size layouts and reduced-motion preferences. RippleDistortion is the fixed site background and uses lower quality on mobile. GSAP ScrollTrigger runs the site-wide parallax and reveal effects with shorter travel on mobile and turns them off for reduced motion. OptionWheel becomes a compact committee selector on mobile. DriftWall shifts from five to two columns and reduces perspective and speed. GradientASCII appears only on committee brief routes and uses a smaller cell size on mobile.

## Preserved functionality
The conference timer retains six presets, pause and reset. The delegate queue persists in localStorage and supports reordering, TXT/CSV import and CSV export. Committee resources support PDF, DOC, DOCX, PPT, PPTX and TXT uploads up to 20 MB.

**Storage limitation:** committee resource uploads are stored only in the current browser using IndexedDB. They are not shared with delegates. Shared uploads need an authenticated backend and cloud storage.

Legacy HTML/JS files remain as reference; the active app begins at `index.html` -> `src/main.jsx`.


## Interactive card treatments

- Primary calls to action use a 3D cube button styled with styled-components. Pointer hover and keyboard focus reveal the upper face; touch activation remains a normal single-tap navigation.
- Secretariat roster cards expand their biography preview on mouse hover or keyboard focus. Selecting a card launches a full profile panel using GSAP Flip shared-element transitions. On touch devices the hover preview is removed and a tap opens the full profile directly.
