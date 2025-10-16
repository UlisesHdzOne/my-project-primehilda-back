export const AUTH_MESSAGES = {
  // 1. Unificado y Seguro para Duplicados de REGISTRO
  // Nuevo nombre más genérico
  registroInvalido:
    'La información de registro es inválida o la cuenta ya existe.',
  // Mismo mensaje, usado para fallos en email, teléfono, o cualquier otra cosa que sea "duplicado"

  // 2. Unificado y Seguro para Inicio de Sesión
  credencialesInvalidas: 'Credenciales inválidas',
  // Usado para: Usuario no existe, Contraseña incorrecta, etc.

  // 3. Errores de Formato/Validación (Se mantienen)
  emailInvalido: 'El email es inválido',
  passwordDebil: 'La contraseña es débil',
  passwordRequerida: 'La contraseña es requerida',
  nombreInvalido: 'El nombre es inválido',
  apellidoInvalido: 'El apellido es inválido',
  rolInvalido: 'El rol es inválido',
  isActiveInvalido: 'El estado es inválido',
  telefonoInvalido: 'El teléfono es inválido',
};
