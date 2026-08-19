export const hoyISO = () => new Date().toISOString().slice(0, 10);
export const fechaISOde = (ms) => (ms ? new Date(ms).toISOString().slice(0, 10) : hoyISO());

export function calcularEdad(fechaNacISO) {
  if (!fechaNacISO) return "";
  const nacimiento = new Date(fechaNacISO + "T00:00:00");
  if (Number.isNaN(nacimiento.getTime())) return "";
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad >= 0 ? edad : "";
}
