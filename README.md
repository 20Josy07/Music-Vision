# 🎵 MusicVision

**MusicVision** es una aplicación moderna de streaming musical diseñada para brindar una experiencia auditiva fluida y envolvente. Explora música, gestiona tus playlists y disfruta de letras sincronizadas, todo en una interfaz elegante y responsiva.

## ✨ Características

### 🎧 Explora y Descubre
- Navega por categorías musicales, lanzamientos recientes y playlists populares.
- Crea y organiza tus propias colecciones de canciones, álbumes y artistas favoritos.

### 🔗 Integración con Spotify
- Conecta tu cuenta de Spotify para escuchar tu música directamente desde la app.
- Visualiza tus canciones más escuchadas y controla la reproducción (play, pausa, siguiente, volumen, aleatorio, repetir) en tiempo real.

### 🎤 Visualización de Letras
- Muestra letras sincronizadas (LRC) o simples en tiempo real.
- Letras extraídas automáticamente desde **LRCLIB**.

### 📃 Cola de Reproducción
- Gestiona las canciones que están por sonar con facilidad.

### 🖼️ Reproductor en Pantalla Completa
- Experiencia inmersiva con fondo dinámico borroso basado en la carátula del álbum y letras en vivo.

### 💡 Diseño Adaptativo
- Totalmente responsiva para escritorio y móviles.
- Soporte para modo claro y oscuro.

### 🧠 Funciones con IA (en desarrollo)
- Integración con **Genkit** lista para futuras mejoras en descubrimiento musical con IA.

## 🛠️ Tech Stack

**Frontend**
- Next.js (App Router, Server Components)
- React + TypeScript

**UI**
- ShadCN UI
- Tailwind CSS
- Lucide React

**Estado**
- React Context API

**IA**
- Genkit (Firebase)

**APIs Externas**
- Spotify Web API
- LRCLIB API (para letras)

## 🚀 ¡Pruébalo en Vivo!
👉 [https://music-vision.netlify.app/](https://music-vision.netlify.app/)

## 🚀 Cómo Empezar (Desarrollo)

Sigue estos pasos para configurar y ejecutar MusicVision en tu entorno local.

### Prerrequisitos
- Node.js (v18 o superior recomendado)
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/musicvision.git # Reemplaza con la URL de tu repositorio
cd musicvision
```

### 2. Instalar Dependencias
Usando npm:
```bash
npm install
```
O usando yarn:
```bash
yarn install
```

### 3. Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto y añade las siguientes variables. Deberás obtener tus propias credenciales de la API de Spotify desde el [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).

```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=TU_SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET=TU_SPOTIFY_CLIENT_SECRET

# URL base de tu aplicación (importante para el redirect URI de Spotify OAuth)
# Para desarrollo local, usualmente es http://localhost:PUERTO
# Asegúrate de que el puerto coincida con el que usa Next.js (por defecto 3000, pero aquí es 9002)
NEXT_PUBLIC_APP_URL=http://localhost:9002

# (Opcional) Clave API de Google para Genkit/Google AI Studio, si usas modelos de Google
# GOOGLE_API_KEY=TU_GOOGLE_API_KEY
```
**Importante**: La `REDIRECT_URI` que configures en tu aplicación de Spotify debe ser `TU_NEXT_PUBLIC_APP_URL/api/spotify/exchange-code`. Por ejemplo, si `NEXT_PUBLIC_APP_URL` es `http://localhost:9002`, la redirect URI en Spotify será `http://localhost:9002/api/spotify/exchange-code`.

### 4. Ejecutar la Aplicación en Desarrollo

Para iniciar el servidor de desarrollo de Next.js:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:9002` (o el puerto que hayas configurado).

Si necesitas ejecutar los flujos de Genkit localmente (por ejemplo, para probar funciones de IA):
```bash
npm run genkit:dev
```
O para que se reinicie con los cambios:
```bash
npm run genkit:watch
```

### 5. Compilar para Producción
Para crear una build de producción:
```bash
npm run build
```
Y para iniciar el servidor de producción:
```bash
npm run start
```

## 🤝 Contribuir
¡Las contribuciones son bienvenidas! Si deseas contribuir, por favor sigue estos pasos:
1. Haz un Fork del proyecto.
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Haz Push a la Branch (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

## 📜 Licencia
Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.
```
