import { supabase } from "../lib/supabaseClient.js";

// Lee el grafo (nodos+enlaces), la vista y la sesión de un lienzo.
// Devuelve null si no existe o si RLS lo bloquea (lienzo de otro
// profesional, por ejemplo) — igual que el leer() de localStorage que
// reemplaza, para no tener que tocar la lógica del Editor.
export async function leerGrafo(id) {
  const { data, error } = await supabase
    .from("lienzos")
    .select("grafo, vista, sesion")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  const grafo = data.grafo || { nodos: [], enlaces: [] };
  return {
    nodos: grafo.nodos || [],
    enlaces: grafo.enlaces || [],
    vista: data.vista || { x: 0, y: 0, k: 1 },
    sesion: data.sesion || 1,
  };
}

// Guarda el grafo completo de una sola vez (mismo patrón de autoguardado
// por debounce que ya tenía el Editor). Devuelve true/false.
export async function guardarGrafo(id, { nodos, enlaces, vista, sesion }) {
  const { error } = await supabase
    .from("lienzos")
    .update({
      grafo: { nodos, enlaces },
      vista,
      sesion,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id);
  return !error;
}
