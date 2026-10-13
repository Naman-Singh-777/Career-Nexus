// A single shared SVG turbulence filter, painted as a fixed full-viewport
// overlay. Cheaper and more "designed" than a repeating PNG noise texture.
export default function GrainOverlay() {
  return (
    <svg className="grain-layer" width="100%" height="100%" aria-hidden="true">
      <filter id="cn-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.4 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cn-grain)" />
    </svg>
  );
}
