import { useState } from "react";
import { FONDOS, C, FONT, SERIF, CSS, COLORES_TARJETA, PATRONES, ESTILO_TARJETA_POR_DEFECTO } from "../estilos/tema.js";
import { estiloTarjeta } from "../estilos/patrones.js";
import { pantalla, mini, boton, etiqueta } from "../estilos/compartidos.js";
import { datosPacienteVacios, datosPacienteDe } from "../lib/paciente.js";
import Noddo from "./Noddo.jsx";
import BotonIcono from "./BotonIcono.jsx";
import ModalPaciente from "./ModalPaciente.jsx";
import ModalPerfil from "./ModalPerfil.jsx";

/* ============ Inicio ============ */
export default function Inicio({
  indice,
  profesional,
  perfil,
  onSalir,
  onAbrir,
  onCrear,
  onRenombrar,
  onPersonalizar,
  onActualizarPaciente,
  onGuardarPerfil,
  onEliminar,
}) {
  const [editando, setEditando] = useState(null);
  const [personalizando, setPersonalizando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [viendoDatos, setViendoDatos] = useState(null);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  return (
    <div
      className="nd"
      style={{
        ...pantalla,
        display: "block",
        background: FONDOS.bruma.bg,
        overflowY: "auto",
        fontFamily: FONT,
        color: C.ink,
      }}
    >
      <style>{CSS}</style>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "48px 28px 64px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Noddo tamano={19} sub="Visualización y memoria en psicoterapia" />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              className="nd-mini"
              style={{ ...mini, fontSize: 12, color: C.inkSoft }}
              onClick={() => setMostrarPerfil(true)}
              title="Perfil profesional"
            >
              {perfil.nombreCompleto || profesional}
            </button>
            <button className="nd-mini" style={mini} onClick={onSalir}>
              Cerrar sesión
            </button>
          </div>
        </div>

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
          <button
            className="nd-btn"
            onClick={() => setCreando(true)}
            style={{ ...boton(true), padding: "10px 16px" }}
          >
            Agregar paciente
          </button>
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
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))",
              alignItems: "start",
              gap: 10,
            }}
          >
            {indice.map((l) => {
              const estilo = l.estilo || ESTILO_TARJETA_POR_DEFECTO;
              const colorHex = COLORES_TARJETA[estilo.color] || COLORES_TARJETA.bruma;
              return (
                <div
                  key={l.id}
                  className="nd-card"
                  style={{
                    background: C.panel,
                    border: `1px solid ${colorHex}66`,
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow: "0 2px 10px -6px rgba(22,50,63,.30)",
                    cursor: "pointer",
                  }}
                  onClick={() => editando !== l.id && personalizando !== l.id && onAbrir(l.id)}
                >
                  <div
                    style={{
                      height: 60,
                      position: "relative",
                      ...estiloTarjeta(estilo),
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 8,
                        fontFamily: SERIF,
                        fontSize: 11,
                        color: C.ink,
                        background: "rgba(255,255,255,.8)",
                        padding: "1px 6px",
                        borderRadius: 999,
                        letterSpacing: 0.3,
                      }}
                    >
                      Nº {String(l.numero ?? "—").padStart(2, "0")}
                    </span>
                  </div>

                  <div style={{ padding: 11 }}>
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
                            fontSize: 15.5,
                            padding: "2px 4px",
                            border: `1px solid ${C.borde}`,
                            borderRadius: 5,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            flex: 1,
                            fontFamily: SERIF,
                            fontSize: 15.5,
                            lineHeight: 1.25,
                          }}
                        >
                          {l.nombre}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 7,
                        display: "flex",
                        gap: 10,
                        fontSize: 10,
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
                        marginTop: 8,
                        paddingTop: 6,
                        borderTop: `1px solid ${C.hair}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <BotonIcono
                        titulo="Datos del paciente"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViendoDatos(l.id);
                        }}
                      >
                        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
                        <circle cx="9" cy="11" r="2.1" />
                        <path d="M6 16c.6-1.8 2-2.6 3-2.6s2.4.8 3 2.6" />
                        <line x1="14.5" y1="9.5" x2="17.5" y2="9.5" />
                        <line x1="14.5" y1="12.5" x2="17.5" y2="12.5" />
                      </BotonIcono>
                      <BotonIcono
                        titulo="Renombrar"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditando(l.id);
                        }}
                      >
                        <path d="M4.5 19.5l1-4L15 6l3 3-9.5 9.5-4 1z" />
                        <path d="M13 8l3 3" />
                      </BotonIcono>
                      <BotonIcono
                        titulo="Personalizar"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPersonalizando((p) => (p === l.id ? null : l.id));
                        }}
                      >
                        <path d="M12 3.6c-4.7 0-8.4 3.5-8.4 7.9 0 4.4 3.4 6.9 6.4 6.9 1.6 0 2.1.9 1.6 2 -.4 1 .3 2 1.5 2 4.3 0 7.3-4.1 7.3-8.7 0-5.2-3.7-10.1-8.4-10.1z" />
                        <circle cx="8.4" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
                        <circle cx="12" cy="7.8" r="1.05" fill="currentColor" stroke="none" />
                        <circle cx="15.6" cy="10.4" r="1.05" fill="currentColor" stroke="none" />
                      </BotonIcono>
                      <div style={{ flex: 1 }} />
                      <BotonIcono
                        titulo="Eliminar"
                        color={C.peligro}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`¿Eliminar el lienzo "${l.nombre}"?`))
                            onEliminar(l.id);
                        }}
                      >
                        <path d="M5 7h14" />
                        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        <path d="M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" />
                        <line x1="10" y1="11" x2="10" y2="16" />
                        <line x1="14" y1="11" x2="14" y2="16" />
                      </BotonIcono>
                    </div>

                    {personalizando === l.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginTop: 9,
                          paddingTop: 9,
                          borderTop: `1px solid ${C.hair}`,
                        }}
                      >
                        <div style={etiqueta}>Patrón</div>
                        <div
                          style={{
                            display: "flex",
                            gap: 5,
                            flexWrap: "wrap",
                            marginTop: 6,
                            marginBottom: 10,
                          }}
                        >
                          {PATRONES.map((p) => (
                            <button
                              key={p.id}
                              title={p.nombre}
                              onClick={() =>
                                onPersonalizar(l.id, { ...estilo, patron: p.id })
                              }
                              className="nd-swatch"
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                cursor: "pointer",
                                border: `1.5px solid ${
                                  estilo.patron === p.id ? C.ink : C.borde
                                }`,
                                ...estiloTarjeta({ patron: p.id, color: estilo.color }),
                              }}
                            />
                          ))}
                        </div>
                        <div style={etiqueta}>Color</div>
                        <div
                          style={{
                            display: "flex",
                            gap: 5,
                            flexWrap: "wrap",
                            marginTop: 6,
                          }}
                        >
                          {Object.entries(COLORES_TARJETA).map(([k, hex]) => (
                            <button
                              key={k}
                              title={k}
                              onClick={() => onPersonalizar(l.id, { ...estilo, color: k })}
                              className="nd-swatch"
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                cursor: "pointer",
                                background: hex,
                                border: `1px solid ${
                                  estilo.color === k ? C.ink : "transparent"
                                }`,
                                boxShadow:
                                  estilo.color === k
                                    ? `0 0 0 2px ${C.panel} inset`
                                    : "none",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {creando && (
        <ModalPaciente
          titulo="Nuevo paciente"
          inicial={datosPacienteVacios()}
          onCerrar={() => setCreando(false)}
          onGuardar={(datos) => {
            onCrear(datos);
            setCreando(false);
          }}
        />
      )}

      {viendoDatos && (
        <ModalPaciente
          titulo="Datos del paciente"
          inicial={datosPacienteDe(indice.find((l) => l.id === viendoDatos))}
          onCerrar={() => setViendoDatos(null)}
          onGuardar={(datos) => {
            onActualizarPaciente(viendoDatos, datos);
            setViendoDatos(null);
          }}
        />
      )}

      {mostrarPerfil && (
        <ModalPerfil
          inicial={perfil}
          onCerrar={() => setMostrarPerfil(false)}
          onGuardar={(datos) => {
            onGuardarPerfil(datos);
            setMostrarPerfil(false);
          }}
        />
      )}
    </div>
  );
}
