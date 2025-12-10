import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import productsRoutes from './routes/productos.routes.js';
import cartRoutes from './routes/cart.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import sql from './config/db.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/roles', rolesRoutes);

// Ruta de prueba general
app.get('/', (req, res) => {
  res.json({
    message: 'GlamourML API',
    version: '1.0.0',
    status: 'running',
  });
});

// Ruta específica para probar la conexión a la BD
app.get('/test-db', async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as now`;
    res.json({
      message: 'Conexión exitosa a PostgreSQL',
      time: result[0].now,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error al conectar a la BD', error: error.message });
  }
});

// Ruta de debug - Ver estructura de usuarios
app.get('/debug/usuarios-schema', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM usuarios LIMIT 1`;
    if (result.length > 0) {
      const columns = Object.keys(result[0]);
      res.json({
        message: 'Estructura de tabla usuarios',
        columns: columns,
        firstUser: result[0],
      });
    } else {
      res.json({ message: 'No hay usuarios en la BD' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al obtener estructura',
      error: error.message,
    });
  }
});

// Ruta de debug - Ver usuarios por email
app.get('/debug/usuarios/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result =
      await sql`SELECT id_usuario, email, nombres, apellidos, estado FROM usuarios WHERE email = ${email}`;

    if (result.length > 0) {
      res.json({
        message: 'Usuario encontrado',
        usuario: result[0],
      });
    } else {
      res.json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error en búsqueda',
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

// Exportar para Vercel
export default app;
