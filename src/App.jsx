import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider.jsx";
import SeleccionRol from "./auth/SeleccionRol.jsx";
import LoginProfesional from "./auth/LoginProfesional.jsx";
import LoginConsultante from "./auth/LoginConsultante.jsx";
import NoAutorizado from "./auth/NoAutorizado.jsx";
import Splash from "./ui/Splash.jsx";
import Inicio from "./ui/Inicio.jsx";
import Editor from "./ui/Editor.jsx";
import { ESTILO_TARJETA_POR_DEFECTO } from "./estilos/tema.js";
import {
  listarLienzos,
  crearLienzo,
  renombrarLienzo,
  personalizarLienzo,
  actualizarPaciente as actualizarPacienteRemoto,
  eliminarLienzo,
} from "./data/lienzos.js";

function AppProfesional() {
  const { perfil, guardarPerfil, salir } = useAuth();
  const [indice, setIndice] = useState(null);
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    listarLienzos().then(setIndice);
  }, []);

  if (indice === null) return <Splash />;

  const cambiarEstilo = (id, estilo) => {
    setIndice((idx) => idx.map((l) => (l.id === id ? { ...l, estilo } : l)));
    personalizarLienzo(id, estilo);
  };

  if (abierto)
    return (
      <Editor
        key={abierto}
        id={abierto}
        nombre={indice.find((l) => l.id === abierto)?.nombre || "Lienzo"}
        estilo={indice.find((l) => l.id === abierto)?.estilo || ESTILO_TARJETA_POR_DEFECTO}
        onCambiarEstilo={(estilo) => cambiarEstilo(abierto, estilo)}
        onInicio={() => setAbierto(null)}
        onResumen={(datos) =>
          setIndice((idx) => idx.map((l) => (l.id === abierto ? { ...l, ...datos } : l)))
        }
      />
    );

  return (
    <Inicio
      indice={indice}
      profesional={perfil.nombreCompleto}
      perfil={perfil}
      onGuardarPerfil={guardarPerfil}
      onSalir={salir}
      onAbrir={setAbierto}
      onCrear={async (datosPaciente) => {
        const nuevo = await crearLienzo(datosPaciente);
        if (!nuevo) return;
        setIndice((idx) => [nuevo, ...idx]);
        setAbierto(nuevo.id);
      }}
      onRenombrar={(id, nombre) => {
        setIndice((idx) => idx.map((l) => (l.id === id ? { ...l, nombre } : l)));
        renombrarLienzo(id, nombre);
      }}
      onPersonalizar={cambiarEstilo}
      onActualizarPaciente={(id, datosPaciente) => {
        setIndice((idx) =>
          idx.map((l) =>
            l.id === id
              ? {
                  ...l,
                  paciente: datosPaciente,
                  nombre: datosPaciente.alias || datosPaciente.nombreCompleto,
                }
              : l
          )
        );
        actualizarPacienteRemoto(id, datosPaciente);
      }}
      onEliminar={(id) => {
        setIndice((idx) => idx.filter((l) => l.id !== id));
        eliminarLienzo(id);
      }}
    />
  );
}

function AppInterno() {
  const { estado } = useAuth();
  const [vistaAcceso, setVistaAcceso] = useState("seleccion");

  if (estado === "cargando") return <Splash />;

  if (estado === "no_autorizado")
    return <NoAutorizado onVolver={() => setVistaAcceso("seleccion")} />;

  if (estado === "sin_sesion") {
    if (vistaAcceso === "profesional")
      return <LoginProfesional onVolver={() => setVistaAcceso("seleccion")} />;
    if (vistaAcceso === "consultante")
      return <LoginConsultante onVolver={() => setVistaAcceso("seleccion")} />;
    return <SeleccionRol onElegir={setVistaAcceso} />;
  }

  // estado === "consultante": se implementa en la siguiente etapa.
  if (estado === "consultante") return <Splash />;

  return <AppProfesional />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInterno />
    </AuthProvider>
  );
}
