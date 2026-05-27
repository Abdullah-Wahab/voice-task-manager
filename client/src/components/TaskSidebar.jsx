import { useMemo } from 'react';

function formatDate(dateStr) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const todayISO = today.toISOString().split('T')[0];
  const tomorrowISO = tomorrow.toISOString().split('T')[0];
  if (dateStr === todayISO) return 'Today';
  if (dateStr === tomorrowISO) return 'Tomorrow';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatTime(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function getTimeIcon(t) {
  if (!t) return '📌';
  const h = parseInt(t.split(':')[0]);
  if (h < 12) return '🌅';
  if (h < 17) return '☀️';
  return '🌙';
}

export function TaskSidebar({ tasks, isOpen, onClose }) {
  const grouped = useMemo(() => {
    const g = {};
    for (const task of tasks) {
      if (!g[task.date]) g[task.date] = [];
      g[task.date].push(task);
    }
    return Object.entries(g).sort(([a],[b]) => a.localeCompare(b));
  }, [tasks]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      )}

      <aside className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-40 lg:z-0
        w-[280px] h-full flex flex-col
        transition-transform duration-300 ease-out
      `} style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
              Tasks
            </h2>
            <p className="text-[22px] font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {tasks.length}
              <span className="text-xs font-normal ml-1.5" style={{ color: 'var(--text-muted)' }}>
                {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded cursor-pointer"
            style={{ background: 'var(--bg-card)', border: 'none', color: 'var(--text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {grouped.length === 0 ? (
            <div className="text-center py-16 px-5">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}>
                🎙️
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No tasks yet</p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Say "Create a task for<br/>team standup at 9 AM"
              </p>
            </div>
          ) : (
            grouped.map(([date, dateTasks]) => (
              <div key={date}>
                <div className="flex items-center gap-2 px-2 mb-2.5">
                  <span className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                    style={{ color: 'var(--accent)' }}>
                    {formatDate(date)}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}>
                    {dateTasks.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {dateTasks.map((task, i) => (
                    <div key={task.id}
                      className="task-enter group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid transparent',
                        animationDelay: `${i * 50}ms`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--bg-card-hover)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--bg-card)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <span className="text-sm flex-shrink-0">{getTimeIcon(task.time)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate"
                          style={{
                            color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          }}>
                          {task.title}
                        </p>
                        {task.time && (
                          <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {formatTime(task.time)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
