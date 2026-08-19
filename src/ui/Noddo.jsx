import { C, MARCA } from "../estilos/tema.js";

/* ============ Marca ============ */
export default function Noddo({ tamano = 15, onClick, sub }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <svg width={tamano + 7} height={tamano + 7} viewBox="0 0 24 24" fill="none">
        <line x1="7" y1="16.5" x2="16" y2="7.5" stroke={C.ink} strokeWidth="1.6" />
        <circle cx="7" cy="16.5" r="3.4" fill={C.panel} stroke={C.ink} strokeWidth="1.6" />
        <circle cx="16.5" cy="7" r="4.6" fill={C.ink} />
      </svg>
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontFamily: MARCA,
            fontSize: tamano,
            fontWeight: 500,
            letterSpacing: tamano * 0.22,
            textTransform: "uppercase",
            color: C.ink,
          }}
        >
          Noddo
        </div>
        {sub && (
          <div
            style={{
              fontSize: 10.5,
              color: C.inkSoft,
              marginTop: 5,
              letterSpacing: 0.2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
