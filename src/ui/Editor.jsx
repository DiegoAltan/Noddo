import { useState, useRef, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import { C, FONT, SERIF, CSS, W, TIPOS, TIPOS_ABREV, COLORES_NODO, COLORES_TARJETA, PATRONES } from "../estilos/tema.js";
import { estiloTarjeta, patronLienzo, colorFondoLienzo, AMBAR_CLARO, AZUL_CLARO, PELIGRO_CLARO, VERDE_CLARO } from "../estilos/patrones.js";
import {
  pantalla,
  flotante,
  caja,
  boton,
  svgCapa,
  vacio,
  zoomCaja,
  zoomBtn,
  zoomTexto,
  mini,
  separador,
  cinta,
  etiqueta,
  sesionCaja,
  sesionBtn,
} from "../estilos/compartidos.js";
import { uid, clamp } from "../lib/utils.js";
import { leerGrafo, guardarGrafo } from "../data/grafo.js";
import Noddo from "./Noddo.jsx";
import Nodo from "./Nodo.jsx";
import Dock from "./Dock.jsx";
import BotonAccionColor from "./BotonAccionColor.jsx";
import { STICKERS, IconoSticker } from "./iconosSticker.jsx";

const STICKER_TAMANO_DEFECTO = 64;
const STICKER_TAMANO_MIN = 32;
const STICKER_TAMANO_MAX = 128;

function bordeCaja(cx, cy, w, h, tx, ty) {
  const dx = tx - cx;
  const dy = ty - cy;
  if (!dx && !dy) return [cx, cy];
  const s = Math.min(
    dx === 0 ? Infinity : (w / 2 + 7) / Math.abs(dx),
    dy === 0 ? Infinity : (h / 2 + 7) / Math.abs(dy)
  );
  return [cx + dx * s, cy + dy * s];
}

/* ============ Editor ============ */
export default function Editor({ id, nombre, estilo, onCambiarEstilo, onInicio, onResumen }) {
  const [nodos, setNodos] = useState([]);
  const [enlaces, setEnlaces] = useState([]);
  const [sesion, setSesion] = useState(1);
  const [vista, setVista] = useState({ x: 0, y: 0, k: 1 });
  const [sel, setSel] = useState(null);
  const [modo, setModo] = useState("mover");
  const [tipoNuevo, setTipoNuevo] = useState("acompanamiento");
  const [tipoStickerNuevo, setTipoStickerNuevo] = useState("corazon");
  const [alturas, setAlturas] = useState({});
  const [editando, setEditando] = useState(null);
  const [nuevaTarea, setNuevaTarea] = useState(null);
  const [paleta, setPaleta] = useState(false);
  const [mostrarColorNodo, setMostrarColorNodo] = useState(false);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);

  const areaRef = useRef(null);
  const arrastre = useRef(null);
  const primer = useRef(true);
  const historia = useRef({ pasado: [], futuro: [] });
  const [, marcarHistoria] = useState(0);

  const avisar = (t, ms = 2200) => {
    setEstado(t);
    setTimeout(() => setEstado(""), ms);
  };

  useEffect(() => {
    (async () => {
      const d = await leerGrafo(id);
      if (d) {
        setNodos(d.nodos || []);
        setEnlaces(d.enlaces || []);
        setVista(d.vista || { x: 0, y: 0, k: 1 });
        setSesion(d.sesion || 1);
      }
      setCargando(false);
    })();
  }, [id]);

  const guardar = useCallback(
    async (confirmar) => {
      const ok = await guardarGrafo(id, {
        nodos,
        enlaces,
        vista,
        sesion,
      });
      onResumen({ nodos: nodos.length, sesion, fecha: Date.now() });
      if (confirmar)
        avisar(
          ok
            ? `Guardado ${new Date().toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "No se pudo guardar. Los cambios siguen en pantalla.",
          ok ? 2200 : 3500
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, nodos, enlaces, vista, sesion]
  );

  useEffect(() => {
    if (cargando) return;
    if (primer.current) {
      primer.current = false;
      return;
    }
    const t = setTimeout(() => guardar(false), 800);
    return () => clearTimeout(t);
  }, [nodos, enlaces, vista, sesion, cargando, guardar]);

  const medir = useCallback((nid, el) => {
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setAlturas((a) =>
        a[nid] === el.offsetHeight ? a : { ...a, [nid]: el.offsetHeight }
      )
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const anchoDe = (n) => (n.tipo === "sticker" ? n.tamano || STICKER_TAMANO_DEFECTO : W[n.tipo]);
  const altoDe = (n) =>
    n.tipo === "sticker"
      ? n.tamano || STICKER_TAMANO_DEFECTO
      : alturas[n.id] || (n.tipo === "central" ? 78 : n.tipo === "titulo" ? 34 : 60);
  const centroDe = (n) => [n.x + anchoDe(n) / 2, n.y + altoDe(n) / 2];
  const aLienzo = (cx, cy) => {
    const r = areaRef.current.getBoundingClientRect();
    return [(cx - r.left - vista.x) / vista.k, (cy - r.top - vista.y) / vista.k];
  };

  const HISTORIA_MAX = 60;
  const registrarHistoria = () => {
    historia.current.pasado.push({ nodos, enlaces });
    if (historia.current.pasado.length > HISTORIA_MAX) historia.current.pasado.shift();
    historia.current.futuro = [];
    marcarHistoria((t) => t + 1);
  };

  const deshacer = () => {
    const pasado = historia.current.pasado;
    if (!pasado.length) return;
    const previo = pasado.pop();
    historia.current.futuro.push({ nodos, enlaces });
    setNodos(previo.nodos);
    setEnlaces(previo.enlaces);
    setSel(null);
    setEditando(null);
    marcarHistoria((t) => t + 1);
  };

  const rehacer = () => {
    const futuro = historia.current.futuro;
    if (!futuro.length) return;
    const siguiente = futuro.pop();
    historia.current.pasado.push({ nodos, enlaces });
    setNodos(siguiente.nodos);
    setEnlaces(siguiente.enlaces);
    setSel(null);
    setEditando(null);
    marcarHistoria((t) => t + 1);
  };

  const crearNodo = (x, y, tipo) => {
    registrarHistoria();
    const n = {
      id: uid(),
      x: x - W[tipo] / 2,
      y: y - (tipo === "titulo" ? 14 : 27),
      texto: "",
      tipo,
      foco: false,
      tareas: [],
      sesion,
    };
    setNodos((ns) => [...ns, n]);
    setSel(n.id);
    setEditando(n.id);
  };

  const crearSticker = (x, y, sticker) => {
    registrarHistoria();
    const tamano = STICKER_TAMANO_DEFECTO;
    const n = {
      id: uid(),
      x: x - tamano / 2,
      y: y - tamano / 2,
      tipo: "sticker",
      sticker,
      tamano,
      color: "rosa",
      patron: "plano",
      sesion,
    };
    setNodos((ns) => [...ns, n]);
    setSel(n.id);
  };

  const actualizar = (nid, campos) =>
    setNodos((ns) => ns.map((n) => (n.id === nid ? { ...n, ...campos } : n)));

  const eliminar = (nid) => {
    registrarHistoria();
    setNodos((ns) => ns.filter((n) => n.id !== nid));
    setEnlaces((es) => es.filter((e) => e.a !== nid && e.b !== nid));
    setSel(null);
  };

  const duplicar = () => {
    const n = nodos.find((x) => x.id === sel);
    if (!n) return;
    registrarHistoria();
    const copia = {
      ...n,
      id: uid(),
      x: n.x + 28,
      y: n.y + 28,
      ...(n.tareas ? { tareas: n.tareas.map((t) => ({ ...t, id: uid() })) } : {}),
    };
    setNodos((ns) => [...ns, copia]);
    setSel(copia.id);
  };

  const conectar = (destino) => {
    const a = nodos.find((n) => n.id === sel);
    const b = nodos.find((n) => n.id === destino);
    if (!a || !b || a.id === b.id) return;
    if (a.tipo === "titulo" || b.tipo === "titulo")
      return avisar("Los títulos no se conectan: nombran, no participan del mapa.");
    if (a.tipo === "sticker" || b.tipo === "sticker")
      return avisar("Los stickers son decorativos: no se conectan al mapa.");
    const rep = enlaces.some(
      (e) => (e.a === a.id && e.b === b.id) || (e.a === b.id && e.b === a.id)
    );
    if (!rep) {
      registrarHistoria();
      setEnlaces((es) => [...es, { id: uid(), a: a.id, b: b.id }]);
    }
    setSel(destino);
  };

  const exportarImagen = async () => {
    if (!areaRef.current) return;
    const selPrevio = sel;
    setSel(null);
    await new Promise((r) => setTimeout(r, 60));
    try {
      const dataUrl = await toPng(areaRef.current, {
        backgroundColor: colorFondoLienzo(estilo),
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${nombre || "lienzo"} - sesion ${sesion}.png`;
      a.click();
      avisar("Imagen exportada.");
    } catch (err) {
      avisar("No se pudo exportar la imagen.", 3500);
    } finally {
      setSel(selPrevio);
    }
  };

  const fondoDown = (e) => {
    if (e.target !== e.currentTarget) return;
    setEditando(null);
    setNuevaTarea(null);
    setPaleta(false);
    setMostrarColorNodo(false);
    if (modo === "nodo") {
      e.preventDefault();
      const [x, y] = aLienzo(e.clientX, e.clientY);
      crearNodo(x, y, tipoNuevo);
      return;
    }
    if (modo === "sticker") {
      e.preventDefault();
      const [x, y] = aLienzo(e.clientX, e.clientY);
      crearSticker(x, y, tipoStickerNuevo);
      return;
    }
    setSel(null);
    arrastre.current = {
      tipo: "pan",
      x0: e.clientX,
      y0: e.clientY,
      vx: vista.x,
      vy: vista.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const nodoDown = (e, n) => {
    e.stopPropagation();
    setNuevaTarea(null);
    setPaleta(false);
    setMostrarColorNodo(false);
    if (modo === "conectar") {
      if (sel && sel !== n.id) conectar(n.id);
      else setSel(n.id);
      return;
    }
    setSel(n.id);
    registrarHistoria();
    arrastre.current = {
      tipo: "nodo",
      id: n.id,
      x0: e.clientX,
      y0: e.clientY,
      nx: n.x,
      ny: n.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const moverPuntero = (e) => {
    const a = arrastre.current;
    if (!a) return;
    const dx = e.clientX - a.x0;
    const dy = e.clientY - a.y0;
    if (a.tipo === "pan") setVista((v) => ({ ...v, x: a.vx + dx, y: a.vy + dy }));
    else actualizar(a.id, { x: a.nx + dx / vista.k, y: a.ny + dy / vista.k });
  };

  const zoomA = (k2, px, py) =>
    setVista((v) => {
      const k = clamp(k2, 0.4, 2.2);
      const r = areaRef.current.getBoundingClientRect();
      const cx = px == null ? r.width / 2 : px - r.left;
      const cy = py == null ? r.height / 2 : py - r.top;
      return { k, x: cx - ((cx - v.x) / v.k) * k, y: cy - ((cy - v.y) / v.k) * k };
    });

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      zoomA(vista.k * (e.deltaY > 0 ? 0.92 : 1.08), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista.k]);

  const nodoSel = nodos.find((n) => n.id === sel) || null;

  useEffect(() => {
    const onKeyDown = (e) => {
      const enCampo = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (enCampo) return;
        e.preventDefault();
        deshacer();
        return;
      }
      if (mod && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        if (enCampo) return;
        e.preventDefault();
        rehacer();
        return;
      }
      if (enCampo) return;

      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicar();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && nodoSel && !editando) {
        e.preventDefault();
        eliminar(nodoSel.id);
        return;
      }
      if (e.key === "Enter" && nodoSel && !editando && nodoSel.tipo !== "sticker") {
        e.preventDefault();
        registrarHistoria();
        setEditando(nodoSel.id);
        return;
      }
      if (e.key === "Escape") {
        setEditando(null);
        setNuevaTarea(null);
        setPaleta(false);
        setMostrarColorNodo(false);
        setSel(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodoSel, editando, sel, nodos, enlaces]);

  return (
    <div
      className="nd"
      style={{
        ...pantalla,
        fontFamily: FONT,
        color: C.ink,
        background: colorFondoLienzo(estilo),
        position: "relative",
      }}
    >
      <style>{CSS}</style>

      {/* Lienzo */}
      <div
        ref={areaRef}
        onPointerDown={fondoDown}
        onPointerMove={moverPuntero}
        onPointerUp={() => (arrastre.current = null)}
        onPointerCancel={() => (arrastre.current = null)}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          touchAction: "none",
          cursor: modo === "nodo" ? "copy" : "default",
          backgroundPosition: `${vista.x}px ${vista.y}px`,
          ...patronLienzo(estilo, vista.k),
        }}
      >
        {!cargando && !nodos.length && (
          <div style={vacio}>
            <p style={{ fontFamily: SERIF, fontSize: 20, margin: 0, color: C.ink }}>
              El lienzo está vacío.
            </p>
            <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              Elige <strong>Nodo</strong> abajo, escoge qué vas a poner y toca el
              lienzo.
            </p>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.k})`,
          }}
        >
          <svg style={svgCapa}>
            {enlaces.map((e) => {
              const a = nodos.find((n) => n.id === e.a);
              const b = nodos.find((n) => n.id === e.b);
              if (!a || !b) return null;
              const [ax, ay] = centroDe(a);
              const [bx, by] = centroDe(b);
              const [x1, y1] = bordeCaja(ax, ay, anchoDe(a), altoDe(a), bx, by);
              const [x2, y2] = bordeCaja(bx, by, anchoDe(b), altoDe(b), ax, ay);
              const activo = sel === a.id || sel === b.id;
              return (
                <g key={e.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={activo ? C.ink : C.line}
                    strokeWidth={activo ? 2 : 1.4}
                    strokeLinecap="round"
                    opacity={activo ? 1 : 0.75}
                  />
                  {activo && (
                    <g
                      style={{ pointerEvents: "auto", cursor: "pointer" }}
                      onClick={() => {
                        registrarHistoria();
                        setEnlaces((es) => es.filter((x) => x.id !== e.id));
                      }}
                    >
                      <circle
                        cx={(x1 + x2) / 2}
                        cy={(y1 + y2) / 2}
                        r={9}
                        fill={C.panel}
                        stroke={C.borde}
                      />
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 + 4}
                        textAnchor="middle"
                        fontSize="11"
                        fill={C.inkSoft}
                      >
                        ×
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {nodos.map((n) => (
            <Nodo
              key={n.id}
              n={n}
              seleccionado={sel === n.id}
              editando={editando === n.id}
              nuevaTarea={nuevaTarea === n.id}
              medir={medir}
              onPointerDown={(e) => nodoDown(e, n)}
              onDobleClic={() => {
                if (n.tipo === "sticker") return;
                registrarHistoria();
                setEditando(n.id);
              }}
              onTexto={(texto) => actualizar(n.id, { texto })}
              onFinEdicion={() => setEditando(null)}
              onToggleTarea={(tid) => {
                registrarHistoria();
                actualizar(n.id, {
                  tareas: n.tareas.map((t) =>
                    t.id === tid ? { ...t, hecha: !t.hecha } : t
                  ),
                });
              }}
              onQuitarTarea={(tid) => {
                registrarHistoria();
                actualizar(n.id, { tareas: n.tareas.filter((t) => t.id !== tid) });
              }}
              onNuevaTarea={(texto) => {
                if (texto.trim()) {
                  registrarHistoria();
                  actualizar(n.id, {
                    tareas: [
                      ...n.tareas,
                      { id: uid(), texto: texto.trim(), hecha: false },
                    ],
                  });
                }
                setNuevaTarea(null);
              }}
            />
          ))}
        </div>

        {/* Acciones del nodo */}
        {nodoSel && !editando && (
          <div
            style={{
              position: "absolute",
              left: vista.x + nodoSel.x * vista.k,
              top: vista.y + (nodoSel.y + altoDe(nodoSel)) * vista.k + 10,
              display: "flex",
              flexDirection: "column",
              gap: mostrarColorNodo && nodoSel.tipo !== "titulo" ? 6 : 0,
              background: "rgba(255,255,255,.94)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${C.hair}`,
              borderRadius: 9,
              padding: 4,
              boxShadow: "0 10px 26px -12px rgba(22,50,63,.45)",
            }}
          >
            {nodoSel.tipo === "sticker" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BotonAccionColor
                    titulo="Duplicar"
                    bg={VERDE_CLARO}
                    color={C.done}
                    onClick={duplicar}
                  >
                    <rect x="4" y="4" width="13" height="13" rx="2.5" />
                    <path d="M9 17v2a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2" />
                  </BotonAccionColor>
                  <span style={separador} />
                  <div style={sesionCaja}>
                    <button
                      className="nd-mini"
                      style={sesionBtn}
                      aria-label="Achicar sticker"
                      onClick={() => {
                        registrarHistoria();
                        actualizar(nodoSel.id, {
                          tamano: clamp(
                            (nodoSel.tamano || STICKER_TAMANO_DEFECTO) - 8,
                            STICKER_TAMANO_MIN,
                            STICKER_TAMANO_MAX
                          ),
                        });
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 11, padding: "0 6px", color: C.ink }}>
                      {nodoSel.tamano || STICKER_TAMANO_DEFECTO}
                    </span>
                    <button
                      className="nd-mini"
                      style={sesionBtn}
                      aria-label="Agrandar sticker"
                      onClick={() => {
                        registrarHistoria();
                        actualizar(nodoSel.id, {
                          tamano: clamp(
                            (nodoSel.tamano || STICKER_TAMANO_DEFECTO) + 8,
                            STICKER_TAMANO_MIN,
                            STICKER_TAMANO_MAX
                          ),
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span style={separador} />
                  <button
                    className="nd-mini"
                    title="Diseño del sticker"
                    aria-label="Diseño del sticker"
                    onClick={() => setMostrarColorNodo((v) => !v)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      padding: 0,
                      border: "none",
                      borderRadius: 7,
                      background: mostrarColorNodo ? C.hair : "transparent",
                      color: C.inkSoft,
                      cursor: "pointer",
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
                      <path d="M12 3.6c-4.7 0-8.4 3.5-8.4 7.9 0 4.4 3.4 6.9 6.4 6.9 1.6 0 2.1.9 1.6 2 -.4 1 .3 2 1.5 2 4.3 0 7.3-4.1 7.3-8.7 0-5.2-3.7-10.1-8.4-10.1z" />
                      <circle cx="8.4" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
                      <circle cx="12" cy="7.8" r="1.05" fill="currentColor" stroke="none" />
                      <circle cx="15.6" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                  <span style={separador} />
                  <BotonAccionColor
                    titulo="Eliminar"
                    bg={PELIGRO_CLARO}
                    color={C.peligro}
                    onClick={() => eliminar(nodoSel.id)}
                  >
                    <path d="M5 7h14" />
                    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    <path d="M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
                    <line x1="10" y1="11" x2="10" y2="16" />
                    <line x1="14" y1="11" x2="14" y2="16" />
                  </BotonAccionColor>
                </div>

                {mostrarColorNodo && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      paddingTop: 6,
                      paddingLeft: 2,
                      borderTop: `1px solid ${C.hair}`,
                    }}
                  >
                    {PATRONES.map((p) => (
                      <button
                        key={p.id}
                        title={p.nombre}
                        onClick={() => {
                          registrarHistoria();
                          actualizar(nodoSel.id, { patron: p.id });
                        }}
                        className="nd-swatch"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 6,
                          cursor: "pointer",
                          border: `1.5px solid ${nodoSel.patron === p.id ? C.ink : C.borde}`,
                          ...estiloTarjeta({ patron: p.id, color: nodoSel.color }),
                        }}
                      />
                    ))}
                    <span style={separador} />
                    {Object.entries(COLORES_TARJETA).map(([k, hex]) => (
                      <button
                        key={k}
                        title={k}
                        onClick={() => {
                          registrarHistoria();
                          actualizar(nodoSel.id, { color: k });
                        }}
                        className="nd-swatch"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          cursor: "pointer",
                          background: hex,
                          border: `1px solid ${nodoSel.color === k ? C.ink : "transparent"}`,
                          boxShadow: nodoSel.color === k ? `0 0 0 2px ${C.panel} inset` : "none",
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BotonAccionColor
                    titulo="Escribir"
                    bg={AMBAR_CLARO}
                    color={C.focoTexto}
                    onClick={() => {
                      registrarHistoria();
                      setEditando(nodoSel.id);
                    }}
                  >
                    <path d="M4.5 19.5l1-4L15 6l3 3-9.5 9.5-4 1z" />
                    <path d="M13 8l3 3" />
                  </BotonAccionColor>
                  {nodoSel.tipo !== "titulo" && (
                    <BotonAccionColor
                      titulo="Agregar tarea"
                      bg={AZUL_CLARO}
                      color={C.tareaTexto}
                      onClick={() => setNuevaTarea(nodoSel.id)}
                    >
                      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
                      <path d="M8 12l2.5 2.5L16 9" />
                    </BotonAccionColor>
                  )}
                  <BotonAccionColor
                    titulo="Duplicar"
                    bg={VERDE_CLARO}
                    color={C.done}
                    onClick={duplicar}
                  >
                    <rect x="4" y="4" width="13" height="13" rx="2.5" />
                    <path d="M9 17v2a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2" />
                  </BotonAccionColor>
                  {nodoSel.tipo !== "titulo" && (
                    <button
                      className="nd-mini"
                      title="Color del nodo"
                      aria-label="Color del nodo"
                      onClick={() => setMostrarColorNodo((v) => !v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        padding: 0,
                        border: "none",
                        borderRadius: 7,
                        background: mostrarColorNodo ? C.hair : "transparent",
                        color: C.inkSoft,
                        cursor: "pointer",
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
                        <path d="M12 3.6c-4.7 0-8.4 3.5-8.4 7.9 0 4.4 3.4 6.9 6.4 6.9 1.6 0 2.1.9 1.6 2 -.4 1 .3 2 1.5 2 4.3 0 7.3-4.1 7.3-8.7 0-5.2-3.7-10.1-8.4-10.1z" />
                        <circle cx="8.4" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
                        <circle cx="12" cy="7.8" r="1.05" fill="currentColor" stroke="none" />
                        <circle cx="15.6" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
                      </svg>
                    </button>
                  )}
                  <span style={separador} />
                  {TIPOS.map(([k, label]) => (
                    <button
                      key={k}
                      className="nd-mini"
                      style={{
                        ...mini,
                        color: nodoSel.tipo === k ? C.ink : C.inkSoft,
                        background: nodoSel.tipo === k ? C.hair : "transparent",
                      }}
                      title={label}
                      onClick={() => {
                        if (nodoSel.tipo !== k) registrarHistoria();
                        actualizar(nodoSel.id, { tipo: k });
                      }}
                    >
                      {TIPOS_ABREV[k]}
                    </button>
                  ))}
                  <span style={separador} />
                  <BotonAccionColor
                    titulo="Eliminar"
                    bg={PELIGRO_CLARO}
                    color={C.peligro}
                    onClick={() => eliminar(nodoSel.id)}
                  >
                    <path d="M5 7h14" />
                    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    <path d="M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
                    <line x1="10" y1="11" x2="10" y2="16" />
                    <line x1="14" y1="11" x2="14" y2="16" />
                  </BotonAccionColor>
                </div>

                {mostrarColorNodo && nodoSel.tipo !== "titulo" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      paddingTop: 6,
                      paddingLeft: 2,
                      borderTop: `1px solid ${C.hair}`,
                    }}
                  >
                    <button
                      title="Sin color"
                      onClick={() => {
                        registrarHistoria();
                        actualizar(nodoSel.id, { color: null });
                      }}
                      className="nd-swatch"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        cursor: "pointer",
                        background: C.panel,
                        border: `1.5px solid ${!nodoSel.color ? C.ink : C.borde}`,
                        boxShadow: !nodoSel.color ? `0 0 0 2px ${C.panel} inset` : "none",
                      }}
                    />
                    {Object.entries(COLORES_NODO).map(([k, hex]) => (
                      <button
                        key={k}
                        title={k}
                        onClick={() => {
                          registrarHistoria();
                          actualizar(nodoSel.id, { color: k });
                        }}
                        className="nd-swatch"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          cursor: "pointer",
                          background: hex,
                          border: `1.5px solid ${nodoSel.color === k ? C.ink : "transparent"}`,
                          boxShadow: nodoSel.color === k ? `0 0 0 2px ${C.panel} inset` : "none",
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Marca */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 20,
          zIndex: 40,
          background: "rgba(255,255,255,.82)",
          backdropFilter: "blur(10px)",
          border: `1px solid rgba(255,255,255,.7)`,
          borderRadius: 10,
          padding: "9px 14px",
          boxShadow: "0 6px 20px -12px rgba(22,50,63,.5)",
        }}
      >
        <Noddo tamano={13} onClick={onInicio} sub={nombre} />
      </div>

      {/* Zoom */}
      <div style={zoomCaja}>
        <button className="nd-mini" style={zoomBtn} onClick={() => zoomA(vista.k * 1.15)}>
          +
        </button>
        <div style={zoomTexto}>{Math.round(vista.k * 100)}%</div>
        <button className="nd-mini" style={zoomBtn} onClick={() => zoomA(vista.k * 0.87)}>
          −
        </button>
        <button
          className="nd-mini"
          style={{ ...zoomBtn, fontSize: 9.5, borderTop: `1px solid ${C.hair}` }}
          onClick={() => setVista({ x: 0, y: 0, k: 1 })}
        >
          100%
        </button>
      </div>

      {/* Avisos */}
      {(estado || modo === "conectar") && (
        <div style={cinta}>
          {estado ||
            (sel
              ? "Toca el nodo con el que quieres conectarlo."
              : "Toca el primer nodo de la conexión.")}
        </div>
      )}

      {/* Selector de tipo */}
      {modo === "nodo" && (
        <div style={{ ...flotante, bottom: 86 }}>
          <div style={caja}>
            <span style={etiqueta}>Vas a poner</span>
            {TIPOS.map(([k, label]) => (
              <button
                key={k}
                className={`nd-btn ${tipoNuevo === k ? "on" : ""}`}
                onClick={() => setTipoNuevo(k)}
                style={boton(tipoNuevo === k, 12)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de sticker */}
      {modo === "sticker" && (
        <div style={{ ...flotante, bottom: 86 }}>
          <div style={caja}>
            <span style={etiqueta}>Vas a poner</span>
            {STICKERS.map((s) => (
              <button
                key={s.id}
                className={`nd-btn ${tipoStickerNuevo === s.id ? "on" : ""}`}
                onClick={() => setTipoStickerNuevo(s.id)}
                title={s.nombre}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  padding: 0,
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `1px solid ${tipoStickerNuevo === s.id ? C.ink : C.borde}`,
                  background: tipoStickerNuevo === s.id ? C.ink : "transparent",
                  color: tipoStickerNuevo === s.id ? C.panel : C.inkSoft,
                }}
              >
                <IconoSticker tipo={s.id} style={{ width: 16, height: 16 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paleta */}
      {paleta && (
        <div style={{ ...flotante, bottom: 86 }}>
          <div style={caja}>
            <span style={etiqueta}>Patrón</span>
            {PATRONES.map((p) => (
              <button
                key={p.id}
                className="nd-swatch"
                onClick={() => onCambiarEstilo({ ...estilo, patron: p.id })}
                title={p.nombre}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  cursor: "pointer",
                  border: `1.5px solid ${estilo.patron === p.id ? C.ink : C.borde}`,
                  ...estiloTarjeta({ patron: p.id, color: estilo.color }),
                }}
              />
            ))}
            <span style={separador} />
            <span style={etiqueta}>Color</span>
            {Object.entries(COLORES_TARJETA).map(([k, hex]) => (
              <button
                key={k}
                className="nd-swatch"
                onClick={() => onCambiarEstilo({ ...estilo, color: k })}
                title={k}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  cursor: "pointer",
                  background: hex,
                  border: `1px solid ${estilo.color === k ? C.ink : "transparent"}`,
                  boxShadow: estilo.color === k ? `0 0 0 2px ${C.panel} inset` : "none",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Barra inferior */}
      <div style={{ ...flotante, bottom: 20 }}>
        <div style={{ ...caja, gap: 5, padding: 6 }}>
          <Dock
            texto
            activo={modo === "nodo"}
            onClick={() => {
              setModo("nodo");
              setPaleta(false);
            }}
            icono={
              <>
                <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
                <line x1="12" y1="9" x2="12" y2="15" />
                <line x1="9" y1="12" x2="15" y2="12" />
              </>
            }
          >
            Nodo
          </Dock>
          <Dock
            texto
            activo={modo === "mover"}
            onClick={() => {
              setModo("mover");
              setPaleta(false);
            }}
            icono={
              <>
                <path d="M12 3.5v17M3.5 12h17" />
                <path d="M12 3.5l-2.6 2.6M12 3.5l2.6 2.6M12 20.5l-2.6-2.6M12 20.5l2.6-2.6" />
                <path d="M3.5 12l2.6-2.6M3.5 12l2.6 2.6M20.5 12l-2.6-2.6M20.5 12l-2.6 2.6" />
              </>
            }
          >
            Mover
          </Dock>
          <Dock
            texto
            activo={modo === "conectar"}
            onClick={() => {
              setModo("conectar");
              setSel(null);
              setPaleta(false);
            }}
            icono={
              <>
                <circle cx="6.5" cy="17.5" r="3" />
                <circle cx="17.5" cy="6.5" r="3" />
                <line x1="8.6" y1="15.4" x2="15.4" y2="8.6" />
              </>
            }
          >
            Conectar
          </Dock>
          <Dock
            activo={modo === "sticker"}
            onClick={() => {
              setModo("sticker");
              setPaleta(false);
            }}
            icono={
              <path d="M12 2.5 14.23 8.93 21.03 9.06 15.61 13.17 17.59 19.69 12 15.8 6.41 19.69 8.39 13.17 2.97 9.06 9.77 8.93Z" />
            }
          >
            Sticker
          </Dock>

          <span style={{ ...separador, height: 22, margin: "0 5px" }} />

          <Dock
            disabled={!historia.current.pasado.length}
            onClick={deshacer}
            icono={
              <>
                <path d="M7.5 8.5H15a4.5 4.5 0 0 1 0 9h-3" />
                <path d="M10.5 5 7 8.5l3.5 3.5" />
              </>
            }
          >
            Deshacer
          </Dock>
          <Dock
            disabled={!historia.current.futuro.length}
            onClick={rehacer}
            icono={
              <>
                <path d="M16.5 8.5H9a4.5 4.5 0 0 0 0 9h3" />
                <path d="M13.5 5 17 8.5l-3.5 3.5" />
              </>
            }
          >
            Rehacer
          </Dock>

          <span style={{ ...separador, height: 22, margin: "0 5px" }} />

          <Dock
            activo={!!nodoSel?.foco}
            acento={C.foco}
            onClick={() => {
              if (!nodoSel) return avisar("Selecciona un nodo para ponerlo en foco.");
              if (nodoSel.tipo === "titulo" || nodoSel.tipo === "sticker")
                return avisar("El foco se pone sobre nodos, no sobre títulos ni stickers.");
              registrarHistoria();
              actualizar(nodoSel.id, { foco: !nodoSel.foco });
            }}
            icono={
              <>
                <circle cx="12" cy="12" r="7.5" />
                <circle cx="12" cy="12" r="3" />
              </>
            }
          >
            Foco
          </Dock>
          <Dock
            activo={paleta}
            onClick={() => setPaleta((p) => !p)}
            icono={
              <>
                <path d="M12 3.6c-4.7 0-8.4 3.5-8.4 7.9 0 4.4 3.4 6.9 6.4 6.9 1.6 0 2.1.9 1.6 2 -.4 1 .3 2 1.5 2 4.3 0 7.3-4.1 7.3-8.7 0-5.2-3.7-10.1-8.4-10.1z" />
                <circle cx="8.4" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
                <circle cx="12" cy="7.8" r="1.05" fill="currentColor" stroke="none" />
                <circle cx="15.6" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
              </>
            }
          >
            Diseño
          </Dock>
          <Dock
            onClick={() => guardar(true)}
            icono={
              <>
                <path d="M5.5 4.5h10l3.5 3.5v11a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1z" />
                <path d="M8 4.5v5h7v-5M8 19.5v-5.5h8v5.5" />
              </>
            }
          >
            Guardar
          </Dock>
          <Dock
            onClick={exportarImagen}
            icono={
              <>
                <path d="M12 4v11" />
                <path d="M7.5 11.5 12 16l4.5-4.5" />
                <path d="M4.5 17v2.2a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V17" />
              </>
            }
          >
            Exportar
          </Dock>

          <div style={sesionCaja} title={`Sesión ${sesion}`}>
            <button
              className="nd-mini"
              style={sesionBtn}
              onClick={() => setSesion((s) => Math.max(1, s - 1))}
              aria-label="Sesión anterior"
            >
              −
            </button>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                padding: "0 7px",
                color: C.ink,
                whiteSpace: "nowrap",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="5.5" width="16" height="15" rx="2" />
                <line x1="4" y1="9.5" x2="20" y2="9.5" />
                <line x1="8" y1="3.5" x2="8" y2="7" />
                <line x1="16" y1="3.5" x2="16" y2="7" />
              </svg>
              {sesion}
            </span>
            <button
              className="nd-mini"
              style={sesionBtn}
              onClick={() => setSesion((s) => s + 1)}
              aria-label="Sesión siguiente"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
