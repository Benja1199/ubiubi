// Importaciones necesarias
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';


// Definir esquemas y modelos con las colecciones ya existentes
const productoSchema = new mongoose.Schema({
  nombre_producto: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String, required: true },
  categoria_id: { type: mongoose.Schema.Types.Mixed, required: true },
});

const opinionSchema = new mongoose.Schema({
  opinion_id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  producto_id: { type: mongoose.Schema.Types.Mixed, required: true },
  calificacion: { type: Number, required: true },
  comentario: { type: String, required: true },
  fecha_opinion: { type: Date, required: true, default: Date.now },
});

const ubicacionSchema = new mongoose.Schema({
  tienda_id: { type: Number, required: true },
  latitud: { type: Number, required: true },
  longitud: { type: Number, required: true },
  direccion: { type: String, required: true },
});

const categoriaSchema = new mongoose.Schema({
  categoria_id: { type: Number, required: true },
  nombre_categoria: { type: String, required: true },
  descripcion: { type: String, required: true },
});

const usuarioSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  nombre_usuario: { type: String, required: true },
  clave: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  rol_id: { type: Number, required: true },
});

const tiendaSchema = new mongoose.Schema({
  tienda_id: { type: Number, required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  propietario: { type: String, required: true },
  user_id: { type: Number, required: true },
  plan_id: { type: Number, required: true },
});

const PlanesSchema = new mongoose.Schema({
  periodo: {type: String, required:true},
  costo: {type: Number, required: true},
  plan_id: { type: Number, required: true },
});

const Producto = mongoose.model('Producto', productoSchema, 'Productos'); // Conecta a la colección existente
const Ubicacion = mongoose.model('Ubicacion', ubicacionSchema, 'ubicacion'); // Conecta a la colección "ubicacion"
const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios'); // Conecta a la colección "usuarios"
const Tienda = mongoose.model('Tienda', tiendaSchema, 'Tiendas'); // Conecta a la colección "Tiendas"
const Opinion = mongoose.model('Opinion', opinionSchema, 'Opinion');
const Categoria = mongoose.model('Categoria', categoriaSchema, 'Categoria');
const Planes = mongoose.model('Planes', PlanesSchema, 'Planes');

// Inicialización de Express
const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MongoDB
mongoose
  .connect('mongodb://localhost:27017/Ubishop', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// ---- ENDPOINTS ----

// Leer productos
app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find().lean();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

app.get('/Planes', async (req, res) => {
  try {
    const Planes = await Planes.find().lean();
    res.json(Planes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los Planes' });
  }
});

// Obtener todas las opiniones
app.get('/opiniones', async (req, res) => {
  try {
    const opiniones = await Opinion.find().lean();
    res.json(opiniones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las opiniones' });
  }
});

// Obtener Categorias
app.get('/categorias', async (req, res) => {
  try {
    const categorias = await Categoria.find().lean();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
});

// Leer ubicaciones
app.get('/ubicacion', async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.find().lean();
    res.json(ubicaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ubicaciones' });
  }
});

// Leer usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find().lean();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Leer tiendas
app.get('/tiendas', async (req, res) => {
  try {
    const tiendas = await Tienda.find().lean();
    res.json(tiendas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tiendas' });
  }
});

// Leer una tienda específica por tienda_id
app.get('/tienda/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tienda = await Tienda.findOne({ tienda_id: id }).lean();
    if (!tienda) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    res.json(tienda);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tienda' });
  }
});

// Endpoint de login
app.post('/login', async (req, res) => {
  const { email, clave } = req.body;

  try {
    const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() }).lean();
    if (!usuario || usuario.clave.trim() !== clave.trim()) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const rol = usuario.rol_id === 2 ? 'Tienda' : usuario.rol_id === 1 ? 'Cliente' : 'Desconocido';
    
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      rol,
      id: usuario.user_id,
      nombre_usuario: usuario.nombre_usuario,
      email: usuario.email,
      telefono: usuario.telefono, // Asegúrate de incluir este campo
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});


app.post('/register', async (req, res) => {
  const { nombre_usuario, email, clave, rol_id, telefono } = req.body; // Asegúrate de incluir `telefono`

  if (!nombre_usuario || !email || !clave || !rol_id || !telefono) { // Validar también `telefono`
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const usuarioExistente = await Usuario.findOne({ email: email.trim().toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const nuevoUsuario = new Usuario({
      user_id: Date.now(),
      nombre_usuario: nombre_usuario.trim(),
      clave: clave.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(), // Guardar el teléfono correctamente
      rol_id,
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});


// Endpoint para insertar en "Tiendas"
app.post('/tiendas', async (req, res) => {
  const { tienda_id, nombre, descripcion, propietario, user_id } = req.body;

  if (!tienda_id || !nombre || !descripcion || !propietario || !user_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const nuevaTienda = new Tienda({
      tienda_id,
      nombre,
      descripcion,
      propietario,
      user_id,
    });

    await nuevaTienda.save();
    res.status(201).json({ mensaje: 'Tienda registrada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la tienda' });
  }
});

// Endpoint para editar un producto
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;  // Obtenemos el id del producto
  const { nombre_producto, precio, descripcion, categoria_id } = req.body;

  // Validación de los campos requeridos
  if (!nombre_producto || !precio || !descripcion || !categoria_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Buscar el producto por ID y actualizarlo con los nuevos datos
    const productoActualizado = await Producto.findByIdAndUpdate(
      id, 
      { nombre_producto, precio, descripcion, categoria_id },
      { new: true }  // Esto devuelve el producto actualizado, no el original
    );

    if (!productoActualizado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      mensaje: 'Producto actualizado exitosamente',
      producto: productoActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Endpoint para insertar en "Productos"
app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find().lean();
    console.log('Productos enviados:', productos); // Verifica aquí
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.post('/productos', async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save(); // Guarda el producto en la base de datos
    res.status(201).send('Producto creado exitosamente');
  } catch (error) {
    console.error('Error al guardar el producto en MongoDB:', error);
    res.status(500).send('Error al guardar el producto');
  }
});

// Endpoint para insertar en "Ubicacion"
app.post('/ubicacion', async (req, res) => {
  const { tienda_id, latitud, longitud, direccion } = req.body;

  if (!tienda_id || !latitud || !longitud || !direccion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const nuevaUbicacion = new Ubicacion({
      tienda_id,
      latitud,
      longitud,
      direccion,
    });

    await nuevaUbicacion.save();
    res.status(201).json({ mensaje: 'Ubicación registrada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la ubicación' });
  }
});


// Obtener opiniones por producto_id
app.get('/opiniones/producto/:producto_id', async (req, res) => {
  const { producto_id } = req.params;

  try {
    const opiniones = await Opinion.aggregate([
      {
        $match: { producto_id: parseInt(producto_id) },
      },
      {
        $lookup: {
          from: 'usuarios', // Nombre exacto de la colección
          localField: 'user_id', // Campo en la colección Opiniones
          foreignField: 'user_id', // Campo en la colección Usuarios
          as: 'usuarioInfo', // Resultado del join
        },
      },
      {
        $unwind: {
          path: '$usuarioInfo',
          preserveNullAndEmptyArrays: true, // Permite valores nulos si no hay coincidencia
        },
      },
      {
        $project: {
          opinion_id: 1,
          producto_id: 1,
          calificacion: 1,
          comentario: 1,
          fecha_opinion: 1,
          usuario: '$usuarioInfo.nombre_usuario', // Incluye el nombre del usuario
        },
      },
    ]);

    console.log('Opiniones obtenidas:', opiniones);
    res.json(opiniones);
  } catch (error) {
    console.error('Error al obtener opiniones:', error);
    res.status(500).json({ error: 'Error al obtener opiniones del producto' });
  }
});

app.get('/productos/categoria/:categoria_id', async (req, res) => {
  const { categoria_id } = req.params;

  try {
    const matchCondition =
      categoria_id === 'null' || categoria_id === 'Todos'
        ? {} // No filtrar por categoría
        : { categoria_id: parseInt(categoria_id) }; // Filtrar por categoría

    const productosPorCategoria = await Producto.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: 'Categoria',
          localField: 'categoria_id',
          foreignField: 'categoria_id',
          as: 'categoriaInfo',
        },
      },
      { $unwind: '$categoriaInfo' },
      {
        $project: {
          _id: 1,
          nombre_producto: 1,
          descripcion: 1,
          precio: 1,
          estado: 1,
          'categoriaInfo.nombre_categoria': 1,
          'categoriaInfo.descripcion': 1,
        },
      },
    ]);
    res.json(productosPorCategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos de la categoría' });
  }
});




app.get('/productos/ubicacion', async (req, res) => {
  try {
    const productos = await Producto.aggregate([
      {
        $lookup: {
          from: 'ubicacion', // Nombre de la colección de ubicaciones
          localField: 'tienda_id', // Relación entre productos y tiendas
          foreignField: 'tienda_id', // Campo relacionado en ubicaciones
          as: 'ubicacionInfo',
        },
      },
      {
        $unwind: '$ubicacionInfo', // Desanidar los datos de ubicación
      },
      {
        $project: {
          _id: 1,
          producto_id: 1, // Incluye producto_id
          nombre_producto: 1,
          precio: 1,
          descripcion: 1,
          categoria_id: 1,
          estado: 1,
          'ubicacionInfo.latitud': 1,
          'ubicacionInfo.longitud': 1,
          'ubicacionInfo.direccion': 1,
        },
      },
    ]);

    console.log('Productos con ubicación obtenidos:', productos); // Verifica producto_id
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos con ubicación:', error);
    res.status(500).json({ error: 'Error al obtener productos con ubicación' });
  }
});




app.get('/tiendas/ubicacion', async (req, res) => {
  try {
    const tiendasConUbicacion = await Tienda.aggregate([
      {
        $lookup: {
          from: 'ubicacion', // Nombre exacto de la colección
          localField: 'tienda_id', // Campo en la colección Tiendas
          foreignField: 'tienda_id', // Campo en la colección Ubicacion
          as: 'ubicacionInfo' // Nombre del campo en el resultado
        }
      },
      {
        $unwind: '$ubicacionInfo' // Desanida la información de ubicación
      },
      {
        $project: {
          _id: 1,
          nombre: 1,
          descripcion: 1,
          propietario: 1,
          'ubicacionInfo.latitud': 1,
          'ubicacionInfo.longitud': 1,
          'ubicacionInfo.direccion': 1
        }
      }
    ]);

    res.json(tiendasConUbicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tiendas con ubicación' });
  }
});

app.get('/tienda/plan/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const tiendaConPlan = await Tienda.aggregate([
      {
        $match: { user_id: parseInt(user_id) }, // Filtra por el user_id del usuario logueado
      },
      {
        $lookup: {
          from: 'Planes', // Une la colección de planes
          localField: 'plan_id',
          foreignField: 'plan_id',
          as: 'planInfo',
        },
      },
      {
        $unwind: '$planInfo', // Desanidar los datos del plan
      },
      {
        $project: {
          _id: 0,
          nombre: 1,
          descripcion: 1,
          propietario: 1,
          'planInfo.periodo': 1,
          'planInfo.costo': 1,
        },
      },
    ]);

    if (tiendaConPlan.length === 0) {
      return res.status(404).json({ error: 'No se encontró la tienda para el usuario logueado' });
    }

    res.json(tiendaConPlan[0]); // Devuelve la tienda con su plan
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la información de la tienda' });
  }
});



// Crear una nueva opinión
app.post('/opiniones', async (req, res) => {
  const { opinion_id, user_id, producto_id, calificacion, comentario } = req.body;

  if (!opinion_id || !user_id || !producto_id || !calificacion || !comentario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const nuevaOpinion = new Opinion({
      opinion_id,
      user_id,
      producto_id,
      calificacion,
      comentario,
      fecha_opinion: new Date(), // Fecha actual
    });

    await nuevaOpinion.save();
    res.status(201).json({ mensaje: 'Opinión registrada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la opinión' });
  }
});


// Editar una opinión
app.put('/opiniones/:id', async (req, res) => {
  const { id } = req.params;
  const { calificacion, comentario } = req.body;

  if (!calificacion || !comentario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const opinionActualizada = await Opinion.findByIdAndUpdate(
      id,
      { calificacion, comentario },
      { new: true }
    );

    if (!opinionActualizada) {
      return res.status(404).json({ error: 'Opinión no encontrada' });
    }

    res.json({
      mensaje: 'Opinión actualizada exitosamente',
      opinion: opinionActualizada,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la opinión' });
  }
});

app.post('/ubicaciones', (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Datos incompletos' });
  }

  // Simula guardado en la base de datos
  console.log('Ubicación guardada:', { latitude, longitude });

  res.status(200).json({ message: 'Ubicación guardada correctamente.' });
});


// Eliminar una opinión
app.delete('/opiniones/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const opinionEliminada = await Opinion.findByIdAndDelete(id);

    if (!opinionEliminada) {
      return res.status(404).json({ error: 'Opinión no encontrada' });
    }

    res.json({ mensaje: 'Opinión eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la opinión' });
  }
});

// Definir función updateUbicacion
app.put('/ubicacion/:id', async (req, res) => {
  const { id } = req.params;
  const { latitud, longitud, direccion } = req.body;
  
  if (!latitud || !longitud) {
      return res.status(400).json({ error: "Latitud y longitud son obligatorios" });
  }

  try {
      // Aquí actualizarías la base de datos según tu implementación
      const result = await db.updateUbicacion(id, { latitud, longitud, direccion });
      res.status(200).json({ message: 'Ubicación actualizada', result });
  } catch (error) {
      console.error('Error actualizando ubicación:', error);
      res.status(500).json({ error: 'Error actualizando ubicación' });
  }
});

app.put('/tienda/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, propietario, location } = req.body;

  try {
    // Encuentra y actualiza la tienda por tienda_id
    const tiendaActualizada = await Tienda.findOneAndUpdate(
      { tienda_id: id }, // Filtro
      {
        $set: {
          nombre,
          descripcion,
          propietario,
          location,
        },
      },
      { new: true, runValidators: true } // Retorna el documento actualizado y aplica validaciones
    ).lean();

    if (!tiendaActualizada) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }

    res.json({
      message: 'Tienda actualizada con éxito',
      tienda: tiendaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar la tienda:', error);
    res.status(500).json({ error: 'Error al actualizar la tienda' });
  }
});


app.put('/usuarios/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);  // Usar `parseInt` si `user_id` es un número

    // Verifica si el ID es un número válido
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Realiza la actualización usando `user_id` en lugar de `_id`
    const user = await Usuario.findOneAndUpdate({ user_id: userId }, req.body, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error actualizando el usuario:', error);
    res.status(500).json({ error: 'Error actualizando el usuario' });
  }
});




// Inicialización del servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
