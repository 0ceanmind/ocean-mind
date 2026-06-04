/* ============================================================
   OceanMind — Library / Depth Catalog + Course Detail
   Exposes (window): DepthCatalog, CourseDetail, lessonLocked
   ============================================================ */

// Is a lesson gated for this user? labs & non-free lessons need a paid tier (and auth).
function lessonLocked(lesson, t) {
  if (!t.authed) return lesson.free ? false : 'auth';
  if (lesson.free) return false;
  if (t.tier === 'free') return 'tier';
  return false;
}

const LTYPE_ICON = { read: 'read', lab: 'beaker', quiz: 'quiz', video: 'video' };

function CourseCard({ c, ctx }) {
  const { nav, stats } = ctx;
  const depth = window.OM.depths.find((d) => d.id === c.depth);
  const depthIdx = window.OM.depths.indexOf(depth);
  const locked = stats.xp < depth.reqXP;
  const labCount = c.lessons.filter((l) => l.type === 'lab').length;

  return (
    <div className={'course-card' + (locked ? ' locked' : '')} onClick={() => { if (!locked && !c.inDev) nav('course', { course: c.id }); }}>
      <div className="cc-head">
        <span className="tag muted">{depth.no} · {depth.name}</span>
        {c.featured && <span className="tag">Featured</span>}
        {locked && <span className="lock"><Icon name="lock" size={13} /> {fmt(depth.reqXP)} XP</span>}
      </div>
      <h3 className="course-title">{c.title}</h3>
      <p className="course-blurb">{c.blurb}</p>
      <div className="course-meta">
        <span><Icon name="book" size={14} /> {c.lessons.length} lessons</span>
        <span><Icon name="clock" size={14} /> {c.hours}</span>
        {labCount > 0 && <span className="lab-pill"><Icon name="beaker" size={13} /> {labCount} live lab{labCount > 1 ? 's' : ''}</span>}
      </div>
      {!locked && !c.inDev && (
        <div className="course-go">Open course <Icon name="arrowR" size={15} /></div>
      )}
      {c.inDev && <div className="course-go faint">In development</div>}
    </div>
  );
}

function DepthCatalog({ ctx }) {
  const { params, t } = ctx;
  const depths = window.OM.depths;
  const allCourses = Object.values(window.OM.courses);
  const filterDepth = params.depth != null ? depths[params.depth] : null;

  const shown = filterDepth ? allCourses.filter((c) => c.depth === filterDepth.id) : allCourses;

  return (
    <div className="view wide">
      <p className="page-eyebrow">{filterDepth ? `Depth ${filterDepth.no}` : 'Library'}</p>
      <h1 className="page-title">{filterDepth ? filterDepth.name : 'Every depth, every course.'}</h1>
      <p className="page-sub">{filterDepth ? filterDepth.blurb : 'The full descent, from the surface down to the ocean floor. Courses unlock as you earn XP and pressurize.'}</p>

      {!filterDepth ? (
        depths.map((d, i) => {
          const courses = allCourses.filter((c) => c.depth === d.id);
          if (!courses.length) return null;
          return (
            <div key={d.id} className="cat-group">
              <div className="cat-group-head">
                <span className="cat-no mono">{d.no}</span>
                <h2 className="cat-group-title">{d.name}</h2>
                <span className="cat-range mono">{d.range}</span>
              </div>
              <div className="course-grid">
                {courses.map((c) => <CourseCard key={c.id} c={c} ctx={ctx} />)}
              </div>
            </div>
          );
        })
      ) : (
        <div className="course-grid" style={{ marginTop: 34 }}>
          {shown.map((c) => <CourseCard key={c.id} c={c} ctx={ctx} />)}
        </div>
      )}
    </div>
  );
}

function CourseDetail({ ctx }) {
  const { params, nav, t, stats } = ctx;
  const c = window.OM.courses[params.course];
  const depth = window.OM.depths.find((d) => d.id === c.depth);
  const depthIdx = window.OM.depths.indexOf(depth);
  const done = stats.completed;
  const completedCount = c.lessons.filter((l) => done.has(c.id + ':' + l.id)).length;
  const pct = c.lessons.length ? completedCount / c.lessons.length : 0;

  return (
    <div className="view">
      <div className="cd-hero">
        <div className="cd-hero-main">
          <p className="page-eyebrow">{depth.no} · {depth.name}</p>
          <h1 className="page-title">{c.title}</h1>
          <p className="page-sub">{c.blurb}</p>
          <div className="course-meta" style={{ marginTop: 20 }}>
            <span><Icon name="book" size={14} /> {c.lessons.length} lessons</span>
            <span><Icon name="clock" size={14} /> {c.hours}</span>
            <span><Icon name="beaker" size={14} /> {c.lessons.filter((l) => l.type === 'lab').length} live labs</span>
          </div>
        </div>
        <div className="cd-progress card pad">
          <ProgressRing value={pct} size={72} stroke={6}>
            <span style={{ color: 'var(--accent)' }}>{Math.round(pct * 100)}<span style={{ fontSize: 10 }}>%</span></span>
          </ProgressRing>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontWeight: 600 }}>{completedCount} / {c.lessons.length} done</span>
            <span className="mono faint" style={{ fontSize: 11 }}>{c.lessons.length - completedCount} lessons left</span>
          </div>
        </div>
      </div>

      <div className="lesson-list">
        {c.lessons.map((l, i) => {
          const isDone = done.has(c.id + ':' + l.id);
          const lock = lessonLocked(l, t);
          return (
            <div key={l.id}
              className={'lesson-row' + (l.hero ? ' hero' : '') + (lock ? ' locked' : '')}
              onClick={() => nav('lesson', { course: c.id, lesson: l.id })}>
              <div className="lr-idx">
                {isDone ? <Icon name="checkcircle" size={22} style={{ color: 'var(--accent)' }} /> : <span className="lr-n mono">{String(i + 1).padStart(2, '0')}</span>}
              </div>
              <span className={'ltype' + (l.type === 'lab' ? ' lab' : '')}>
                <Icon name={LTYPE_ICON[l.type]} size={16} />
              </span>
              <div className="lr-main">
                <div className="lr-title">
                  {l.t}
                  {l.hero && <span className="tag" style={{ marginLeft: 10 }}>The wow</span>}
                </div>
                <div className="lr-meta mono">
                  {l.type === 'lab' ? 'Live lab' : l.type === 'quiz' ? 'Checkpoint' : 'Reading'} · {l.dur}
                  {l.free && <span className="lr-free"> · Free</span>}
                </div>
              </div>
              <div className="lr-action">
                {lock ? <span className="lock"><Icon name="lock" size={14} /> {lock === 'auth' ? 'Sign in' : 'Explorer'}</span>
                  : <Icon name="chevR" size={18} className="faint" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { DepthCatalog, CourseDetail, lessonLocked });
