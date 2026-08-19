import { supabase } from "../lib/supabaseClient.js";

export const PERFIL_VACIO = {
  nombreCompleto: "",
  profesion: "",
  registroSIS: "",
  registroMineduc: "",
  correo: "",
};

function filaAPerfil(fila) {
  return {
    nombreCompleto: fila.nombre_completo || "",
    profesion: fila.profesion || "",
    registroSIS: fila.registro_sis || "",
    registroMineduc: fila.registro_mineduc || "",
    correo: fila.correo || "",
  };
}

// Devuelve el perfil del profesional autenticado, o `undefined` si hay
// sesión pero no existe fila en `perfiles` — esa es la señal de "cuenta
// no autorizada" que usa AuthProvider para cerrar la sesión.
export async function leerPerfil() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase.from("perfiles").select("*").eq("id", uid).maybeSingle();
  if (error) {
    console.error("leerPerfil", error);
    return null;
  }
  return data ? filaAPerfil(data) : undefined;
}

export async function guardarPerfil(datos) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return false;
  const { error } = await supabase
    .from("perfiles")
    .update({
      nombre_completo: datos.nombreCompleto,
      profesion: datos.profesion,
      registro_sis: datos.registroSIS,
      registro_mineduc: datos.registroMineduc,
      correo: datos.correo,
    })
    .eq("id", uid);
  return !error;
}
