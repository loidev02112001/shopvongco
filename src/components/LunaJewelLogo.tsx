/**
 * LunaJewelLogo — SVG inline logo matching the brand identity.
 * Props:
 *   variant: "full"   — floral icon + "Luna Jewel" text (for TopBar)
 *            "icon"   — floral icon only (for product card watermark)
 *   className: extra Tailwind / CSS classes
 */

interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
  /** Height in px (width scales proportionally). Default: full=48, icon=24 */
  height?: number;
}

const BRAND = "#5bbfbf";

/** 4-petal floral icon — matches the Luna Jewel brand logo exactly */
function FloralIcon({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const s = size / 2;
  // Each petal: two curved arcs forming an almond/vesica shape, repeated at 0°,90°,180°,270°
  // Plus diagonal petals at 45°,135°,225°,315° (smaller, triangular cross shape)
  const petalPath = (rotate: number, large: boolean) => {
    const r1 = large ? s * 0.72 : s * 0.52;
    const r2 = large ? s * 0.22 : s * 0.16;
    // Petal pointing upward from center, rotated
    return (
      <g key={rotate} transform={`rotate(${rotate} ${cx} ${cy})`}>
        {/* Outer petal shape */}
        <path
          d={`M ${cx} ${cy - r1 * 0.15} 
              C ${cx - r2} ${cy - r1 * 0.5}, ${cx - r2 * 0.7} ${cy - r1}, ${cx} ${cy - r1}
              C ${cx + r2 * 0.7} ${cy - r1}, ${cx + r2} ${cy - r1 * 0.5}, ${cx} ${cy - r1 * 0.15}Z`}
          fill="none"
          stroke={BRAND}
          strokeWidth={large ? "1.2" : "0.9"}
        />
        {/* Inner petal line */}
        <path
          d={`M ${cx} ${cy - r1 * 0.25}
              C ${cx - r2 * 0.5} ${cy - r1 * 0.55}, ${cx - r2 * 0.35} ${cy - r1 * 0.85}, ${cx} ${cy - r1 * 0.88}
              C ${cx + r2 * 0.35} ${cy - r1 * 0.85}, ${cx + r2 * 0.5} ${cy - r1 * 0.55}, ${cx} ${cy - r1 * 0.25}Z`}
          fill="none"
          stroke={BRAND}
          strokeWidth={large ? "1.0" : "0.7"}
          opacity="0.7"
        />
      </g>
    );
  };

  // Cross connectors (the square/diamond cross shape in the middle)
  const crossSize = s * 0.38;

  return (
    <g>
      {/* 4 main petals */}
      {[0, 90, 180, 270].map(r => petalPath(r, true))}
      {/* 4 diagonal smaller petals */}
      {[45, 135, 225, 315].map(r => petalPath(r, false))}

      {/* Cross / diamond connector lines */}
      <rect
        x={cx - crossSize * 0.18}
        y={cy - crossSize}
        width={crossSize * 0.36}
        height={crossSize * 2}
        fill="none"
        stroke={BRAND}
        strokeWidth="1.0"
        opacity="0.5"
      />
      <rect
        x={cx - crossSize}
        y={cy - crossSize * 0.18}
        width={crossSize * 2}
        height={crossSize * 0.36}
        fill="none"
        stroke={BRAND}
        strokeWidth="1.0"
        opacity="0.5"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={s * 0.13} fill={BRAND} />
      {/* Small dots at top/bottom/left/right of center */}
      {[0, 90, 180, 270].map(deg => {
        const rad = (deg * Math.PI) / 180;
        const dx = cx + Math.sin(rad) * s * 0.22;
        const dy = cy - Math.cos(rad) * s * 0.22;
        return <circle key={deg} cx={dx} cy={dy} r={s * 0.045} fill={BRAND} opacity="0.7" />;
      })}
    </g>
  );
}

export function LunaJewelLogo({ variant = "full", className = "", height }: LogoProps) {
  if (variant === "icon") {
    const h = height ?? 24;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 60"
        height={h}
        width={h}
        className={className}
        aria-label="Luna Jewel"
      >
        <FloralIcon cx={30} cy={30} size={54} />
      </svg>
    );
  }

  // full variant — icon on top, text below (stacked like in the reference image)
  const h = height ?? 52;
  // viewBox: 200 wide × 110 tall (icon 70px, gap, text 36px)
  const vw = 200;
  const vh = 110;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${vw} ${vh}`}
      height={h}
      width={(h / vh) * vw}
      className={className}
      aria-label="Luna Jewel"
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Yeseva+One&display=swap');`}</style>
      </defs>
      {/* Floral icon centered */}
      <FloralIcon cx={vw / 2} cy={36} size={62} />
      {/* Brand name below icon */}
      <text
        x={vw / 2}
        y="98"
        textAnchor="middle"
        fontFamily="'Yeseva One', 'Georgia', serif"
        fontSize="32"
        fontWeight="400"
        letterSpacing="0.5"
        fill={BRAND}
      >
        Luna Jewel
      </text>
    </svg>
  );
}
