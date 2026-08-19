import { C } from "../estilos/tema.js";

/* ============ Botón ícono (tarjetas de Inicio) ============ */
export default function BotonIcono({ onClick, titulo, color, children }) {
  return (
    <button
      className="nd-mini"
      title={titulo}
      aria-label={titulo}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        padding: 0,
        border: "none",
        borderRadius: 6,
        background: "transparent",
        color: color || C.inkSoft,
        cursor: "pointer",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}
