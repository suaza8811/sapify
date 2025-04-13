const mongoose = require('mongoose');

const uri = 'mongodb+srv://csuaza:1234@shopify.hx00r.mongodb.net/orderShopify?retryWrites=true&w=majority';

mongoose.connect(uri, {
  
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch((err) => console.error('❌ Error al conectar:', err));

const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
});

const ordenSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  telefono: String,
  productos: [productoSchema],
  fecha: { type: Date, default: Date.now },
});

// Forzar uso de colección "dataShopify"
const Orden = mongoose.model('Orden', ordenSchema, 'dataShopify');

const nuevaOrden = new Orden({
  nombre: 'Christian Suárez',
  email: 'christian@email.com',
  telefono: '3111234567',
  productos: [
    { nombre: 'Arepas de maíz', precio: 12000 },
    { nombre: 'Botella de agua', precio: 5000 }
  ]
});

nuevaOrden.save()
  .then((doc) => {
    console.log('✅ Orden guardada en colección dataShopify:', doc);
    mongoose.connection.close();
  })
  .catch((err) => console.error('❌ Error al guardar la orden:', err));
