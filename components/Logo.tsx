import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["600", "700"] });

export function ZyntraLogo({ className = "h-8", hideText = false }: { className?: string, hideText?: boolean }) {
  // We use the className on the SVG to control the height of the logo icon.
  // The wrapper will size itself to fit the icon and text.
  return (
    <div className="flex items-center gap-2.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={`${className} aspect-square`}
        fill="none"
      >
        <defs>
          <linearGradient id="zyntra-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00A2FF" />
            <stop offset="100%" stopColor="#003380" />
          </linearGradient>
        </defs>
        {/* Cruz médica principal */}
        <path
          d="M 35 15 H 65 V 35 H 85 V 65 H 65 V 85 H 35 V 65 H 15 V 35 H 35 V 15 Z"
          fill="url(#zyntra-blue)"
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
      {!hideText && (
        <span className={`${inter.className} text-[#003380] font-bold tracking-tight text-[1.35rem] leading-none mb-[2px]`}>
          ZyntraMed
        </span>
      )}
    </div>
  );
}
