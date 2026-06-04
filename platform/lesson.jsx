/* ============================================================
   OceanMind — Lesson Player (reading + live lab + XP loop)
   Exposes (window): LessonPlayer
   ============================================================ */

// lesson-type -> icon (local copy; Babel scripts don't share scope)
const LTYPE_ICON = { read: 'read', lab: 'beaker', quiz: 'quiz', video: 'video' };

// Accurate short bodies for the featured ML course's reading lessons.
const LESSON_TEXT = {
  'ml-foundations:l1': {
    intro: "Before any math, get the core idea right. \u201CLearning\u201D in machine learning doesn't mean understanding — it means an algorithm adjusting numbers until its predictions match data it has seen.",
    paras: [
      "A traditional program is rules you write by hand: if this, do that. A machine-learning model is different — you show it examples of inputs paired with the right answers, and it searches for a set of internal numbers (called weights) that turn those inputs into those answers.",
      "Nothing in the model \u201Cknows\u201D what a cat or a sentence is. It only knows how to lower a single number — the error between its guess and the truth — by nudging its weights. Repeat that nudge millions of times and useful behavior emerges.",
      "That's the whole trick, and everything else in AI — neural networks, language models, image generators — is an elaboration of it. Keep this frame as you descend: measure error, adjust, repeat.",
    ],
  },
  'ml-foundations:l3': {
    intro: "The neuron is the atom of a neural network. It does something almost insultingly simple — and yet stacking them is enough to learn almost anything.",
    paras: [
      "A single neuron takes its inputs, multiplies each by a weight, adds them up with a bias, and squashes the result through a curve (an activation function). That's it: a weighted sum, then a bend.",
      "On its own, one neuron can only separate data with a straight line. Give it inputs that aren't linearly separable — like two interlocking spirals — and it fails. This limitation is exactly why we stack neurons into layers.",
      "In the next lesson you'll train a small network of these neurons yourself and watch the straight line bend into a curve as the weights change.",
    ],
  },
  'ml-foundations:l5': {
    intro: "If a model is going to improve, it needs a number that says how wrong it currently is. That number is the loss.",
    paras: [
      "Loss is a single value computed from the model's predictions versus the true answers. High loss means very wrong; zero loss means perfect on the data it saw. Training is nothing more than making this number go down.",
      "For yes/no problems we often use cross-entropy loss, which punishes confident wrong answers far more harshly than unsure ones — pushing the model toward honest probabilities.",
      "When you trained the network in the previous lab, the falling curve on the right was the loss. Every dip was the model getting measurably less wrong.",
    ],
  },
  'ml-foundations:l6': {
    intro: "Knowing how wrong you are isn't enough — you need to know which direction to adjust each weight. That direction is the gradient, and following it downhill is gradient descent.",
    paras: [
      "Imagine the loss as a hilly landscape where every position is a setting of the weights. You want the lowest valley. The gradient is the slope under your feet; gradient descent means taking a small step downhill, over and over.",
      "The size of that step is the learning rate. Too small and training crawls; too large and you bound past the valley and bounce around — exactly what you saw when you pushed the learning-rate slider high in the lab.",
      "Backpropagation is just an efficient way to compute that downhill direction for every weight at once, even in a deep network.",
    ],
  },
};

function ReadingBody({ lesson, courseId }) {
  const key = courseId + ':' + lesson.id;
  const body = LESSON_TEXT[key];
  if (!body) {
    return (
      <div className="reading">
        <p className="reading-intro">This lesson builds on what you've learned so far. Work through it at your own pace — your progress saves automatically.</p>
        <div className="reading-note"><Icon name="sparkle" size={15} fill="currentColor" stroke={0} style={{ color: 'var(--accent)' }} /> Full lesson content is part of the published curriculum.</div>
      </div>
    );
  }
  return (
    <div className="reading">
      <p className="reading-intro">{body.intro}</p>
      {body.paras.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

function LessonPlayer({ ctx }) {
  const { params, nav, t, stats, completeLesson } = ctx;
  const c = window.OM.courses[params.course];
  const idx = c.lessons.findIndex((l) => l.id === params.lesson);
  const lesson = c.lessons[idx];
  const depth = window.OM.depths.find((d) => d.id === c.depth);
  const key = c.id + ':' + lesson.id;
  const alreadyDone = stats.completed.has(key);

  const lock = lessonLocked(lesson, t);
  const [canComplete, setCanComplete] = React.useState(lesson.type !== 'lab');
  const [done, setDone] = React.useState(alreadyDone);
  const body = window.OM.lessonBodies[key];

  React.useEffect(() => {
    setCanComplete(lesson.type !== 'lab');
    setDone(stats.completed.has(key));
    // eslint-disable-next-line
  }, [params.course, params.lesson]);

  const next = c.lessons[idx + 1];
  const prev = c.lessons[idx - 1];

  const xpFor = lesson.type === 'lab' ? 60 : lesson.type === 'quiz' ? 40 : 25;

  const onComplete = () => {
    if (done) { goNext(); return; }
    setDone(true);
    completeLesson(c.id, lesson, xpFor);
  };
  const goNext = () => {
    if (next) nav('lesson', { course: c.id, lesson: next.id });
    else nav('dashboard');
  };

  // ---- locked wall ----
  if (lock) {
    return (
      <div className="view">
        <LessonChrome c={c} lesson={lesson} idx={idx} depth={depth} ctx={ctx} />
        <div className="wall">
          <div className="lockbig"><Icon name="lock" size={24} /></div>
          <h3>{lock === 'auth' ? 'Sign in to start this lesson' : 'This live lab is an Explorer feature'}</h3>
          <p>{lock === 'auth'
            ? 'Create a free account to track progress and open every free lesson on the platform.'
            : 'Live AI tools — the neural nets, prompt studios, and visualizers — are included on Explorer and Deep Diver. Free covers reading and three lessons per depth.'}</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => nav('onboarding')}>{lock === 'auth' ? 'Start free' : 'Upgrade to Explorer'}</button>
            <button className="btn outline" onClick={() => nav('course', { course: c.id })}>Back to course</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <LessonChrome c={c} lesson={lesson} idx={idx} depth={depth} ctx={ctx} />

      <div className="lesson-body">
        <div className="lesson-kicker">
          <span className={'ltype' + (lesson.type === 'lab' ? ' lab' : '')}><Icon name={LTYPE_ICON[lesson.type]} size={16} /></span>
          <span className="mono">{lesson.type === 'lab' ? 'LIVE LAB' : lesson.type === 'quiz' ? 'CHECKPOINT' : 'READING'} · {lesson.dur}</span>
          {done && <span className="tag" style={{ marginLeft: 'auto' }}><Icon name="check" size={12} /> Completed</span>}
        </div>
        <h1 className="lesson-h1">{lesson.t}</h1>

        {body && body.lab === 'neuralnet' ? (
          <>
            <p className="reading-intro">{body.intro}</p>

            <div className="lab-steps">
              {body.steps.map((s, i) => (
                <div key={i} className="lab-step">
                  <span className="ls-n mono">{i + 1}</span>
                  <p>{s}</p>
                </div>
              ))}
            </div>

            <NeuralNetLab accent={t.accent} onTrained={() => setCanComplete(true)} />

            <div className="takeaways">
              <div className="tk-lbl mono">WHAT YOU JUST PROVED</div>
              <ul>
                {body.takeaways.map((tk, i) => (
                  <li key={i}><Icon name="check" size={15} style={{ color: 'var(--accent)', flex: 'none', marginTop: 3 }} /> <span>{tk}</span></li>
                ))}
              </ul>
            </div>

            {!canComplete && !done && (
              <div className="complete-hint mono"><Icon name="bolt" size={14} fill="currentColor" stroke={0} style={{ color: 'var(--accent)' }} /> Train the network to ~88% accuracy to complete this lesson.</div>
            )}
          </>
        ) : (
          <ReadingBody lesson={lesson} courseId={c.id} />
        )}

        <div className="lesson-foot">
          <button className="btn outline" disabled={!prev} onClick={() => prev && nav('lesson', { course: c.id, lesson: prev.id })}>
            <Icon name="arrowL" size={16} /> Previous
          </button>
          <div className="row">
            {done
              ? <button className="btn" onClick={goNext}>{next ? 'Next lesson' : 'Finish course'} <Icon name="arrowR" size={16} /></button>
              : <button className="btn" disabled={!canComplete} onClick={onComplete}>
                  <Icon name="check" size={16} /> Complete <span className="xp-plus">+{xpFor} XP</span>
                </button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonChrome({ c, lesson, idx, depth, ctx }) {
  const { nav } = ctx;
  return (
    <div className="lesson-chrome">
      <button className="btn ghost sm" onClick={() => nav('course', { course: c.id })}><Icon name="arrowL" size={15} /> {c.title}</button>
      <div className="lc-prog">
        <span className="mono faint">LESSON {idx + 1} / {c.lessons.length}</span>
        <div className="lc-dots">
          {c.lessons.map((l, i) => <span key={i} className={'lc-dot' + (i === idx ? ' cur' : '') + (ctx.stats.completed.has(c.id + ':' + l.id) ? ' done' : '')} />)}
        </div>
      </div>
    </div>
  );
}

window.LessonPlayer = LessonPlayer;
