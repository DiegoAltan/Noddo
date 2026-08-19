/* ============ Sistema visual ============ */
export const FONDOS = {
  bruma: { nombre: "Bruma", bg: "#E9EEF0", grid: "#CBD8DE", tinte: "#16323F" },
  salvia: { nombre: "Salvia", bg: "#E7EDE5", grid: "#C9D8C6", tinte: "#22392C" },
  arena: { nombre: "Arena", bg: "#F1ECE4", grid: "#DCD1C2", tinte: "#3B3126" },
  lavanda: { nombre: "Lavanda", bg: "#ECEAF1", grid: "#D4CFE0", tinte: "#2E2A3D" },
  rosa: { nombre: "Rosa", bg: "#F2EAE9", grid: "#DFCCCB", tinte: "#3D2B2A" },
  cielo: { nombre: "Cielo", bg: "#E5EEF3", grid: "#C6DAE6", tinte: "#173442" },
};

export const C = {
  ink: "#16323F",
  inkSoft: "#61787F",
  inkTenue: "#8FA3AB",
  hair: "#E2E9EC",
  panel: "#FFFFFF",
  line: "#9BB0B9",
  foco: "#D2A03C",
  focoTexto: "#8A6414",
  done: "#3F7A5C",
  borde: "#C4D1D7",
  tarea: "#E3F0F7",
  tareaBorde: "#BFDCEA",
  tareaTexto: "#1B4A63",
  peligro: "#9B5A50",
};

export const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export const MARCA =
  'Futura, "Avenir Next", "Century Gothic", "Trebuchet MS", Helvetica, sans-serif';
export const SERIF = 'Iowan Old Style, "Palatino Linotype", Palatino, Georgia, serif';

export const W = { central: 240, acompanamiento: 172, titulo: 264 };
export const NOTCH = "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)";
export const TIPOS = [
  ["central", "Central"],
  ["acompanamiento", "Acompañamiento"],
  ["titulo", "Título"],
];
export const TIPOS_ABREV = { central: "Ct", acompanamiento: "Ac", titulo: "Tt" };
/* ============ Personalización de tarjetas ============ */
export const COLORES_TARJETA = {
  bruma: "#B7C6CE",
  salvia: "#AEC2A8",
  arena: "#D8C3A0",
  lavanda: "#BEB4D6",
  rosa: "#D9B3B0",
  cielo: "#A9C6D9",
  musgo: "#8FA37E",
  ocre: "#D9A24B",
};
// Mismos tonos que COLORES_TARJETA pero más saturados: para acentos chicos
// (la franja de color de un nodo) el pastel se pierde, así que aquí van
// versiones con más "punch" mantieniendo la misma familia de color.
export const COLORES_NODO = {
  bruma: "#3E6E88",
  salvia: "#4C9257",
  arena: "#C6842E",
  lavanda: "#7C5CB8",
  rosa: "#D65C56",
  cielo: "#2A82C4",
  musgo: "#43713A",
  ocre: "#D1841F",
};
export const PATRONES = [
  { id: "plano", nombre: "Plano" },
  { id: "puntos", nombre: "Puntos" },
  { id: "diagonales", nombre: "Diagonales" },
  { id: "cuadricula", nombre: "Cuadrícula" },
  { id: "rombos", nombre: "Rombos" },
  { id: "confeti", nombre: "Confeti" },
];

export const ESTILO_TARJETA_POR_DEFECTO = { patron: "plano", color: "bruma" };
/* ============ Estilos globales ============ */
export const CSS = `
.nd * { box-sizing: border-box; }
.nd-btn { transition: background .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease; }
.nd-btn:hover { border-color: ${C.inkTenue}; color: ${C.ink}; }
.nd-btn.on:hover { border-color: currentColor; }
.nd-node { transition: box-shadow .18s ease; }
.nd-card { transition: box-shadow .2s ease, transform .2s ease; }
.nd-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px -12px rgba(22,50,63,.32); }
.nd-swatch { transition: transform .12s ease, box-shadow .12s ease; }
.nd-swatch:hover { transform: scale(1.08); }
.nd input::placeholder, .nd textarea::placeholder { color: ${C.inkTenue}; }
.nd textarea:focus, .nd input:focus { outline: none; border-color: ${C.inkSoft}; }
.nd-mini:hover { background: ${C.hair}; color: ${C.ink}; }
.nd-accion-color { background: transparent; color: ${C.inkSoft}; transition: background .15s ease, color .15s ease; }
.nd-accion-color:hover, .nd-accion-color:active { background: var(--accion-bg); color: var(--accion-color); }
`;
