import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Añade el objeto 'server' si no existe
    host: '0.0.0.0', // Es útil para que ngrok pueda acceder al host
    allowedHosts: [
      // **AÑADE ESTA LÍNEA** con el dominio exacto que te dio ngrok
      'unsoiling-sharie-foppishly.ngrok-free.dev',
      // (Opcional) Puedes añadir el dominio base si usas la versión gratuita
      'ngrok-free.dev', 
      // Si el dominio cambia a .ngrok.io
      'ngrok.io', 
      // 'localhost', // Ya suele estar permitido por defecto
    ],
  },
})
