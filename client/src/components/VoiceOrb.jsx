import { useEffect, useRef } from 'react';

const STATE_MAP = {
  idle: { color: '#7b6cf6', label: 'Click or press Space to talk', icon: 'mic' },
  listening: { color: '#34d399', label: 'Listening...', icon: 'stop' },
  processing: { color: '#fbbf24', label: 'Thinking...', icon: 'dots' },
  speaking: { color: '#7b6cf6', label: 'Click to interrupt', icon: 'wave' },
  error: { color: '#f87171', label: 'Try again', icon: 'mic' },
};

export function VoiceOrb({ status, interimTranscript, onClick }) {
  const cfg = STATE_MAP[status] || STATE_MAP.idle;
  const canvasRef = useRef(null);

  // Waveform for listening
  useEffect(() => {
    if (status !== 'listening') return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let id, t = 0;
    const draw = () => {
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(52,211,153,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h/2 + Math.sin(x/w*Math.PI*4+t)*6 + Math.sin(x/w*Math.PI*7+t*1.4)*3;
        x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
      t += 0.06;
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, [status]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Interim transcript */}
      {status === 'listening' && interimTranscript && (
        <div className="text-xs px-4 py-2 rounded-xl max-w-[280px] text-center"
          style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          {interimTranscript}...
        </div>
      )}

      {/* Waveform */}
      {status === 'listening' && (
        <canvas ref={canvasRef} width={140} height={24} className="opacity-70" />
      )}

      {/* Orb */}
      <button onClick={onClick}
        className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center cursor-pointer outline-none border-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${cfg.color}20, ${cfg.color}08)`,
          border: `1.5px solid ${cfg.color}40`,
          boxShadow: status === 'listening'
            ? `0 0 25px ${cfg.color}30, 0 0 60px ${cfg.color}08`
            : `0 0 15px ${cfg.color}12`,
          animation: status === 'idle' ? 'orb-breathe 3.5s ease-in-out infinite' :
                     status === 'listening' ? 'orb-listen-glow 1.5s ease-in-out infinite' : 'none',
        }}
        aria-label={cfg.label}
      >
        {/* Pulse ring — listening */}
        {status === 'listening' && (
          <div className="absolute inset-0 rounded-full" style={{
            border: `1.5px solid ${cfg.color}30`,
            animation: 'orb-pulse-ring 2s ease-out infinite',
          }} />
        )}

        {/* Spin ring — thinking */}
        {status === 'processing' && (
          <div className="absolute inset-[-5px] rounded-full" style={{
            border: '2px solid transparent',
            borderTopColor: cfg.color,
            borderRightColor: `${cfg.color}40`,
            animation: 'orb-think-spin 1s linear infinite',
          }} />
        )}

        {/* Wave ring — speaking */}
        {status === 'speaking' && (
          <div className="absolute inset-[-2px] rounded-full" style={{
            background: `${cfg.color}10`,
            animation: 'orb-speak-wave 1.8s ease-in-out infinite',
          }} />
        )}

        {/* Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke={cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          className="relative z-10">
          {status === 'listening' ? (
            <rect x="7" y="7" width="10" height="10" rx="2" fill={cfg.color} stroke="none" />
          ) : status === 'processing' ? (
            <>
              <circle cx="8" cy="12" r="1.5" fill={cfg.color} stroke="none" style={{animation:'dot-bounce 1.2s 0s infinite'}} />
              <circle cx="12" cy="12" r="1.5" fill={cfg.color} stroke="none" style={{animation:'dot-bounce 1.2s 0.15s infinite'}} />
              <circle cx="16" cy="12" r="1.5" fill={cfg.color} stroke="none" style={{animation:'dot-bounce 1.2s 0.3s infinite'}} />
            </>
          ) : status === 'speaking' ? (
            <>
              <rect x="4" y="9" width="2" height="6" rx="1" fill={cfg.color} stroke="none" style={{animation:'orb-speak-wave 1s 0s infinite'}} />
              <rect x="8" y="6" width="2" height="12" rx="1" fill={cfg.color} stroke="none" style={{animation:'orb-speak-wave 1s 0.1s infinite'}} />
              <rect x="12" y="8" width="2" height="8" rx="1" fill={cfg.color} stroke="none" style={{animation:'orb-speak-wave 1s 0.2s infinite'}} />
              <rect x="16" y="5" width="2" height="14" rx="1" fill={cfg.color} stroke="none" style={{animation:'orb-speak-wave 1s 0.3s infinite'}} />
              <rect x="20" y="9" width="2" height="6" rx="1" fill={cfg.color} stroke="none" style={{animation:'orb-speak-wave 1s 0.4s infinite'}} />
            </>
          ) : (
            <>
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </>
          )}
        </svg>
      </button>

      {/* Label */}
      <span className="text-[11px] font-medium tracking-wider uppercase"
        style={{ color: cfg.color, animation: status === 'listening' ? 'status-pulse 2s infinite' : 'none' }}>
        {cfg.label}
      </span>
    </div>
  );
}
