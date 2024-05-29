const { Pool } = require("pg");

const pool = new Pool({
  user: "emily",
  host: "localhost",
  database: "skatepark",
  password: "12345678",
  port: 5432,
});

const registroUsuario = async (
  email,
  nombre,
  password,
  anos_experiencia,
  especialidad,
  foto
) => {
  try {
    const query = {
      text: "INSERT INTO skaters(email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES($1, $2, $3, $4, $5, $6, false) RETURNING *",
      values: [email, nombre, password, anos_experiencia, especialidad, foto],
    };
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw new Error("Error al insertar registro");
  }
};

const actualizarUsuario = async (
  email,
  nombre,
  password,
  anos_experiencia,
  especialidad
) => {
  try {
    const query = {
      text: "UPDATE skaters SET nombre=$2, password=$3, anos_experiencia=$4, especialidad=$5 WHERE email=$1 RETURNING *",
      values: [email, nombre, password, anos_experiencia, especialidad],
    };
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw new Error("Error al actualizar usuario");
  }
};

const loginUsuario = async (email, password) => {
  const query = {
    text: "SELECT * FROM skaters WHERE email = $1 AND password = $2",
    values: [email, password],
  };
  const { rows } = await pool.query(query);
  if (rows.length === 0) throw new Error("Email o contraseña incorrectos");
  return rows[0];
};

const listadoSkaters = async () => {
  try {
    const { rows } = await pool.query({
      text: "SELECT * FROM skaters ORDER BY id",
    });
    return rows;
  } catch (err) {
    console.log(err);
    throw new Error("Error al consultar los usuarios");
  }
};

const eliminarUsuario = async (email) => {
  try {
    const query = {
      text: "DELETE FROM skaters WHERE email = $1 RETURNING *",
      values: [email],
    };
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw new Error("Error al borrar el usuario");
  }
};

const actualizarEstado = async (id, estado) => {
  try {
    const query = {
      text: "UPDATE skaters SET estado=$2 WHERE id=$1 RETURNING *",
      values: [id, estado],
    };
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw new Error("Error al actualizar estado");
  }
};

module.exports = {
  registroUsuario,
  listadoSkaters,
  loginUsuario,
  actualizarUsuario,
  eliminarUsuario,
  actualizarEstado,
};
