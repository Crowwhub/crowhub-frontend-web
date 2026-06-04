type CrowProps = {
  width?: number;
  height?: number;
  bodyFill?: string;
  wingFill?: string;
  detailFill?: string;
  accent?: string;
  showPerch?: boolean;
};

export default function CrowSvg({
  width = 140,
  height = 120,
  bodyFill = "#1a1a1a",
  wingFill = "#2a2a2a",
  detailFill = "#3a3a3a",
  accent = "#6aab7a",
  showPerch = true,
}: CrowProps = {}) {
  return (
    <svg
      viewBox="0 0 160 140"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="28" cy="26" r="2" fill={accent} opacity="0.7">
        <animate
          attributeName="opacity"
          values="0.7;0.1;0.7"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="144" cy="20" r="1.6" fill={accent} opacity="0.6">
        <animate
          attributeName="opacity"
          values="0.6;0.1;0.6"
          dur="1.8s"
          begin="0.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="12" cy="58" r="1.6" fill={accent} opacity="0.5">
        <animate
          attributeName="opacity"
          values="0.5;0.1;0.5"
          dur="3s"
          begin="1s"
          repeatCount="indefinite"
        />
      </circle>

      {showPerch && (
        <line
          x1="20"
          y1="124"
          x2="140"
          y2="124"
          stroke={detailFill}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}

      <g className="crow-body">
        <g className="crow-tail">
          <path
            d="M 60 75 L 12 56 L 6 70 L 4 86 L 10 100 L 22 108 L 60 92 Z"
            fill={wingFill}
            stroke={bodyFill}
            strokeWidth="0.5"
          />
        </g>

        <ellipse cx="82" cy="80" rx="38" ry="26" fill={bodyFill} />

        <path
          d="M 95 60 Q 88 70 88 82 Q 88 90 98 92 L 105 70 Z"
          fill={bodyFill}
        />

        <circle cx="115" cy="50" r="22" fill={bodyFill} />

        <g className="crow-wing">
          <path
            d="M 60 70 Q 82 60 104 70 Q 110 88 92 96 Q 70 96 60 86 Z"
            fill={wingFill}
            stroke={bodyFill}
            strokeWidth="0.5"
          />
          <path
            d="M 70 78 Q 84 74 100 78"
            stroke={bodyFill}
            strokeWidth="1"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M 72 86 Q 84 82 96 86"
            stroke={bodyFill}
            strokeWidth="1"
            fill="none"
            opacity="0.7"
          />
        </g>

        <path d="M 132 44 L 158 50 L 132 51 Z" fill={detailFill} />
        <g className="crow-beak">
          <path d="M 132 52 L 158 52 L 132 60 Z" fill={wingFill} />
        </g>

        <g className="crow-eye">
          <circle cx="120" cy="46" r="5" fill="#0a0a0a" />
          <circle cx="120" cy="46" r="3.5" fill={accent} />
          <circle cx="121.5" cy="44.5" r="1.4" fill="#ffffff" />
        </g>

        <line
          x1="75"
          y1="104"
          x2="75"
          y2="120"
          stroke={detailFill}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="92"
          y1="104"
          x2="92"
          y2="120"
          stroke={detailFill}
          strokeWidth="2"
          strokeLinecap="round"
        />

        <line
          x1="75"
          y1="120"
          x2="83"
          y2="124"
          stroke={detailFill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="75"
          y1="120"
          x2="75"
          y2="125"
          stroke={detailFill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="75"
          y1="120"
          x2="67"
          y2="124"
          stroke={detailFill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <line
          x1="92"
          y1="120"
          x2="100"
          y2="124"
          stroke={detailFill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="92"
          y1="120"
          x2="92"
          y2="125"
          stroke={detailFill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="92"
          y1="120"
          x2="84"
          y2="124"
          stroke={detailFill}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
