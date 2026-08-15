import React, { useState, useRef, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";

/* ============ Sistema visual ============ */
const FONDOS = {
  bruma: { nombre: "Bruma", bg: "#E9EEF0", grid: "#CBD8DE", tinte: "#16323F" },
  salvia: { nombre: "Salvia", bg: "#E7EDE5", grid: "#C9D8C6", tinte: "#22392C" },
  arena: { nombre: "Arena", bg: "#F1ECE4", grid: "#DCD1C2", tinte: "#3B3126" },
  lavanda: { nombre: "Lavanda", bg: "#ECEAF1", grid: "#D4CFE0", tinte: "#2E2A3D" },
  rosa: { nombre: "Rosa", bg: "#F2EAE9", grid: "#DFCCCB", tinte: "#3D2B2A" },
  cielo: { nombre: "Cielo", bg: "#E5EEF3", grid: "#C6DAE6", tinte: "#173442" },
};

const C = {
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

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MARCA =
  'Futura, "Avenir Next", "Century Gothic", "Trebuchet MS", Helvetica, sans-serif';
const SERIF = 'Iowan Old Style, "Palatino Linotype", Palatino, Georgia, serif';

const W = { central: 240, acompanamiento: 172, titulo: 264 };
const NOTCH = "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)";
const TIPOS = [
  ["central", "Central"],
  ["acompanamiento", "Acompañamiento"],
  ["titulo", "Título"],
];

const K_INDICE = "noddo:indice";
const K_LIENZO = (id) => `noddo:lienzo:${id}`;
const K_LEGADO = "lienzo:v3";

const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const leer = async (k) => {
  try {
    const r = await window.storage.get(k);
    return r ? JSON.parse(r.value) : null;
  } catch (e) {
    return null;
  }
};
const escribir = async (k, v) => {
  try {
    await window.storage.set(k, JSON.stringify(v));
    return true;
  } catch (e) {
    return false;
  }
};

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

/* ============ Estilos globales ============ */
const CSS = `
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
`;

/* ============ Marca ============ */
function Noddo({ tamano = 15, onClick, sub }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <svg width={tamano + 7} height={tamano + 7} viewBox="0 0 24 24" fill="none">
        <line x1="7" y1="16.5" x2="16" y2="7.5" stroke={C.ink} strokeWidth="1.6" />
        <circle cx="7" cy="16.5" r="3.4" fill={C.panel} stroke={C.ink} strokeWidth="1.6" />
        <circle cx="16.5" cy="7" r="4.6" fill={C.ink} />
      </svg>
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontFamily: MARCA,
            fontSize: tamano,
            fontWeight: 500,
            letterSpacing: tamano * 0.22,
            textTransform: "uppercase",
            color: C.ink,
          }}
        >
          Noddo
        </div>
        {sub && (
          <div
            style={{
              fontSize: 10.5,
              color: C.inkSoft,
              marginTop: 5,
              letterSpacing: 0.2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Raíz ============ */
export default function App() {
  const [indice, setIndice] = useState(null);
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    (async () => {
      let idx = await leer(K_INDICE);
      if (!idx) {
        const legado = await leer(K_LEGADO);
        if (legado && Array.isArray(legado.nodos) && legado.nodos.length) {
          const id = uid();
          await escribir(K_LIENZO(id), {
            nodos: legado.nodos,
            enlaces: legado.enlaces || [],
            vista: legado.vista || { x: 0, y: 0, k: 1 },
            sesion: legado.sesion || 1,
            fondo: "bruma",
          });
          idx = [
            {
              id,
              nombre: "Lienzo inicial",
              nodos: legado.nodos.length,
              sesion: legado.sesion || 1,
              fecha: Date.now(),
            },
          ];
        } else {
          idx = [];
        }
        await escribir(K_INDICE, idx);
      }
      setIndice(idx);
    })();
  }, []);

  const actualizarIndice = async (nuevo) => {
    setIndice(nuevo);
    await escribir(K_INDICE, nuevo);
  };

  if (indice === null)
    return (
      <div style={{ ...pantalla, background: FONDOS.bruma.bg }} className="nd">
        <style>{CSS}</style>
        <div style={{ margin: "auto", opacity: 0.5 }}>
          <Noddo tamano={16} />
        </div>
      </div>
    );

  if (abierto)
    return (
      <Editor
        key={abierto}
        id={abierto}
        nombre={indice.find((l) => l.id === abierto)?.nombre || "Lienzo"}
        onInicio={() => setAbierto(null)}
        onResumen={(datos) =>
          actualizarIndice(
            indice.map((l) => (l.id === abierto ? { ...l, ...datos } : l))
          )
        }
      />
    );

  return (
    <Inicio
      indice={indice}
      onAbrir={setAbierto}
      onCrear={async (nombre) => {
        const id = uid();
        await escribir(K_LIENZO(id), {
          nodos: [],
          enlaces: [],
          vista: { x: 0, y: 0, k: 1 },
          sesion: 1,
          fondo: "bruma",
        });
        await actualizarIndice([
          { id, nombre, nodos: 0, sesion: 1, fecha: Date.now() },
          ...indice,
        ]);
        setAbierto(id);
      }}
      onRenombrar={(id, nombre) =>
        actualizarIndice(indice.map((l) => (l.id === id ? { ...l, nombre } : l)))
      }
      onEliminar={(id) => actualizarIndice(indice.filter((l) => l.id !== id))}
    />
  );
}

/* ============ Inicio ============ */
function Inicio({ indice, onAbrir, onCrear, onRenombrar, onEliminar }) {
  const [nuevo, setNuevo] = useState("");
  const [editando, setEditando] = useState(null);

  return (
    <div
      className="nd"
      style={{
        ...pantalla,
        background: FONDOS.bruma.bg,
        overflowY: "auto",
        fontFamily: FONT,
        color: C.ink,
      }}
    >
      <style>{CSS}</style>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "48px 28px 64px" }}>
        <Noddo tamano={19} sub="Visualización y memoria en psicoterapia" />

        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 27,
              fontWeight: 400,
              margin: 0,
              letterSpacing: -0.3,
            }}
          >
            Lienzos
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && nuevo.trim()) {
                  onCrear(nuevo.trim());
                  setNuevo("");
                }
              }}
              placeholder="Nombre o código del consultante"
              style={{
                fontFamily: FONT,
                fontSize: 13,
                padding: "10px 12px",
                width: 240,
                border: `1px solid ${C.borde}`,
                borderRadius: 8,
                background: C.panel,
                color: C.ink,
              }}
            />
            <button
              className="nd-btn"
              onClick={() => {
                if (!nuevo.trim()) return;
                onCrear(nuevo.trim());
                setNuevo("");
              }}
              style={{ ...boton(true), padding: "10px 16px" }}
            >
              Nuevo lienzo
            </button>
          </div>
        </div>

        {indice.length === 0 ? (
          <div
            style={{
              marginTop: 40,
              padding: "56px 24px",
              border: `1px dashed ${C.borde}`,
              borderRadius: 14,
              textAlign: "center",
              color: C.inkSoft,
            }}
          >
            <p style={{ fontFamily: SERIF, fontSize: 19, margin: 0, color: C.ink }}>
              Todavía no hay lienzos.
            </p>
            <p style={{ fontSize: 13, marginTop: 8 }}>
              Crea uno por consultante. Cada lienzo guarda su mapa, sus tareas y su
              número de sesión.
            </p>
          </div>
        ) : (
          <div
            style={{
              marginTop: 26,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 14,
            }}
          >
            {indice.map((l) => (
              <div
                key={l.id}
                className="nd-card"
                style={{
                  background: C.panel,
                  border: `1px solid ${C.hair}`,
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 2px 10px -6px rgba(22,50,63,.30)",
                  cursor: "pointer",
                }}
                onClick={() => editando !== l.id && onAbrir(l.id)}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {editando === l.id ? (
                    <input
                      autoFocus
                      defaultValue={l.nombre}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) => {
                        onRenombrar(l.id, e.target.value.trim() || l.nombre);
                        setEditando(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                      style={{
                        flex: 1,
                        fontFamily: SERIF,
                        fontSize: 17,
                        padding: "3px 5px",
                        border: `1px solid ${C.borde}`,
                        borderRadius: 5,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        fontFamily: SERIF,
                        fontSize: 18,
                        lineHeight: 1.25,
                      }}
                    >
                      {l.nombre}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 14,
                    fontSize: 11,
                    color: C.inkSoft,
                    letterSpacing: 0.3,
                  }}
                >
                  <span>Sesión {l.sesion ?? 1}</span>
                  <span>
                    {l.nodos ?? 0} {l.nodos === 1 ? "nodo" : "nodos"}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: `1px solid ${C.hair}`,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  <button
                    className="nd-mini"
                    style={mini}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditando(l.id);
                    }}
                  >
                    Renombrar
                  </button>
                  <button
                    className="nd-mini"
                    style={{ ...mini, color: C.peligro }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`¿Eliminar el lienzo "${l.nombre}"?`))
                        onEliminar(l.id);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ Editor ============ */
function Editor({ id, nombre, onInicio, onResumen }) {
  const [nodos, setNodos] = useState([]);
  const [enlaces, setEnlaces] = useState([]);
  const [fondo, setFondo] = useState("bruma");
  const [sesion, setSesion] = useState(1);
  const [vista, setVista] = useState({ x: 0, y: 0, k: 1 });
  const [sel, setSel] = useState(null);
  const [modo, setModo] = useState("mover");
  const [tipoNuevo, setTipoNuevo] = useState("acompanamiento");
  const [alturas, setAlturas] = useState({});
  const [editando, setEditando] = useState(null);
  const [nuevaTarea, setNuevaTarea] = useState(null);
  const [paleta, setPaleta] = useState(false);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);

  const areaRef = useRef(null);
  const arrastre = useRef(null);
  const primer = useRef(true);
  const historia = useRef({ pasado: [], futuro: [] });
  const [, marcarHistoria] = useState(0);

  const F = FONDOS[fondo] || FONDOS.bruma;
  const avisar = (t, ms = 2200) => {
    setEstado(t);
    setTimeout(() => setEstado(""), ms);
  };

  useEffect(() => {
    (async () => {
      const d = await leer(K_LIENZO(id));
      if (d) {
        setNodos(d.nodos || []);
        setEnlaces(d.enlaces || []);
        setVista(d.vista || { x: 0, y: 0, k: 1 });
        setSesion(d.sesion || 1);
        setFondo(d.fondo || "bruma");
      }
      setCargando(false);
    })();
  }, [id]);

  const guardar = useCallback(
    async (confirmar) => {
      const ok = await escribir(K_LIENZO(id), {
        nodos,
        enlaces,
        vista,
        sesion,
        fondo,
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
    [id, nodos, enlaces, vista, sesion, fondo]
  );

  useEffect(() => {
    if (cargando) return;
    if (primer.current) {
      primer.current = false;
      return;
    }
    const t = setTimeout(() => guardar(false), 800);
    return () => clearTimeout(t);
  }, [nodos, enlaces, vista, sesion, fondo, cargando, guardar]);

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

  const anchoDe = (n) => W[n.tipo];
  const altoDe = (n) =>
    alturas[n.id] || (n.tipo === "central" ? 78 : n.tipo === "titulo" ? 34 : 60);
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
      tareas: n.tareas.map((t) => ({ ...t, id: uid() })),
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
        backgroundColor: F.bg,
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
    if (modo === "nodo") {
      e.preventDefault();
      const [x, y] = aLienzo(e.clientX, e.clientY);
      crearNodo(x, y, tipoNuevo);
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
      if (e.key === "Enter" && nodoSel && !editando) {
        e.preventDefault();
        registrarHistoria();
        setEditando(nodoSel.id);
        return;
      }
      if (e.key === "Escape") {
        setEditando(null);
        setNuevaTarea(null);
        setPaleta(false);
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
        background: F.bg,
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
          backgroundImage: `radial-gradient(${F.grid} 1px, transparent 1px)`,
          backgroundSize: `${24 * vista.k}px ${24 * vista.k}px`,
          backgroundPosition: `${vista.x}px ${vista.y}px`,
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
              alignItems: "center",
              gap: 2,
              background: "rgba(255,255,255,.94)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${C.hair}`,
              borderRadius: 9,
              padding: 4,
              boxShadow: "0 10px 26px -12px rgba(22,50,63,.45)",
            }}
          >
            <button
              className="nd-mini"
              style={mini}
              onClick={() => {
                registrarHistoria();
                setEditando(nodoSel.id);
              }}
            >
              Escribir
            </button>
            {nodoSel.tipo !== "titulo" && (
              <button
                className="nd-mini"
                style={mini}
                onClick={() => setNuevaTarea(nodoSel.id)}
              >
                + Tarea
              </button>
            )}
            <button className="nd-mini" style={mini} onClick={duplicar}>
              Duplicar
            </button>
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
                onClick={() => {
                  if (nodoSel.tipo !== k) registrarHistoria();
                  actualizar(nodoSel.id, { tipo: k });
                }}
              >
                {label}
              </button>
            ))}
            <span style={separador} />
            <button
              className="nd-mini"
              style={{ ...mini, color: C.peligro }}
              onClick={() => eliminar(nodoSel.id)}
            >
              Eliminar
            </button>
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

      {/* Paleta */}
      {paleta && (
        <div style={{ ...flotante, bottom: 86 }}>
          <div style={caja}>
            <span style={etiqueta}>Fondo</span>
            {Object.entries(FONDOS).map(([k, f]) => (
              <button
                key={k}
                className="nd-swatch"
                onClick={() => setFondo(k)}
                title={f.nombre}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  cursor: "pointer",
                  background: f.bg,
                  border: `1px solid ${fondo === k ? C.ink : C.borde}`,
                  boxShadow: fondo === k ? `0 0 0 2px ${C.panel} inset` : "none",
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
              if (nodoSel.tipo === "titulo")
                return avisar("El foco se pone sobre nodos, no sobre títulos.");
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

          <div style={sesionCaja}>
            <button
              className="nd-mini"
              style={sesionBtn}
              onClick={() => setSesion((s) => Math.max(1, s - 1))}
            >
              −
            </button>
            <span
              style={{
                fontSize: 12,
                padding: "0 9px",
                color: C.ink,
                whiteSpace: "nowrap",
              }}
            >
              Sesión {sesion}
            </span>
            <button
              className="nd-mini"
              style={sesionBtn}
              onClick={() => setSesion((s) => s + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Nodo ============ */
function Nodo({
  n,
  seleccionado,
  editando,
  nuevaTarea,
  medir,
  onPointerDown,
  onDobleClic,
  onTexto,
  onFinEdicion,
  onToggleTarea,
  onQuitarTarea,
  onNuevaTarea,
}) {
  const ref = useRef(null);
  const [borrador, setBorrador] = useState("");
  useEffect(() => medir(n.id, ref.current), [n.id, medir]);

  const central = n.tipo === "central";
  const titulo = n.tipo === "titulo";

  const anillo = n.foco
    ? `inset 0 0 0 2px ${C.foco}`
    : seleccionado
    ? `inset 0 0 0 1.8px ${C.ink}`
    : `inset 0 0 0 1px ${central ? "rgba(22,50,63,.22)" : C.borde}`;

  const sombra = central
    ? ", 0 1px 2px rgba(22,50,63,.05), 0 14px 30px -14px rgba(22,50,63,.45)"
    : ", 0 6px 16px -12px rgba(22,50,63,.5)";

  const marco = titulo
    ? {
        background: "transparent",
        borderRadius: 6,
        boxShadow: seleccionado ? `inset 0 0 0 1px ${C.borde}` : "none",
      }
    : {
        background: central ? C.panel : "rgba(255,255,255,.72)",
        backdropFilter: central ? "none" : "blur(3px)",
        borderRadius: central ? 16 : 3,
        clipPath: central ? "none" : NOTCH,
        overflow: "hidden",
        boxShadow: anillo + sombra,
      };

  return (
    <div
      ref={ref}
      className="nd-node"
      onPointerDown={onPointerDown}
      onDoubleClick={onDobleClic}
      style={{
        position: "absolute",
        left: n.x,
        top: n.y,
        width: W[n.tipo],
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        ...marco,
      }}
    >
      <div style={{ padding: titulo ? "3px 4px" : central ? "14px 17px" : "10px 12px" }}>
        {!titulo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 8.5,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: n.foco ? C.focoTexto : C.inkTenue,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                width: central ? 7 : 5,
                height: central ? 7 : 5,
                borderRadius: central ? 7 : 1,
                background: n.foco ? C.foco : central ? C.ink : C.inkTenue,
                flexShrink: 0,
              }}
            />
            {central ? "Central" : "Acompañamiento"}
            {n.foco ? " · en foco" : ""}
          </div>
        )}

        {editando ? (
          <textarea
            autoFocus
            value={n.texto}
            onChange={(e) => onTexto(e.target.value)}
            onBlur={onFinEdicion}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder={
              titulo
                ? "Nombre de la sección"
                : central
                ? "El nudo del relato…"
                : "Lo que aparece alrededor…"
            }
            rows={titulo ? 1 : 2}
            style={{
              width: "100%",
              fontFamily: titulo ? SERIF : FONT,
              fontSize: titulo ? 19 : central ? 15 : 13,
              lineHeight: 1.35,
              color: C.ink,
              background: titulo ? "rgba(255,255,255,.75)" : C.panel,
              border: `1px solid ${C.hair}`,
              borderRadius: 6,
              padding: titulo ? "4px 6px" : 7,
              resize: "none",
            }}
          />
        ) : (
          <div
            style={{
              fontFamily: titulo ? SERIF : FONT,
              fontSize: titulo ? 19 : central ? 15.5 : 13,
              fontWeight: central ? 500 : 400,
              letterSpacing: titulo ? 0.2 : central ? -0.1 : 0,
              lineHeight: 1.38,
              color: n.texto ? C.ink : C.inkTenue,
              opacity: titulo && !n.texto ? 0.5 : 1,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {n.texto || (titulo ? "Título" : "Doble clic para escribir")}
          </div>
        )}
      </div>

      {!titulo && (n.tareas.length > 0 || nuevaTarea) && (
        <div
          style={{
            background: C.tarea,
            borderTop: `1px solid ${C.tareaBorde}`,
            padding: central ? "10px 17px" : "8px 12px",
          }}
        >
          {n.tareas.map((t) => (
            <div
              key={t.id}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                gap: 7,
                alignItems: "flex-start",
                fontSize: 12,
                lineHeight: 1.35,
                marginBottom: 4,
              }}
            >
              <input
                type="checkbox"
                checked={t.hecha}
                onChange={() => onToggleTarea(t.id)}
                style={{ marginTop: 1.5, accentColor: C.done, cursor: "pointer" }}
              />
              <span
                style={{
                  flex: 1,
                  color: t.hecha ? "#7BA0B2" : C.tareaTexto,
                  textDecoration: t.hecha ? "line-through" : "none",
                }}
              >
                {t.texto}
              </span>
              {seleccionado && (
                <button
                  onClick={() => onQuitarTarea(t.id)}
                  style={quitar}
                  aria-label="Quitar tarea"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {nuevaTarea && (
            <input
              autoFocus
              value={borrador}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => setBorrador(e.target.value)}
              onBlur={() => {
                onNuevaTarea(borrador);
                setBorrador("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onNuevaTarea(borrador);
                  setBorrador("");
                }
              }}
              placeholder="Nueva tarea"
              style={{
                width: "100%",
                fontFamily: FONT,
                fontSize: 12,
                color: C.tareaTexto,
                background: C.panel,
                padding: "6px 8px",
                border: `1px solid ${C.tareaBorde}`,
                borderRadius: 5,
                marginTop: 4,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ============ Piezas ============ */
function Dock({ children, activo, onClick, acento, icono, disabled }) {
  const color = acento || C.ink;
  return (
    <button
      className={`nd-btn ${activo ? "on" : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontFamily: FONT,
        fontSize: 12,
        padding: "8px 12px",
        borderRadius: 8,
        cursor: disabled ? "default" : "pointer",
        border: "1px solid transparent",
        background: activo ? color : "transparent",
        color: activo ? (acento ? "#3D2C08" : "#fff") : C.inkSoft,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icono}
      </svg>
      {children}
    </button>
  );
}

const pantalla = { height: "100vh", width: "100%", display: "flex", flexDirection: "column" };

const flotante = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 30,
  display: "flex",
  justifyContent: "center",
  maxWidth: "96vw",
};

const caja = {
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

const boton = (activo, fs = 12.5) => ({
  fontFamily: FONT,
  fontSize: fs,
  padding: "7px 12px",
  borderRadius: 8,
  cursor: "pointer",
  border: `1px solid ${activo ? C.ink : C.borde}`,
  background: activo ? C.ink : "transparent",
  color: activo ? "#fff" : C.inkSoft,
});

const svgCapa = {
  position: "absolute",
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  overflow: "visible",
  pointerEvents: "none",
};

const vacio = {
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

const zoomCaja = {
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

const zoomBtn = {
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

const zoomTexto = {
  fontSize: 10,
  color: C.inkTenue,
  textAlign: "center",
  padding: "3px 0",
  borderTop: `1px solid ${C.hair}`,
  borderBottom: `1px solid ${C.hair}`,
};

const mini = {
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

const separador = { width: 1, height: 16, background: C.hair, margin: "0 3px" };

const quitar = {
  border: "none",
  background: "transparent",
  color: "#7BA0B2",
  cursor: "pointer",
  fontSize: 13,
  lineHeight: 1,
  padding: 0,
};

const cinta = {
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

const etiqueta = {
  fontSize: 9,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: C.inkTenue,
  marginRight: 3,
};

const sesionCaja = {
  display: "flex",
  alignItems: "center",
  border: `1px solid ${C.borde}`,
  borderRadius: 8,
  overflow: "hidden",
  marginLeft: 3,
};

const sesionBtn = {
  border: "none",
  background: "transparent",
  color: C.inkSoft,
  fontSize: 13,
  padding: "7px 10px",
  cursor: "pointer",
  fontFamily: FONT,
};
