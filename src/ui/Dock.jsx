import { C, FONT } from "../estilos/tema.js";

/* ============ Piezas ============ */
export default function Dock({ children, activo, onClick, acento, icono, disabled, texto }) {
  const color = acento || C.ink;
  return (
    <button
      className={`nd-btn ${activo ? "on" : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={texto ? undefined : children}
      aria-label={children}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: texto ? 7 : 0,
        width: texto ? "auto" : 36,
        height: 36,
        padding: texto ? "0 12px" : 0,
        fontFamily: FONT,
        fontSize: 12,
        borderRadius: 8,
        cursor: disabled ? "default" : "pointer",
        border: "1px solid transparent",
        background: activo ? color : "transparent",
        color: activo ? (acento ? "#3D2C08" : "#fff") : C.inkSoft,
        opacity: disabled ? 0.35 : 1,
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icono}
      </svg>
      {texto && children}
    </button>
  );
}
