import { supabase, supabaseConfigurado } from "../lib/supabaseClient.js";
import { ESTILO_TARJETA_POR_DEFECTO } from "../estilos/tema.js";
import { uid } from "../lib/utils.js";
import { leerLocal, escribirLocal } from "../lib/almacenLocal.js";

function filaAIndice(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    numero: fila.numero,
    sesion: fila.sesion,
    fecha: fila.creado_en ? new Date(fila.creado_en).getTime() : Date.now(),
    estilo: fila.estilo,
    paciente: fila.paciente,
    nodos: (fila.grafo?.nodos || []).length,
  };
}

// TEMPORAL — namespace de localStorage para el "modo de prueba" (ver
// AuthProvider.entrarModoPrueba). Solo se usa si supabaseConfigurado es
// false. Quitar junto con ese modo cuando ya no haga falta.
const K_INDICE_PRUEBA = "noddo:prueba:indice";
const K_CONTADOR_PRUEBA = "noddo:prueba:contador";
const K_LIENZO_PRUEBA = (id) => `noddo:prueba:lienzo:${id}`;

// Lista los lienzos del profesional autenticado, en la misma forma que
// tenía el índice guardado en localStorage (id, nombre, numero, sesion,
// fecha, estilo, paciente, nodos) para no tener que tocar Inicio.jsx.
// RLS ya filtra por profesional_id = auth.uid(); no hace falta filtrar acá.
export async function listarLienzos() {
  if (!supabaseConfigurado) return leerLocal(K_INDICE_PRUEBA) || [];

  const { data, error } = await supabase
    .from("lienzos")
    .select("id, nombre, numero, sesion, estilo, paciente, creado_en, grafo")
    .eq("archivado", false)
    .order("creado_en", { ascending: false });
  if (error) {
    console.error("listarLienzos", error);
    return [];
  }
  return data.map(filaAIndice);
}

export async function crearLienzo(datosPaciente) {
  if (!supabaseConfigurado) {
    const idx = leerLocal(K_INDICE_PRUEBA) || [];
    const numero = (leerLocal(K_CONTADOR_PRUEBA) || 0) + 1;
    escribirLocal(K_CONTADOR_PRUEBA, numero);
    const nuevo = {
      id: uid(),
      nombre: datosPaciente.alias || datosPaciente.nombreCompleto,
      numero,
      sesion: 1,
      fecha: Date.now(),
      estilo: ESTILO_TARJETA_POR_DEFECTO,
      paciente: datosPaciente,
      nodos: 0,
    };
    escribirLocal(K_INDICE_PRUEBA, [nuevo, ...idx]);
    escribirLocal(K_LIENZO_PRUEBA(nuevo.id), {
      nodos: [],
      enlaces: [],
      vista: { x: 0, y: 0, k: 1 },
      sesion: 1,
    });
    return nuevo;
  }

  const { data: auth } = await supabase.auth.getUser();
  const profesionalId = auth?.user?.id;
  if (!profesionalId) return null;

  // Numeración correlativa por profesional. No es perfectamente atómico
  // ante dos creaciones simultáneas desde dos pestañas — mismo nivel de
  // garantía que tenía el contador en localStorage, que tampoco lo era.
  const { data: maxRow } = await supabase
    .from("lienzos")
    .select("numero")
    .eq("profesional_id", profesionalId)
    .order("numero", { ascending: false })
    .limit(1)
    .maybeSingle();
  const numero = (maxRow?.numero || 0) + 1;

  const { data, error } = await supabase
    .from("lienzos")
    .insert({
      profesional_id: profesionalId,
      numero,
      nombre: datosPaciente.alias || datosPaciente.nombreCompleto,
      paciente: datosPaciente,
      estilo: ESTILO_TARJETA_POR_DEFECTO,
      grafo: { nodos: [], enlaces: [] },
    })
    .select("id, nombre, numero, sesion, estilo, paciente, creado_en, grafo")
    .single();
  if (error) {
    console.error("crearLienzo", error);
    return null;
  }
  return filaAIndice(data);
}

export async function renombrarLienzo(id, nombre) {
  if (!supabaseConfigurado) {
    const idx = leerLocal(K_INDICE_PRUEBA) || [];
    escribirLocal(K_INDICE_PRUEBA, idx.map((l) => (l.id === id ? { ...l, nombre } : l)));
    return true;
  }
  const { error } = await supabase.from("lienzos").update({ nombre }).eq("id", id);
  return !error;
}

export async function personalizarLienzo(id, estilo) {
  if (!supabaseConfigurado) {
    const idx = leerLocal(K_INDICE_PRUEBA) || [];
    escribirLocal(K_INDICE_PRUEBA, idx.map((l) => (l.id === id ? { ...l, estilo } : l)));
    return true;
  }
  const { error } = await supabase.from("lienzos").update({ estilo }).eq("id", id);
  return !error;
}

export async function actualizarPaciente(id, datosPaciente) {
  if (!supabaseConfigurado) {
    const idx = leerLocal(K_INDICE_PRUEBA) || [];
    escribirLocal(
      K_INDICE_PRUEBA,
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
    return true;
  }
  const { error } = await supabase
    .from("lienzos")
    .update({
      paciente: datosPaciente,
      nombre: datosPaciente.alias || datosPaciente.nombreCompleto,
    })
    .eq("id", id);
  return !error;
}

export async function eliminarLienzo(id) {
  if (!supabaseConfigurado) {
    const idx = leerLocal(K_INDICE_PRUEBA) || [];
    escribirLocal(K_INDICE_PRUEBA, idx.filter((l) => l.id !== id));
    return true;
  }
  const { error } = await supabase.from("lienzos").delete().eq("id", id);
  return !error;
}
