# Airy — Landing (first page)

Minimal product landing inspired by air.inc. Full-screen 3D typography hero that morphs into a sticky header on scroll.

## Run locally

ES modules require a local server. From the project root:

```bash
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000).

## Behavior

- **Load:** Full-viewport hero with centered 3D “Airy” (extruded, matte), soft lighting, and subtle idle motion. Supporting line: “Instant product photos from one shot.”
- **Scroll (first ~80vh):** 3D text flattens, scales down, moves up, and becomes the sticky header. Supporting text fades out.
- **Below fold:** Sticky header plus one intro line (max-width 560–640px).
- **Reduced motion:** 3D is skipped; 2D “Airy” and sticky header show immediately.
- **Mobile:** Same flow with smaller scales and centered header.

## Stack

- HTML + CSS
- Vanilla JS + Three.js (FontLoader, TextGeometry) for 3D typography and scroll-driven morph
