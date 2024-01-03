import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import authRoutes from '../routes/authRoutes';

// URL de conexión a MongoDB con el puerto (reemplaza el 27017 con tu puerto)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ClusterNE';

// Configuración de conexión
const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferTimeoutMS: 0,
};

export async function mongooseConnect() {
  try {
    await mongoose.connect(mongoURI, options);

    const app = express();

    // Middleware
    app.use(bodyParser.json());

    // Rutas de Autenticación
    app.use('/auth', authRoutes);

    // Ruta para agregar productos
    app.post('/products', async (req, res) => {
      const { productName } = req.body;

      try {
        // Verificar si el producto ya existe
        const existingProduct = await Product.findOne({ productName });

        if (existingProduct) {
          // El producto ya existe, manejar la excepción
          return res.status(400).json({ error: 'Producto duplicado. No se puede agregar.' });
        }

        // Si el producto no existe, agregarlo
        const newProduct = new Product({ productName });
        await newProduct.save();

        res.json({ message: 'Producto agregado correctamente.' });
      } catch (error) {
        console.error('Error al agregar el producto:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
      }
    });

    // Puerto de escucha
    const port = 3000;
    app.listen(port, () => {
      console.log(`Servidor en ejecución en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error de conexión o autenticación a MongoDB:', error.message);
  } finally {
    // Cerrar la conexión al finalizar las operaciones
    mongoose.disconnect();
    console.log('Conexión cerrada');
  }
  mongoose.set('debug', true);
}
