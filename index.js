import express from "express";
import pool from "./db.js";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: '*' }));

app.use(express.json())/

app.get('/canchas', async (req, res) => {
  try {
    const [resultado] = await pool.execute('SELECT * FROM canchas');
    res.json(resultado);
  } catch {
    console.error('Error al obtener canchas');
    res.status(500).send('Error al obtener canchas');
  }
})

app.get('/turnos_canchas', async (req, res) => {
  try {
    const [resultado] = await pool.execute('SELECT * FROM turnos_canchas');
    res.json(resultado);
  } catch {
    console.error('Error al obtener canchas');
    res.status(500).send('Error al obtener canchas');
  }
})

app.get('/turnos_canchas/canchas', async (req, res) => {
  const { id } = req.query;

  try {
    const query = "SELECT * FROM turnos_canchas WHERE cancha_id = ?"
    const [resultado] = await pool.execute(query, [id]);
    res.json(resultado)
  } catch {
    console.error('Error al filtrar turnos');
    res.status(500).send('Error al filtrar turnos')
  }
})

app.put("/turnos/:turnoId", async (req, res) => {
  const { nombre, dni } = req.body;
  const { turnoId : idTurno } = req.params; // Obtenemos el turno_id de los parámetros de la ruta

  try {
    const [resultado] = await pool.execute(
      `UPDATE turnos_canchas
       SET nombre = ?, dni =  ?, estado = 'pendiente'
       WHERE id = ?`,
      [nombre, dni, idTurno]
    );

    if (resultado.affectedRows > 0) {
      res.json({ mensaje: "Turno reservado correctamente" });
    } else {
      res.status(404).json({ error: "Turno no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    res.status(500).json({ error: "Error al reservar turno" });
  }
});


/* CONFIRMAR TURNO QUE ESTABA EN PENDIENTE */

app.put("/turnos/confirmar/:turnoId", async (req, res) => {
  const { turnoId } = req.params;

  try {
    const [resultado] = await pool.execute(
      `UPDATE turnos_canchas
       SET estado = 'reservado'
       WHERE id = ?`,
      [turnoId]
    );

    if (resultado.affectedRows > 0) {
      res.json({ mensaje: "Turno reservado correctamente" });
    } else {
      res.status(404).json({ error: "Turno no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    res.status(500).json({ error: "Error al reservar turno" });
  }
});


// Suponiendo que la tabla se llama turnos_canchas
app.get("/turnos_canchas/canchas", async (req, res) => {
  const { id } = req.query;

  try {
    const [turnos] = await pool.execute(
      "SELECT * FROM turnos_canchas WHERE cancha_id = ?",
      [id]
    );

    res.json(turnos);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    res.status(500).json({ error: "Error al obtener turnos" });
  }
});


/* LIBERAR TURNO */

app.put("/turnos/liberar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await pool.execute(
      `UPDATE turnos_canchas 
       SET estado = 'disponible', nombre = NULL, dni = NULL , telefono = NULL 
       WHERE id = ?`,
      [id]
    );

    if (resultado.affectedRows > 0) {
      res.json({ mensaje: "Turno liberado correctamente" });
    } else {
      res.status(404).json({ error: "Turno no encontrado" });
    }
  } catch (error) {
    console.error("Error al liberar turno:", error);
    res.status(500).json({ error: "Error al liberar turno" });
  }
});

/* CODIGO PARA CREAR TURNOS */

app.post("/turnos_canchas", async (req, res) => {
  const { hora, cancha_id, estado, precio, fecha } = req.body;

  try {
    const [resultado] = await pool.execute(
      "INSERT INTO turnos_canchas (hora, cancha_id, estado, precio, fecha) VALUES (?, ?, ?, ?, ?)",
      [hora, cancha_id, estado, precio, fecha]
    );

    res.status(201).json({ mensaje: "Turno creado", id: resultado.insertId });
  } catch (error) {
    console.error("Error al crear turno:", error);
    res.status(500).json({ error: "Error al crear turno" });
  }
});

/* BORRAR TURNO */

app.delete("/turnos_canchas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await pool.execute("DELETE FROM turnos_canchas WHERE id = ?", [id]);

    if (resultado.affectedRows > 0) {
      res.json({ mensaje: "Turno eliminado correctamente" });
    } else {
      res.status(404).json({ error: "Turno no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    res.status(500).json({ error: "Error al eliminar turno" });
  }
});

/* { ACTUALIZACION DE TIPO DE PAGO } */

app.put("/turnos/pagar/:id", async (req, res) => {
  const { id } = req.params;
  const { tipoPago, condicion } = req.body;

  console.log("Datos recibidos:", { id, tipoPago });

  if (!id || isNaN(id) || !tipoPago) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE turnos_canchas SET tipo_pago = ?, condicion = ? WHERE id = ?",
      [tipoPago,condicion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error SQL:", err.message);
    res.status(500).json({ error: "Error al actualizar el pago", detalle: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://0.0.0.0:${PORT}`);
});

