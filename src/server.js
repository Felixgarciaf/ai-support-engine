import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`[AI Support Engine] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[AI Support Engine] Endpoint activo: POST http://localhost:${PORT}/api/analyze`);
});
