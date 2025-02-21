const db = require("../config/firebase");
const bcrypt = require("bcrypt");
const SECRET_KEY = 'aguacate';
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { email, username, password, role } = req.body;
  if (!email || !username || !password || !role) {
    return res.status(400).json({
      statusCode: 400,
      message: "Bad Request",
      intDataMessage: [{ message: "Todos los campos son obligatorios" }],
    });
  }
  try {
    const usersRef = db.collection("users");
    const usernameSnapshot = await usersRef
      .where("username", "==", username)
      .get();
    const emailSnapshot = await usersRef.where("email", "==", email).get();
    if (!usernameSnapshot.empty || !emailSnapshot.empty) {
      return res.status(400).json({
        statusCode: 400,
        message: "Usuario ya existe",
        intDataMessage: [
          { message: "El usuario o el correo ya están registrados" },
        ],
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
      last_login: "",
    });
    res.status(201).json({
      statusCode: 201,
      message: "Usuario registrado exitosamente",
      intDataMessage: [{ message: "Registro completado" }],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Error en el servidor",
      intDataMessage: [{ message: "No se pudo registrar el usuario" }],
    });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      statusCode: 400,
      message: "Bad Request",
      intDataMessage: [{ message: "Usuario o contraseña no proporcionados" }],
    });
  }
  try {
    const userRef = db.collection("users").doc(username);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(401).json({
        statusCode: 401,
        message: "Sin autorización",
        intDataMessage: [{ message: "Usuario no encontrado" }],
      });
    }
    const userData = doc.data();
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({
        statusCode: 401,
        message: "Sin autorización",
        intDataMessage: [{ message: "Credenciales incorrectas" }],
      });
    }
    await userRef.update({ last_login: new Date() });

    const rolesRef = db.collection("roles").doc(userData.role);
    const rolesDoc = await rolesRef.get();

    if (!rolesDoc.exists) {
      return res.status(500).json({
        statusCode: 500,
        message: "Error interno del servidor",
        intDataMessage: [
          { message: "El rol del usuario no existe en la base de datos" },
        ],
      });
    }

    const roleData = rolesDoc.data();

    const token = jwt.sign(
      {
        username: userData.username,
        role: userData.role,
        permissions: roleData.permissions,
      },
      SECRET_KEY,
      { expiresIn: "8m" }
    );
    res.status(200).json({
      statusCode: 200,
      message: "OK",
      intDataMessage: [{ credentials: token }],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Error interno del servidor",
      intDataMessage: [{ message: "Ocurrió un error al iniciar sesión" }],
    });
  }
};

module.exports = { register, login };
