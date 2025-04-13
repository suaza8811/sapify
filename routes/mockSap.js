const express = require('express');
const router = express.Router();

router.post('/sap/orders', (req, res) => {
  console.log('📦 Orden recibida en el endpoint simulado de SAP:');
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).json({ message: 'Orden recibida correctamente por SAP (mock).' });
});

module.exports = router;
