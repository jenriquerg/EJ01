const db = require('../config/firebase');

const getUsers = async (req, res) => {
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
}

module.exports = { getUsers}
