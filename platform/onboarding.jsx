/* ============================================================
   OceanMind — Onboarding (pick depth + goal, then "log in")
   Exposes (window): Onboarding
   ============================================================ */

function Onboarding({ ctx }) {
  const { nav, setTweak, setStats } = ctx;
  const depths = window.OM.depths;
  const goals = window.OM.goals;
  const [step, setStep] = React.useState(0);
  const [pick, setPick] = React.useState(null);   // starting depth index
  const [goal, setGoal] = React.useState(null);

  const levelOptions = [
    { di: 0, t: "I'm brand new", d: "I've heard the buzzwords but couldn't explain how AI works." },
    { di: 1, t: "I know the basics", d: "I understand ML at a high level and want the mechanics." },
    { di: 3, t: "I build with AI", d: "I ship with models and want to go deeper, faster." },
  ];

  const finish = () => {
    const startXp = depths[pick ?? 0].reqXP + (pick ? 40 : 0);
    setStats((s) => ({ ...s, xp: startXp, streak: 1, completed: s.completed }));
    setTweak('authed', true);
    setTweak('depthProgress', pick ?? 0);
    nav('home', { welcomed: true });
  };

  const next = () => setStep((s) => s + 1);

  return (
    <div className="ob">
      <div className="ob-bg" />
      <div className="ob-panel">
        <div className="ob-brand"><span className="sb-mark" /> OceanMind</div>

        <div className="ob-dots">
          {[0, 1, 2].map((i) => <span key={i} className={'ob-dot' + (i <= step ? ' on' : '')} />)}
        </div>

        {step === 0 && (
          <div className="ob-step">
            <p className="ob-eyebrow">Welcome aboard</p>
            <h1 className="ob-h1">How deep do you<br />want to <b>go?</b></h1>
            <p className="ob-lead">OceanMind teaches AI as a dive, not a playlist. You'll pick a starting depth, then learn by using real AI tools — not watching videos about them. Let's find your waterline.</p>
            <div className="ob-actions">
              <button className="btn" onClick={next}>Begin the descent <Icon name="arrowR" size={16} /></button>
              <button className="btn ghost" onClick={() => nav('home')}>Explore as guest</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="ob-step">
            <p className="ob-eyebrow">Step 1 · Your waterline</p>
            <h2 className="ob-h2">Where should we start you?</h2>
            <div className="ob-cards">
              {levelOptions.map((o) => (
                <button key={o.di} className={'ob-card' + (pick === o.di ? ' sel' : '')} onClick={() => setPick(o.di)}>
                  <div className="ob-card-top">
                    <span className="ob-card-no mono">{depths[o.di].no}</span>
                    {pick === o.di && <Icon name="checkcircle" size={20} className="ob-tick" />}
                  </div>
                  <div className="ob-card-t">{o.t}</div>
                  <div className="ob-card-d">{o.d}</div>
                  <div className="ob-card-depth mono">Start at · {depths[o.di].name}</div>
                </button>
              ))}
            </div>
            <div className="ob-actions">
              <button className="btn" disabled={pick == null} onClick={next}>Continue <Icon name="arrowR" size={16} /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ob-step">
            <p className="ob-eyebrow">Step 2 · Your goal</p>
            <h2 className="ob-h2">What are you here to do?</h2>
            <div className="ob-goals">
              {goals.map((g) => (
                <button key={g.id} className={'ob-goal' + (goal === g.id ? ' sel' : '')} onClick={() => setGoal(g.id)}>
                  <span className="ob-goal-t">{g.t}</span>
                  <span className="ob-goal-d">{g.d}</span>
                  <span className="ob-goal-tick">{goal === g.id && <Icon name="check" size={16} />}</span>
                </button>
              ))}
            </div>
            <div className="ob-actions">
              <button className="btn" disabled={!goal} onClick={finish}>Enter OceanMind <Icon name="arrowR" size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.Onboarding = Onboarding;
