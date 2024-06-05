//Importar paquetes
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.listen(3000 , console.log("Servidor arriba."))

//Ruta json.
app.use(express.json());

//Ruta por defecto para mostrar el HTML.
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

//Insertar usuario.
app.post("/roommate", async (req, res) => {
    try {
      const response = await fetch('https://randomuser.me/api');
      const { results } = await response.json();
      const { name } = results[0];
      const apellido = name.last;
      const roommatesJSON = JSON.parse(fs.readFileSync("roommate.json", "utf8"));
      
      // 'roommates' en el objeto JSON
      if (!roommatesJSON.roommates) {
        roommatesJSON.roommates = [];
      }
  
      const nuevoRoommate = { 
        id: uuidv4().slice(0, 6), 
        nombre: `${name.first} ${apellido}`,
        debe: Math.floor(Math.random() * 50 + 1) * 10000,
        recibe: Math.floor(Math.random() * 50 + 1) * 10000
      };
      roommatesJSON.roommates.push(nuevoRoommate);
      fs.writeFileSync("roommate.json", JSON.stringify(roommatesJSON, null, 2));
      res.send("Roommate agregado con éxito");
    } catch (error) {
      console.error("Error al agregar roommate:", error);
      res.status(500).send("Error al agregar roommate");
    }
  });

//Obtener todas las roommates.
app.get("/roommates", (req, res) => {
    try {        
        const data = fs.readFileSync('roommate.json', 'utf8');
        const roommates = JSON.parse(data);
        res.send(roommates);
    } catch (error) {
        console.error("No se logra obtener roommates.")
    }

});

//Obtener todas las gastos.
app.get("/gastos", (req, res) => {
    try {        
        const data = fs.readFileSync('gastos.json', 'utf8');
        const gastos = JSON.parse(data);
        res.send(gastos);
    } catch (error) {
        console.error("No se pueden obtener los gastos.")
    }

});

// Insertar nuevo gasto.
app.post("/gasto", (req, res) => {
    const { roommate, descripcion, monto } = req.body;
    
    // Registra los datos recibidos desde el formulario
    console.log("Datos recibidos del formulario:");
    console.log("Nombre del roommate:", roommate);
    console.log("Descripción:", descripcion);
    console.log("Monto:", monto);

    const gasto = { id: uuidv4().slice(30), roommate, descripcion, monto};
    const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
    const gastos = gastosJSON.gastos;
    gastos.push(gasto);

    // Registra los datos antes de guardarlos.
    console.log("Datos a guardar en gastos.json:");
    console.log("Nuevo gasto:", gasto);

    fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 2));
    res.send("Gasto agregado con éxito");
});

// Ruta para eliminar un gasto.
app.delete("/gasto", (req, res) => {
    const { id } = req.query;
    const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
    gastosJSON.gastos = gastosJSON.gastos.filter((g) => g.id !== id);
    fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 2));
    res.send("Gasto eliminado con éxito");
});
