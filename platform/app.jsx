/* ============================================================
   OceanMind — App root: router, state, XP loop, tweaks
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2dd4d4",
  "authed": true,
  "tier": "explorer",
  "depthProgress": 1,
  "audience": "b2c"
}/*EDITMODE-END*/;

const LS_KEY = 'om_state_v1';
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    s.completed = new Set(s.completed || []);
    return s;
  } catch (e) { return null; }
}
function saveState(view, params, stats) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      view, params, xp: stats.xp, streak: stats.streak, completed: [...stats.completed],
    }));
  } catch (e) {}
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const depths = window.OM.depths;
  const saved = React.useRef(loadState()).current;

  const baselineXp = depths[TWEAK_DEFAULTS.depthProgress].reqXP + (TWEAK_DEFAULTS.depthProgress ? 40 : 0);
  const [view, setView] = React.useState(saved?.view || 'home');
  const [params, setParams] = React.useState(saved?.params || {});
  const [stats, setStats] = React.useState({
    xp: saved?.xp ?? baselineXp,
    streak: saved?.streak ?? 7,
    completed: saved?.completed ?? new Set(['ml-foundations:l1', 'ml-foundations:l2']),
  });
  const [toasts, setToasts] = React.useState([]);
  const mainRef = React.useRef(null);

  // apply accent to the document
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);

  // sync depth from the depthProgress tweak (skip first mount so saved XP survives)
  const firstSync = React.useRef(true);
  React.useEffect(() => {
    if (firstSync.current) { firstSync.current = false; return; }
    const dp = Math.max(0, Math.min(5, t.depthProgress));
    setStats((s) => ({ ...s, xp: depths[dp].reqXP + (dp ? 40 : 0) }));
  }, [t.depthProgress]);

  // persist + scroll to top on nav
  React.useEffect(() => {
    saveState(view, params, stats);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [view, params, stats]);

  const nav = React.useCallback((v, p = {}) => { setView(v); setParams(p); }, []);

  const pushToast = (toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { ...toast, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3800);
  };

  const completeLesson = (courseId, lesson, xp) => {
    const key = courseId + ':' + lesson.id;
    setStats((s) => {
      if (s.completed.has(key)) return s;
      const oldDi = currentDepthIndex(s.xp);
      const newXp = s.xp + xp;
      const newDi = currentDepthIndex(newXp);
      const completed = new Set(s.completed); completed.add(key);
      if (newDi > oldDi) {
        pushToast({ kind: 'depth', title: 'New depth unlocked', sub: depths[newDi].name + ' · ' + depths[newDi].range, gain: '+' + xp });
      } else {
        pushToast({ kind: 'xp', title: lesson.type === 'lab' ? 'Lab complete' : 'Lesson complete', sub: lesson.t, gain: '+' + xp });
      }
      return { ...s, xp: newXp, completed };
    });
  };

  // crumbs
  const crumbs = (() => {
    const C = window.OM.courses;
    switch (view) {
      case 'home': return [{ label: 'Dive' }];
      case 'library':
        return params.depth != null
          ? [{ label: 'Dive', to: 'home' }, { label: depths[params.depth].name }]
          : [{ label: 'Library' }];
      case 'course': return [{ label: 'Library', to: 'library' }, { label: C[params.course].title }];
      case 'lesson': {
        const c = C[params.course];
        const l = c.lessons.find((x) => x.id === params.lesson);
        return [{ label: c.title, to: 'course', params: { course: c.id } }, { label: l.t }];
      }
      case 'dashboard': return [{ label: 'Dashboard' }];
      case 'org': return [{ label: 'My Team' }];
      default: return [{ label: 'Dive' }];
    }
  })();

  const ctx = { view, params, nav, t, setTweak, stats, setStats, completeLesson, crumbs };

  // onboarding is full-screen (no shell)
  if (view === 'onboarding') {
    return (<><Onboarding ctx={ctx} /><TweaksUI t={t} setTweak={setTweak} /></>);
  }

  const Guarded = (Comp) => {
    if (!t.authed && (view === 'dashboard' || view === 'org')) {
      return <GuestGate nav={nav} />;
    }
    return <Comp ctx={ctx} />;
  };

  let Screen = null;
  if (view === 'home') Screen = <IcebergHome ctx={ctx} />;
  else if (view === 'library') Screen = <DepthCatalog ctx={ctx} />;
  else if (view === 'course') Screen = <CourseDetail ctx={ctx} />;
  else if (view === 'lesson') Screen = <LessonPlayer ctx={ctx} />;
  else if (view === 'dashboard') Screen = Guarded(Dashboard);
  else if (view === 'org') Screen = Guarded(OrgDashboard);
  else Screen = <IcebergHome ctx={ctx} />;

  return (
    <>
      <div className="bg-deep" />
      <div className="app">
        <Sidebar ctx={ctx} />
        <div className="main" ref={mainRef}>
          <Topbar ctx={ctx} />
          {Screen}
        </div>
      </div>

      <div className="toast-wrap">
        {toasts.map((to) => (
          <div key={to.id} className="toast">
            <span className="tx"><Icon name={to.kind === 'depth' ? 'iceberg' : 'bolt'} size={20} fill={to.kind === 'depth' ? 'none' : 'currentColor'} stroke={to.kind === 'depth' ? 2 : 0} /></span>
            <div className="col">
              <span className="tt">{to.title}</span>
              <span className="ts">{to.sub}</span>
            </div>
            <span className="tg">{to.gain}</span>
          </div>
        ))}
      </div>

      <TweaksUI t={t} setTweak={setTweak} />
    </>
  );
}

function GuestGate({ nav }) {
  return (
    <div className="view">
      <div className="wall" style={{ marginTop: 40 }}>
        <div className="lockbig"><Icon name="user" size={24} /></div>
        <h3>Sign in to see your dive log</h3>
        <p>Your dashboard tracks XP, streaks, and how far you've descended. Create a free account to start your record.</p>
        <button className="btn" onClick={() => nav('onboarding')}>Start free <Icon name="arrowR" size={15} /></button>
      </div>
    </div>
  );
}

function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme" />
      <TweakColor label="Accent" value={t.accent}
        options={['#2dd4d4', '#5aa0ff', '#7c6cf0', '#3ad29a', '#f4a64b']}
        onChange={(v) => setTweak('accent', v)} />

      <TweakSection label="Account state" />
      <TweakToggle label="Signed in" value={t.authed} onChange={(v) => setTweak('authed', v)} />
      <TweakRadio label="Plan" value={t.tier}
        options={[{ value: 'free', label: 'Free' }, { value: 'explorer', label: 'Explorer' }, { value: 'diver', label: 'Diver' }]}
        onChange={(v) => setTweak('tier', v)} />

      <TweakSection label="Progress" />
      <TweakSlider label="Depth reached" value={t.depthProgress} min={0} max={5} step={1}
        onChange={(v) => setTweak('depthProgress', v)} />

      <TweakSection label="Market framing" />
      <TweakRadio label="Audience" value={t.audience}
        options={[{ value: 'b2c', label: 'Consumer' }, { value: 'b2b', label: 'Org / B2B' }]}
        onChange={(v) => setTweak('audience', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
