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

const updateUser = async (req, res) => {
    const userPermissions = req.user.permissions ? req.user.permissions.split(', ') : [];
    if (userPermissions.includes('update_user')) {
    try {
        const { username } = req.params;
        const { email, role } = req.body;
        const userRef = db.collection('users').doc(username);
        await userRef.update({ email, role });
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            intDataMessage: [{ message: "Usuario actualizado correctamente" }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo actualizar el usuario" }]
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

const deleteUser = async (req, res) => {
    const userPermissions = req.user.permissions ? req.user.permissions.split(', ') : [];
    if (userPermissions.includes('delete_user')) {
    try {
        const { username } = req.params;
        const userRef = db.collection('users').doc(username);
        await userRef.delete();
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            intDataMessage: [{ message: "Usuario eliminado correctamente" }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo eliminar el usuario" }]
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

module.exports = { getUsers, updateUser, deleteUser};
