/* ============ Stickers ============ */
export const STICKERS = [
  { id: "corazon", nombre: "Corazón" },
  { id: "estrella", nombre: "Estrella" },
  { id: "sol", nombre: "Sol" },
  { id: "luna", nombre: "Luna" },
  { id: "nube", nombre: "Nube" },
  { id: "gota", nombre: "Gota" },
  { id: "hoja", nombre: "Hoja" },
  { id: "flor", nombre: "Flor" },
  { id: "rayo", nombre: "Rayo" },
  { id: "pelota", nombre: "Pelota" },
];

export function IconoSticker({ tipo, style }) {
  const props = { viewBox: "0 0 24 24", fill: "currentColor", style };
  switch (tipo) {
    case "corazon":
      return (
        <svg {...props}>
          <path d="M12 20.5C12 20.5 3.5 15 3.5 9.3 3.5 6.3 5.8 4 8.6 4 10.1 4 11.4 4.7 12 5.9 12.6 4.7 13.9 4 15.4 4 18.2 4 20.5 6.3 20.5 9.3 20.5 15 12 20.5 12 20.5Z" />
        </svg>
      );
    case "estrella":
      return (
        <svg {...props}>
          <path d="M12 2.5 14.23 8.93 21.03 9.06 15.61 13.17 17.59 19.69 12 15.8 6.41 19.69 8.39 13.17 2.97 9.06 9.77 8.93Z" />
        </svg>
      );
    case "sol":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4.4" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1.5" x2="12" y2="4.3" />
            <line x1="12" y1="19.7" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="4.3" y2="12" />
            <line x1="19.7" y1="12" x2="22.5" y2="12" />
            <line x1="4.6" y1="4.6" x2="6.6" y2="6.6" />
            <line x1="17.4" y1="17.4" x2="19.4" y2="19.4" />
            <line x1="4.6" y1="19.4" x2="6.6" y2="17.4" />
            <line x1="17.4" y1="6.6" x2="19.4" y2="4.6" />
          </g>
        </svg>
      );
    case "luna":
      return (
        <svg {...props}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      );
    case "nube":
      return (
        <svg {...props}>
          <path d="M6.5 19a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 16.9 8.02 4.5 4.5 0 0 1 17.5 19h-11Z" />
        </svg>
      );
    case "gota":
      return (
        <svg {...props}>
          <path d="M12 3s7 7.58 7 12a7 7 0 0 1-14 0c0-4.42 7-12 7-12Z" />
        </svg>
      );
    case "hoja":
      return (
        <svg {...props}>
          <path d="M20 4C10 4 4 10 4 19c0 .55.45 1 1 1 9 0 15-6 15-16 0-.55-.45-1-1-1Z" />
        </svg>
      );
    case "flor":
      return (
        <svg {...props}>
          <circle cx="16.5" cy="12" r="3.4" />
          <circle cx="13.4" cy="16.3" r="3.4" />
          <circle cx="8.4" cy="14.6" r="3.4" />
          <circle cx="8.4" cy="9.4" r="3.4" />
          <circle cx="13.4" cy="7.7" r="3.4" />
          <circle cx="12" cy="12" r="2.3" />
        </svg>
      );
    case "rayo":
      return (
        <svg {...props}>
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
      );
    case "pelota":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <g stroke="rgba(255,255,255,.8)" strokeWidth="1.3" fill="none">
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <path d="M5.6 5.6c2.6 3.4 2.6 9.4 0 12.8" />
            <path d="M18.4 5.6c-2.6 3.4-2.6 9.4 0 12.8" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
