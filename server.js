import express from 'express';
import path from 'path';

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

// Redireccionar todas las rutas a index.html para Vue Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 1677;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
