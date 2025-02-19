const express = require('express'); // Para crear el servidor
const jwt = require('jsonwebtoken'); // Para generar el token
const bodyParser = require('body-parser'); // Para parsear el cuerpo de la petición
const cors = require('cors'); // Para permitir peticiones desde cualquier origen

const admin = require("firebase-admin");
const app = express(); // Crear el servidor
const PORT = 3000; // Puerto donde correrá el servidor
const SECRET_KEY = 'aguacate'; // Clave secreta para firmar el token

const bcrypt = require('bcrypt'); // Para hashear la contraseña
let serviceAccount = require("./key/serviceAccountKey.json"); // Credenciales de Firebase

// Inicializar Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Inicializar Firestore
const db = admin.firestore();

// Middleware para permitir peticiones desde cualquier origen
app.use(cors());

// Middleware para parsear el cuerpo de la petición
app.use(bodyParser.json());

// Middleware para verificar el token Bearer
const authenticateToken = (req, res, next) => {
    // Verificar si la cabecera de autorización está presente
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            statusCode: 401,
            message: "No autorizado",
            intDataMessage: [{ message: "Token no proporcionado o inválido" }]
        });
    }
    // Extraer el token de la cabecera
    const token = authHeader.split(' ')[1];
    // Verificar el token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                statusCode: 403,
                message: "Acceso denegado",
                intDataMessage: [{ message: "Token inválido o expirado" }]
            });
        }
        // Guardar los datos del usuario en el objeto req
        req.user = decoded;
        next();
    });
};

// Ruta de registro
app.post('/register', async (req, res) => {
    const { email, username, password, role } = req.body;
    if (!email || !username || !password || !role) {
        return res.status(400).json({
            statusCode: 400,
            message: "Bad Request",
            intDataMessage: [{ message: "Todos los campos son obligatorios" }]
        });
    }
    try {
        const usersRef = db.collection('users');
        const usernameSnapshot = await usersRef.where('username', '==', username).get();
        const emailSnapshot = await usersRef.where('email', '==', email).get();
        if (!usernameSnapshot.empty || !emailSnapshot.empty) {
            return res.status(400).json({
                statusCode: 400,
                message: "Usuario ya existe",
                intDataMessage: [{ message: "El usuario o el correo ya están registrados" }]
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const timestamp = new Date();
        await usersRef.doc(username).set({
            email,
            username,
            password: hashedPassword,
            role,
            date_register: timestamp,
            last_login: ""
        });
        res.status(201).json({
            statusCode: 201,
            message: "Usuario registrado exitosamente",
            intDataMessage: [{ message: "Registro completado" }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo registrar el usuario" }]
        });
    }
});

// Aplicar middleware de autenticación a la ruta
app.get('/users', authenticateToken, async (req, res) => {
    const userPermissions = req.user.permissions ? req.user.permissions.split(', ') : [];
    if (userPermissions.includes('get_users')) {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();
        const users = snapshot.docs.map(doc => doc.data());
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            intDataMessage: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo obtener la lista de usuarios" }]
        });
    }
    }else{
        res.status(403).json({
            statusCode: 403,
            message: "Acceso denegado",
            intDataMessage: [{ message: "No tienes permiso para acceder a esta ruta" }]
        });
    }
});

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            statusCode: 400,
            message: "Bad Request",
            intDataMessage: [{ message: "Usuario o contraseña no proporcionados" }]
        });
    }
    try {
        const userRef = db.collection('users').doc(username);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(401).json({
                statusCode: 401,
                message: "Sin autorización",
                intDataMessage: [{ message: "Usuario no encontrado" }]
            });
        }
        const userData = doc.data();
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(401).json({
                statusCode: 401,
                message: "Sin autorización",
                intDataMessage: [{ message: "Credenciales incorrectas" }]
            });
        }
        await userRef.update({ last_login: new Date() });

        // Obtener los permisos del rol del usuario
        const rolesRef = db.collection('roles').doc(userData.role);
        const rolesDoc = await rolesRef.get();

        if (!rolesDoc.exists) {
            return res.status(500).json({
                statusCode: 500,
                message: "Error interno del servidor",
                intDataMessage: [{ message: "El rol del usuario no existe en la base de datos" }]
            });
        }

        const roleData = rolesDoc.data();

        const token = jwt.sign({ username: userData.username, role: userData.role, permissions: roleData.permissions }, SECRET_KEY, { expiresIn: '1m' });
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            intDataMessage: [{ credentials: token }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error interno del servidor",
            intDataMessage: [{ message: "Ocurrió un error al iniciar sesión" }]
        });
    }
});


// Middleware de error 404 para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        statusCode: 404,
        message: "No encontrado",
        intDataMessage: [{ message: "Ruta no encontrada" }]
    });
});

// Middleware de error 500 para errores internos del servidor
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        statusCode: 500,
        message: "Error interno del servidor",
        intDataMessage: [{ message: "Un error interno del servidor ha ocurrido" }]
    });
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});