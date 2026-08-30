// TEMPORAL — respaldo en localStorage del navegador para el "modo de
// prueba" (ver AuthProvider.entrarModoPrueba). Solo lo usan data/*.js
// cuando supabaseConfigurado es false. Quitar junto con ese modo cuando
// ya no haga falta probar la app sin un proyecto Supabase real.
export const leerLocal = (k) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};

export const escribirLocal = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
};
