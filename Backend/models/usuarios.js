import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombre_usuario: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  clave: {
    type: String,
    required: true,
  },
  rol_id: {
    type: Number,
    required: true,
  },
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
