import { useEffect, useRef } from 'react';

export function ChatHistory({ messages, status, error }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      {messages.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Voice Task Manager
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Manage your tasks with natural voice commands
          </p>

          <div className="grid gap-2 w-full max-w-sm">
            {[
              { icon: '➕', text: 'Create a task for team standup at 9 AM' },
              { icon: '📋', text: "What's on my schedule today?" },
              { icon: '✏️', text: 'Move the LinkedIn task to 6 PM' },
              { icon: '🗑️', text: 'Delete the morning meeting' },
            ].map((ex, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <span className="text-sm flex-shrink-0">{ex.icon}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>"{ex.text}"</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-6 px-3 py-2 rounded-lg"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
              Space
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to start talking</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`msg-enter flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs mt-0.5"
                style={{
                  background: msg.role === 'user' ? 'var(--accent-bg-strong)' : 'var(--bg-elevated)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--accent)30' : 'var(--border)'}`,
                }}>
                {msg.role === 'user' ? '🎤' : '🤖'}
              </div>

              {/* Bubble */}
              <div className="px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--accent-dim)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                  borderBottomRightRadius: msg.role === 'user' ? '6px' : '16px',
                  borderBottomLeftRadius: msg.role === 'user' ? '16px' : '6px',
                }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {status === 'processing' && (
          <div className="msg-enter flex justify-start">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs mt-0.5"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                🤖
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: 'var(--accent)',
                        animation: `dot-bounce 1.2s ${i * 0.15}s ease-in-out infinite`,
                      }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="msg-enter flex justify-center">
            <div className="px-4 py-2 rounded-xl text-xs flex items-center gap-2"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
