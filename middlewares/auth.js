const SECRET_KEY = 'aguacate';
const jwt = require('jsonwebtoken');

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
        req.user = decoded;
        next();
    });
};

module.exports = authenticateToken;
