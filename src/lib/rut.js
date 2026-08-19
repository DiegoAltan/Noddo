// Normaliza un RUT chileno a su forma canónica: solo dígitos + dígito
// verificador en mayúscula, sin puntos ni guión (ej. "12345678-K" -> "12345678K").
export function normalizarRut(rut) {
  if (!rut) return "";
  return rut
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[.\s]/g, "")
    .replace(/-/g, "");
}

// Valida el dígito verificador de un RUT ya normalizado (módulo 11).
export function validarDigitoVerificador(rutNormalizado) {
  if (!rutNormalizado || rutNormalizado.length < 2) return false;
  const cuerpo = rutNormalizado.slice(0, -1);
  const dv = rutNormalizado.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dv === dvEsperado;
}

// Normaliza y valida en un solo paso. Devuelve el RUT normalizado si es
// válido, o null si no lo es — para usar antes de cualquier intento de
// autenticación (nunca se consulta la base con un RUT sin validar primero).
export function rutValido(rut) {
  const normalizado = normalizarRut(rut);
  return validarDigitoVerificador(normalizado) ? normalizado : null;
}
