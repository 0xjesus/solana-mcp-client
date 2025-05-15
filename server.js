const express = require('express');
const path = require('path');

const app = express();

console.log('Iniciando servidor Express...');
console.log(`Directorio de archivos estáticos: ${path.join(__dirname, 'dist')}`);

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta básica de prueba
app.get('/api/test', (req, res) => {
  console.log('API test accedida');
  res.json({ message: 'API funcionando correctamente' });
});

// Definir rutas específicas para diferentes vistas de SPA
// En lugar de usar comodines, definimos rutas específicas
app.get('/', serveIndex);
// Añade más rutas según las necesites para tu aplicación Vue

function serveIndex(req, res) {
  console.log(`Sirviendo index.html para la ruta: ${req.path}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), err => {
    if (err) {
      console.error(`Error al servir index.html: ${err.message}`);
      res.status(500).send('Error interno del servidor');
    }
  });
}

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  console.log(`Ruta no encontrada: ${req.path}`);
  res.status(404).sendFile(path.join(__dirname, 'dist', 'index.html'), err => {
    if (err) {
      console.error(`Error al servir index.html para 404: ${err.message}`);
      res.status(500).send('Error interno del servidor');
    }
  });
});

const PORT = process.env.PORT || 1677;
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('Rutas configuradas:');
  console.log('  - / (raíz)');
  console.log('  - /login');
  console.log('  - /dashboard');
  console.log('  - /profile');
  console.log('  - /api/test (endpoint de prueba)');
  console.log('📝 Para añadir más rutas, edita el archivo server.js');
});
