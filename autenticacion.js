const jwt = require("jsonwebtoken");

const { loginUsuario } = require("./consultas");

const SECRET_KEY = "jBPZv3MdtXn1vEAOtJYIa2dXGPVWvJeb";

const login = async (email, password) => {
  // Login de usuario
  if (email == "admin@skatepark.com" && password == "admin") {
    let token = jwt.sign({ email, isAdmin: true }, SECRET_KEY, {
      expiresIn: "1h",
    });
    return { admin: true, token };
  }

  try {
    const usuario = await loginUsuario(email, password);
    let token = jwt.sign({ ...usuario }, SECRET_KEY, { expiresIn: "1h" });
    return { admin: false, token };
  } catch (err) {
    console.log(err);
    throw new Error("Error al iniciar sesión, verifica tus credenciales.");
  }
};

const verifyToken = (token) => {
  try {
    const data = jwt.verify(token, SECRET_KEY);
    return data;
  } catch (error) {
    throw new Error("Token inválido");
  }
};

module.exports = { login, verifyToken };
