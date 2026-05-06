import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 30000,
});

const PORT = process.env.PORT || 3000;

// Serve built frontend in production. In dev, Vite handles the frontend.
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) res.status(404).send('Build the frontend first: npm run build');
  });
});

// =================================================================
// GAME STATE
// =================================================================

const rooms = new Map(); // code -> RoomState

const WORDS = [
  'casa', 'gato', 'perro', 'sol', 'luna', 'estrella', 'pez', 'manzana',
  'banana', 'pizza', 'taco', 'pelota', 'auto', 'avion', 'barco', 'arbol',
  'flor', 'montaña', 'rio', 'playa', 'libro', 'lapiz', 'computadora',
  'telefono', 'silla', 'mesa', 'cama', 'puerta', 'ventana', 'reloj',
  'mariposa', 'abeja', 'elefante', 'jirafa', 'tigre', 'leon', 'oso',
  'conejo', 'raton', 'vaca', 'cerdo', 'pollo', 'sombrero', 'zapato',
  'camisa', 'pantalon', 'anteojos', 'taza', 'tenedor', 'cuchillo', 'plato',
  'helado', 'hamburguesa', 'torta', 'queso', 'huevo', 'frutilla', 'uva',
  'sandia', 'pera', 'naranja', 'limon', 'zanahoria', 'tomate', 'papa',
  'choclo', 'lechuga', 'pan', 'lluvia', 'nieve', 'viento', 'fuego',
  'arcoiris', 'rayo', 'escuela', 'hospital', 'iglesia', 'parque',
  'bicicleta', 'tren', 'colectivo', 'helicoptero', 'cohete', 'submarino',
  'semaforo', 'puente', 'escalera', 'piano', 'guitarra', 'tambor',
  'trompeta', 'camara', 'television', 'robot', 'fantasma', 'dragon',
  'bruja', 'princesa', 'rey', 'reina', 'doctor', 'policia', 'bombero',
  'profesor', 'astronauta', 'payaso', 'ninja', 'pirata', 'corazon',
  'circulo', 'cuadrado', 'triangulo', 'flecha', 'globo', 'regalo',
  'vela', 'llave', 'candado', 'martillo', 'sierra', 'paraguas',
  'anillo', 'collar', 'corona', 'espada', 'pingüino', 'tortuga', 'caballo',
  'serpiente', 'araña', 'cangrejo', 'tiburon', 'ballena', 'delfin',
  'pulpo', 'medusa', 'cactus', 'palmera', 'hongo', 'mariquita', 'oruga',
  'buho', 'aguila', 'loro', 'flamenco', 'cisne', 'pavo', 'zorro',
  'lobo', 'cebra', 'canguro', 'koala', 'panda', 'mono', 'gorila',
  'rinoceronte', 'hipopotamo', 'cocodrilo', 'camello', 'asado', 'mate',
  'empanada', 'choripan', 'medialuna', 'alfajor', 'dulce de leche',
  'tango', 'futbol', 'cancha', 'pileta', 'bandera', 'mapa', 'dado',
  'naipe', 'ajedrez', 'dardos', 'columpio', 'tobogan', 'arenero'
];

// =================================================================
// HELPERS
// =================================================================

const genId = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-3);

function genRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s;
  do {
    s = '';
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  } while (rooms.has(s));
  return s;
}

function normalize(s) {
  return (s || '').toString().toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ');
}

function pickWord(recent = []) {
  const recentSet = new Set(recent.map(normalize));
  const pool = WORDS.filter(w => !recentSet.has(normalize(w)));
  const list = pool.length > 0 ? pool : WORDS;
  return list[Math.floor(Math.random() * list.length)];
}

function maskWord(word, revealed = []) {
  return word.split('').map((c, i) => {
    if (c === ' ') return ' ';
    if (revealed.includes(i)) return c;
    return '_';
  }).join('');
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

// View room state from a specific player's perspective (mask the word for non-drawers)
function viewForPlayer(room, playerId) {
  const isDrawer = room.currentDrawerId === playerId;
  const me = room.players.find(p => p.id === playerId);
  const reveal = isDrawer || room.status === 'roundEnd' || room.status === 'gameEnd' || me?.hasGuessedThisRound;
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players.map(p => ({
      id: p.id, name: p.name, score: p.score,
      hasGuessedThisRound: p.hasGuessedThisRound,
      guessedAt: p.guessedAt,
      avatarSeed: p.avatarSeed,
    })),
    settings: room.settings,
    status: room.status,
    currentRound: room.currentRound,
    currentDrawerId: room.currentDrawerId,
    currentWord: reveal ? room.currentWord : null,
    maskedWord: room.currentWord ? maskWord(room.currentWord, room.revealedIndices || []) : '',
    wordLength: room.currentWord ? room.currentWord.length : 0,
    revealedWord: room.revealedWord,
    roundStartTime: room.roundStartTime,
    roundEndTime: room.roundEndTime,
    chat: room.chat.slice(-80),
    strokes: room.strokes,
  };
}

function broadcastRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  for (const p of room.players) {
    const sock = io.sockets.sockets.get(p.socketId);
    if (sock) sock.emit('roomUpdate', viewForPlayer(room, p.id));
  }
}

function pushChat(room, msg) {
  room.chat.push({ id: genId(), timestamp: Date.now(), ...msg });
  if (room.chat.length > 200) room.chat = room.chat.slice(-150);
}

// =================================================================
// GAME LIFECYCLE
// =================================================================

function clearAllTimers(room) {
  if (room.roundTimer) { clearTimeout(room.roundTimer); room.roundTimer = null; }
  if (room.endRoundTimer) { clearTimeout(room.endRoundTimer); room.endRoundTimer = null; }
  if (room.hintTimers) { room.hintTimers.forEach(t => clearTimeout(t)); room.hintTimers = []; }
}

function startNewTurn(room) {
  clearAllTimers(room);
  const drawerId = room.drawerOrder[room.currentDrawerIndex];
  const word = pickWord(room.recentWords);

  room.status = 'playing';
  room.currentDrawerId = drawerId;
  room.currentWord = word;
  room.revealedIndices = [];
  room.revealedWord = null;
  room.roundStartTime = Date.now();
  room.roundEndTime = Date.now() + (room.settings.roundDuration * 1000);
  room.recentWords = [...(room.recentWords || []), word].slice(-30);
  room.strokes = [];
  room.players.forEach(p => {
    p.hasGuessedThisRound = false;
    p.guessedAt = null;
    p.guessOrder = null;
  });

  const drawer = room.players.find(p => p.id === drawerId);
  pushChat(room, { type: 'system', message: `${drawer?.name || '?'} dibuja ahora` });

  // End-of-round timer
  room.roundTimer = setTimeout(() => {
    if (room.status === 'playing') endRound(room);
  }, room.settings.roundDuration * 1000);

  // Schedule progressive letter reveals
  const wordLetters = word.replace(/\s/g, '').length;
  const hintsCount = Math.max(0, Math.floor(wordLetters / 3));
  room.hintTimers = [];
  for (let i = 1; i <= hintsCount; i++) {
    const at = (room.settings.roundDuration * 1000) * (i / (hintsCount + 1));
    const t = setTimeout(() => {
      if (room.status !== 'playing') return;
      const hidden = [];
      for (let idx = 0; idx < word.length; idx++) {
        if (word[idx] !== ' ' && !room.revealedIndices.includes(idx)) hidden.push(idx);
      }
      if (hidden.length > 0) {
        room.revealedIndices.push(hidden[Math.floor(Math.random() * hidden.length)]);
        broadcastRoom(room.code);
      }
    }, at);
    room.hintTimers.push(t);
  }

  broadcastRoom(room.code);
}

function endRound(room) {
  clearAllTimers(room);

  const guessers = room.players.filter(p => p.id !== room.currentDrawerId);
  const correctCount = guessers.filter(p => p.hasGuessedThisRound).length;
  const drawerBonus = correctCount * 25;
  const drawer = room.players.find(p => p.id === room.currentDrawerId);
  if (drawer) drawer.score += drawerBonus;

  room.status = 'roundEnd';
  room.revealedWord = room.currentWord;
  pushChat(room, { type: 'system', message: `La palabra era: ${room.currentWord}` });
  if (drawer && drawerBonus > 0) {
    pushChat(room, { type: 'system', message: `${drawer.name} ganó +${drawerBonus} pts por dibujar` });
  }

  broadcastRoom(room.code);

  room.endRoundTimer = setTimeout(() => advanceToNextTurn(room), 5000);
}

function advanceToNextTurn(room) {
  clearAllTimers(room);
  let nextIdx = room.currentDrawerIndex + 1;
  // Skip drawers who have left
  while (nextIdx < room.drawerOrder.length) {
    if (room.players.find(p => p.id === room.drawerOrder[nextIdx])) break;
    nextIdx++;
  }

  if (nextIdx >= room.drawerOrder.length) {
    // Round complete
    const nextRound = room.currentRound + 1;
    if (nextRound >= room.settings.totalRounds) return endGame(room);
    room.currentRound = nextRound;
    room.drawerOrder = room.players.map(p => p.id);
    room.currentDrawerIndex = 0;
  } else {
    room.currentDrawerIndex = nextIdx;
  }

  if (room.players.length < 2) return endGame(room);
  startNewTurn(room);
}

function endGame(room) {
  clearAllTimers(room);
  room.status = 'gameEnd';
  pushChat(room, { type: 'system', message: '¡Fin del juego!' });
  broadcastRoom(room.code);
}

function startGame(room) {
  clearAllTimers(room);
  room.currentRound = 0;
  room.drawerOrder = room.players.map(p => p.id);
  room.currentDrawerIndex = 0;
  room.recentWords = [];
  room.players.forEach(p => {
    p.score = 0;
    p.hasGuessedThisRound = false;
    p.guessedAt = null;
  });
  pushChat(room, { type: 'system', message: '¡Empieza la partida!' });
  startNewTurn(room);
}

// =================================================================
// SOCKET.IO HANDLERS
// =================================================================

io.on('connection', (socket) => {
  let myRoomCode = null;
  let myUserId = null;

  socket.on('createRoom', ({ name }, ack) => {
    const cleanName = (name || '').toString().trim().slice(0, 20);
    if (!cleanName) return ack?.({ error: 'Nombre requerido' });
    const code = genRoomCode();
    const userId = genId();
    const room = {
      code, hostId: userId,
      players: [{
        id: userId, socketId: socket.id, name: cleanName,
        avatarSeed: Math.floor(Math.random() * 1000),
        score: 0, hasGuessedThisRound: false, guessedAt: null,
      }],
      settings: { totalRounds: 3, roundDuration: 80 },
      status: 'lobby',
      currentRound: 0, drawerOrder: [], currentDrawerIndex: 0,
      currentDrawerId: null, currentWord: null,
      revealedIndices: [], revealedWord: null,
      roundStartTime: 0, roundEndTime: 0,
      strokes: [], chat: [], recentWords: [],
      roundTimer: null, endRoundTimer: null, hintTimers: [],
    };
    pushChat(room, { type: 'system', message: `${cleanName} creó la sala` });
    rooms.set(code, room);
    socket.join(code);
    myRoomCode = code; myUserId = userId;
    ack?.({ code, userId });
    broadcastRoom(code);
  });

  socket.on('joinRoom', ({ code, name }, ack) => {
    const c = (code || '').toString().trim().toUpperCase();
    const cleanName = (name || '').toString().trim().slice(0, 20) || 'Jugador';
    const room = rooms.get(c);
    if (!room) return ack?.({ error: 'Sala no encontrada' });
    if (room.players.length >= 12) return ack?.({ error: 'Sala llena' });
    const userId = genId();
    room.players.push({
      id: userId, socketId: socket.id, name: cleanName,
      avatarSeed: Math.floor(Math.random() * 1000),
      score: 0, hasGuessedThisRound: false, guessedAt: null,
    });
    pushChat(room, { type: 'system', message: `${cleanName} se unió` });
    socket.join(c);
    myRoomCode = c; myUserId = userId;
    ack?.({ code: c, userId });
    broadcastRoom(c);
  });

  socket.on('startGame', () => {
    const room = rooms.get(myRoomCode);
    if (!room || room.hostId !== myUserId || room.players.length < 2 || room.status !== 'lobby') return;
    startGame(room);
  });

  socket.on('changeSettings', (settings) => {
    const room = rooms.get(myRoomCode);
    if (!room || room.hostId !== myUserId || room.status !== 'lobby') return;
    if (settings.totalRounds) room.settings.totalRounds = Math.max(1, Math.min(10, parseInt(settings.totalRounds, 10)));
    if (settings.roundDuration) room.settings.roundDuration = Math.max(30, Math.min(180, parseInt(settings.roundDuration, 10)));
    broadcastRoom(myRoomCode);
  });

  socket.on('stroke', (stroke) => {
    const room = rooms.get(myRoomCode);
    if (!room || room.currentDrawerId !== myUserId || room.status !== 'playing') return;
    if (!stroke || typeof stroke !== 'object') return;
    room.strokes.push(stroke);
    socket.to(myRoomCode).emit('stroke', stroke);
  });

  socket.on('clearCanvas', () => {
    const room = rooms.get(myRoomCode);
    if (!room || room.currentDrawerId !== myUserId) return;
    const ev = { type: 'clear' };
    room.strokes.push(ev);
    socket.to(myRoomCode).emit('stroke', ev);
  });

  socket.on('chat', (text) => {
    const room = rooms.get(myRoomCode);
    if (!room) return;
    const me = room.players.find(p => p.id === myUserId);
    if (!me) return;
    const t = (text || '').toString().slice(0, 60).trim();
    if (!t) return;

    // If actively playing and player is a guesser who hasn't guessed yet → check guess
    if (room.status === 'playing' && room.currentDrawerId !== myUserId && !me.hasGuessedThisRound) {
      const guess = normalize(t);
      const target = normalize(room.currentWord);

      if (guess === target) {
        const now = Date.now();
        const guessOrder = room.players.filter(p => p.hasGuessedThisRound).length;
        const timeRatio = Math.max(0, (room.roundEndTime - now) / (room.settings.roundDuration * 1000));
        const points = Math.round(50 + 100 * timeRatio + Math.max(0, 30 - guessOrder * 10));
        me.score += points;
        me.hasGuessedThisRound = true;
        me.guessedAt = now;
        me.guessOrder = guessOrder;
        pushChat(room, { type: 'correct', playerName: me.name, points });
        broadcastRoom(myRoomCode);

        const guessers = room.players.filter(p => p.id !== room.currentDrawerId);
        if (guessers.length > 0 && guessers.every(p => p.hasGuessedThisRound)) {
          endRound(room);
        }
        return;
      }
      const isClose = target.length >= 4 && guess.length === target.length && levenshtein(guess, target) === 1;
      pushChat(room, {
        type: isClose ? 'close' : 'message',
        playerId: myUserId, playerName: me.name, message: t
      });
      broadcastRoom(myRoomCode);
      return;
    }

    // Regular chat (lobby, drawer, already-guessed, round-end)
    pushChat(room, { type: 'message', playerId: myUserId, playerName: me.name, message: t });
    broadcastRoom(myRoomCode);
  });

  socket.on('playAgain', () => {
    const room = rooms.get(myRoomCode);
    if (!room || room.hostId !== myUserId || room.status !== 'gameEnd') return;
    clearAllTimers(room);
    room.status = 'lobby';
    room.players.forEach(p => { p.score = 0; p.hasGuessedThisRound = false; p.guessedAt = null; });
    room.strokes = [];
    room.chat = [];
    pushChat(room, { type: 'system', message: 'Volviendo al lobby...' });
    broadcastRoom(myRoomCode);
  });

  socket.on('disconnect', () => handleLeave());
  socket.on('leave', () => handleLeave());

  function handleLeave() {
    if (!myRoomCode) return;
    const room = rooms.get(myRoomCode);
    if (!room) { myRoomCode = null; myUserId = null; return; }

    const player = room.players.find(p => p.id === myUserId);
    if (!player) return;

    const wasDrawer = room.currentDrawerId === myUserId;
    room.players = room.players.filter(p => p.id !== myUserId);
    pushChat(room, { type: 'system', message: `${player.name} se fue` });

    if (room.hostId === myUserId && room.players.length > 0) {
      room.hostId = room.players[0].id;
      pushChat(room, { type: 'system', message: `${room.players[0].name} es el nuevo anfitrión` });
    }

    if (room.players.length === 0) {
      clearAllTimers(room);
      rooms.delete(myRoomCode);
    } else if (room.status === 'playing' && (wasDrawer || room.players.length < 2)) {
      endRound(room);
    } else {
      broadcastRoom(myRoomCode);
    }

    socket.leave(myRoomCode);
    myRoomCode = null;
    myUserId = null;
  }
});

server.listen(PORT, () => {
  console.log(`🎨 Dibujale corriendo en http://localhost:${PORT}`);
});
