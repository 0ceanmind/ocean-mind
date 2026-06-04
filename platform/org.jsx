/* ============================================================
   OceanMind — B2B Org / Admin Dashboard
   Exposes (window): OrgDashboard
   ============================================================ */

function OrgDashboard({ ctx }) {
  const { t } = ctx;
  const org = window.OM.org;
  const depths = window.OM.depths;
  const totalXp = org.members.reduce((n, m) => n + m.xp, 0);
  const avgDepth = (org.members.reduce((n, m) => n + m.depth, 0) / org.members.length);
  const activeNow = org.weeklyActive[org.weeklyActive.length - 1];
  const dist = org.depthDistribution;
  const distMax = Math.max(...dist, 1);
  const waMax = Math.max(...org.weeklyActive, 1);

  const stats = [
    { k: 'Seats used', v: `${org.seatsUsed}/${org.seats}`, icon: 'seat', accent: true },
    { k: 'Active this week', v: activeNow, icon: 'user' },
    { k: 'Avg. depth', v: avgDepth.toFixed(1), icon: 'iceberg' },
    { k: 'Team XP', v: fmt(totalXp), icon: 'bolt' },
  ];

  return (
    <div className="view wide">
      <div className="spread" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 18 }}>
        <div>
          <p className="page-eyebrow">Organization · Admin</p>
          <h1 className="page-title">{org.name}</h1>
          <p className="page-sub">Track adoption, depth, and momentum across your team. Assign courses and watch the whole org descend together.</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <span className="tag"><Icon name="building" size={13} /> {org.plan} plan · renews {org.renew}</span>
          <button className="btn sm"><Icon name="plus" size={15} /> Assign course</button>
        </div>
      </div>

      <div className="dash-stats">
        {stats.map((s) => (
          <div key={s.k} className="dstat card">
            <span className={'dstat-ic' + (s.accent ? ' accent' : '')}><Icon name={s.icon} size={20} /></span>
            <div className="col">
              <span className="dstat-v">{s.v}</span>
              <span className="dstat-k mono">{s.k}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="org-grid">
        {/* seats utilization */}
        <div className="card pad">
          <h3 className="card-h">Seat utilization</h3>
          <div className="seat-bar">
            <div className="seat-fill" style={{ width: (org.seatsUsed / org.seats * 100) + '%' }} />
          </div>
          <div className="spread" style={{ marginTop: 12 }}>
            <span className="mono faint" style={{ fontSize: 11 }}>{org.seatsUsed} active · {org.seats - org.seatsUsed} open</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--accent-dim)' }}>{Math.round(org.seatsUsed / org.seats * 100)}% used</span>
          </div>
        </div>

        {/* weekly active */}
        <div className="card pad">
          <h3 className="card-h">Weekly active learners</h3>
          <div className="wk-chart" style={{ marginTop: 18 }}>
            {org.weeklyActive.map((v, i) => (
              <div key={i} className="wk-col">
                <div className="wk-bar-track">
                  <div className="wk-bar" style={{ height: (v / waMax * 100) + '%' }} />
                </div>
                <span className="wk-day mono">{['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'Now'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* depth distribution */}
        <div className="card pad org-dist">
          <h3 className="card-h">Team by depth</h3>
          <div className="dist-rows">
            {depths.map((d, i) => (
              <div key={d.id} className="dist-row">
                <span className="dist-name">{d.no} · {d.name}</span>
                <div className="dist-track"><div className="dist-fill" style={{ width: (dist[i] / distMax * 100) + '%' }} /></div>
                <span className="dist-n mono">{dist[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* members table */}
      <div className="card members">
        <div className="members-head">
          <h3 className="card-h" style={{ margin: 0 }}>Team members</h3>
          <span className="mono faint" style={{ fontSize: 11 }}>{org.members.length} shown</span>
        </div>
        <div className="mtable">
          <div className="mtr mthead">
            <span>Member</span><span>Role</span><span>Depth</span><span>XP</span><span>Streak</span><span>Last active</span>
          </div>
          {org.members.map((m) => {
            const d = depths[m.depth];
            const initials = m.name.split(' ').map((x) => x[0]).join('');
            return (
              <div key={m.name} className="mtr">
                <span className="mcell-name"><span className="mav">{initials}</span>{m.name}</span>
                <span className="faint">{m.role}</span>
                <span><span className="depth-chip mono">{d.no} {d.name}</span></span>
                <span className="mono">{fmt(m.xp)}</span>
                <span className="mono">{m.streak > 0 ? <><Icon name="flame" size={13} fill="currentColor" stroke={0} style={{ color: 'var(--gold)' }} /> {m.streak}</> : <span className="faint">—</span>}</span>
                <span className="faint mono" style={{ fontSize: 12 }}>{m.active}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.OrgDashboard = OrgDashboard;
