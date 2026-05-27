import { useMemo } from 'react';

function formatDate(dateStr) {
  const today = new Date(), tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function timePeriod(t) {
  if (!t) return '📌';
  const h = parseInt(t.split(':')[0]);
  if (h < 12) return '🌅';
  if (h < 17) return '☀️';
  return '🌙';
}

export function TaskSidebar({ tasks, isOpen, onClose }) {
  const grouped = useMemo(() => {
    const g = {};
    for (const t of tasks) { (g[t.date] = g[t.date] || []).push(t); }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  return (

      <aside style={{
        width: isOpen ? 272 : 0, flexShrink: 0,
        overflow: 'hidden', transition: 'width 0.3s ease',
        borderRight: isOpen ? '1px solid var(--border)' : 'none',
        background: 'var(--bg-surface)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ width: 272, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Tasks
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{tasks.length}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{tasks.length === 1 ? 'task' : 'tasks'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
            {grouped.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎙️</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>No tasks yet</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, lineHeight: 1.5 }}>
                  Try: "Create a task for<br/>team standup at 9 AM"
                </div>
              </div>
            ) : grouped.map(([date, dateTasks]) => (
              <div key={date} style={{ marginBottom: 20 }}>
                {/* Date header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {formatDate(date)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--purple-glow)',
                    background: 'rgba(139,124,247,0.1)', padding: '2px 7px', borderRadius: 10,
                  }}>{dateTasks.length}</span>
                </div>

                {/* Task cards */}
                {dateTasks.map((task, i) => (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', marginBottom: 4, borderRadius: 12,
                    background: 'var(--bg-card)', border: '1px solid transparent',
                    transition: 'all 0.15s', cursor: 'default',
                    animation: `slide-up 0.3s ease ${i * 40}ms both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{timePeriod(task.time)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: task.status === 'done' ? 'var(--text-faint)' : 'var(--text)',
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{task.title}</div>
                      {task.time && (
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                          {formatTime(task.time)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>
  );
}
