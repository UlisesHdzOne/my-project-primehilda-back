export const AUTH_MESSAGES = {
  // Registro
  emailExistente: 'El email ya está registrado',
  general: 'No se pudo completar el registro. Verifica tus datos.',
  telefonoExistente: 'El teléfono ya está registrado',
  documentoExistente: 'El documento ya está registrado',
  passwordDebil:
    'La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números',
  registroInvalido: 'Error en el registro',

  // Login
  credencialesInvalidas: 'Credenciales inválidas',
  cuentaInactiva: 'La cuenta está inactiva',

  // Validación DTO - ✅ AGREGAR ESTOS
  emailInvalido: 'El email debe ser válido 2',
  emailRequerido: 'El email es requerido 1',
  passwordRequerida: 'La contraseña es requerida',
  passwordNoString: 'La contraseña debe ser texto',

  // ✅ NUEVOS - Los que usa tu DTO
  nombreInvalido: 'El nombre debe ser texto válido',
  nombreRequerido: 'El nombre es requerido',
  apellidoInvalido: 'El apellido debe ser texto válido',
  apellidoRequerido: 'El apellido es requerido',
  telefonoInvalido: 'El teléfono debe contener solo números (10-15 dígitos)',
};
