import { useEffect, useState } from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { VoiceOrb } from './components/VoiceOrb';
import { TaskSidebar } from './components/TaskSidebar';
import { ChatHistory } from './components/ChatHistory';

export default function App() {
  const {
    status, tasks, messages, error,
    interimTranscript, isSupported, toggleVoice,
  } = useVoiceAgent();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Space key shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); toggleVoice(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleVoice]);

  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Browser Not Supported</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            This app needs the Web Speech API.<br/>Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-5 py-3 flex-shrink-0"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg cursor-pointer transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            aria-label="Toggle tasks">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-dim), var(--accent))', boxShadow: '0 2px 8px rgba(123,108,246,0.3)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Voice Tasks</h1>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{
            background: status === 'error' ? 'var(--danger)' :
                        status === 'listening' ? 'var(--success)' :
                        status === 'processing' ? 'var(--warning)' :
                        status === 'speaking' ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: status === 'listening' ? '0 0 6px var(--success)' :
                       status === 'processing' ? '0 0 6px var(--warning)' : 'none',
          }} />
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {status === 'error' ? 'Error' :
             status === 'listening' ? 'Listening' :
             status === 'processing' ? 'Thinking' :
             status === 'speaking' ? 'Speaking' : 'Ready'}
          </span>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <TaskSidebar tasks={tasks} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Chat + Voice */}
        <main className="flex-1 flex flex-col min-w-0">
          <ChatHistory messages={messages} status={status} error={error} />

          {/* Voice area */}
          <div className="flex-shrink-0 flex justify-center py-5 relative"
            style={{ background: 'linear-gradient(to top, var(--bg-secondary), transparent)', borderTop: '1px solid var(--border)' }}>
            <VoiceOrb status={status} interimTranscript={interimTranscript} onClick={toggleVoice} />
          </div>
        </main>
      </div>
    </div>
  );
}
