# 🎨 Dibujale

Juego multijugador online para dibujar y adivinar (estilo Skribbl), con multijugador real vía WebSockets.

## 🎯 Stack

- **Backend:** Node.js + Express + Socket.io (multijugador en tiempo real, sin polling)
- **Frontend:** React + Vite + Tailwind CSS
- **Deploy:** Render, Railway, Fly.io o cualquier host de Node

## 🚀 Levantarlo localmente

Necesitás Node.js 18 o más nuevo. Si no lo tenés: https://nodejs.org/

```bash
# 1. Instalar dependencias
npm install

# 2. Modo desarrollo (frontend con hot-reload + backend juntos)
npm run dev

# Abrí http://localhost:5173 en dos ventanas distintas para probar el multijugador
```

Para probar la versión "de producción" localmente:

```bash
npm run build    # Compila el frontend a dist/
npm start        # Levanta el server en http://localhost:3000
```

## 🌐 Deployar a Render (gratis, recomendado)

1. Subí el proyecto a un repo de GitHub.
2. Entrá a https://render.com y creá una cuenta.
3. **New → Web Service** → conectás tu repo.
4. Configurá así:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Tocá **Create Web Service**. En 2-3 minutos tenés tu URL pública (algo como `https://dibujale.onrender.com`).
6. ¡Pasale ese link a tus amigos!

> **Nota del plan free:** Render duerme la app después de 15 min sin actividad. La primera persona que entre va a esperar ~30 segundos para que despierte. Después anda fluido.

### Alternativa: Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Te genera una URL pública. Tier free disponible.

## 🤖 Workflow con Claude Code

Si querés iterar el proyecto con [Claude Code](https://docs.claude.com/en/docs/claude-code/overview):

```bash
# Instalar Claude Code (una vez)
npm install -g @anthropic-ai/claude-code

# En la carpeta del proyecto
cd dibujale
claude
```

Comandos útiles para tirarle a Claude Code:

- `instalá las dependencias y corré npm run dev en background, después abrí http://localhost:5173`
- `agregá una palabra "fideos" al server.js`
- `hacé que el lobby muestre los pings de cada jugador`
- `subí esto a un repo nuevo de GitHub llamado dibujale y mostrame el link`
- `deployalo a Render usando su CLI`

## 📁 Estructura

```
dibujale/
├── server.js           ← Express + Socket.io, toda la lógica del juego
├── index.html          ← Vite root
├── src/
│   ├── main.jsx        ← Entry point de React
│   └── App.jsx         ← Toda la UI (home, lobby, juego, fin)
├── vite.config.js      ← Config de Vite con proxy a /socket.io
├── package.json
└── README.md
```

## ⚙️ Cómo funciona

- El servidor mantiene el estado de cada sala en memoria (Map de `código → estado`).
- Cada jugador se conecta vía WebSocket y emite eventos: `createRoom`, `joinRoom`, `stroke`, `chat`, etc.
- El servidor enmascara la palabra para que solo el dibujante la vea (el resto recibe `___ ___ ___`).
- Las pinceladas se transmiten en vivo a los demás jugadores con latencia de ~30-100ms.
- El servidor maneja los timers de turno, las pistas progresivas (revela letras), el scoring y la rotación de dibujantes.

## 🎮 Reglas

- 2 a 12 jugadores por sala.
- Cada turno, uno dibuja y los demás adivinan en el chat.
- Puntaje según rapidez: cuanto antes adivines, más puntos.
- El dibujante gana 25 pts por cada persona que adivine.
- Pistas: se revelan letras de a poco a medida que avanza el turno.
- Si escribís algo a una sola letra de la palabra, te avisa "¡cerca!".

## 📝 Licencia

Hacé lo que quieras con esto. Pasala bien.
