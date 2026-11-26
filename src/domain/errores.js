// Errores de dominio. `campos` asocia cada campo con su mensaje para mostrarlo en pantalla.

export class ErrorValidacion extends Error {
  constructor(campos) {
    super('Revise los datos de la reserva.');
    this.name = 'ErrorValidacion';
    this.campos = campos;
  }
}

export class ErrorHorarioNoDisponible extends Error {
  constructor(mensaje = 'Ese horario acaba de ser ocupado. Elija otro horario; sus demás datos se conservan.') {
    super(mensaje);
    this.name = 'ErrorHorarioNoDisponible';
    this.campos = { hora: mensaje };
  }
}

export class ErrorConflictoEstudiante extends Error {
  constructor(codigo) {
    const mensaje = `Ya tiene la reserva ${codigo} en esa fecha y hora. Elija otro horario.`;
    super(mensaje);
    this.name = 'ErrorConflictoEstudiante';
    this.campos = { hora: mensaje };
  }
}

export class ErrorEstadoReserva extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorEstadoReserva';
  }
}

export class ErrorPersistencia extends Error {
  constructor(mensaje = 'No se pudo guardar. Sus datos siguen en pantalla: vuelva a intentarlo.') {
    super(mensaje);
    this.name = 'ErrorPersistencia';
  }
}
