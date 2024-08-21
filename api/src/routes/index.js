const router = require("express").Router();
const QR_KEYACCESS = process.env.QR_KEY_ACCESS;
const crypto = require("crypto");
// const { v4: uuidv4 } = require("uuid");

const keyRouteAttendence = {};

// Ruta
router.post("/validate-attendence", (req, res) => {
  // Datos del alumno que servira para comprobarlos dentro de la hoja de calculo
  const { name, dni, carrera } = req.body;

  // Se toma la clave de acceso que se encuentra por query para comprobar si es valida
  const keyURL_access = req.query["key-access"];

  // Se corrobora que la clave exista y sea valida
  if (
    keyRouteAttendence[keyURL_access] &&
    keyRouteAttendence[keyURL_access].valid
  ) {
    // Una vez validada la clave se la elimina para que no puedan ingresar con el mismo link
    delete keyRouteAttendence[keyURL_access];
    /* Acá se debería usar la api de google spreadsheet para comprobar si el alumno 
    se encuentra en la materia y si se encuentra poner el valor de la asistencia en el respectivo día
    */
    res.send("asistencia valida");
  } else {
    // Si la clave no es válida se le envía un error 400
    res.status(400).json({ message: "Bad Request" });
  }
});

// Ruta que genera el QR y la clave de acceso a la ruta de asistencia
router.get("/qr-generator", async (req, res) => {
  // Se utiliza crypto para generar una clave de 32 dígitos y se la pasa a hexadecimal
  const keyUrlAttendence = crypto.randomBytes(16).toString("hex");
  /* Se crea dentro de keyRouteAttendence una propiedad que lleva como nombre la clave de 32 dígitos 
  y se le asigna como valor otro objeto con una propiedad booleana con el valor true*/
  keyRouteAttendence[keyUrlAttendence] = { valid: true };

  // Para crear el QR se utiliza la api de QR code generator
  try {
    const qr_response = await fetch(
      `https://api.qr-code-generator.com/v1/create?access-token=${QR_KEYACCESS}`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          frame_name: "no-frame",
          //qr_code_text: `localhost:3000/validate-attendence/?key-access=${keyUrlAttendence}`,
          qr_code_text: `https://www.youtube.com/watch?v=PyoRdu-i0AQ`,
          image_format: "SVG",
          qr_code_logo: "scan-me-square",
        }),
      }
    );
    // https://www.youtube.com/watch?v=PyoRdu-i0AQ
    // Si la api no funciona se sale por un error con el estado de la respuesta
    if (!qr_response.ok)
      throw new Error("Error en la solicitud:" + qr_response.status);

    // Si la api funciono se retorna el QR como svg
    const qr_text = await qr_response.text();

    res.setHeader("Content-Type", "image/svg+xml");

    res.send(qr_text);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
