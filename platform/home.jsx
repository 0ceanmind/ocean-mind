/* ============================================================
   OceanMind — Iceberg Home (logged-in depth navigation)
   Exposes (window): IcebergHome
   ============================================================ */

function IcebergHome({ ctx }) {
  const { nav, t, stats } = ctx;
  const depths = window.OM.depths;
  const courses = window.OM.courses;
  const di = currentDepthIndex(stats.xp);
  const [hover, setHover] = React.useState(null);

  const courseCount = (depthId) => Object.values(courses).filter((c) => c.depth === depthId && !c.inDev).length;
  const lessonCount = (depthId) => Object.values(courses)
    .filter((c) => c.depth === depthId).reduce((n, c) => n + c.lessons.length, 0);

  // continue card → featured course hero lesson
  const cont = { course: courses['ml-foundations'], lessonId: 'l4' };

  return (
    <div className="view wide">
      <div className="home-head">
        <div>
          <p className="page-eyebrow">{t.authed ? 'Welcome back, Maya' : 'The descent'}</p>
          <h1 className="page-title">Choose your depth.</h1>
          <p className="page-sub">Six depths, one continuous dive from curious beginner to working researcher. The deeper you go, the more the water — and the ideas — pressurize.</p>
        </div>
        {t.authed && (
          <div className="home-depthstat">
            <ProgressRing value={(di + 1) / 6} size={88} stroke={6}>
              <span style={{ color: 'var(--accent)' }}>{di + 1}<span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>/6</span></span>
            </ProgressRing>
            <div className="col" style={{ gap: 2 }}>
              <span className="mono faint" style={{ fontSize: 10, letterSpacing: '.14em' }}>CURRENT DEPTH</span>
              <span style={{ fontWeight: 600, fontSize: 16 }}>{depths[di].name}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--accent-dim)' }}>{depths[di].range}</span>
            </div>
          </div>
        )}
      </div>

      <div className="home-grid">
        {/* the iceberg scene */}
        <div className="berg-scene">
          <div className="berg-img" />
          <div className="berg-deepen" />
          <div className="berg-water"><span className="mono">SEA LEVEL · 0m</span></div>
          <div className="berg-bands">
            {depths.map((d, i) => {
              const locked = stats.xp < d.reqXP;
              const here = i === di;
              const cc = courseCount(d.id);
              return (
                <div
                  key={d.id}
                  className={'berg-band' + (locked ? ' locked' : '') + (here ? ' here' : '') + (hover === i ? ' hot' : '')}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => { if (!d.inDev) nav('library', { depth: i }); }}
                  style={{ cursor: d.inDev ? 'default' : 'pointer' }}
                >
                  <div className="bb-left">
                    <span className="bb-no mono">{d.no}</span>
                    <div className="col" style={{ gap: 3, minWidth: 0 }}>
                      <span className="bb-name">{d.name} {here && <em className="bb-here">you are here</em>}</span>
                      <span className="bb-who">{d.who}</span>
                    </div>
                  </div>
                  <div className="bb-right">
                    <span className="bb-range mono">{d.range}</span>
                    {d.inDev ? (
                      <span className="tag muted">Soon</span>
                    ) : locked ? (
                      <span className="lock"><Icon name="lock" size={13} /> {fmt(d.reqXP)} XP</span>
                    ) : (
                      <span className="bb-courses">{cc} course{cc !== 1 ? 's' : ''} <Icon name="arrowR" size={14} /></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* side rail */}
        <div className="home-rail">
          {t.authed ? (
            <div className="continue-card">
              <div className="cc-label mono">CONTINUE YOUR DIVE</div>
              <div className="cc-course">{cont.course.title}</div>
              <div className="cc-lesson">
                <span className="ltype lab"><Icon name="beaker" size={16} /></span>
                <div className="col" style={{ gap: 2, minWidth: 0 }}>
                  <span className="cc-ltitle">Watch a neural network learn</span>
                  <span className="mono faint" style={{ fontSize: 11 }}>Lesson 4 of 8 · live lab</span>
                </div>
              </div>
              <div className="cc-bar"><i style={{ width: '38%' }} /></div>
              <button className="btn block" onClick={() => nav('lesson', { course: 'ml-foundations', lesson: 'l4' })}>
                <Icon name="play" size={15} fill="currentColor" stroke={0} /> Resume lesson
              </button>
            </div>
          ) : (
            <div className="continue-card guest">
              <div className="cc-label mono">START LEARNING</div>
              <div className="cc-course">Create your free account</div>
              <p className="muted" style={{ fontSize: 13.5, margin: '6px 0 18px' }}>Pick a depth, set a goal, and start earning XP toward the abyss. No card required.</p>
              <button className="btn block" onClick={() => nav('onboarding')}>Start free <Icon name="arrowR" size={15} /></button>
            </div>
          )}

          <div className="rail-stats">
            <div className="rs">
              <div className="rs-k mono">DEPTHS UNLOCKED</div>
              <div className="rs-v">{t.authed ? di + 1 : 1}<span className="rs-of">/6</span></div>
            </div>
            <div className="rs">
              <div className="rs-k mono">LIVE AI TOOLS</div>
              <div className="rs-v">9</div>
            </div>
          </div>

          <div className="rail-note">
            <Icon name="sparkle" size={15} fill="currentColor" stroke={0} style={{ color: 'var(--accent)', flex: 'none' }} />
            <span>Every depth ships with interactive tools you operate — a neural net you train, an attention map you poke, a prompt studio wired to a real model.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.IcebergHome = IcebergHome;
