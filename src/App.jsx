import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  Pencil, Eraser, Trash2, Send, Users, Trophy, Crown, Copy, Check,
  ArrowRight, Clock, RotateCcw, Home, LogOut, Sparkles
} from 'lucide-react';

// =================================================================
//                          SOCKET CONNECTION
// =================================================================

const socket = io({
  autoConnect: false,
  reconnection: true,
});

// =================================================================
//                          CONSTANTS
// =================================================================

const COLORS = [
  '#1a1a1a', '#FFFFFF', '#7F7F7F', '#C8C8C8',
  '#8B0000', '#E63946', '#FF7F27', '#FFD93D',
  '#2A9D8F', '#06AED5', '#3F48CC', '#9B5DE5',
  '#A0522D', '#FFAEC9', '#FFC971', '#F4E4B7',
  '#B5E61D', '#A0E7E5', '#5B8FB9', '#C8BFE7'
];

const BRUSH_SIZES = [3, 7, 14, 24, 38];

// =================================================================
//                          I18N
// =================================================================

const I18N = {
  es: {
    tuNombre: 'Tu nombre',
    comoTeLlamas: '¿Cómo te llamás?',
    crearSala: 'Crear sala',
    unirmeASala: 'Unirme a sala',
    codigoDeSala: 'Código de sala',
    volver: 'Volver',
    entrar: 'Entrar',
    salir: 'Salir',
    jugadores: 'Jugadores',
    configuracion: 'Configuración',
    rondas: 'Rondas',
    segundosTurno: 'Segundos/turno',
    idiomasDeLaSala: 'Idiomas de la sala',
    empezar: '¡EMPEZAR!',
    necesitasAlMenos2: 'Necesitás al menos 2 jugadores',
    esperandoAnfitrion: 'Esperando que el anfitrión empiece...',
    esperandoMasJugadores: 'Esperando que se sumen más jugadores...',
    compartiElCodigo: 'Compartí el código de 4 letras con tus amigos',
    copiarLink: 'Copiar link de invitación',
    copiado: '¡Copiado!',
    tocaParaCopiar: 'Tocá para copiar',
    tuPalabra: 'Tu palabra',
    letrasAdivina: 'letras — adiviná',
    adivinaste: '¡Adivinaste!',
    estaDibujando: 'está dibujando...',
    chat: 'Chat',
    estasDibujando: 'Estás dibujando...',
    yaAdivinaste: '¡Ya adivinaste!',
    esperaProximaRonda: 'Esperá la próxima ronda...',
    escribiTuIntento: 'Escribí tu intento...',
    adivino: 'adivinó',
    cerca: '(¡cerca!)',
    laPalabraEra: 'La palabra era:',
    finDeTurno: 'Fin de turno',
    proximoTurno: 'Próximo turno...',
    finDelJuego: 'FIN DEL JUEGO',
    ganador: '¡GANADOR!',
    tablaFinal: 'Tabla final',
    otraVez: 'Otra vez',
    elAnfitriondecide: 'El anfitrión decide...',
    conectando: 'Conectando...',
    subtitulo: 'Multijugador online — pasala bien con tus amigos',
    dibujayAdivina: 'DIBUJÁ Y ADIVINÁ',
    ronda: 'Ronda',
    adivinaron: 'adivinaron',
    vos: 'vos',
  },
  pt: {
    tuNombre: 'Seu nome',
    comoTeLlamas: 'Como você se chama?',
    crearSala: 'Criar sala',
    unirmeASala: 'Entrar na sala',
    codigoDeSala: 'Código da sala',
    volver: 'Voltar',
    entrar: 'Entrar',
    salir: 'Sair',
    jugadores: 'Jogadores',
    configuracion: 'Configuração',
    rondas: 'Rodadas',
    segundosTurno: 'Segundos/turno',
    idiomasDeLaSala: 'Idiomas da sala',
    empezar: 'COMEÇAR!',
    necesitasAlMenos2: 'Precisa de pelo menos 2 jogadores',
    esperandoAnfitrion: 'Aguardando o anfitrião começar...',
    esperandoMasJugadores: 'Aguardando mais jogadores...',
    compartiElCodigo: 'Compartilhe o código de 4 letras com seus amigos',
    copiarLink: 'Copiar link de convite',
    copiado: 'Copiado!',
    tocaParaCopiar: 'Toque para copiar',
    tuPalabra: 'Sua palavra',
    letrasAdivina: 'letras — adivinhe',
    adivinaste: 'Você adivinhou!',
    estaDibujando: 'está desenhando...',
    chat: 'Chat',
    estasDibujando: 'Você está desenhando...',
    yaAdivinaste: 'Você já adivinhou!',
    esperaProximaRonda: 'Aguarde a próxima rodada...',
    escribiTuIntento: 'Escreva sua tentativa...',
    adivino: 'adivinhou',
    cerca: '(quase!)',
    laPalabraEra: 'A palavra era:',
    finDeTurno: 'Fim do turno',
    proximoTurno: 'Próximo turno...',
    finDelJuego: 'FIM DO JOGO',
    ganador: 'VENCEDOR!',
    tablaFinal: 'Placar final',
    otraVez: 'Jogar de novo',
    elAnfitriondecide: 'O anfitrião decide...',
    conectando: 'Conectando...',
    subtitulo: 'Multijogador online — divirta-se com seus amigos',
    dibujayAdivina: 'DESENHE E ADIVINHE',
    ronda: 'Rodada',
    adivinaron: 'adivinharam',
    vos: 'você',
  },
};

function t(key, lang) {
  return I18N[lang]?.[key] ?? I18N.es[key] ?? key;
}

// =================================================================
//                          HELPERS
// =================================================================

const stringToColor = (seed) => {
  const palette = ['#FFB4A2', '#FFD93D', '#A0E7E5', '#B5E48C', '#FFAEC9', '#9B5DE5', '#06AED5', '#F9C74F'];
  return palette[Math.abs(seed || 0) % palette.length];
};

const renderMaskedDisplay = (masked) =>
  masked.split('').map((c, i) => (
    <span
      key={i}
      className={c === '_'
        ? 'inline-block w-3 sm:w-4 mx-[2px] border-b-[3px] border-current'
        : 'inline-block mx-[2px]'
      }
    >
      {c === '_' ? '\u00A0' : c === ' ' ? '\u00A0\u00A0' : c}
    </span>
  ));

// =================================================================
//                          DRAWING CANVAS
// =================================================================

function DrawingCanvas({ strokes, isDrawer, color, brushSize, tool, onStrokeComplete }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const currentStroke = useRef(null);

  const drawStroke = (ctx, stroke) => {
    const { color: c, size, points, eraser } = stroke;
    ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = c;
    ctx.fillStyle = c;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (!points || points.length < 2) {
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  const fullRedraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const item of strokes) {
      if (item.type === 'clear') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (item.type === 'stroke') {
        drawStroke(ctx, item);
      }
    }
    if (currentStroke.current) drawStroke(ctx, currentStroke.current);
  }, [strokes]);

  useEffect(() => { fullRedraw(); }, [fullRedraw]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = e.touches?.[0] ?? e.changedTouches?.[0] ?? e;
    return {
      x: (point.clientX - rect.left) * scaleX,
      y: (point.clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e) => {
    if (!isDrawer) return;
    if (e.cancelable) e.preventDefault();
    setDrawing(true);
    const pos = getPos(e);
    currentStroke.current = {
      type: 'stroke',
      color, size: brushSize,
      eraser: tool === 'eraser',
      points: [pos],
    };
    fullRedraw();
  };

  const handleMove = (e) => {
    if (!drawing || !isDrawer || !currentStroke.current) return;
    if (e.cancelable) e.preventDefault();
    const pos = getPos(e);
    const last = currentStroke.current.points[currentStroke.current.points.length - 1];
    if (Math.abs(last.x - pos.x) < 0.5 && Math.abs(last.y - pos.y) < 0.5) return;
    currentStroke.current.points.push(pos);
    const ctx = canvasRef.current.getContext('2d');
    const s = currentStroke.current;
    ctx.globalCompositeOperation = s.eraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const prev = s.points[s.points.length - 2];
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

  const handleEnd = (e) => {
    if (!drawing || !isDrawer) return;
    if (e?.cancelable) e.preventDefault();
    setDrawing(false);
    if (currentStroke.current && currentStroke.current.points.length > 0) {
      onStrokeComplete(currentStroke.current);
    }
    currentStroke.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={700}
      className={`w-full h-full bg-white rounded-2xl ${isDrawer ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      style={{ touchAction: 'none' }}
    />
  );
}

// =================================================================
//                          HOME SCREEN
// =================================================================

function HomeScreen({ name, setName, joinCode, setJoinCode, onCreate, onJoin, error, busy, preferredLang, setPreferredLang }) {
  const [mode, setMode] = useState(null);
  const tk = (key) => t(key, preferredLang);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative" style={{ background: '#FAF5E9' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full" style={{ background: '#FFD93D', opacity: 0.4 }} />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full" style={{ background: '#FF6B6B', opacity: 0.35 }} />
        <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full" style={{ background: '#4ECDC4', opacity: 0.25 }} />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-block transform -rotate-2 mb-4">
            <div className="bg-yellow-300 px-6 py-2 border-[3px] border-black" style={{ boxShadow: '6px 6px 0 0 #1a1a1a' }}>
              <span className="text-sm font-bold tracking-widest">{tk('dibujayAdivina')}</span>
            </div>
          </div>
          <h1 className="text-7xl sm:text-8xl leading-none" style={{ fontFamily: '"Bagel Fat One", cursive', color: '#1a1a1a', textShadow: '5px 5px 0 #FF6B6B' }}>
            DIBUJALE
          </h1>
          <p className="mt-4 text-lg font-bold opacity-80">
            {tk('subtitulo')}
          </p>
        </div>

        <div className="bg-white border-[3px] border-black rounded-3xl p-6 sm:p-8" style={{ boxShadow: '8px 8px 0 0 #1a1a1a' }}>
          <label className="block mb-2 text-sm font-bold tracking-wide uppercase">{tk('tuNombre')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tk('comoTeLlamas')}
            maxLength={20}
            className="w-full px-4 py-3 text-lg border-[3px] border-black rounded-xl focus:outline-none bg-yellow-50 font-bold"
          />

          {/* Language picker */}
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPreferredLang('es')}
                className="px-4 py-3 border-[3px] border-black rounded-xl font-bold text-lg transition-transform hover:-translate-y-0.5"
                style={{
                  background: preferredLang === 'es' ? '#FFD93D' : '#FFFFFF',
                  boxShadow: '4px 4px 0 0 #1a1a1a',
                }}
              >
                🇪🇸 Español
              </button>
              <button
                onClick={() => setPreferredLang('pt')}
                className="px-4 py-3 border-[3px] border-black rounded-xl font-bold text-lg transition-transform hover:-translate-y-0.5"
                style={{
                  background: preferredLang === 'pt' ? '#FFD93D' : '#FFFFFF',
                  boxShadow: '4px 4px 0 0 #1a1a1a',
                }}
              >
                🇧🇷 Português
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-2 bg-red-100 border-2 border-red-400 rounded-lg text-red-800 text-sm font-bold">
              {error}
            </div>
          )}

          {mode === null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => name.trim() && onCreate()}
                disabled={!name.trim() || busy}
                className="px-6 py-4 bg-pink-400 border-[3px] border-black rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-translate-y-0.5 hover:translate-x-0.5 active:translate-y-0 active:translate-x-0"
                style={{ boxShadow: '5px 5px 0 0 #1a1a1a' }}
              >
                <Sparkles className="inline w-5 h-5 mr-2" />
                {tk('crearSala')}
              </button>
              <button
                onClick={() => name.trim() && setMode('join')}
                disabled={!name.trim() || busy}
                className="px-6 py-4 bg-cyan-300 border-[3px] border-black rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: '5px 5px 0 0 #1a1a1a' }}
              >
                <ArrowRight className="inline w-5 h-5 mr-2" />
                {tk('unirmeASala')}
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="mt-6">
              <label className="block mb-2 text-sm font-bold tracking-wide uppercase">{tk('codigoDeSala')}</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                className="w-full px-4 py-3 text-2xl tracking-[0.5em] text-center border-[3px] border-black rounded-xl focus:outline-none bg-cyan-50 uppercase"
                style={{ fontFamily: '"Bagel Fat One", cursive' }}
              />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => setMode(null)}
                  className="px-4 py-3 bg-gray-200 border-[3px] border-black rounded-xl font-bold transition-transform hover:-translate-y-0.5"
                  style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}
                >{tk('volver')}</button>
                <button
                  onClick={onJoin}
                  disabled={joinCode.length !== 4 || busy}
                  className="px-4 py-3 bg-green-400 border-[3px] border-black rounded-xl font-bold disabled:opacity-50 transition-transform hover:-translate-y-0.5"
                  style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}
                >{tk('entrar')}</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm opacity-70">
          {tk('compartiElCodigo')}
        </div>
      </div>
    </div>
  );
}

// =================================================================
//                          LOBBY SCREEN
// =================================================================

function LobbyScreen({ room, userId, onStart, onLeave, onChangeSettings, preferredLang }) {
  const [copied, setCopied] = useState(false);
  const isHost = room.hostId === userId;
  const canStart = room.players.length >= 2;
  const tk = (key) => t(key, preferredLang);

  const copyCode = () => {
    try { navigator.clipboard?.writeText(room.code); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareLink = () => {
    const url = `${window.location.origin}?sala=${room.code}`;
    try { navigator.clipboard?.writeText(url); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentLangs = room.settings?.languages || ['es'];
  const langMode = currentLangs.length >= 2 ? 'both' : currentLangs[0] === 'pt' ? 'pt' : 'es';

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: '#FAF5E9' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-white border-[3px] border-black rounded-xl font-bold text-sm transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}
          >
            <LogOut className="inline w-4 h-4 mr-1" />{tk('salir')}
          </button>
        </div>

        <div className="bg-white border-[3px] border-black rounded-3xl p-6 sm:p-8 mb-6" style={{ boxShadow: '8px 8px 0 0 #1a1a1a' }}>
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">{tk('codigoDeSala')}</p>
            <button
              onClick={copyCode}
              className="mt-2 inline-flex items-center gap-3 px-6 py-3 bg-yellow-300 border-[3px] border-black rounded-2xl transition-transform hover:-translate-y-1"
              style={{ boxShadow: '6px 6px 0 0 #1a1a1a' }}
            >
              <span className="text-5xl tracking-[0.3em]" style={{ fontFamily: '"Bagel Fat One", cursive' }}>{room.code}</span>
              {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
            </button>
            <p className="mt-3 text-sm opacity-70">{copied ? tk('copiado') : tk('tocaParaCopiar')}</p>
            <button
              onClick={shareLink}
              className="mt-3 px-4 py-2 bg-cyan-200 border-2 border-black rounded-lg text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: '3px 3px 0 0 #1a1a1a' }}
            >
              {tk('copiarLink')}
            </button>
          </div>
        </div>

        <div className="bg-white border-[3px] border-black rounded-3xl p-6 mb-6" style={{ boxShadow: '8px 8px 0 0 #1a1a1a' }}>
          <h2 className="text-2xl mb-4 flex items-center gap-2" style={{ fontFamily: '"Bagel Fat One", cursive' }}>
            <Users className="w-6 h-6" />
            {tk('jugadores')} ({room.players.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {room.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 border-[3px] border-black rounded-xl"
                style={{
                  background: p.id === userId ? '#A0E7E5' : '#FFF',
                  boxShadow: '3px 3px 0 0 #1a1a1a'
                }}
              >
                <div className="w-10 h-10 rounded-full border-[3px] border-black flex items-center justify-center text-lg" style={{ background: stringToColor(p.avatarSeed), fontFamily: '"Bagel Fat One", cursive' }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 font-bold truncate">
                  {p.name}
                  {p.id === userId && <span className="ml-1 opacity-60 text-sm">({tk('vos')})</span>}
                </span>
                {p.id === room.hostId && <Crown className="w-5 h-5 text-yellow-600" />}
              </div>
            ))}
            {room.players.length < 2 && (
              <div className="flex items-center justify-center px-4 py-6 border-[3px] border-dashed border-gray-400 rounded-xl col-span-full text-gray-500 italic">
                {tk('esperandoMasJugadores')}
              </div>
            )}
          </div>
        </div>

        {isHost && (
          <div className="bg-white border-[3px] border-black rounded-3xl p-6 mb-6" style={{ boxShadow: '8px 8px 0 0 #1a1a1a' }}>
            <h2 className="text-xl mb-4" style={{ fontFamily: '"Bagel Fat One", cursive' }}>{tk('configuracion')}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wide">{tk('rondas')}</label>
                <select
                  value={room.settings.totalRounds}
                  onChange={(e) => onChangeSettings({ totalRounds: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border-[3px] border-black rounded-xl font-bold"
                >
                  {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wide">{tk('segundosTurno')}</label>
                <select
                  value={room.settings.roundDuration}
                  onChange={(e) => onChangeSettings({ roundDuration: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border-[3px] border-black rounded-xl font-bold"
                >
                  {[40, 60, 80, 100, 120, 150].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Language settings */}
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wide">{tk('idiomasDeLaSala')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'es', label: '🇪🇸 Español', langs: ['es'] },
                  { key: 'pt', label: '🇧🇷 Português', langs: ['pt'] },
                  { key: 'both', label: '🇪🇸+🇧🇷', langs: ['es', 'pt'] },
                ].map(({ key, label, langs }) => (
                  <button
                    key={key}
                    onClick={() => onChangeSettings({ languages: langs })}
                    className="px-3 py-2 border-[3px] border-black rounded-xl font-bold text-sm transition-transform hover:-translate-y-0.5"
                    style={{
                      background: langMode === key ? '#FFD93D' : '#FFFFFF',
                      boxShadow: '3px 3px 0 0 #1a1a1a',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isHost ? (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full px-6 py-5 bg-pink-400 border-[3px] border-black rounded-2xl text-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-translate-y-1"
            style={{ boxShadow: '8px 8px 0 0 #1a1a1a', fontFamily: '"Bagel Fat One", cursive' }}
          >
            {canStart ? tk('empezar') : tk('necesitasAlMenos2')}
          </button>
        ) : (
          <div className="w-full px-6 py-5 bg-gray-100 border-[3px] border-black rounded-2xl text-center font-bold" style={{ boxShadow: '8px 8px 0 0 #1a1a1a' }}>
            {tk('esperandoAnfitrion')}
          </div>
        )}
      </div>
    </div>
  );
}

// =================================================================
//                          GAME SCREEN
// =================================================================

function GameScreen({ room, userId, localStrokes, onStrokeComplete, onClear, onSendChat, onLeave, preferredLang }) {
  const isDrawer = room.currentDrawerId === userId;
  const me = room.players.find(p => p.id === userId);
  const drawer = room.players.find(p => p.id === room.currentDrawerId);
  const guessersTotal = room.players.filter(p => p.id !== room.currentDrawerId).length;
  const guessedCount = room.players.filter(p => p.hasGuessedThisRound).length;
  const tk = (key) => t(key, preferredLang);

  const [color, setColor] = useState('#1a1a1a');
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [tool, setTool] = useState('pencil');
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.ceil((room.roundEndTime - Date.now()) / 1000));
      setTimeLeft(diff);
    }, 200);
    return () => clearInterval(interval);
  }, [room.roundEndTime]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.chat]);

  const displayStrokes = isDrawer ? localStrokes : room.strokes;

  const handleSendChat = (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    onSendChat(text);
    setChatInput('');
  };

  const isRoundEnd = room.status === 'roundEnd';
  const masked = room.maskedWord || '';

  return (
    <div className="min-h-screen px-2 sm:px-4 py-4" style={{ background: '#FAF5E9' }}>
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={onLeave}
            className="px-3 py-2 bg-white border-[3px] border-black rounded-xl font-bold text-sm transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: '3px 3px 0 0 #1a1a1a' }}
          >
            <Home className="inline w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border-[3px] border-black rounded-xl" style={{ boxShadow: '3px 3px 0 0 #1a1a1a' }}>
            <Clock className="w-5 h-5" />
            <span className="text-2xl tabular-nums" style={{ fontFamily: '"Bagel Fat One", cursive', color: timeLeft <= 10 ? '#E63946' : '#1a1a1a' }}>
              {timeLeft}
            </span>
          </div>

          <div className="px-4 py-2 bg-cyan-200 border-[3px] border-black rounded-xl font-extrabold" style={{ boxShadow: '3px 3px 0 0 #1a1a1a' }}>
            {tk('ronda')} {room.currentRound + 1}/{room.settings.totalRounds}
          </div>

          <div className="flex-1 px-4 py-2 bg-yellow-200 border-[3px] border-black rounded-xl text-center overflow-hidden" style={{ boxShadow: '3px 3px 0 0 #1a1a1a' }}>
            {isRoundEnd ? (
              <div style={{ fontFamily: '"Bagel Fat One", cursive' }} className="text-xl">
                {tk('laPalabraEra')} <span className="text-pink-600">{room.revealedWord}</span>
              </div>
            ) : isDrawer ? (
              <div>
                <div className="text-xs uppercase font-bold opacity-70">{tk('tuPalabra')}</div>
                <div className="text-2xl tracking-wider" style={{ fontFamily: '"Bagel Fat One", cursive' }}>
                  {room.currentWord}
                </div>
              </div>
            ) : me?.hasGuessedThisRound ? (
              <div>
                <div className="text-xs uppercase font-bold opacity-70">{tk('adivinaste')}</div>
                <div className="text-2xl tracking-wider" style={{ fontFamily: '"Bagel Fat One", cursive', color: '#2A9D8F' }}>
                  {room.currentWord}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs uppercase font-bold opacity-70">
                  {room.wordLength} {tk('letrasAdivina')}
                </div>
                <div className="text-2xl" style={{ fontFamily: '"Bagel Fat One", cursive' }}>
                  {renderMaskedDisplay(masked)}
                </div>
              </div>
            )}
          </div>

          <div className="px-3 py-2 bg-pink-200 border-[3px] border-black rounded-xl text-sm font-bold" style={{ boxShadow: '3px 3px 0 0 #1a1a1a' }}>
            {guessedCount}/{guessersTotal} {tk('adivinaron')}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-4">
          {/* Players panel */}
          <div className="bg-white border-[3px] border-black rounded-2xl p-3 order-2 lg:order-1" style={{ boxShadow: '5px 5px 0 0 #1a1a1a' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2">{tk('jugadores')}</h3>
            <div className="space-y-2 max-h-[200px] lg:max-h-none overflow-y-auto">
              {[...room.players].sort((a, b) => b.score - a.score).map((p, idx) => {
                const isCurrent = p.id === room.currentDrawerId;
                const isMe = p.id === userId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-2 py-2 rounded-xl border-2 ${isCurrent ? 'border-pink-500' : 'border-black'} ${p.hasGuessedThisRound ? 'bg-green-100' : 'bg-white'}`}
                  >
                    <div className="text-lg font-bold w-6 text-center opacity-60" style={{ fontFamily: '"Bagel Fat One", cursive' }}>{idx + 1}</div>
                    <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-sm flex-shrink-0" style={{ background: stringToColor(p.avatarSeed), fontFamily: '"Bagel Fat One", cursive' }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate flex items-center gap-1">
                        {p.name}
                        {isMe && <span className="text-[10px] opacity-60">({tk('vos')})</span>}
                        {isCurrent && <Pencil className="w-3 h-3 text-pink-600" />}
                      </div>
                      <div className="text-xs font-bold opacity-70">{p.score} pts</div>
                    </div>
                    {p.hasGuessedThisRound && !isCurrent && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canvas */}
          <div className="order-1 lg:order-2 relative">
            <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden aspect-[10/7]" style={{ boxShadow: '6px 6px 0 0 #1a1a1a' }}>
              <DrawingCanvas
                strokes={displayStrokes}
                isDrawer={isDrawer && !isRoundEnd}
                color={color}
                brushSize={brushSize}
                tool={tool}
                onStrokeComplete={onStrokeComplete}
              />
            </div>

            {isRoundEnd && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-yellow-300 border-[3px] border-black rounded-2xl px-8 py-6 transform -rotate-2" style={{ boxShadow: '8px 8px 0 0 #1a1a1a' }}>
                  <div className="text-center">
                    <div className="text-sm font-bold uppercase">{tk('finDeTurno')}</div>
                    <div className="text-3xl mt-1" style={{ fontFamily: '"Bagel Fat One", cursive' }}>
                      {room.revealedWord}
                    </div>
                    <div className="text-xs mt-2 opacity-70">{tk('proximoTurno')}</div>
                  </div>
                </div>
              </div>
            )}

            {isDrawer && !isRoundEnd && (
              <div className="mt-3 bg-white border-[3px] border-black rounded-2xl p-3 flex flex-wrap items-center gap-2" style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}>
                <div className="flex gap-1">
                  <button onClick={() => setTool('pencil')} className={`p-2 border-2 border-black rounded-lg ${tool === 'pencil' ? 'bg-yellow-300' : 'bg-white'}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setTool('eraser')} className={`p-2 border-2 border-black rounded-lg ${tool === 'eraser' ? 'bg-yellow-300' : 'bg-white'}`}>
                    <Eraser className="w-4 h-4" />
                  </button>
                  <button onClick={onClear} className="p-2 border-2 border-black rounded-lg bg-red-300 hover:bg-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-px h-8 bg-black opacity-20" />
                <div className="flex items-center gap-1">
                  {BRUSH_SIZES.map((s) => (
                    <button key={s} onClick={() => setBrushSize(s)} className={`w-8 h-8 border-2 border-black rounded-lg flex items-center justify-center ${brushSize === s ? 'bg-yellow-300' : 'bg-white'}`}>
                      <div className="rounded-full bg-black" style={{ width: Math.min(s / 2 + 2, 18), height: Math.min(s / 2 + 2, 18) }} />
                    </button>
                  ))}
                </div>
                <div className="w-px h-8 bg-black opacity-20" />
                <div className="flex flex-wrap gap-1">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); setTool('pencil'); }}
                      className={`w-7 h-7 border-2 rounded-md ${color === c && tool === 'pencil' ? 'border-yellow-500 ring-2 ring-yellow-400' : 'border-black'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isDrawer && !isRoundEnd && (
              <div className="mt-3 px-4 py-2 bg-cyan-100 border-[3px] border-black rounded-xl text-center font-bold" style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}>
                <Pencil className="inline w-4 h-4 mr-1" />
                {drawer?.name} {tk('estaDibujando')}
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="bg-white border-[3px] border-black rounded-2xl flex flex-col order-3" style={{ boxShadow: '5px 5px 0 0 #1a1a1a' }}>
            <div className="px-3 py-2 border-b-2 border-black bg-yellow-100 rounded-t-2xl">
              <h3 className="font-bold uppercase text-sm tracking-wider">{tk('chat')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[300px] max-h-[60vh]">
              {(room.chat || []).map((m) => {
                if (m.type === 'system') {
                  return <div key={m.id} className="text-xs italic px-2 py-1 opacity-70 text-center">{m.message}</div>;
                }
                if (m.type === 'correct') {
                  return (
                    <div key={m.id} className="px-2 py-1 bg-green-100 border-2 border-green-500 rounded-lg text-sm font-bold text-green-800">
                      ✓ {m.playerName} {tk('adivino')} (+{m.points} pts)
                    </div>
                  );
                }
                if (m.type === 'close') {
                  return (
                    <div key={m.id} className="px-2 py-1 bg-yellow-100 border border-yellow-500 rounded-lg text-sm">
                      <span className="font-bold">{m.playerName}:</span> {m.message} <span className="italic opacity-70">{tk('cerca')}</span>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="px-2 py-1 text-sm break-words">
                    <span className="font-bold">{m.playerName}:</span> {m.message}
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>
            <form onSubmit={handleSendChat} className="border-t-2 border-black p-2 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isDrawer || me?.hasGuessedThisRound || isRoundEnd}
                placeholder={
                  isDrawer ? tk('estasDibujando') :
                  me?.hasGuessedThisRound ? tk('yaAdivinaste') :
                  isRoundEnd ? tk('esperaProximaRonda') :
                  tk('escribiTuIntento')
                }
                maxLength={50}
                className="flex-1 px-3 py-2 border-2 border-black rounded-lg text-sm focus:outline-none disabled:bg-gray-100 disabled:opacity-60 font-semibold"
              />
              <button
                type="submit"
                disabled={isDrawer || me?.hasGuessedThisRound || isRoundEnd || !chatInput.trim()}
                className="px-3 py-2 bg-pink-300 border-2 border-black rounded-lg disabled:opacity-40 hover:bg-pink-400"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// =================================================================
//                          END SCREEN
// =================================================================

function EndScreen({ room, userId, onPlayAgain, onLeave, preferredLang }) {
  const isHost = room.hostId === userId;
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const tk = (key) => t(key, preferredLang);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative" style={{ background: '#FAF5E9' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-3 h-3" style={{
            top: `${(i * 47) % 100}%`,
            left: `${(i * 73) % 100}%`,
            background: ['#FFD93D', '#FF6B6B', '#4ECDC4', '#9B5DE5'][i % 4],
            transform: `rotate(${i * 37}deg)`,
          }} />
        ))}
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="inline-block transform -rotate-2 mb-3">
            <div className="bg-yellow-300 px-6 py-1 border-[3px] border-black" style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}>
              <span className="text-sm font-bold tracking-widest">{tk('finDelJuego')}</span>
            </div>
          </div>
          <h1 className="text-6xl" style={{ fontFamily: '"Bagel Fat One", cursive', textShadow: '4px 4px 0 #FF6B6B' }}>
            {tk('ganador')}
          </h1>
        </div>

        {winner && (
          <div className="bg-yellow-200 border-[3px] border-black rounded-3xl p-8 mb-6 text-center transform -rotate-1" style={{ boxShadow: '10px 10px 0 0 #1a1a1a' }}>
            <Trophy className="w-16 h-16 mx-auto mb-2 text-yellow-700" />
            <div className="text-4xl mb-2" style={{ fontFamily: '"Bagel Fat One", cursive' }}>{winner.name}</div>
            <div className="text-2xl font-bold">{winner.score} pts</div>
          </div>
        )}

        <div className="bg-white border-[3px] border-black rounded-2xl p-4 mb-6" style={{ boxShadow: '6px 6px 0 0 #1a1a1a' }}>
          <h2 className="text-xl mb-3" style={{ fontFamily: '"Bagel Fat One", cursive' }}>{tk('tablaFinal')}</h2>
          <div className="space-y-2">
            {ranked.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2 border-2 border-black rounded-xl" style={{ background: idx === 0 ? '#FFD93D' : idx === 1 ? '#E0E0E0' : idx === 2 ? '#FFB97A' : '#FFF' }}>
                <div className="text-xl w-8 text-center" style={{ fontFamily: '"Bagel Fat One", cursive' }}>{idx + 1}</div>
                <div className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center" style={{ background: stringToColor(p.avatarSeed), fontFamily: '"Bagel Fat One", cursive' }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 font-bold">
                  {p.name} {p.id === userId && <span className="opacity-60 text-sm">({tk('vos')})</span>}
                </div>
                <div className="text-lg font-bold">{p.score} pts</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {isHost ? (
            <button
              onClick={onPlayAgain}
              className="px-6 py-4 bg-pink-400 border-[3px] border-black rounded-2xl font-bold text-lg transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: '6px 6px 0 0 #1a1a1a', fontFamily: '"Bagel Fat One", cursive' }}
            >
              <RotateCcw className="inline w-5 h-5 mr-1" />{tk('otraVez')}
            </button>
          ) : (
            <div className="px-6 py-4 bg-gray-100 border-[3px] border-black rounded-2xl text-center font-bold text-sm" style={{ boxShadow: '6px 6px 0 0 #1a1a1a' }}>
              {tk('elAnfitriondecide')}
            </div>
          )}
          <button
            onClick={onLeave}
            className="px-6 py-4 bg-cyan-300 border-[3px] border-black rounded-2xl font-bold text-lg transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: '6px 6px 0 0 #1a1a1a', fontFamily: '"Bagel Fat One", cursive' }}
          >
            <Home className="inline w-5 h-5 mr-1" />{tk('salir')}
          </button>
        </div>
      </div>
    </div>
  );
}

// =================================================================
//                          MAIN APP
// =================================================================

export default function App() {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const [preferredLang, setPreferredLang] = useState('es');

  const [localStrokes, setLocalStrokes] = useState([]);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('roomUpdate', (newRoom) => {
      setRoom(newRoom);
    });

    socket.on('stroke', (stroke) => {
      setRoom(prev => {
        if (!prev) return prev;
        return { ...prev, strokes: [...prev.strokes, stroke] };
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomUpdate');
      socket.off('stroke');
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sala = params.get('sala');
    if (sala) setJoinCode(sala.toUpperCase().slice(0, 4));
  }, []);

  useEffect(() => {
    setLocalStrokes([]);
  }, [room?.roundStartTime]);

  const screen = !room
    ? 'home'
    : room.status === 'lobby'
    ? 'lobby'
    : room.status === 'gameEnd'
    ? 'end'
    : 'game';

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    setError('');
    setBusy(true);
    socket.emit('createRoom', { name, preferredLang }, (res) => {
      setBusy(false);
      if (res?.error) { setError(res.error); return; }
      if (res?.userId) setUserId(res.userId);
    });
  };

  const handleJoinRoom = () => {
    if (!name.trim() || !joinCode.trim()) return;
    setError('');
    setBusy(true);
    socket.emit('joinRoom', { name, code: joinCode, preferredLang }, (res) => {
      setBusy(false);
      if (res?.error) { setError(res.error); return; }
      if (res?.userId) setUserId(res.userId);
    });
  };

  const handleLeave = () => {
    socket.emit('leave');
    setRoom(null);
    setUserId(null);
    setLocalStrokes([]);
    if (window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleStartGame = () => socket.emit('startGame');
  const handleChangeSettings = (changes) => socket.emit('changeSettings', changes);
  const handlePlayAgain = () => socket.emit('playAgain');

  const handleStrokeComplete = (stroke) => {
    setLocalStrokes(s => [...s, stroke]);
    socket.emit('stroke', stroke);
  };

  const handleClear = () => {
    setLocalStrokes(s => [...s, { type: 'clear' }]);
    socket.emit('clearCanvas');
  };

  const handleSendChat = (text) => {
    socket.emit('chat', text);
  };

  if (!connected && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF5E9' }}>
        <div className="text-center">
          <div className="text-2xl font-bold animate-pulse" style={{ fontFamily: '"Bagel Fat One", cursive' }}>
            {t('conectando', preferredLang)}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        name={name} setName={setName}
        joinCode={joinCode} setJoinCode={setJoinCode}
        onCreate={handleCreateRoom} onJoin={handleJoinRoom}
        error={error} busy={busy}
        preferredLang={preferredLang} setPreferredLang={setPreferredLang}
      />
    );
  }
  if (screen === 'lobby') {
    return (
      <LobbyScreen
        room={room} userId={userId}
        onStart={handleStartGame} onLeave={handleLeave}
        onChangeSettings={handleChangeSettings}
        preferredLang={preferredLang}
      />
    );
  }
  if (screen === 'game') {
    return (
      <GameScreen
        room={room} userId={userId}
        localStrokes={localStrokes}
        onStrokeComplete={handleStrokeComplete}
        onClear={handleClear}
        onSendChat={handleSendChat}
        onLeave={handleLeave}
        preferredLang={preferredLang}
      />
    );
  }
  if (screen === 'end') {
    return (
      <EndScreen
        room={room} userId={userId}
        onPlayAgain={handlePlayAgain}
        onLeave={handleLeave}
        preferredLang={preferredLang}
      />
    );
  }
  return null;
}
