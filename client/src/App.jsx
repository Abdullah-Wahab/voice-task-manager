import { useEffect, useState, useCallback } from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { VoiceOrb } from './components/VoiceOrb';
import { TaskSidebar } from './components/TaskSidebar';
import { ChatHistory } from './components/ChatHistory';

export default function App() {
  const { status, tasks, messages, error, interimTranscript, isSupported, toggleVoice } = useVoiceAgent();
  const [sidebar, setSidebar] = useState(true);
  const toggleSidebar = useCallback(() => setSidebar(p => !p), []);

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); toggleVoice(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [toggleVoice]);

  if (!isSupported) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Browser Not Supported</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
            This app needs the Web Speech API. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
          </p>
        </div>
      </div>
    );
  }

  const statusLabel = { idle: 'Ready', listening: 'Listening', processing: 'Thinking', speaking: 'Speaking', error: 'Error' }[status] || 'Ready';
  const statusColor = { idle: 'var(--text-faint)', listening: 'var(--green)', processing: 'var(--yellow)', speaking: 'var(--purple)', error: 'var(--red)' }[status];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* ── HEADER ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, flexShrink: 0,
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggleSidebar} style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
            background: sidebar ? 'var(--bg-elevated)' : 'var(--bg-card)',
            color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {sidebar
                ? <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></>
              }
            </svg>
          </button>
          <div style={{
            width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--purple-dim), var(--purple))',
            boxShadow: '0 2px 12px rgba(139,124,247,0.25)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>Voice Tasks</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>AI-powered task manager</div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', borderRadius: 20,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: statusColor,
            boxShadow: status === 'listening' ? `0 0 8px ${statusColor}` : 'none',
          }}/>
          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {statusLabel}
          </span>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <TaskSidebar tasks={tasks} isOpen={sidebar} onClose={() => setSidebar(false)} />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <ChatHistory messages={messages} status={status} error={error} />

          <div style={{
            flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '20px 0 24px',
            borderTop: '1px solid var(--border)', background: 'var(--bg-surface)',
          }}>
            <VoiceOrb status={status} interimTranscript={interimTranscript} onClick={toggleVoice} />
          </div>
        </main>
      </div>
    </div>
  );
}
