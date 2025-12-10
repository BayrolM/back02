import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../config/db.js';

export const register = async (req, res) => {
  try {
    const {
      id_rol,
      tipo_documento,
      documento,
      nombres,
      apellidos,
      email,
      telefono,
      direccion,
      ciudad,
      password,
    } = req.body;

    // Verificar si el correo ya existe
    const emailExists =
      await sql`SELECT * FROM usuarios WHERE email = ${email}`;

    if (emailExists.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
            INSERT INTO usuarios (
                id_rol, tipo_documento, documento, nombres, apellidos,
                email, telefono, direccion, ciudad, password_hash, estado
            )
            VALUES (
                ${id_rol}, ${tipo_documento}, ${documento}, ${nombres}, ${apellidos},
                ${email}, ${telefono}, ${direccion}, ${ciudad}, ${hashedPassword}, true
            )
        `;

    return res.json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 === Login Request ===');
    console.log('📧 Email:', email);
    console.log('🔑 JWT_SECRET configurado:', !!process.env.JWT_SECRET);

    // Verificar que JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
      console.error('❌ ERROR: JWT_SECRET no está configurado en .env');
      return res
        .status(500)
        .json({ message: 'Error de configuración del servidor' });
    }

    console.log('🔍 Buscando usuario en la BD...');
    const result = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
    console.log(
      '📊 Resultado de búsqueda:',
      result.length,
      'usuario(s) encontrado(s)'
    );

    if (result.length === 0) {
      console.log('❌ Usuario no encontrado con email:', email);
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    const user = result[0];
    console.log(
      '✅ Usuario encontrado:',
      user.email,
      '- id_usuario:',
      user.id_usuario
    );
    console.log('🔐 Campos disponibles:', Object.keys(user));

    // Verificar que el campo de contraseña existe
    if (!user.password_hash) {
      console.error(
        "❌ ERROR: Campo 'password_hash' no encontrado en usuario. Campos disponibles:",
        Object.keys(user)
      );
      return res
        .status(500)
        .json({ message: 'Error de configuración de base de datos' });
    }

    console.log('🔑 Verificando contraseña...');
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('✅ Contraseña válida:', validPassword);

    if (!validPassword) {
      console.log('❌ Contraseña incorrecta para usuario:', email);
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    console.log('🎟️ Generando JWT...');
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        email: user.email,
        rol: user.id_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login exitoso para usuario:', email);
    return res.json({ token });
  } catch (error) {
    console.error('💥 ERROR en login:', error);
    console.error('📋 Stack trace:', error.stack);
    return res.status(500).json({
      message: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
