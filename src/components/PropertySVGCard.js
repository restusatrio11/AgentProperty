import styles from "./PropertySVGCard.module.css";

export default function PropertySVGCard({ namaProperti, tipe, status }) {
  const hash = namaProperti ? getHashCode(namaProperti) : 0;
  
  function getHashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = str.charCodeAt(i) + ((h << 5) - h);
    }
    return Math.abs(h);
  }

  // Deterministic values based on name hash
  const gradientDir = hash % 4;
  const numGridLines = 6 + (hash % 5);
  const accentCircleX = 80 + (hash % 240);
  const accentCircleY = 60 + (hash % 100);
  const accentCircleR = 30 + (hash % 40);
  const linePatternIndex = hash % 3;

  // Set colors
  const goldColor = "#C9A961";
  const darkBgStart = "#1A1A1A";
  
  // Custom dark gradient end based on hash
  const bgEnds = ["#262626", "#2D261A", "#1F232D", "#2E1C1C"];
  const darkBgEnd = bgEnds[hash % bgEnds.length];

  return (
    <svg 
      className={styles.cardSvg} 
      viewBox="0 0 400 240" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`grad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={darkBgStart} />
          <stop offset="100%" stopColor={darkBgEnd} />
        </linearGradient>
        <pattern id={`grid-${hash}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(201, 169, 97, 0.05)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="400" height="240" fill={`url(#grad-${hash})`} />
      
      {/* Grid Pattern overlay */}
      <rect width="400" height="240" fill={`url(#grid-${hash})`} />

      {/* Ambient glowing circle */}
      <circle 
        cx={accentCircleX} 
        cy={accentCircleY} 
        r={accentCircleR} 
        fill="rgba(201, 169, 97, 0.08)"
        stroke={goldColor}
        strokeWidth="0.5"
        strokeDasharray="4 8"
        strokeOpacity="0.15"
      />

      {/* Decorative Gold Lines */}
      {linePatternIndex === 0 && (
        <g stroke={goldColor} strokeWidth="1" strokeOpacity="0.2">
          <line x1="20" y1="20" x2="380" y2="20" />
          <line x1="20" y1="20" x2="20" y2="220" />
          <circle cx="20" cy="20" r="3" fill={goldColor} fillOpacity="0.4" />
          <circle cx="380" cy="20" r="3" fill={goldColor} fillOpacity="0.4" />
          <circle cx="20" cy="220" r="3" fill={goldColor} fillOpacity="0.4" />
        </g>
      )}
      {linePatternIndex === 1 && (
        <g stroke={goldColor} strokeWidth="1" strokeOpacity="0.15">
          <circle cx="200" cy="120" r="100" fill="none" />
          <circle cx="200" cy="120" r="102" fill="none" strokeDasharray="2 4" />
        </g>
      )}
      {linePatternIndex === 2 && (
        <g stroke={goldColor} strokeWidth="0.5" strokeOpacity="0.2">
          <line x1="0" y1="0" x2="400" y2="240" />
          <line x1="400" y1="0" x2="0" y2="240" />
        </g>
      )}

      {/* Architectural Drawing of Property */}
      {tipe === "VILLA" ? (
        // Villa Outline
        <g stroke={goldColor} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Villa Base / Ground Line */}
          <line x1="60" y1="190" x2="340" y2="190" strokeWidth="2" strokeOpacity="0.6" />
          
          {/* Villa Main Block */}
          <rect x="90" y="110" width="140" height="80" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* Villa Roof (slanted) */}
          <path d="M70 110 L160 60 L250 110" strokeWidth="2" strokeOpacity="0.8" />
          
          {/* Overlapping modern block */}
          <rect x="210" y="90" width="100" height="100" strokeWidth="1.5" strokeOpacity="0.5" fill={darkBgStart} fillOpacity="0.8" />
          <path d="M200 90 L320 90" strokeWidth="2" strokeOpacity="0.8" />
          
          {/* Windows / Glass panes */}
          <rect x="230" y="105" width="30" height="40" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="270" y="105" width="30" height="40" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="245" y1="105" x2="245" y2="145" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="285" y1="105" x2="285" y2="145" strokeWidth="0.5" strokeOpacity="0.3" />

          {/* Door */}
          <rect x="150" y="140" width="25" height="50" strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="155" cy="165" r="1.5" fill={goldColor} fillOpacity="0.5" />

          {/* Luxury pool steps or lines on the side */}
          <path d="M315 190 L330 190" strokeWidth="1.5" strokeOpacity="0.6" />
        </g>
      ) : (
        // Ruko Outline (Commercial Shop House)
        <g stroke={goldColor} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Ground Line */}
          <line x1="60" y1="200" x2="340" y2="200" strokeWidth="2" strokeOpacity="0.6" />
          
          {/* Double or Triple Ruko side-by-side */}
          {/* Ruko 1 */}
          <rect x="100" y="70" width="90" height="130" strokeWidth="1.5" strokeOpacity="0.5" />
          {/* Ruko 2 */}
          <rect x="190" y="70" width="90" height="130" strokeWidth="1.5" strokeOpacity="0.5" />
          
          {/* Top parapet / modern styling */}
          <rect x="95" y="60" width="100" height="10" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="185" y="60" width="100" height="10" strokeWidth="1" strokeOpacity="0.6" />
          
          {/* Windows - Level 3 */}
          <rect x="115" y="85" width="25" height="30" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="150" y="85" width="25" height="30" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="205" y="85" width="25" height="30" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="240" y="85" width="25" height="30" strokeWidth="1" strokeOpacity="0.3" />

          {/* Windows - Level 2 */}
          <rect x="115" y="125" width="25" height="30" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="150" y="125" width="25" height="30" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="205" y="125" width="25" height="30" strokeWidth="1" strokeOpacity="0.3" />
          <rect x="240" y="125" width="25" height="30" strokeWidth="1" strokeOpacity="0.3" />

          {/* Shop front door / folding gate - Level 1 */}
          <rect x="110" y="165" width="70" height="35" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="120" y1="165" x2="120" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="130" y1="165" x2="130" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="140" y1="165" x2="140" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="150" y1="165" x2="150" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="160" y1="165" x2="160" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="170" y1="165" x2="170" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />

          <rect x="200" y="165" width="70" height="35" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="210" y1="165" x2="210" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="220" y1="165" x2="220" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="230" y1="165" x2="230" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="240" y1="165" x2="240" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="250" y1="165" x2="250" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="260" y1="165" x2="260" y2="200" strokeWidth="0.5" strokeOpacity="0.3" />
        </g>
      )}

      {/* Subtle bottom label */}
      <text 
        x="200" 
        y="225" 
        fill={goldColor} 
        fillOpacity="0.4" 
        fontSize="9" 
        fontWeight="600" 
        letterSpacing="2"
        textAnchor="middle"
      >
        PRIME PROPERTY ARCHITECTURAL SERIES
      </text>

      {/* SOLD OUT watermark overlay */}
      {status === "sold_out" && (
        <g>
          {/* Translucent overlay */}
          <rect width="400" height="240" fill="#B33A3A" fillOpacity="0.15" />
          {/* Diagonal ribbon */}
          <path d="M 0,60 L 120,0 L 160,0 L 0,80 Z" fill="#B33A3A" />
          <text 
            x="50" 
            y="35" 
            fill="#FFFFFF" 
            fontSize="10" 
            fontWeight="800" 
            transform="rotate(-26.5 50 35)"
            textAnchor="middle"
            letterSpacing="1"
          >
            SOLD OUT
          </text>
        </g>
      )}
    </svg>
  );
}
