import { useState } from "react";
import { C, FONT, SERIF, CSS } from "../estilos/tema.js";
import { etiquetaCampo, campoLogin, mini, boton } from "../estilos/compartidos.js";
import { calcularEdad } from "../lib/fechas.js";

/* ============ Modal: datos del paciente ============ */
export default function ModalPaciente({ titulo, inicial, onGuardar, onCerrar }) {
  const [datos, setDatos] = useState(inicial);
  const [error, setError] = useState("");

  const campo = (clave, valor) => {
    setError("");
    setDatos((d) => ({ ...d, [clave]: valor }));
  };

  const cambiarNacimiento = (valor) => {
    setError("");
    setDatos((d) => ({
      ...d,
      fechaNacimiento: valor,
      edad: valor ? calcularEdad(valor) : d.edad,
    }));
  };

  const guardar = () => {
    if (!datos.nombreCompleto.trim()) return setError("El nombre completo es obligatorio.");
    onGuardar({
      ...datos,
      nombreCompleto: datos.nombreCompleto.trim(),
      alias: datos.alias.trim(),
    });
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
          {titulo}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={etiquetaCampo}>Nombre completo</label>
            <input
              autoFocus
              value={datos.nombreCompleto}
              onChange={(e) => campo("nombreCompleto", e.target.value)}
              placeholder="Nombre y apellido"
              style={campoLogin}
            />
          </div>
          <div>
            <label style={etiquetaCampo}>Alias</label>
            <input
              value={datos.alias}
              onChange={(e) => campo("alias", e.target.value)}
              placeholder="Opcional"
              style={campoLogin}
            />
          </div>

          <div>
            <label style={etiquetaCampo}>Fecha de nacimiento</label>
            <input
              type="date"
              value={datos.fechaNacimiento}
              onChange={(e) => cambiarNacimiento(e.target.value)}
              style={campoLogin}
            />
          </div>
          <div>
            <label style={etiquetaCampo}>Edad</label>
            <input
              type="number"
              min={0}
              max={120}
              value={datos.edad}
              disabled={!!datos.fechaNacimiento}
              onChange={(e) => campo("edad", e.target.value)}
              placeholder="Opcional"
              style={{ ...campoLogin, opacity: datos.fechaNacimiento ? 0.55 : 1 }}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={etiquetaCampo}>Correo</label>
          <input
            type="email"
            value={datos.correo}
            onChange={(e) => campo("correo", e.target.value)}
            placeholder="Opcional"
            style={campoLogin}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={etiquetaCampo}>Fecha de inicio</label>
          <input
            type="date"
            value={datos.fechaInicio}
            onChange={(e) => campo("fechaInicio", e.target.value)}
            style={campoLogin}
          />
        </div>

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
