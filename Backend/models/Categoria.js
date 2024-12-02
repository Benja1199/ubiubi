import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema({
  nombre_categoria: { type: String, required: true },
  categoria_id: { type: Number },
  descripcion: { type: String },
});

// Especificar explícitamente el nombre exacto de la colección como 'Categoria'
const Categoria = mongoose.model('Categoria', categoriaSchema, 'Categoria');

export default Categoria;
