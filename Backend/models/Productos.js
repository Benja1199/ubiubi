import mongoose from 'mongoose';

// Define el esquema
const productoSchema = new mongoose.Schema({
  nombre_producto: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String, required: true },
  categoria_id: { type: mongoose.Schema.Types.Mixed, required: true }, // Mixed para flexibilidad
});

// Especifica explícitamente el nombre de la colección: 'Productos'
const Productos = mongoose.model('Productos', productoSchema, 'Productos');

export default Productos;
