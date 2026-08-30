import { useRef, useState, useEffect } from "react";
import { C, FONT, SERIF, W, NOTCH, COLORES_NODO, COLORES_EMOCION } from "../estilos/tema.js";
import { quitar } from "../estilos/compartidos.js";
import { mezclarConBlanco } from "../estilos/patrones.js";
import { IconoSticker } from "./iconosSticker.jsx";

/* ============ Nodo ============ */
export default function Nodo({
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

  if (n.tipo === "sticker") {
    const tamano = n.tamano || 64;
    return (
      <div
        className="nd-node"
        onPointerDown={onPointerDown}
        style={{
          position: "absolute",
          left: n.x,
          top: n.y,
          width: tamano,
          height: tamano,
          borderRadius: "50%",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
          boxShadow: seleccionado ? `inset 0 0 0 2px ${C.ink}` : "none",
        }}
      >
        <IconoSticker
          tipo={n.sticker}
          color={COLORES_NODO[n.color] || COLORES_NODO.bruma}
          patron={n.patron}
          idBase={n.id}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: tamano * 0.82,
            height: tamano * 0.82,
            transform: "translate(-50%, -50%)",
            filter: "drop-shadow(0 4px 8px rgba(22,50,63,.35))",
          }}
        />
      </div>
    );
  }

  const central = n.tipo === "central";
  const titulo = n.tipo === "titulo";
  const emocion = n.tipo === "emocion";
  const colorHex = n.color ? (emocion ? COLORES_EMOCION[n.color] : COLORES_NODO[n.color]) : null;

  const anillo = n.foco
    ? `inset 0 0 0 2px ${C.foco}`
    : seleccionado
    ? `inset 0 0 0 1.8px ${C.ink}`
    : `inset 0 0 0 1px ${central ? "rgba(22,50,63,.22)" : C.borde}`;

  const sombra = central
    ? ", 0 2px 4px rgba(22,50,63,.06), 0 18px 34px -16px rgba(22,50,63,.5)"
    : ", 0 6px 16px -12px rgba(22,50,63,.5)";

  const marco = titulo
    ? {
        background: "transparent",
        borderRadius: 6,
        boxShadow: seleccionado ? `inset 0 0 0 1px ${C.borde}` : "none",
      }
    : {
        background: central
          ? C.panel
          : emocion
          ? mezclarConBlanco(colorHex || C.inkTenue, 0.32)
          : "rgba(255,255,255,.74)",
        backdropFilter: central || emocion ? "none" : "blur(3px)",
        borderRadius: central ? 16 : 4,
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
      {!titulo && !emocion && colorHex && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: colorHex,
          }}
        />
      )}
      <div
        style={{
          padding: titulo ? "3px 4px" : central ? "14px 17px" : "10px 12px",
          paddingLeft: !titulo && !emocion && colorHex ? (central ? 21 : 16) : undefined,
        }}
      >
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
                background: n.foco ? C.foco : colorHex || (central ? C.ink : C.inkTenue),
                flexShrink: 0,
              }}
            />
            {central ? "Central" : emocion ? "Emoción" : "Acompañamiento"}
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
                : emocion
                ? "Nombra la emoción…"
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
                  e.stopPropagation();
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
