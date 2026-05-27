import { useEffect, useRef } from 'react';

export function ChatHistory({ messages, status, error }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, status]);

  const examples = [
    { icon: '➕', text: 'Create a task for team standup at 9 AM' },
    { icon: '📋', text: "What's on my schedule today?" },
    { icon: '✏️', text: 'Move the LinkedIn task to 6 PM' },
    { icon: '🗑️', text: 'Delete the morning meeting' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
      {/* Empty state */}
      {messages.length === 0 && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '0 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, marginBottom: 20,
            background: 'rgba(139,124,247,0.08)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="1.5">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Voice Task Manager</h3>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 28 }}>Manage your tasks with natural voice commands</p>

          <div style={{ display: 'grid', gap: 8, width: '100%', maxWidth: 380 }}>
            {examples.map((ex, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 14,
                background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'left',
              }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{ex.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4 }}>"{ex.text}"</span>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 28,
            padding: '8px 14px', borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <kbd style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
              padding: '3px 8px', borderRadius: 6,
              background: 'var(--bg-elevated)', color: 'var(--text-faint)', border: '1px solid var(--border-hover)',
            }}>Space</kbd>
            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>to start talking</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
              marginBottom: 12, animation: 'slide-up 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '80%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginTop: 2,
                  background: isUser ? 'rgba(139,124,247,0.12)' : 'var(--bg-elevated)',
                  border: `1px solid ${isUser ? 'rgba(139,124,247,0.2)' : 'var(--border)'}`,
                }}>
                  {isUser ? '🎤' : '🤖'}
                </div>

                {/* Bubble */}
                <div style={{
                  padding: '10px 16px', fontSize: 13, lineHeight: 1.6,
                  color: 'var(--text)',
                  background: isUser ? 'var(--purple-dim)' : 'var(--bg-card)',
                  border: `1px solid ${isUser ? 'var(--purple-dim)' : 'var(--border)'}`,
                  borderRadius: 18,
                  borderBottomRightRadius: isUser ? 6 : 18,
                  borderBottomLeftRadius: isUser ? 18 : 6,
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking dots */}
        {status === 'processing' && (
          <div style={{ display: 'flex', marginBottom: 12, animation: 'slide-up 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginTop: 2,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              }}>🤖</div>
              <div style={{
                padding: '14px 18px', borderRadius: 18, borderBottomLeftRadius: 6,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                display: 'flex', gap: 5,
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)',
                    animation: `bounce-dot 1.2s ${i * 0.15}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 12,
            animation: 'slide-up 0.3s ease',
          }}>
            <div style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 12,
              background: 'rgba(240,96,96,0.08)', color: 'var(--red)',
              border: '1px solid rgba(240,96,96,0.12)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {error}
            </div>
          </div>
        )}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
