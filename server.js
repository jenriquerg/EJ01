const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const roleRoutes = require('./routes/role.routes');
const permissionRoutes = require('./routes/permissions.routes');

const app = express();
const PORT = 3000;

// Middleware global
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/permissions', permissionRoutes);

// Middleware de manejo de errores
app.use(errorHandler);
// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
