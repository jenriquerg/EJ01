const db = require("../config/firebase");

const addRole = async (req, res) => {
    const userPermissions = req.user.permissions ? req.user.permissions.split(', ') : [];
    if (!userPermissions.includes('add_role')) {
        return res.status(403).json({
            statusCode: 403,
            message: "Acceso denegado",
            intDataMessage: [{ message: "No tienes permiso para acceder a esta ruta" }]
        });
    }
    const { name, permissions } = req.body;
    if (!name || !permissions) {
        return res.status(400).json({
            statusCode: 400,
            message: "Bad Request",
            intDataMessage: [{ message: "Todos los campos son obligatorios" }]
        });
    }
    try {
        const roleRef = db.collection('roles').doc(name);
        const docSnapshot = await roleRef.get();
        
        if (docSnapshot.exists) {
            return res.status(400).json({
                statusCode: 400,
                message: "Rol ya existe",
                intDataMessage: [{ message: "El rol ya existe" }]
            });
        }
        
        await roleRef.set({ permissions });
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            intDataMessage: [{ message: "Rol agregado correctamente" }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo agregar el rol" }]
        });
    }
};

const updateRole = async (req, res) => {
    const userPermissions = req.user.permissions ? req.user.permissions.split(', ') : [];
    if (!userPermissions.includes('update_role')) {
        return res.status(403).json({
            statusCode: 403,
            message: "Acceso denegado",
            intDataMessage: [{ message: "No tienes permiso para acceder a esta ruta" }]
        });
    }
    
    const { name, permissions } = req.body;
    if (!name || !permissions) {
        return res.status(400).json({
            statusCode: 400,
            message: "Bad Request",
            intDataMessage: [{ message: "Todos los campos son obligatorios" }]
        });
    }
    
    try {
        const roleRef = db.collection('roles').doc(name);
        const docSnapshot = await roleRef.get();
        
        if (!docSnapshot.exists) {
            return res.status(404).json({
                statusCode: 404,
                message: "Rol no encontrado",
                intDataMessage: [{ message: "El rol no existe" }]
            });
        }
        
        await roleRef.update({ permissions });
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            intDataMessage: [{ message: "Rol actualizado correctamente" }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo actualizar el rol" }]
        });
    }
};

const deleteRole = async (req, res) => {
    const userPermissions = req.user.permissions ? req.user.permissions.split(', ') : [];
    if (!userPermissions.includes('delete_role')) {
        return res.status(403).json({
            statusCode: 403,
            message: "Acceso denegado",
            intDataMessage: [{ message: "No tienes permiso para acceder a esta ruta" }]
        });
    }
    const { role } = req.params;

    if (!role) {
        return res.status(400).json({
            statusCode: 400,
            message: "Bad Request",
            intDataMessage: [{ message: "El nombre del rol es requerido" }]
        });
    }
    try {
        const roleRef = db.collection('roles').doc(role);
        const docSnapshot = await roleRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).json({
                statusCode: 404,
                message: "Rol no encontrado",
                intDataMessage: [{ message: "El rol no existe" }]
            });
        }
        await roleRef.delete();
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            intDataMessage: [{ message: "Rol eliminado correctamente" }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo eliminar el rol" }]
        });
    }
};

module.exports = { addRole, updateRole, deleteRole };