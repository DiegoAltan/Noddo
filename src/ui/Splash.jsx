import { FONDOS, CSS } from "../estilos/tema.js";
import { pantalla } from "../estilos/compartidos.js";
import Noddo from "./Noddo.jsx";

export default function Splash() {
  return (
    <div style={{ ...pantalla, background: FONDOS.bruma.bg }} className="nd">
      <style>{CSS}</style>
      <div style={{ margin: "auto", opacity: 0.5 }}>
        <Noddo tamano={16} />
      </div>
    </div>
  );
}
