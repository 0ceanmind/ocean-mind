/* ============================================================
   OceanMind — AppShell: sidebar + topbar
   Exposes (window): Sidebar, Topbar, currentDepthIndex
   ============================================================ */

// highest unlocked depth index for a given xp
function currentDepthIndex(xp) {
  const d = window.OM.depths;
  let idx = 0;
  for (let i = 0; i < d.length; i++) if (xp >= d[i].reqXP) idx = i;
  return idx;
}

function Sidebar({ ctx }) {
  const { view, nav, t, stats } = ctx;
  const loggedIn = t.authed;
  const depths = window.OM.depths;
  const di = currentDepthIndex(stats.xp);
  const depth = depths[di];
  // progress toward next depth
  const next = depths[di + 1];
  const prevReq = depth.reqXP;
  const span = next ? next.reqXP - prevReq : 1;
  const pct = next ? Math.max(0, Math.min(1, (stats.xp - prevReq) / span)) : 1;

  const items = [
    { id: 'home', label: 'Dive', icon: 'iceberg' },
    { id: 'library', label: 'Library', icon: 'catalog' },
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  ];
  if (t.audience === 'b2b') items.push({ id: 'org', label: 'My Team', icon: 'building' });

  return (
    <aside className="sidebar">
      <div className="sb-brand" onClick={() => nav('home')}>
        <span className="sb-mark" /> OceanMind
      </div>

      <div className="sb-sec">Navigate</div>
      {items.map((it) => (
        <div key={it.id} className={'nav-item' + (view === it.id ? ' active' : '')} onClick={() => nav(it.id)}>
          <Icon name={it.icon} size={18} className="ni-ic" />
          {it.label}
          {it.id === 'org' && <span className="ni-badge">B2B</span>}
        </div>
      ))}

      <div className="sb-sec">Your descent</div>
      <div className="nav-item" onClick={() => nav('library', { depth: di })}>
        <Icon name="wave" size={18} className="ni-ic" />
        {depth.name}
        <span className="ni-badge">{depth.no}</span>
      </div>

      <div className="sb-spacer" />

      {loggedIn ? (
        <div className="sb-card">
          <div className="who">
            <div className="sb-av">M</div>
            <div className="col" style={{ gap: 1 }}>
              <span className="nm">Maya Okonkwo</span>
              <span className="pl">{t.tier === 'free' ? 'Free plan' : t.tier === 'diver' ? 'Deep Diver' : 'Explorer'}</span>
            </div>
          </div>
          <div className="sb-mini-bar"><i style={{ width: (pct * 100) + '%' }} /></div>
          <div className="lvlrow">
            <span>{depth.name}</span>
            <span>{next ? `${stats.xp - prevReq}/${span} XP` : 'Max depth'}</span>
          </div>
        </div>
      ) : (
        <div className="sb-signin">
          <p>You're exploring as a guest. Sign in to track depth, earn XP, and unlock tools.</p>
          <button className="btn block sm" onClick={() => nav('onboarding')}>Start free</button>
        </div>
      )}
    </aside>
  );
}

function Topbar({ ctx }) {
  const { crumbs, nav, t, stats } = ctx;
  const loggedIn = t.authed;
  return (
    <div className="topbar">
      <div className="tb-crumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevR" size={13} className="sep" />}
            {c.to
              ? <a onClick={() => nav(c.to, c.params)}>{c.label}</a>
              : <span className="cur">{c.label}</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="tb-right">
        {loggedIn ? (
          <>
            <div className="chip streak" title="Day streak">
              <Icon name="flame" size={16} fill="currentColor" stroke={0} className="fl" />
              <span className="cv">{stats.streak}</span>
            </div>
            <div className="chip xp" title="Total XP">
              <Icon name="bolt" size={15} fill="currentColor" stroke={0} className="xc" />
              <span className="cv">{fmt(stats.xp)}</span> XP
            </div>
            <div className="tb-av" onClick={() => nav('dashboard')}>M</div>
          </>
        ) : (
          <>
            <button className="btn ghost sm" onClick={() => nav('onboarding')}>Log in</button>
            <button className="btn sm" onClick={() => nav('onboarding')}>Start free</button>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, currentDepthIndex });
