import { useEffect, useRef } from 'react';

const STATES = {
  idle:       { color: '#8b7cf7', label: 'Click or press Space to talk' },
  listening:  { color: '#3dd68c', label: 'Listening...' },
  processing: { color: '#f0c040', label: 'Thinking...' },
  speaking:   { color: '#8b7cf7', label: 'Click to interrupt' },
  error:      { color: '#f06060', label: 'Try again' },
};

export function VoiceOrb({ status, interimTranscript, onClick }) {
  const { color, label } = STATES[status] || STATES.idle;
  const canvasRef = useRef(null);

  // Waveform for listening
  useEffect(() => {
    if (status !== 'listening') return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let id, t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.strokeStyle = `${color}80`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < c.width; x++) {
        const y = c.height / 2 + Math.sin(x / c.width * Math.PI * 4 + t) * 5 + Math.sin(x / c.width * Math.PI * 7 + t * 1.3) * 3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      t += 0.07;
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, [status, color]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, userSelect: 'none' }}>
      {/* Interim text */}
      {status === 'listening' && interimTranscript && (
        <div style={{
          fontSize: 12, color: 'var(--text-dim)', padding: '6px 14px', borderRadius: 12, maxWidth: 260, textAlign: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          {interimTranscript}...
        </div>
      )}

      {/* Waveform */}
      {status === 'listening' && <canvas ref={canvasRef} width={120} height={20} style={{ opacity: 0.6 }} />}

      {/* Orb button */}
      <button onClick={onClick} style={{
        position: 'relative', width: 68, height: 68, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', border: `1.5px solid ${color}40`, outline: 'none',
        background: `radial-gradient(circle at 40% 35%, ${color}18, ${color}06)`,
        boxShadow: status === 'listening' ? `0 0 30px ${color}25, 0 0 60px ${color}08` : `0 0 12px ${color}10`,
        animation: status === 'idle' ? 'breathe 3.5s ease-in-out infinite' :
                   status === 'listening' ? 'glow-pulse 1.5s ease-in-out infinite' : 'none',
        transition: 'box-shadow 0.4s, border-color 0.4s',
      }}>
        {/* Pulse ring (listening) */}
        {status === 'listening' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `1.5px solid ${color}25`,
            animation: 'ring-out 2s ease-out infinite',
          }} />
        )}

        {/* Spin ring (thinking) */}
        {status === 'processing' && (
          <div style={{
            position: 'absolute', inset: -5, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: color, borderRightColor: `${color}30`,
            animation: 'spin 1s linear infinite',
          }} />
        )}

        {/* Icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
          {status === 'listening' ? (
            <rect x="7" y="7" width="10" height="10" rx="2" fill={color} stroke="none" />
          ) : status === 'processing' ? (
            <>
              <circle cx="7" cy="12" r="1.5" fill={color} stroke="none" style={{ animation: 'bounce-dot 1.2s 0s infinite' }} />
              <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" style={{ animation: 'bounce-dot 1.2s 0.15s infinite' }} />
              <circle cx="17" cy="12" r="1.5" fill={color} stroke="none" style={{ animation: 'bounce-dot 1.2s 0.3s infinite' }} />
            </>
          ) : status === 'speaking' ? (
            <>
              {[4, 8, 12, 16, 20].map((x, i) => (
                <rect key={i} x={x} y={8} width={2} height={8} rx={1} fill={color} stroke="none"
                  style={{ transformOrigin: 'center', animation: `wave-bar 0.8s ${i * 0.1}s ease-in-out infinite` }} />
              ))}
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
      <span style={{
        fontSize: 10, fontWeight: 600, color, letterSpacing: '0.12em', textTransform: 'uppercase',
        animation: status === 'listening' ? 'fade-in 0.3s ease' : 'none',
      }}>
        {label}
      </span>
    </div>
  );
}
