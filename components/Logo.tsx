export function MedsysLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="medsysGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      
      {/* Cruz médica principal (Shape Básico do Fundo) */}
      <path
        d="M 35 15 H 65 V 35 H 85 V 65 H 65 V 85 H 35 V 65 H 15 V 35 H 35 V 15 Z"
        fill="url(#medsysGrad)"
      />
      
      {/* Stethoscope Path (Branco cortando a cruz) */}
      <path
        d="M 45 25 V 45 C 45 55, 55 55, 55 45 V 35 M 55 50 C 55 65, 30 65, 30 50 M 30 50 A 5 5 0 1 0 30 40 A 5 5 0 1 0 30 50"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
