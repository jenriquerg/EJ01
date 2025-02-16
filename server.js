const express = require('express'); // Importa el paquete express para manejar el servidor
const jwt = require('jsonwebtoken'); // Importa el paquete jsonwebtoken para manejar tokens
const bodyParser = require('body-parser'); // Importa el paquete body-parser para manejar el cuerpo de las peticiones
const cors = require('cors');  // Importa el paquete cors 

const app = express();
const PORT = 3000; // Puerto en el que escuchará el servidor
const SECRET_KEY = 'aguacate'; // Clave secreta para firmar los tokens

app.use(cors());  // Deja entrar a todos 
app.use(bodyParser.json()); // Middleware para parsear el cuerpo de las peticiones a JSON

// Usuarios hardcodeados
const users = [
    { username: 'EnriqueRG', password: 'amarillo' },
    { username: 'TaniaVM', password: 'pollito' }
];

// Ruta de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validación de parámetros
    if (!username || !password) {
        return res.status(400).json({
            statusCode: 400,
            message: "Bad Request",
            intDataMessage: [{ message: "Usuario o contraseña no proporcionados" }]
        });
    }

    // Verificación de credenciales
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({
            statusCode: 401,
            message: "Sin autorización",
            intDataMessage: [{ message: "Credenciales incorrectas" }]
        });
    }

    // Generación del token que truena en un minuto
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1m' });
    // Respuesta exitosa
    return res.status(200).json({
        statusCode: 200,
        message: "OK",
        intDataMessage: [
            {
                credentials: token
            }
        ]
    });
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
    console.error(err);  // Log de errores
    res.status(500).json({
        statusCode: 500,
        message: "Error interno del servidor",
        intDataMessage: [{ message: "Un error interno del servidor ha ocurrido" }]
    });
});

app.listen(PORT, () => {
    console.log(`Salimos en http://localhost:${PORT}`);
});
