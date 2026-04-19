// Stethoscope + ECG animation logo
const HeroLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`} aria-hidden="true">
    <svg viewBox="0 0 200 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ECG line */}
      <path
        className="ecg-line"
        d="M0 40 L40 40 L48 20 L56 60 L64 30 L72 50 L80 40 L200 40"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stethoscope */}
      <g transform="translate(140 12)">
        <path d="M10 8 v18 a14 14 0 0 0 28 0 v-18" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
        <circle cx="10" cy="6" r="3" fill="hsl(var(--primary))" />
        <circle cx="38" cy="6" r="3" fill="hsl(var(--primary))" />
        <path d="M24 40 v8 a8 8 0 0 0 16 0" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="40" cy="52" r="6" fill="hsl(var(--primary-glow))" stroke="hsl(var(--primary))" strokeWidth="2" />
      </g>
    </svg>
  </div>
);

export default HeroLogo;
