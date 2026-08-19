import { useState } from "react";
import { C, FONT, SERIF, CSS } from "../estilos/tema.js";
import { etiquetaCampo, campoLogin, mini, boton } from "../estilos/compartidos.js";

/* ============ Modal: perfil profesional ============ */
export default function ModalPerfil({ inicial, onGuardar, onCerrar }) {
  const [datos, setDatos] = useState(inicial);
  const [error, setError] = useState("");

  const campo = (clave, valor) => {
    setError("");
    setDatos((d) => ({ ...d, [clave]: valor }));
  };

  const guardar = () => {
    if (!datos.nombreCompleto.trim())
      return setError("El nombre completo del profesional es obligatorio.");
    onGuardar({ ...datos, nombreCompleto: datos.nombreCompleto.trim() });
  };

  return (
    <div
      onClick={onCerrar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22,50,63,.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          background: C.panel,
          borderRadius: 16,
          padding: "28px 28px 24px",
          boxShadow: "0 30px 70px -20px rgba(22,50,63,.5)",
          fontFamily: FONT,
          color: C.ink,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <style>{CSS}</style>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 21,
            fontWeight: 400,
            margin: "0 0 20px",
          }}
        >
          Perfil profesional
        </h2>

        <label style={etiquetaCampo}>Nombre completo</label>
        <input
          autoFocus
          value={datos.nombreCompleto}
          onChange={(e) => campo("nombreCompleto", e.target.value)}
          placeholder="Nombre y apellido"
          style={campoLogin}
        />

        <label style={{ ...etiquetaCampo, marginTop: 12 }}>Profesión / especialidad</label>
        <input
          value={datos.profesion}
          onChange={(e) => campo("profesion", e.target.value)}
          placeholder="Opcional — ej. Psicólogo(a) clínico(a)"
          style={campoLogin}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <label style={etiquetaCampo}>Registro SIS</label>
            <input
              value={datos.registroSIS}
              onChange={(e) => campo("registroSIS", e.target.value)}
              placeholder="Opcional"
              style={campoLogin}
            />
          </div>
          <div>
            <label style={etiquetaCampo}>Registro Mineduc</label>
            <input
              value={datos.registroMineduc}
              onChange={(e) => campo("registroMineduc", e.target.value)}
              placeholder="Opcional"
              style={campoLogin}
            />
          </div>
        </div>

        <label style={{ ...etiquetaCampo, marginTop: 12 }}>Correo de contacto</label>
        <input
          type="email"
          value={datos.correo}
          onChange={(e) => campo("correo", e.target.value)}
          placeholder="Opcional"
          style={campoLogin}
        />

        {error && (
          <p style={{ fontSize: 12, color: C.peligro, marginTop: 12, marginBottom: 0 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
          <button
            className="nd-mini"
            style={{ ...mini, padding: "9px 14px" }}
            onClick={onCerrar}
          >
            Cancelar
          </button>
          <button
            className="nd-btn"
            onClick={guardar}
            style={{ ...boton(true), padding: "9px 18px" }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
