import { C, FONT } from "./tema.js";

export const pantalla = { height: "100vh", width: "100%", display: "flex", flexDirection: "column" };

export const flotante = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 30,
  display: "flex",
  justifyContent: "center",
  maxWidth: "96vw",
};

export const caja = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  background: "rgba(255,255,255,.9)",
  backdropFilter: "blur(14px)",
  border: `1px solid rgba(255,255,255,.75)`,
  borderRadius: 14,
  padding: "8px 12px",
  boxShadow: "0 16px 40px -20px rgba(22,50,63,.6), 0 2px 6px -3px rgba(22,50,63,.2)",
  flexWrap: "wrap",
};

export const boton = (activo, fs = 12.5) => ({
  fontFamily: FONT,
  fontSize: fs,
  padding: "7px 12px",
  borderRadius: 8,
  cursor: "pointer",
  border: `1px solid ${activo ? C.ink : C.borde}`,
  background: activo ? C.ink : "transparent",
  color: activo ? C.panel : C.inkSoft,
});

export const svgCapa = {
  position: "absolute",
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  overflow: "visible",
  pointerEvents: "none",
};

export const vacio = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: C.inkSoft,
  pointerEvents: "none",
  textAlign: "center",
  padding: 24,
};

export const zoomCaja = {
  position: "absolute",
  right: 20,
  top: 18,
  zIndex: 30,
  background: "rgba(255,255,255,.88)",
  backdropFilter: "blur(10px)",
  border: `1px solid rgba(255,255,255,.7)`,
  borderRadius: 10,
  overflow: "hidden",
  width: 40,
  boxShadow: "0 8px 22px -14px rgba(22,50,63,.55)",
};

export const zoomBtn = {
  display: "block",
  width: "100%",
  border: "none",
  background: "transparent",
  color: C.inkSoft,
  fontSize: 14,
  padding: "6px 0",
  cursor: "pointer",
  fontFamily: FONT,
};

export const zoomTexto = {
  fontSize: 10,
  color: C.inkTenue,
  textAlign: "center",
  padding: "3px 0",
  borderTop: `1px solid ${C.hair}`,
  borderBottom: `1px solid ${C.hair}`,
};

export const mini = {
  fontFamily: FONT,
  fontSize: 11.5,
  padding: "6px 9px",
  border: "none",
  background: "transparent",
  color: C.inkSoft,
  cursor: "pointer",
  borderRadius: 6,
  whiteSpace: "nowrap",
};

export const separador = { width: 1, height: 16, background: C.hair, margin: "0 3px" };

export const etiquetaCampo = {
  display: "block",
  fontSize: 10.5,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: C.inkSoft,
  marginBottom: 6,
};

export const campoLogin = {
  width: "100%",
  fontFamily: FONT,
  fontSize: 14,
  padding: "10px 12px",
  border: `1px solid ${C.borde}`,
  borderRadius: 8,
  background: C.panel,
  color: C.ink,
  boxSizing: "border-box",
};

export const quitar = {
  border: "none",
  background: "transparent",
  color: "#7BA0B2",
  cursor: "pointer",
  fontSize: 13,
  lineHeight: 1,
  padding: 0,
};

export const cinta = {
  position: "absolute",
  top: 20,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 35,
  background: C.ink,
  color: "#fff",
  fontSize: 12.5,
  padding: "9px 16px",
  borderRadius: 9,
  pointerEvents: "none",
  boxShadow: "0 10px 26px -14px rgba(0,0,0,.7)",
};

export const etiqueta = {
  fontSize: 9,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: C.inkTenue,
  marginRight: 3,
};

export const sesionCaja = {
  display: "flex",
  alignItems: "center",
  border: `1px solid ${C.borde}`,
  borderRadius: 8,
  overflow: "hidden",
  marginLeft: 3,
};

export const sesionBtn = {
  border: "none",
  background: "transparent",
  color: C.inkSoft,
  fontSize: 13,
  padding: "7px 10px",
  cursor: "pointer",
  fontFamily: FONT,
};
