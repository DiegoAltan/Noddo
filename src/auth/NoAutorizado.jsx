import { C, FONT, FONDOS, CSS } from "../estilos/tema.js";
import { pantalla, mini, boton } from "../estilos/compartidos.js";
import Noddo from "../ui/Noddo.jsx";
import { useAuth } from "./AuthProvider.jsx";

export default function NoAutorizado({ onVolver }) {
  const { mensaje, limpiarMensaje } = useAuth();

  return (
    <div
      className="nd"
      style={{
        ...pantalla,
        background: FONDOS.bruma.bg,
        fontFamily: FONT,
        color: C.ink,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <style>{CSS}</style>
      <div
        style={{
          width: "min(400px, 100%)",
          background: C.panel,
          border: `1px solid ${C.hair}`,
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 24px 60px -24px rgba(22,50,63,.35)",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Noddo tamano={19} />
        </div>
        <p style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6, margin: 0 }}>
          {mensaje || "Tu cuenta aún no está autorizada para usar Noddo."}
        </p>
        <button
          className="nd-btn"
          style={{ ...boton(true), padding: "10px 18px", marginTop: 24 }}
          onClick={() => {
            limpiarMensaje();
            onVolver();
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
