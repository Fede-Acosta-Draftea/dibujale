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

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) res.status(404).send('Build the frontend first: npm run build');
  });
});

// =================================================================
// WORD LISTS
// =================================================================

const WORDS_BILINGUAL = [
  // Animales (25)
  { es: 'gato', pt: 'gato' },
  { es: 'perro', pt: 'cachorro' },
  { es: 'elefante', pt: 'elefante' },
  { es: 'mariposa', pt: 'borboleta' },
  { es: 'conejo', pt: 'coelho' },
  { es: 'vaca', pt: 'vaca' },
  { es: 'chancho', pt: 'porco' },
  { es: 'abeja', pt: 'abelha' },
  { es: 'tortuga', pt: 'tartaruga' },
  { es: 'pez', pt: 'peixe' },
  { es: 'ballena', pt: 'baleia' },
  { es: 'tiburón', pt: 'tubarão' },
  { es: 'delfín', pt: 'golfinho' },
  { es: 'pingüino', pt: 'pinguim' },
  { es: 'caballo', pt: 'cavalo' },
  { es: 'cebra', pt: 'zebra' },
  { es: 'jirafa', pt: 'girafa' },
  { es: 'león', pt: 'leão' },
  { es: 'oso', pt: 'urso' },
  { es: 'mono', pt: 'macaco' },
  { es: 'serpiente', pt: 'cobra' },
  { es: 'cangrejo', pt: 'caranguejo' },
  { es: 'pulpo', pt: 'polvo' },
  { es: 'loro', pt: 'papagaio' },
  { es: 'águila', pt: 'águia' },
  // Comidas (20)
  { es: 'pizza', pt: 'pizza' },
  { es: 'helado', pt: 'sorvete' },
  { es: 'hamburguesa', pt: 'hambúrguer' },
  { es: 'manzana', pt: 'maçã' },
  { es: 'banana', pt: 'banana' },
  { es: 'frutilla', pt: 'morango' },
  { es: 'sandía', pt: 'melancia' },
  { es: 'piña', pt: 'abacaxi' },
  { es: 'durazno', pt: 'pêssego' },
  { es: 'cebolla', pt: 'cebola' },
  { es: 'zanahoria', pt: 'cenoura' },
  { es: 'tomate', pt: 'tomate' },
  { es: 'queso', pt: 'queijo' },
  { es: 'pan', pt: 'pão' },
  { es: 'huevo', pt: 'ovo' },
  { es: 'naranja', pt: 'laranja' },
  { es: 'limón', pt: 'limão' },
  { es: 'uva', pt: 'uva' },
  { es: 'papa', pt: 'batata' },
  { es: 'torta', pt: 'bolo' }, // REVISAR: "torta" en BR = tarta salada; "bolo" = pastel dulce
  // Objetos cotidianos (15)
  { es: 'silla', pt: 'cadeira' },
  { es: 'mesa', pt: 'mesa' },
  { es: 'llave', pt: 'chave' },
  { es: 'paraguas', pt: 'guarda-chuva' },
  { es: 'anteojos', pt: 'óculos' },
  { es: 'reloj', pt: 'relógio' },
  { es: 'libro', pt: 'livro' },
  { es: 'lápiz', pt: 'lápis' },
  { es: 'cama', pt: 'cama' },
  { es: 'puerta', pt: 'porta' },
  { es: 'ventana', pt: 'janela' },
  { es: 'taza', pt: 'xícara' }, // REVISAR: "xícara" en BR = taza pequeña de café
  { es: 'mochila', pt: 'mochila' },
  { es: 'botella', pt: 'garrafa' },
  { es: 'cuchillo', pt: 'faca' },
  // Naturaleza (12)
  { es: 'sol', pt: 'sol' },
  { es: 'luna', pt: 'lua' },
  { es: 'árbol', pt: 'árvore' },
  { es: 'montaña', pt: 'montanha' },
  { es: 'río', pt: 'rio' },
  { es: 'flor', pt: 'flor' },
  { es: 'nube', pt: 'nuvem' },
  { es: 'lluvia', pt: 'chuva' },
  { es: 'estrella', pt: 'estrela' },
  { es: 'playa', pt: 'praia' },
  { es: 'ola', pt: 'onda' },
  { es: 'arcoíris', pt: 'arco-íris' },
  // Profesiones (8)
  { es: 'doctor', pt: 'médico' },
  { es: 'bombero', pt: 'bombeiro' },
  { es: 'payaso', pt: 'palhaço' },
  { es: 'maestro', pt: 'professor' },
  { es: 'policía', pt: 'policial' },
  { es: 'astronauta', pt: 'astronauta' },
  { es: 'cocinero', pt: 'cozinheiro' },
  { es: 'rey', pt: 'rei' },
  // Transporte (10)
  { es: 'avión', pt: 'avião' },
  { es: 'barco', pt: 'barco' },
  { es: 'tren', pt: 'trem' },
  { es: 'auto', pt: 'carro' },
  { es: 'colectivo', pt: 'ônibus' },
  { es: 'bicicleta', pt: 'bicicleta' },
  { es: 'helicóptero', pt: 'helicóptero' },
  { es: 'submarino', pt: 'submarino' },
  { es: 'cohete', pt: 'foguete' },
  { es: 'moto', pt: 'moto' },
  // Deportes y juegos (8)
  { es: 'pelota', pt: 'bola' },
  { es: 'ajedrez', pt: 'xadrez' },
  { es: 'dado', pt: 'dado' },
  { es: 'patines', pt: 'patins' },
  { es: 'surf', pt: 'surfe' },
  { es: 'boxeo', pt: 'boxe' },
  { es: 'tenis', pt: 'tênis' },
  { es: 'arco', pt: 'arco' },
  // Cuerpo (7)
  { es: 'ojo', pt: 'olho' },
  { es: 'nariz', pt: 'nariz' },
  { es: 'boca', pt: 'boca' },
  { es: 'mano', pt: 'mão' },
  { es: 'pie', pt: 'pé' },
  { es: 'oreja', pt: 'orelha' },
  { es: 'corazón', pt: 'coração' },
  // Ropa (6)
  { es: 'sombrero', pt: 'chapéu' },
  { es: 'zapato', pt: 'sapato' },
  { es: 'camisa', pt: 'camisa' },
  { es: 'vestido', pt: 'vestido' },
  { es: 'guantes', pt: 'luvas' },
  { es: 'media', pt: 'meia' },
  // Casa (5)
  { es: 'casa', pt: 'casa' },
  { es: 'cocina', pt: 'cozinha' },
  { es: 'baño', pt: 'banheiro' },
  { es: 'escalera', pt: 'escada' },
  { es: 'chimenea', pt: 'lareira' },
  // Formas (4)
  { es: 'círculo', pt: 'círculo' },
  { es: 'triángulo', pt: 'triângulo' },
  { es: 'cuadrado', pt: 'quadrado' },
  { es: 'flecha', pt: 'seta' },
  // Herramientas (5)
  { es: 'martillo', pt: 'martelo' },
  { es: 'tijeras', pt: 'tesoura' },
  { es: 'escoba', pt: 'vassoura' },
  { es: 'linterna', pt: 'lanterna' },
  { es: 'candado', pt: 'cadeado' },
  // Instrumentos (7)
  { es: 'piano', pt: 'piano' },
  { es: 'guitarra', pt: 'violão' },
  { es: 'tambor', pt: 'tambor' },
  { es: 'trompeta', pt: 'trompete' },
  { es: 'flauta', pt: 'flauta' },
  { es: 'violín', pt: 'violino' },
  { es: 'micrófono', pt: 'microfone' },
  // Misc (18)
  { es: 'globo', pt: 'balão' }, // REVISAR: "globo" en BR evoca más una esfera/globe
  { es: 'regalo', pt: 'presente' },
  { es: 'vela', pt: 'vela' },
  { es: 'corona', pt: 'coroa' },
  { es: 'espada', pt: 'espada' },
  { es: 'fantasma', pt: 'fantasma' },
  { es: 'robot', pt: 'robô' },
  { es: 'cámara', pt: 'câmera' },
  { es: 'televisión', pt: 'televisão' },
  { es: 'teléfono', pt: 'telefone' },
  { es: 'computadora', pt: 'computador' },
  { es: 'puente', pt: 'ponte' },
  { es: 'castillo', pt: 'castelo' },
  { es: 'bandera', pt: 'bandeira' },
  { es: 'semáforo', pt: 'semáforo' },
  { es: 'anillo', pt: 'anel' },
  { es: 'collar', pt: 'colar' },
  { es: 'espejo', pt: 'espelho' },
];

const WORDS_ES_ONLY = [
  'asado', 'mate', 'empanada', 'choripán', 'medialuna',
  'alfajor', 'dulce de leche', 'milanesa', 'locro', 'tango',
  'poncho', 'gaucho', 'bandoneón', 'boleadoras', 'chimichurri',
];

const WORDS_PT_ONLY = [
  'feijoada', 'brigadeiro', 'açaí', 'samba', 'pão de queijo',
  'coxinha', 'caipirinha', 'farofa', 'capoeira', 'carnaval',
  'forró', 'churrasco',
];

// =================================================================
// GAME STATE
// =================================================================

const rooms = new Map();
const disconnectTimers = new Map(); // userId -> timer

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

function pickWordForRoom(room) {
  const languages = room.settings?.languages || ['es'];
  const isBilingual = languages.length >= 2;
  const recentEs = new Set((room.recentWords || []).map(w => normalize(w.es || w)));
  const recentPt = new Set((room.recentWords || []).map(w => normalize(w.pt || w)));

  if (isBilingual) {
    const pool = WORDS_BILINGUAL.filter(
      w => !recentEs.has(normalize(w.es)) && !recentPt.has(normalize(w.pt))
    );
    const list = pool.length > 0 ? pool : WORDS_BILINGUAL;
    return list[Math.floor(Math.random() * list.length)];
  } else if (languages[0] === 'pt') {
    const ptPool = [...WORDS_BILINGUAL.map(w => w.pt), ...WORDS_PT_ONLY];
    const pool = ptPool.filter(w => !recentPt.has(normalize(w)));
    const list = pool.length > 0 ? pool : ptPool;
    const word = list[Math.floor(Math.random() * list.length)];
    return { es: word, pt: word };
  } else {
    const esPool = [...WORDS_BILINGUAL.map(w => w.es), ...WORDS_ES_ONLY];
    const pool = esPool.filter(w => !recentEs.has(normalize(w)));
    const list = pool.length > 0 ? pool : esPool;
    const word = list[Math.floor(Math.random() * list.length)];
    return { es: word, pt: word };
  }
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

function viewForPlayer(room, playerId) {
  const isDrawer = room.currentDrawerId === playerId;
  const me = room.players.find(p => p.id === playerId);
  const reveal = isDrawer || room.status === 'roundEnd' || room.status === 'gameEnd' || me?.hasGuessedThisRound;

  const languages = room.settings.languages || ['es'];
  const isBilingual = languages.length >= 2;

  // Determine which language word to use for this player
  const playerLang = (me?.preferredLang && languages.includes(me.preferredLang))
    ? me.preferredLang
    : languages[0];

  const myWord = playerLang === 'pt' ? room.currentWordPt : room.currentWordEs;
  const myRevealedIndices = playerLang === 'pt'
    ? (room.revealedIndicesPt || [])
    : (room.revealedIndicesEs || []);

  let currentWordDisplay = null;
  let maskedWord = '';
  let wordLength = 0;

  if (room.currentWordEs) {
    if (reveal) {
      if (isDrawer) {
        currentWordDisplay = isBilingual
          ? `${room.currentWordEs} / ${room.currentWordPt}`
          : room.currentWordEs;
      } else {
        currentWordDisplay = myWord;
      }
    } else {
      maskedWord = maskWord(myWord, myRevealedIndices);
      wordLength = myWord.length;
    }
  }

  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players.map(p => ({
      id: p.id, name: p.name, score: p.score,
      hasGuessedThisRound: p.hasGuessedThisRound,
      guessedAt: p.guessedAt,
      avatarSeed: p.avatarSeed,
      avatarEmoji: p.avatarEmoji || null,
    })),
    settings: room.settings,
    status: room.status,
    currentRound: room.currentRound,
    currentDrawerId: room.currentDrawerId,
    currentWord: currentWordDisplay,
    maskedWord,
    wordLength,
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
  const wordPair = pickWordForRoom(room);

  const languages = room.settings.languages || ['es'];
  const isBilingual = languages.length >= 2;

  room.status = 'playing';
  room.currentDrawerId = drawerId;
  room.currentWordEs = wordPair.es;
  room.currentWordPt = wordPair.pt;
  room.revealedIndicesEs = [];
  room.revealedIndicesPt = [];
  room.revealedWord = null;
  room.roundStartTime = Date.now();
  room.roundEndTime = Date.now() + (room.settings.roundDuration * 1000);
  room.recentWords = [...(room.recentWords || []), wordPair].slice(-30);
  room.strokes = [];
  room.players.forEach(p => {
    p.hasGuessedThisRound = false;
    p.guessedAt = null;
    p.guessOrder = null;
  });

  const drawer = room.players.find(p => p.id === drawerId);
  pushChat(room, { type: 'system', message: `${drawer?.name || '?'} dibuja ahora` });

  room.roundTimer = setTimeout(() => {
    if (room.status === 'playing') endRound(room);
  }, room.settings.roundDuration * 1000);

  // Schedule hint reveals per language
  const wordLetters = wordPair.es.replace(/\s/g, '').length;
  const hintsCount = Math.max(0, Math.floor(wordLetters / 3));
  room.hintTimers = [];
  for (let i = 1; i <= hintsCount; i++) {
    const at = (room.settings.roundDuration * 1000) * (i / (hintsCount + 1));
    const t = setTimeout(() => {
      if (room.status !== 'playing') return;

      // Reveal a letter for ES word
      const hiddenEs = [];
      for (let idx = 0; idx < wordPair.es.length; idx++) {
        if (wordPair.es[idx] !== ' ' && !room.revealedIndicesEs.includes(idx)) hiddenEs.push(idx);
      }
      if (hiddenEs.length > 0) {
        room.revealedIndicesEs.push(hiddenEs[Math.floor(Math.random() * hiddenEs.length)]);
      }

      if (isBilingual) {
        // Reveal a letter for PT word independently
        const hiddenPt = [];
        for (let idx = 0; idx < wordPair.pt.length; idx++) {
          if (wordPair.pt[idx] !== ' ' && !room.revealedIndicesPt.includes(idx)) hiddenPt.push(idx);
        }
        if (hiddenPt.length > 0) {
          room.revealedIndicesPt.push(hiddenPt[Math.floor(Math.random() * hiddenPt.length)]);
        }
      } else {
        // Mono mode: both words are the same, share indices
        room.revealedIndicesPt = [...room.revealedIndicesEs];
      }

      broadcastRoom(room.code);
    }, at);
    room.hintTimers.push(t);
  }

  broadcastRoom(room.code);
}

function endRound(room) {
  clearAllTimers(room);

  const languages = room.settings.languages || ['es'];
  const isBilingual = languages.length >= 2;

  const guessers = room.players.filter(p => p.id !== room.currentDrawerId);
  const correctCount = guessers.filter(p => p.hasGuessedThisRound).length;
  const drawerBonus = correctCount * 25;
  const drawer = room.players.find(p => p.id === room.currentDrawerId);
  if (drawer) drawer.score += drawerBonus;

  room.status = 'roundEnd';
  const wordDisplay = isBilingual
    ? `${room.currentWordEs} / ${room.currentWordPt}`
    : room.currentWordEs;
  room.revealedWord = wordDisplay;
  pushChat(room, { type: 'system', message: `La palabra era: ${wordDisplay}` });
  if (drawer && drawerBonus > 0) {
    pushChat(room, { type: 'system', message: `${drawer.name} ganó +${drawerBonus} pts por dibujar` });
  }

  broadcastRoom(room.code);
  room.endRoundTimer = setTimeout(() => advanceToNextTurn(room), 5000);
}

function advanceToNextTurn(room) {
  clearAllTimers(room);
  let nextIdx = room.currentDrawerIndex + 1;
  while (nextIdx < room.drawerOrder.length) {
    if (room.players.find(p => p.id === room.drawerOrder[nextIdx])) break;
    nextIdx++;
  }

  if (nextIdx >= room.drawerOrder.length) {
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

  socket.on('createRoom', ({ name, preferredLang, avatarEmoji }, ack) => {
    const cleanName = (name || '').toString().trim().slice(0, 20);
    if (!cleanName) return ack?.({ error: 'Nombre requerido' });
    const lang = ['es', 'pt'].includes(preferredLang) ? preferredLang : 'es';
    const code = genRoomCode();
    const userId = genId();
    const room = {
      code, hostId: userId,
      players: [{
        id: userId, socketId: socket.id, name: cleanName,
        avatarSeed: Math.floor(Math.random() * 1000),
        avatarEmoji: avatarEmoji || null,
        score: 0, hasGuessedThisRound: false, guessedAt: null,
        preferredLang: lang,
      }],
      settings: { totalRounds: 3, roundDuration: 80, languages: ['es'] },
      status: 'lobby',
      currentRound: 0, drawerOrder: [], currentDrawerIndex: 0,
      currentDrawerId: null,
      currentWordEs: null, currentWordPt: null,
      revealedIndicesEs: [], revealedIndicesPt: [],
      revealedWord: null,
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

  socket.on('joinRoom', ({ code, name, preferredLang, avatarEmoji }, ack) => {
    const c = (code || '').toString().trim().toUpperCase();
    const cleanName = (name || '').toString().trim().slice(0, 20) || 'Jugador';
    const lang = ['es', 'pt'].includes(preferredLang) ? preferredLang : 'es';
    const room = rooms.get(c);
    if (!room) return ack?.({ error: 'Sala no encontrada' });
    if (room.players.length >= 12) return ack?.({ error: 'Sala llena' });
    const userId = genId();
    room.players.push({
      id: userId, socketId: socket.id, name: cleanName,
      avatarSeed: Math.floor(Math.random() * 1000),
      avatarEmoji: avatarEmoji || null,
      score: 0, hasGuessedThisRound: false, guessedAt: null,
      preferredLang: lang,
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
    if (settings.languages && Array.isArray(settings.languages)) {
      const valid = settings.languages.filter(l => ['es', 'pt'].includes(l));
      if (valid.length > 0) room.settings.languages = valid.slice(0, 2);
    }
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

  socket.on('reaction', ({ type }) => {
    const room = rooms.get(myRoomCode);
    if (!room || room.status !== 'playing') return;
    const me = room.players.find(p => p.id === myUserId);
    if (!me || room.currentDrawerId === myUserId) return;
    const emoji = type === 'up' ? '👍' : '👎';
    pushChat(room, { type: 'reaction', playerName: me.name, emoji });
    broadcastRoom(myRoomCode);
  });

  socket.on('chat', (text) => {
    const room = rooms.get(myRoomCode);
    if (!room) return;
    const me = room.players.find(p => p.id === myUserId);
    if (!me) return;
    const t = (text || '').toString().slice(0, 60).trim();
    if (!t) return;

    if (room.status === 'playing' && room.currentDrawerId !== myUserId && !me.hasGuessedThisRound) {
      const guess = normalize(t);
      const targetEs = normalize(room.currentWordEs || '');
      const targetPt = normalize(room.currentWordPt || '');

      if (guess === targetEs || guess === targetPt) {
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

      const isCloseEs = targetEs.length >= 4 && guess.length === targetEs.length && levenshtein(guess, targetEs) === 1;
      const isClosePt = targetPt.length >= 4 && guess.length === targetPt.length && levenshtein(guess, targetPt) === 1;
      const isClose = isCloseEs || isClosePt;

      pushChat(room, {
        type: isClose ? 'close' : 'message',
        playerId: myUserId, playerName: me.name, message: t
      });
      broadcastRoom(myRoomCode);
      return;
    }

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

  socket.on('disconnect', () => {
    if (!myRoomCode || !myUserId) return;
    const room = rooms.get(myRoomCode);
    if (!room) { myRoomCode = null; myUserId = null; return; }

    const player = room.players.find(p => p.id === myUserId);
    if (!player) return;

    player.connected = false;

    if (disconnectTimers.has(myUserId)) {
      clearTimeout(disconnectTimers.get(myUserId));
    }

    const capturedRoomCode = myRoomCode;
    const capturedUserId = myUserId;
    const capturedName = player.name;

    // 5 minutos para reconectar antes de remover al jugador
    const timer = setTimeout(() => {
      disconnectTimers.delete(capturedUserId);
      const r = rooms.get(capturedRoomCode);
      if (!r) return;
      const p = r.players.find(pl => pl.id === capturedUserId);
      if (!p || p.connected) return; // ya reconectó

      const wasDrawer = r.currentDrawerId === capturedUserId;
      r.players = r.players.filter(pl => pl.id !== capturedUserId);
      pushChat(r, { type: 'system', message: `${capturedName} abandonó` });

      if (r.hostId === capturedUserId && r.players.length > 0) {
        r.hostId = r.players[0].id;
        pushChat(r, { type: 'system', message: `${r.players[0].name} es el nuevo anfitrión` });
      }

      if (r.players.length === 0) {
        clearAllTimers(r);
        rooms.delete(capturedRoomCode);
      } else if (r.status === 'playing' && (wasDrawer || r.players.length < 2)) {
        endRound(r);
      } else {
        broadcastRoom(capturedRoomCode);
      }
    }, 300000);

    disconnectTimers.set(myUserId, timer);
    pushChat(room, { type: 'system', message: `${player.name} se desconectó...` });
    broadcastRoom(myRoomCode);
    myRoomCode = null;
    myUserId = null;
  });

  socket.on('leave', () => {
    if (myUserId && disconnectTimers.has(myUserId)) {
      clearTimeout(disconnectTimers.get(myUserId));
      disconnectTimers.delete(myUserId);
    }
    handleLeave();
  });

  socket.on('rejoinRoom', ({ code, userId }, ack) => {
    const room = rooms.get(code);
    if (!room) return ack?.({ error: 'Sala no encontrada' });

    const player = room.players.find(p => p.id === userId);
    if (!player) return ack?.({ error: 'Sesión expirada' });

    if (disconnectTimers.has(userId)) {
      clearTimeout(disconnectTimers.get(userId));
      disconnectTimers.delete(userId);
    }

    player.socketId = socket.id;
    player.connected = true;
    socket.join(code);
    myRoomCode = code;
    myUserId = userId;

    pushChat(room, { type: 'system', message: `${player.name} volvió` });
    ack?.({ code, userId });
    broadcastRoom(code);
  });

  function handleLeave() {
    if (!myRoomCode) return;
    const room = rooms.get(myRoomCode);
    if (!room) { myRoomCode = null; myUserId = null; return; }

    if (myUserId && disconnectTimers.has(myUserId)) {
      clearTimeout(disconnectTimers.get(myUserId));
      disconnectTimers.delete(myUserId);
    }

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
