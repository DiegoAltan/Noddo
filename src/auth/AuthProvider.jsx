import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, supabaseConfigurado } from "../lib/supabaseClient.js";
import { leerPerfil, guardarPerfil as guardarPerfilRemoto } from "../data/perfil.js";

const AuthContext = createContext(null);

// Estados posibles: "cargando" | "sin_sesion" | "no_autorizado" | "profesional" | "consultante"
export function AuthProvider({ children }) {
  const [estado, setEstado] = useState("cargando");
  const [perfil, setPerfil] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const resolverSesion = useCallback(async (session) => {
    if (!session) {
      setPerfil(null);
      setEstado("sin_sesion");
      return;
    }

    // Sesión de consultante (Etapa 2): el JWT trae app_metadata.rol y
    // rut_normalizado, emitidos por la Edge Function de acceso. Como el
    // consultante no tiene fila en `perfiles`, hay que distinguir este
    // caso ANTES de intentar leer el perfil profesional.
    if (session.user?.app_metadata?.rol === "consultante") {
      setEstado("consultante");
      return;
    }

    const datosPerfil = await leerPerfil();
    if (datosPerfil === undefined) {
      // Hay sesión de Google pero no hay fila en `perfiles`: el trigger
      // handle_new_user() no la creó porque el correo no está en
      // profesionales_autorizados (o no está vigente). No tiene ningún
      // acceso real — todas las políticas RLS filtran por esa fila — pero
      // igual cerramos la sesión de forma explícita y mostramos el motivo,
      // en vez de dejar al usuario "autenticado" sin poder hacer nada.
      await supabase.auth.signOut();
      setMensaje(
        "Tu cuenta de Google aún no está autorizada para usar Noddo. Si crees que esto es un error, contacta a quien administra la plataforma."
      );
      setPerfil(null);
      setEstado("no_autorizado");
      return;
    }

    if (datosPerfil === null) {
      // Error de red/consulta, no un rechazo de autorización.
      setMensaje("No se pudo verificar tu cuenta. Intenta de nuevo.");
      setEstado("no_autorizado");
      return;
    }

    setPerfil(datosPerfil);
    setEstado("profesional");
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado) {
      setEstado("sin_sesion");
      return;
    }
    supabase.auth.getSession().then(({ data }) => resolverSesion(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, session) => {
      resolverSesion(session);
    });
    return () => sub.subscription.unsubscribe();
  }, [resolverSesion]);

  const entrarConGoogle = async () => {
    setMensaje("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const salir = async () => {
    await supabase.auth.signOut();
    setMensaje("");
    setPerfil(null);
    setEstado("sin_sesion");
  };

  const guardarPerfil = async (datos) => {
    const ok = await guardarPerfilRemoto(datos);
    if (ok) setPerfil(datos);
    return ok;
  };

  const limpiarMensaje = () => setMensaje("");

  return (
    <AuthContext.Provider
      value={{ estado, perfil, mensaje, entrarConGoogle, salir, guardarPerfil, limpiarMensaje }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
