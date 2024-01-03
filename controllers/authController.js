import bcrypt from 'bcryptjs';
import User from '../models/User';

// Registro de usuario
export async function registerUser(req, res) {
  try {
    const { username, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
    }

    // Hash de la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
}

// Inicio de sesión de usuario
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    // Buscar el usuario por nombre de usuario
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Comparar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Puedes generar un token JWT aquí para la autenticación de sesión

    res.status(200).json({ message: 'Inicio de sesión exitoso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
}
