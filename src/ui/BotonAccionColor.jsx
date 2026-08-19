/* ============ Botón de acción con color (barra del nodo) ============ */
export default function BotonAccionColor({ onClick, titulo, bg, color, children }) {
  return (
    <button
      className="nd-accion-color"
      title={titulo}
      aria-label={titulo}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        padding: 0,
        border: "none",
        borderRadius: 7,
        cursor: "pointer",
        "--accion-bg": bg,
        "--accion-color": color,
      }}
    >
      <svg
        width="15"
        height="15"
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
