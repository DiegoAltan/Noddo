import { useState } from "react";
import { C, FONT, FONDOS, CSS } from "../estilos/tema.js";
import { pantalla, mini, boton, etiquetaCampo, campoLogin } from "../estilos/compartidos.js";
import { rutValido } from "../lib/rut.js";
import Noddo from "../ui/Noddo.jsx";

export default function LoginConsultante({ onVolver }) {
  const [rut, setRut] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  const entrar = () => {
    if (!rutValido(rut)) return setError("El RUT ingresado no es válido.");
    if (!codigo.trim()) return setError("Ingresa el código de acceso.");
    // El acceso de consultante (validación contra la Edge Function) se
    // conecta en la siguiente etapa de este proyecto.
    setError("El acceso de consultante todavía no está disponible.");
  };

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
          width: "min(360px, 100%)",
          background: C.panel,
          border: `1px solid ${C.hair}`,
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 24px 60px -24px rgba(22,50,63,.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <Noddo tamano={19} />
        </div>
        <p style={{ textAlign: "center", fontSize: 12.5, color: C.inkSoft, marginTop: 4, marginBottom: 32 }}>
          Acceso de consultante
        </p>

        <label style={etiquetaCampo}>RUT</label>
        <input
          autoFocus
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          placeholder="12345678-9"
          style={campoLogin}
        />

        <label style={{ ...etiquetaCampo, marginTop: 16 }}>Código de acceso</label>
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          placeholder="Entregado por tu profesional"
          style={{ ...campoLogin, letterSpacing: 2, textAlign: "center" }}
        />

        {error && (
          <p style={{ fontSize: 12, color: C.peligro, marginTop: 10, marginBottom: 0 }}>{error}</p>
        )}

        <button
          className="nd-btn"
          onClick={entrar}
          style={{ ...boton(true), width: "100%", padding: "12px 16px", marginTop: 24, fontSize: 13.5 }}
        >
          Entrar
        </button>

        <button
          className="nd-mini"
          style={{ ...mini, display: "block", margin: "16px auto 0", textAlign: "center" }}
          onClick={onVolver}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
