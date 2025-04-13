require('dotenv').config();
const express = require('express');
const connectDB = require('./config/mongodb');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middlewares/errorHandler');
const mockSapRoutes = require('./routes/mockSap');
//const sendToSAP = require('./jobs/sendOrdersToSAP');
const testSendSAP = require('./jobs/mockSendToSap');
const cors = require('cors');



const app = express();
app.use(cors());
// Conectar a la base de datos
connectDB();

// Middleware para procesar JSON
app.use(express.json());

// Rutas para el webhook
app.use('/webhook', orderRoutes);

// Middleware global para el manejo de errores
app.use(errorHandler);

//sap test
app.use('/mock', mockSapRoutes);
//app.use(testSendSAP)

//dashboard enpoint
app.use('/api/orders', orderRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
