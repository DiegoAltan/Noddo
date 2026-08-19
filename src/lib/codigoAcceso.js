// Mismo alfabeto que supabase/migrations/0001_init.sql (generar_codigo_acceso):
// sin 0/O/1/l/I porque el código se lee y se dicta en voz alta.
export const ALFABETO_CODIGO_ACCESO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Limpia lo que el consultante escribe (espacios, minúsculas, guiones de
// separación visual) antes de mandarlo a validar contra el hash.
export function normalizarCodigoAcceso(codigo) {
  if (!codigo) return "";
  return codigo.toString().trim().toUpperCase().replace(/[\s-]/g, "");
}

// Formato solo visual para mostrárselo al profesional (ABCD-EFGH), no se
// usa para comparar ni se guarda así en ninguna parte.
export function formatearCodigoAcceso(codigo) {
  const limpio = normalizarCodigoAcceso(codigo);
  if (limpio.length !== 8) return limpio;
  return `${limpio.slice(0, 4)}-${limpio.slice(4)}`;
}
