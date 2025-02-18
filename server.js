const express = require('express'); // Para crear el servidor
const jwt = require('jsonwebtoken'); // Para generar el token
const bodyParser = require('body-parser'); // Para parsear el cuerpo de la petición
const cors = require('cors'); // Para permitir peticiones desde cualquier origen
const bcrypt = require('bcrypt'); // Para hashear la contraseña
const admin = require("firebase-admin");

const app = express(); // Crear el servidor
const PORT = 3000; // Puerto donde correrá el servidor
const SECRET_KEY = 'aguacate'; // Clave secreta para firmar el token

var serviceAccount = require("./key/serviceAccountKey.json"); // Credenciales de Firebase

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

// Ruta de registro
app.post('/register', async (req, res) => {
    //Extraer los datos del cuerpo de la petición sin fechas
    const { email, username, password, role } = req.body;
    // Verificar que los campos no estén vacíos
    if (!email || !username || !password || !role) {
        return res.status(400).json({
            statusCode: 400,
            message: "Bad Request",
            intDataMessage: [{ message: "Todos los campos son obligatorios" }]
        });
    }
    // Verificar que el rol sea 'admin' o 'common'
    try {
        const userRef = db.collection('users').doc(username);
        const doc = await userRef.get();
        // Verificar si el usuario ya existe
        if (doc.exists) {
            return res.status(400).json({
                statusCode: 400,
                message: "Usuario ya existe",
                intDataMessage: [{ message: "El usuario ya está registrado" }]
            });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        const timestamp = new Date();

        // Guardar el usuario en Firestore
        await userRef.set({
            email,
            username,
            password: hashedPassword,
            role,
            date_register: timestamp,
            last_login: ""
        });
        // Enviar una respuesta exitosa
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

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Verificar que los campos no estén vacíos
    if (!username || !password) {
        return res.status(400).json({
            statusCode: 400,
            message: "Bad Request",
            intDataMessage: [{ message: "Usuario o contraseña no proporcionados" }]
        });
    }
    // Verificar que el usuario exista
    try {
        const userRef = db.collection('users').doc(username);
        const doc = await userRef.get();
        // Verificar si el usuario no existe
        if (!doc.exists) {
            return res.status(401).json({
                statusCode: 401,
                message: "Sin autorización",
                intDataMessage: [{ message: "Usuario no encontrado" }]
            });
        }
        // Extraer los datos del usuario
        const userData = doc.data();
        //Verificar la contraseña hasheada
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(401).json({
                statusCode: 401,
                message: "Sin autorización",
                intDataMessage: [{ message: "Credenciales incorrectas" }]
            });
        }
        // Actualizar la fecha de último inicio de sesión
        await userRef.update({ last_login: new Date() });

        //Generar token con la información del usuario
        const token = jwt.sign({ username: userData.username, role: userData.role }, SECRET_KEY, { expiresIn: '1m' });

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