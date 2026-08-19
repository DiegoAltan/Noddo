import { C, COLORES_TARJETA } from "./tema.js";

export function estiloTarjeta(estilo) {
  const color = COLORES_TARJETA[estilo?.color] || COLORES_TARJETA.bruma;
  const patron = estilo?.patron || "plano";
  switch (patron) {
    case "puntos":
      return {
        backgroundColor: color + "2e",
        backgroundImage: `radial-gradient(${color} 2.6px, transparent 2.6px)`,
        backgroundSize: "18px 18px",
      };
    case "diagonales":
      return {
        backgroundColor: color + "2e",
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 7px, transparent 7px, transparent 18px)`,
      };
    case "cuadricula":
      return {
        backgroundColor: color + "2e",
        backgroundImage: `linear-gradient(${color} 2px, transparent 2px), linear-gradient(90deg, ${color} 2px, transparent 2px)`,
        backgroundSize: "18px 18px",
      };
    case "rombos":
      return {
        backgroundColor: color + "2e",
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 4px, transparent 4px, transparent 16px), repeating-linear-gradient(-45deg, ${color} 0, ${color} 4px, transparent 4px, transparent 16px)`,
      };
    case "confeti":
      return {
        backgroundColor: color + "26",
        backgroundImage: [
          `radial-gradient(circle at 15% 30%, ${color} 4.5px, transparent 5px)`,
          `radial-gradient(circle at 70% 18%, ${color} 3px, transparent 3.5px)`,
          `radial-gradient(circle at 42% 68%, ${color} 5.5px, transparent 6px)`,
          `radial-gradient(circle at 88% 60%, ${color} 3.5px, transparent 4px)`,
          `radial-gradient(circle at 22% 88%, ${color} 4.5px, transparent 5px)`,
          `radial-gradient(circle at 60% 42%, ${color} 3px, transparent 3.5px)`,
          `radial-gradient(circle at 90% 92%, ${color} 4px, transparent 4.5px)`,
        ].join(", "),
      };
    case "plano":
    default:
      return { backgroundColor: color };
  }
}

export function mezclarConBlanco(hex, factorColor) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mezclar = (c) => Math.round(c * factorColor + 255 * (1 - factorColor)).toString(16).padStart(2, "0");
  return `#${mezclar(r)}${mezclar(g)}${mezclar(b)}`;
}

// Fondos pálidos para los botones de acción con color de la barra del nodo,
// todos con la misma intensidad suave (mismo factor de mezcla con blanco).
export const AMBAR_CLARO = mezclarConBlanco(C.foco, 0.16);
export const AZUL_CLARO = C.tarea;
export const PELIGRO_CLARO = mezclarConBlanco(C.peligro, 0.16);
export const VERDE_CLARO = mezclarConBlanco(C.done, 0.16);

// Tinte pálido y opaco del color elegido: la "hoja de papel" del lienzo.
export function colorFondoLienzo(estilo) {
  const color = COLORES_TARJETA[estilo?.color] || COLORES_TARJETA.bruma;
  return mezclarConBlanco(color, 0.16);
}

/*
 * Versión tenue del mismo patrón, para usar como fondo del lienzo: misma
 * forma que en la tarjeta pero mucho más suave, y a escala de canvas
 * infinito (tamaños más grandes, atados al zoom/paneo vía k). Se dibuja
 * sobre el tinte opaco de colorFondoLienzo, no lleva su propio backgroundColor.
 */
export function patronLienzo(estilo, k = 1) {
  const color = COLORES_TARJETA[estilo?.color] || COLORES_TARJETA.bruma;
  const patron = estilo?.patron || "plano";
  const t = (px) => px * k;
  // background-size en px enteros: si el mosaico mide una fracción de
  // píxel, cada baldosa puede redondearse distinto al pintarse y las
  // formas se desalinean levemente de una baldosa a la siguiente.
  const tEntero = (px) => Math.round(px * k);
  // Raya diagonal con un borde suavizado de 1px: un repeating-linear-gradient
  // con corte 100% afilado en diagonal hace que el navegador "puntee" la
  // línea en vez de dibujarla continua en ciertos niveles de zoom (moiré de
  // rasterización). Un pixel de transición alcanza para que antialise bien
  // y sigue viéndose nítido.
  const rayaDiagonal = (angulo, grosorPx, periodoPx) => {
    const grosor = tEntero(grosorPx);
    const periodo = tEntero(periodoPx);
    return `repeating-linear-gradient(${angulo}, transparent 0, ${color}4d 1px, ${color}4d ${grosor}px, transparent ${grosor + 1}px, transparent ${periodo}px)`;
  };
  switch (patron) {
    case "puntos":
      return {
        backgroundImage: `radial-gradient(${color}66 ${t(1.8)}px, transparent ${t(1.8)}px)`,
        backgroundSize: `${tEntero(30)}px ${tEntero(30)}px`,
      };
    case "diagonales":
      return {
        backgroundImage: rayaDiagonal("45deg", 3, 30),
      };
    case "cuadricula":
      return {
        // repeating-linear-gradient en vez de linear-gradient + background-size:
        // este último tilea una imagen rasterizada y cada baldosa puede
        // redondear su ancho fraccionario (por el zoom) de forma independiente,
        // desalineando las líneas entre baldosas. El gradiente repetido se
        // calcula de forma continua, así las líneas quedan siempre rectas.
        backgroundImage: `repeating-linear-gradient(to bottom, ${color}4d 0, ${color}4d ${tEntero(1.4)}px, transparent ${tEntero(1.4)}px, transparent ${tEntero(30)}px), repeating-linear-gradient(to right, ${color}4d 0, ${color}4d ${tEntero(1.4)}px, transparent ${tEntero(1.4)}px, transparent ${tEntero(30)}px)`,
      };
    case "rombos":
      return {
        backgroundImage: `${rayaDiagonal("45deg", 2.4, 26)}, ${rayaDiagonal("-45deg", 2.4, 26)}`,
      };
    case "confeti":
      return {
        backgroundImage: [
          `radial-gradient(circle at ${t(10)}px ${t(14)}px, ${color}66 ${t(2.2)}px, transparent ${t(2.6)}px)`,
          `radial-gradient(circle at ${t(46)}px ${t(8)}px, ${color}66 ${t(1.6)}px, transparent ${t(2)}px)`,
          `radial-gradient(circle at ${t(58)}px ${t(40)}px, ${color}66 ${t(2.4)}px, transparent ${t(2.8)}px)`,
          `radial-gradient(circle at ${t(20)}px ${t(52)}px, ${color}66 ${t(1.8)}px, transparent ${t(2.2)}px)`,
          `radial-gradient(circle at ${t(48)}px ${t(62)}px, ${color}66 ${t(1.5)}px, transparent ${t(1.9)}px)`,
        ].join(", "),
        backgroundSize: `${tEntero(72)}px ${tEntero(72)}px`,
      };
    case "plano":
    default:
      return {};
  }
}
