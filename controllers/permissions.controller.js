const db = require("../config/firebase");

const addPermission = async (req, res) => {
    const userPermissions = req.user.permissions ? req.user.permissions.split(', ') : [];
    if (!userPermissions.includes('add_permissions')) {
        return res.status(403).json({
            statusCode: 403,
            message: "Acceso denegado",
            intDataMessage: [{ message: "No tienes permiso para acceder a esta ruta" }]
        });
    }

    try {
        const { role } = req.params;
        const { permission } = req.body;

        if (!role || !permission) {
            return res.status(400).json({
                statusCode: 400,
                message: "Bad Request",
                intDataMessage: [{ message: "El rol y el permiso son requeridos" }]
            });
        }

        const roleRef = db.collection("roles").doc(role);
        const doc = await roleRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                statusCode: 404,
                message: "Not Found",
                intDataMessage: [{ message: "El rol especificado no existe" }]
            });
        }

        let { permissions } = doc.data();
        if (!permissions) permissions = "";
        
        // Agregar el nuevo permiso si no existe
        if (!permissions.includes(permission)) {
            permissions += (permissions ? "," : "") + permission;
            await roleRef.update({ permissions });
        }

        res.status(200).json({
            statusCode: 200,
            message: "Permiso agregado correctamente",
            intDataMessage: [{ permissions }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo agregar el permiso" }]
        });
    }
};

const deletePermission = async (req, res) => {
    const userPermissions = req.user.permissions ? req.user.permissions.split(', ') : [];
    if (!userPermissions.includes('delete_permissions')) {
        return res.status(403).json({
            statusCode: 403,
            message: "Acceso denegado",
            intDataMessage: [{ message: "No tienes permiso para acceder a esta ruta" }]
        });
    }
    try {
        const { role } = req.params;
        const { permission } = req.body;
        if (!role || !permission) {
            return res.status(400).json({
                statusCode: 400,
                message: "Bad Request",
                intDataMessage: [{ message: "El rol y el permiso son requeridos" }]
            });
        }
        const roleRef = db.collection("roles").doc(role);
        const doc = await roleRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                statusCode: 404,
                message: "Not Found",
                intDataMessage: [{ message: "El rol especificado no existe" }]
            });
        }

        let { permissions } = doc.data();
        if (!permissions || !permissions.includes(permission)) {
            return res.status(404).json({
                statusCode: 404,
                message: "Not Found",
                intDataMessage: [{ message: "El permiso especificado no existe en el rol" }]
            });
        }

        // Eliminar el permiso de la cadena
        permissions = permissions.split(",").filter(p => p !== permission).join(",");
        await roleRef.update({ permissions });

        res.status(200).json({
            statusCode: 200,
            message: "Permiso eliminado correctamente",
            intDataMessage: [{ permissions }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: "Error en el servidor",
            intDataMessage: [{ message: "No se pudo eliminar el permiso" }]
        });
    }
};


module.exports = { addPermission, deletePermission };