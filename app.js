const express = require("express");
const exphbs = require("express-handlebars");
const fileUpload = require("express-fileupload");

/*
    ./autenticacion.js
    Login de administrador
    email: admin@skatepark.com
    password: admin
*/

const {
  registroUsuario,
  listadoSkaters,
  actualizarUsuario,
  eliminarUsuario,
  actualizarEstado,
} = require("./consultas");
const { login, verifyToken } = require("./autenticacion");

const app = express();

app.listen(3000, () => {
  console.log("El servidor está inicializado en el puerto 3000");
});

const hbs = exphbs.create({
  extname: ".html",
  layoutsDir: __dirname + "/views",
  partialsDir: __dirname + "/views/componentes/",
});

app.engine(".html", hbs.engine);
app.set("view engine", ".html");

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));

app.get("/", async (req, res) => {
  try {
    const skaters = await listadoSkaters();
    res.render("Index", {
      layout: "Index",
      skaters,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/registro", async (req, res) => {
  res.render("Registro", {
    layout: "Registro",
  });
});

app.post("/registro", async (req, res) => {
  const {
    email,
    nombre,
    password,
    repetir_password,
    anos_experiencia,
    especialidad,
  } = req.body;

  if (password != repetir_password) {
    return res.status(400).send("Las password no son iguales.");
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("Debes subir un archivo.");
  }

  let foto = req.files.foto;
  let urlFoto = "/images/" + foto.name;
  let uploadPath = __dirname + "/assets" + urlFoto;

  foto.mv(uploadPath, async function (err) {
    if (err) return res.status(500).send(err);

    try {
      await registroUsuario(
        email,
        nombre,
        password,
        anos_experiencia,
        especialidad,
        urlFoto
      );
      res.redirect("/");
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

app.get("/login", async (req, res) => {
  res.render("Login", {
    layout: "Login",
  });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { admin, token } = await login(email, password);
    if (admin) {
      res.redirect("/admin?token=" + token);
    } else {
      res.redirect("/datos?token=" + token);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/datos", async (req, res) => {
  try {
    const token = req.query.token;
    const datosUsuario = verifyToken(token);
    res.render("Datos", {
      layout: "Datos",
      datosUsuario,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/datos", async (req, res) => {
  try {
    const {
      nombre,
      password,
      repetir_password,
      anos_experiencia,
      especialidad,
      token,
    } = req.body;

    if (password != repetir_password) {
      return res.status(400).send("Las password no son iguales.");
    }
    const { email } = verifyToken(token);
    await actualizarUsuario(
      email,
      nombre,
      password,
      anos_experiencia,
      especialidad
    );
    const { _, token: nuevoToken } = await login(email, password);
    res.redirect("/datos?token=" + nuevoToken);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/eliminar", async (req, res) => {
  try {
    const { token } = req.body;
    const { email } = verifyToken(token);
    await eliminarUsuario(email);
    res.redirect("/");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin", async (req, res) => {
  try {
    const token = req.query.token;
    const data = verifyToken(token);
    if (!data.isAdmin) {
      throw new Error("No tienes permisos para acceder a esta página");
    }
    const skaters = await listadoSkaters();
    res.render("Admin", {
      layout: "Admin",
      skaters,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin", async (req, res) => {
  try {
    const { id, estado, token } = req.body;
    const data = verifyToken(token);
    if (!data.isAdmin) {
      throw new Error("No tienes permisos para acceder a esta página");
    }
    await actualizarEstado(id, estado == "on" ? true : false);
    res.redirect("/admin?token=" + token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
