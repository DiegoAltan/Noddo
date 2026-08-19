import { hoyISO, fechaISOde } from "./fechas.js";

export const datosPacienteVacios = () => ({
  nombreCompleto: "",
  alias: "",
  fechaNacimiento: "",
  edad: "",
  correo: "",
  fechaInicio: hoyISO(),
});

export function datosPacienteDe(l) {
  if (l?.paciente) {
    return {
      nombreCompleto: l.paciente.nombreCompleto || l.nombre || "",
      alias: l.paciente.alias || "",
      fechaNacimiento: l.paciente.fechaNacimiento || "",
      edad: l.paciente.edad || "",
      correo: l.paciente.correo || "",
      fechaInicio: l.paciente.fechaInicio || fechaISOde(l.fecha),
    };
  }
  return {
    nombreCompleto: l?.nombre || "",
    alias: "",
    fechaNacimiento: "",
    edad: "",
    correo: "",
    fechaInicio: fechaISOde(l?.fecha),
  };
}
