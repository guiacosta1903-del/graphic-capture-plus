'use client';

import React from 'react';

interface StickerArtProps {
  id: string;
  name: string;
}

export const StickerArt: React.FC<StickerArtProps> = ({ id, name }) => {
  // Renders authentic die-cut sticker vector representations with white contour and drop shadow
  switch (id) {
    case '1': // Renato 1983
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md select-none">
          <circle cx="100" cy="100" r="90" fill="#ffffff" />
          <circle cx="100" cy="100" r="82" fill="#0d80f2" />
          <circle cx="100" cy="100" r="76" fill="#000000" />
          {/* Silhouette Renato */}
          <path d="M70 145 C70 115 85 95 100 95 C115 95 130 115 130 145 Z" fill="#ffffff" />
          <circle cx="100" cy="75" r="22" fill="#ffffff" />
          <path d="M82 68 C85 55 115 55 118 68 Z" fill="#f59e0b" />
          <text x="100" y="165" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" letterSpacing="1">
            RENATO 1983
          </text>
          <text x="100" y="180" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
            HERÓI DE TÓQUIO
          </text>
        </svg>
      );
    case '2': // Taça Libertadores
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md select-none">
          <path d="M60 20 L140 20 L155 80 C155 120 125 150 100 165 C75 150 45 120 45 80 Z" fill="#ffffff" />
          <path d="M64 24 L136 24 L149 80 C149 116 122 144 100 158 C78 144 51 116 51 80 Z" fill="#0d80f2" />
          {/* Cup */}
          <path d="M85 50 L115 50 L112 85 C112 100 88 100 88 85 Z" fill="#f59e0b" />
          <path d="M96 85 L104 85 L104 115 L96 115 Z" fill="#d97706" />
          <rect x="85" y="115" width="30" height="12" rx="3" fill="#ffffff" />
          <text x="100" y="145" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
            TRI DA AMÉRICA
          </text>
        </svg>
      );
    case '3': // Arena do Grêmio
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md select-none">
          <path d="M20 110 C20 60 180 60 180 110 L170 150 C170 165 30 165 30 150 Z" fill="#ffffff" />
          <path d="M26 110 C26 66 174 66 174 110 L166 146 C166 158 34 158 34 146 Z" fill="#09090b" />
          {/* Stadium Roof Curve */}
          <path d="M40 100 Q100 65 160 100" stroke="#0d80f2" strokeWidth="6" fill="none" />
          <circle cx="100" cy="115" r="14" fill="#0d80f2" />
          <text x="100" y="140" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">
            ARENA DO GRÊMIO
          </text>
        </svg>
      );
    case '5': // Suárez (Esgotado)
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md select-none">
          <path d="M40 30 Q100 10 160 30 Q180 100 160 170 Q100 190 40 170 Q20 100 40 30 Z" fill="#ffffff" />
          <path d="M46 36 Q100 18 154 36 Q172 100 154 164 Q100 182 46 164 Q28 100 46 36 Z" fill="#0d80f2" />
          {/* Number 9 */}
          <text x="100" y="105" textAnchor="middle" fill="#ffffff" fontSize="56" fontWeight="900" fontFamily="sans-serif">
            9
          </text>
          <text x="100" y="135" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" letterSpacing="2">
            SUÁREZ
          </text>
          <text x="100" y="152" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
            EL PISTOLERO
          </text>
        </svg>
      );
    case '8': // Holográfico (Esgotado)
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md select-none">
          <rect x="25" y="25" width="150" height="150" rx="35" fill="#ffffff" />
          <defs>
            <linearGradient id="holoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#c084fc" />
              <stop offset="70%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <rect x="32" y="32" width="136" height="136" rx="28" fill="url(#holoGrad)" />
          <circle cx="100" cy="95" r="40" fill="#09090b" opacity="0.9" />
          <text x="100" y="93" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="900">
            GRÊMIO
          </text>
          <text x="100" y="110" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
            IMORTAL
          </text>
          <text x="100" y="155" textAnchor="middle" fill="#09090b" fontSize="11" fontWeight="900" letterSpacing="1">
            HOLOGRÁFICO
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md select-none">
          <circle cx="100" cy="100" r="88" fill="#ffffff" />
          <circle cx="100" cy="100" r="80" fill="#0d80f2" />
          <circle cx="100" cy="100" r="74" fill="#09090b" />
          <circle cx="100" cy="100" r="68" fill="#ffffff" stroke="#0d80f2" strokeWidth="4" />
          {/* Tricolor stripes */}
          <rect x="50" y="80" width="100" height="12" fill="#0d80f2" />
          <rect x="50" y="92" width="100" height="16" fill="#000000" />
          <rect x="50" y="108" width="100" height="12" fill="#ffffff" />
          <text x="100" y="104" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">
            GRÊMIO
          </text>
          <text x="100" y="150" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            DESDE 1903
          </text>
        </svg>
      );
  }
};
