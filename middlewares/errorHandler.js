// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
    console.error(err);  // Imprimir detalles del error en la consola
    res.status(500).json({
        statusCode: 500,
        message: "Error interno del servidor",
        intDataMessage: [{ message: "Un error interno del servidor ha ocurrido" }]
    });
};

// Middleware para rutas no encontradas
const notFoundHandler = (req, res) => {
    res.status(404).json({
        statusCode: 404,
        message: "No encontrado",
        intDataMessage: [{ message: "Ruta no encontrada" }]
    });
};

module.exports = { errorHandler, notFoundHandler };
