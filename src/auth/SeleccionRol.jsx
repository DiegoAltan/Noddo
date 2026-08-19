import { C, FONT, SERIF, FONDOS, CSS } from "../estilos/tema.js";
import { pantalla } from "../estilos/compartidos.js";
import Noddo from "../ui/Noddo.jsx";

const opcion = {
  display: "block",
  width: "100%",
  textAlign: "left",
  fontFamily: FONT,
  background: C.panel,
  border: `1px solid ${C.borde}`,
  borderRadius: 12,
  padding: "18px 20px",
  cursor: "pointer",
};

export default function SeleccionRol({ onElegir }) {
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
      <div style={{ width: "min(400px, 100%)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Noddo tamano={19} />
        </div>

        <button className="nd-btn" style={{ ...opcion, marginBottom: 12 }} onClick={() => onElegir("profesional")}>
          <div style={{ fontFamily: SERIF, fontSize: 17 }}>Soy profesional</div>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>
            Accede con tu cuenta de Google para ver tus lienzos.
          </div>
        </button>

        <button className="nd-btn" style={opcion} onClick={() => onElegir("consultante")}>
          <div style={{ fontFamily: SERIF, fontSize: 17 }}>Soy consultante</div>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>
            Accede con tu RUT y el código que te entregó tu profesional.
          </div>
        </button>
      </div>
    </div>
  );
}
