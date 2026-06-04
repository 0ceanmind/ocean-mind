/* ============================================================
   OceanMind — Learner Dashboard (XP, streak, depth, continue)
   Exposes (window): Dashboard
   ============================================================ */

function Dashboard({ ctx }) {
  const { nav, t, stats } = ctx;
  const depths = window.OM.depths;
  const di = currentDepthIndex(stats.xp);
  const depth = depths[di];
  const next = depths[di + 1];
  const span = next ? next.reqXP - depth.reqXP : 1;
  const pct = next ? Math.max(0, Math.min(1, (stats.xp - depth.reqXP) / span)) : 1;
  const lessonsDone = stats.completed.size;

  // weekly XP activity (illustrative, last bar = today)
  const week = [40, 0, 85, 60, 120, 30, Math.min(220, 60 + lessonsDone * 12)];
  const wkMax = Math.max(...week, 1);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const trainedNet = stats.completed.has('ml-foundations:l4');
  const achievements = [
    { id: 'first', t: 'First Descent', d: 'Complete your first lesson', icon: 'wave', earned: lessonsDone >= 1 },
    { id: 'net', t: 'Net Trainer', d: 'Train a neural network to convergence', icon: 'network', earned: trainedNet },
    { id: 'streak', t: 'Tidal Rhythm', d: 'Keep a 7-day streak', icon: 'flame', earned: stats.streak >= 7 },
    { id: 'depth2', t: 'Below the Surface', d: 'Reach depth 02', icon: 'unlock', earned: di >= 1 },
    { id: 'five', t: 'Steady Diver', d: 'Finish 5 lessons', icon: 'check', earned: lessonsDone >= 5 },
    { id: 'abyss', t: 'Into the Abyss', d: 'Reach depth 05', icon: 'iceberg', earned: di >= 4 },
  ];
  const earnedCount = achievements.filter((a) => a.earned).length;

  const statCards = [
    { k: 'Total XP', v: fmt(stats.xp), icon: 'bolt', accent: true },
    { k: 'Day streak', v: stats.streak, icon: 'flame', flame: true },
    { k: 'Current depth', v: depth.no + ' / 06', icon: 'iceberg' },
    { k: 'Lessons done', v: lessonsDone, icon: 'check' },
  ];

  return (
    <div className="view wide">
      <div className="spread" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 18 }}>
        <div>
          <p className="page-eyebrow">Your dive log</p>
          <h1 className="page-title">Maya's descent.</h1>
        </div>
        {t.audience === 'b2b' && (
          <span className="tag"><Icon name="building" size={13} /> Seat · Meridian Labs</span>
        )}
      </div>

      <div className="dash-stats">
        {statCards.map((s) => (
          <div key={s.k} className="dstat card">
            <span className={'dstat-ic' + (s.accent ? ' accent' : '') + (s.flame ? ' flame' : '')}>
              <Icon name={s.icon} size={20} fill={s.flame ? 'currentColor' : 'none'} stroke={s.flame ? 0 : 2} />
            </span>
            <div className="col">
              <span className="dstat-v">{s.v}</span>
              <span className="dstat-k mono">{s.k}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="col" style={{ gap: 18 }}>
          {/* depth meter */}
          <div className="card pad depth-meter">
            <div className="spread">
              <h3 className="card-h">Depth progress</h3>
              <span className="mono faint" style={{ fontSize: 11 }}>{fmt(stats.xp)} XP total</span>
            </div>
            <div className="dm-track">
              {depths.map((d, i) => {
                const reached = stats.xp >= d.reqXP;
                const here = i === di;
                return (
                  <div key={d.id} className={'dm-step' + (reached ? ' reached' : '') + (here ? ' here' : '')}>
                    <div className="dm-node">{reached ? <Icon name="check" size={13} /> : <span className="mono">{d.no}</span>}</div>
                    <div className="dm-label">
                      <span className="dm-name">{d.name}</span>
                      <span className="mono faint">{d.range}</span>
                    </div>
                    {here && next && (
                      <div className="dm-next mono">{span - (stats.xp - depth.reqXP)} XP to {next.name}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* weekly activity */}
          <div className="card pad">
            <div className="spread"><h3 className="card-h">This week</h3><span className="mono faint" style={{ fontSize: 11 }}>XP earned per day</span></div>
            <div className="wk-chart">
              {week.map((v, i) => (
                <div key={i} className="wk-col">
                  <div className="wk-bar-track">
                    <div className="wk-bar" style={{ height: (v / wkMax * 100) + '%' }}>
                      {v > 0 && <span className="wk-val mono">{v}</span>}
                    </div>
                  </div>
                  <span className={'wk-day mono' + (i === 6 ? ' today' : '')}>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 18 }}>
          {/* continue */}
          <div className="card pad continue-mini">
            <div className="cc-label mono">CONTINUE</div>
            <div className="cc-course">Understanding Machine Learning</div>
            <div className="cc-lesson" style={{ marginTop: 12 }}>
              <span className="ltype lab"><Icon name="beaker" size={16} /></span>
              <div className="col" style={{ gap: 2 }}>
                <span className="cc-ltitle">Watch a neural network learn</span>
                <span className="mono faint" style={{ fontSize: 11 }}>Lesson 4 · live lab</span>
              </div>
            </div>
            <button className="btn block" style={{ marginTop: 16 }} onClick={() => nav('lesson', { course: 'ml-foundations', lesson: 'l4' })}>
              <Icon name="play" size={14} fill="currentColor" stroke={0} /> Resume
            </button>
          </div>

          {/* achievements */}
          <div className="card pad">
            <div className="spread"><h3 className="card-h">Achievements</h3><span className="mono faint" style={{ fontSize: 11 }}>{earnedCount}/{achievements.length}</span></div>
            <div className="ach-grid">
              {achievements.map((a) => (
                <div key={a.id} className={'ach' + (a.earned ? ' earned' : '')} title={a.d}>
                  <span className="ach-ic"><Icon name={a.icon} size={18} fill={a.icon === 'flame' && a.earned ? 'currentColor' : 'none'} stroke={a.icon === 'flame' && a.earned ? 0 : 2} /></span>
                  <span className="ach-t">{a.t}</span>
                  <span className="ach-d">{a.d}</span>
                  {!a.earned && <span className="ach-lock"><Icon name="lock" size={11} /></span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
