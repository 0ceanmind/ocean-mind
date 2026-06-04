/* ============================================================
   OceanMind — Neural Network Lab  (the "tool is the lesson")
   A real 2->H->H->1 MLP trained with backprop in the browser.
   Live decision boundary, loss curve, accuracy. No libraries.
   Exposes (window): NeuralNetLab
   ============================================================ */

// ---- math helpers (module scope) ----
const nnTanh = (z) => Math.tanh(z);
const nnSig = (z) => 1 / (1 + Math.exp(-z));
function nnGauss() { // Box-Muller
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const NN_DOMAIN = 4; // coords live in [-4, 4]

function nnMakeNet(hidden) {
  // architecture: 2 -> hidden -> hidden -> 1
  const sizes = [2, hidden, hidden, 1];
  const W = [], B = [];
  for (let l = 1; l < sizes.length; l++) {
    const inN = sizes[l - 1], outN = sizes[l];
    const scale = 1 / Math.sqrt(inN);
    const w = [];
    for (let o = 0; o < outN; o++) {
      const row = [];
      for (let i = 0; i < inN; i++) row.push(nnGauss() * scale);
      w.push(row);
    }
    W.push(w);
    B.push(new Array(outN).fill(0).map(() => nnGauss() * 0.1));
  }
  return { sizes, W, B };
}

// forward pass, returns output + cached activations & pre-activations
function nnForward(net, x) {
  const acts = [x];          // activation per layer (incl input)
  const zs = [];             // pre-activation per weight layer
  let a = x;
  for (let l = 0; l < net.W.length; l++) {
    const w = net.W[l], b = net.B[l];
    const z = new Array(w.length);
    const out = new Array(w.length);
    const last = l === net.W.length - 1;
    for (let o = 0; o < w.length; o++) {
      let s = b[o];
      const row = w[o];
      for (let i = 0; i < a.length; i++) s += row[i] * a[i];
      z[o] = s;
      out[o] = last ? nnSig(s) : nnTanh(s);
    }
    zs.push(z); acts.push(out); a = out;
  }
  return { out: a[0], acts, zs };
}

// full-batch gradient descent, one epoch. returns {loss, acc}
function nnTrainEpoch(net, data, lr) {
  const L = net.W.length;
  const gW = net.W.map((w) => w.map((row) => row.map(() => 0)));
  const gB = net.B.map((b) => b.map(() => 0));
  let loss = 0, correct = 0;
  for (const p of data) {
    const { out, acts, zs } = nnForward(net, [p.x, p.y]);
    const y = p.c;
    const eps = 1e-7;
    loss += -(y * Math.log(out + eps) + (1 - y) * Math.log(1 - out + eps));
    if ((out > 0.5 ? 1 : 0) === y) correct++;
    // output delta (sigmoid + BCE => out - y)
    let delta = [out - y];
    for (let l = L - 1; l >= 0; l--) {
      const aPrev = acts[l];
      for (let o = 0; o < net.W[l].length; o++) {
        gB[l][o] += delta[o];
        const row = gW[l][o];
        for (let i = 0; i < aPrev.length; i++) row[i] += delta[o] * aPrev[i];
      }
      if (l > 0) {
        // propagate to previous activation, through tanh'
        const aCur = acts[l]; // activation of layer l (the tanh output of prev weight layer)
        const newDelta = new Array(net.W[l - 1].length).fill(0);
        for (let i = 0; i < newDelta.length; i++) {
          let s = 0;
          for (let o = 0; o < net.W[l].length; o++) s += net.W[l][o][i] * delta[o];
          newDelta[i] = s * (1 - aCur[i] * aCur[i]); // tanh derivative
        }
        delta = newDelta;
      }
    }
  }
  const N = data.length;
  for (let l = 0; l < L; l++) {
    for (let o = 0; o < net.W[l].length; o++) {
      net.B[l][o] -= lr * gB[l][o] / N;
      for (let i = 0; i < net.W[l][o].length; i++) net.W[l][o][i] -= lr * gW[l][o][i] / N;
    }
  }
  return { loss: loss / N, acc: correct / N };
}

// ---- datasets ----
function nnDataset(kind) {
  const pts = [];
  const n = 90; // per class
  if (kind === 'clusters') {
    for (let i = 0; i < n; i++) {
      pts.push({ x: -1.6 + nnGauss() * 0.8, y: -1.1 + nnGauss() * 0.8, c: 0 });
      pts.push({ x: 1.6 + nnGauss() * 0.8, y: 1.1 + nnGauss() * 0.8, c: 1 });
    }
  } else if (kind === 'circle') {
    for (let i = 0; i < n; i++) {
      const r1 = Math.random() * 1.3, a1 = Math.random() * Math.PI * 2;
      pts.push({ x: Math.cos(a1) * r1, y: Math.sin(a1) * r1, c: 1 });
      const r2 = 2.2 + Math.random() * 1.2, a2 = Math.random() * Math.PI * 2;
      pts.push({ x: Math.cos(a2) * r2, y: Math.sin(a2) * r2, c: 0 });
    }
  } else { // spiral
    for (let i = 0; i < n; i++) {
      const r = (i / n) * 3.4 + 0.2;
      const t1 = (i / n) * 3.4 + nnGauss() * 0.08;
      pts.push({ x: r * Math.cos(t1 * 2.4), y: r * Math.sin(t1 * 2.4), c: 0 });
      pts.push({ x: r * Math.cos(t1 * 2.4 + Math.PI), y: r * Math.sin(t1 * 2.4 + Math.PI), c: 1 });
    }
  }
  return pts;
}

function nnHexToRgb(hex) {
  const h = hex.replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(x, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function NeuralNetLab({ accent = '#2dd4d4', onTrained }) {
  const DATASETS = [
    { id: 'clusters', label: 'Two clusters' },
    { id: 'circle', label: 'Circle' },
    { id: 'spiral', label: 'Spiral' },
  ];
  const [dataset, setDataset] = React.useState('clusters');
  const [neurons, setNeurons] = React.useState(6);
  const [lr, setLr] = React.useState(0.15);
  const [running, setRunning] = React.useState(false);
  const [stats, setStats] = React.useState({ epoch: 0, loss: null, acc: 0 });

  const canvasRef = React.useRef(null);
  const fieldRef = React.useRef(null);     // offscreen low-res field
  const netRef = React.useRef(null);
  const dataRef = React.useRef([]);
  const epochRef = React.useRef(0);
  const lossHistRef = React.useRef([]);
  const runRef = React.useRef(false);
  const rafRef = React.useRef(0);
  const trainedFiredRef = React.useRef(false);
  const accentRgb = React.useRef(nnHexToRgb(accent));
  accentRgb.current = nnHexToRgb(accent);

  const GRID = 50; // offscreen field resolution

  const rebuild = React.useCallback(() => {
    netRef.current = nnMakeNet(neurons);
    dataRef.current = nnDataset(dataset);
    epochRef.current = 0;
    lossHistRef.current = [];
    trainedFiredRef.current = false;
    setStats({ epoch: 0, loss: null, acc: 0 });
    draw();
    drawLoss();
    // eslint-disable-next-line
  }, [neurons, dataset]);

  // ---- drawing ----
  function draw() {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    // field
    let off = fieldRef.current;
    if (!off) { off = document.createElement('canvas'); off.width = GRID; off.height = GRID; fieldRef.current = off; }
    const octx = off.getContext('2d');
    const img = octx.createImageData(GRID, GRID);
    const net = netRef.current;
    const [ar, ag, ab] = accentRgb.current;
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const x = (gx / (GRID - 1)) * 2 * NN_DOMAIN - NN_DOMAIN;
        const y = NN_DOMAIN - (gy / (GRID - 1)) * 2 * NN_DOMAIN;
        const o = net ? nnForward(net, [x, y]).out : 0.5;
        // blend deep-navy (class0) -> accent (class1)
        const t = o;
        const r = 12 + (ar - 12) * t;
        const g = 20 + (ag - 20) * t;
        const b = 34 + (ab - 34) * t;
        const idx = (gy * GRID + gx) * 4;
        // gentle contrast so the boundary reads
        const k = 0.42 + 0.58 * Math.abs(t - 0.5) * 2; // confidence
        img.data[idx] = r * (0.55 + 0.45 * k);
        img.data[idx + 1] = g * (0.55 + 0.45 * k);
        img.data[idx + 2] = b * (0.55 + 0.45 * k);
        img.data[idx + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(off, 0, 0, GRID, GRID, 0, 0, W, H);

    // boundary contour (where out≈0.5) — subtle stroke via second pass is costly; skip.
    // grid lines
    ctx.strokeStyle = 'rgba(255,255,255,.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const p = (i / 8) * W;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(W, p); ctx.stroke();
    }

    // data points
    const toPx = (x, y) => [((x + NN_DOMAIN) / (2 * NN_DOMAIN)) * W, ((NN_DOMAIN - y) / (2 * NN_DOMAIN)) * H];
    for (const p of dataRef.current) {
      const [px, py] = toPx(p.x, p.y);
      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      if (p.c === 1) {
        ctx.fillStyle = '#eafeff';
        ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = accent; ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(8,14,26,.9)';
        ctx.fill();
        ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(190,205,220,.85)'; ctx.stroke();
      }
    }
  }

  function drawLoss() {
    const cv = document.getElementById('nnLoss'); if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    const hist = lossHistRef.current;
    // baseline
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H - 1); ctx.lineTo(W, H - 1); ctx.stroke();
    if (hist.length < 2) return;
    const maxL = Math.max(...hist, 0.001);
    ctx.beginPath();
    hist.forEach((l, i) => {
      const x = (i / (hist.length - 1)) * W;
      const yy = H - (l / maxL) * (H - 6) - 3;
      i === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    });
    ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.shadowColor = accent; ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function stepEpochs(k) {
    const net = netRef.current; if (!net) return;
    let last = { loss: 0, acc: 0 };
    for (let i = 0; i < k; i++) {
      last = nnTrainEpoch(net, dataRef.current, lr);
      epochRef.current++;
      if (epochRef.current % 2 === 0) {
        lossHistRef.current.push(last.loss);
        if (lossHistRef.current.length > 160) lossHistRef.current.shift();
      }
    }
    setStats({ epoch: epochRef.current, loss: last.loss, acc: last.acc });
    if (!trainedFiredRef.current && last.acc >= 0.88 && epochRef.current > 20) {
      trainedFiredRef.current = true;
      onTrained && onTrained();
    }
  }

  function loop() {
    if (!runRef.current) return;
    stepEpochs(3);
    draw(); drawLoss();
    rafRef.current = requestAnimationFrame(loop);
  }

  function toggleRun() {
    const next = !runRef.current;
    runRef.current = next; setRunning(next);
    if (next) rafRef.current = requestAnimationFrame(loop);
    else cancelAnimationFrame(rafRef.current);
  }
  function singleStep() {
    if (runRef.current) toggleRun();
    stepEpochs(1); draw(); drawLoss();
  }
  function reset() {
    if (runRef.current) toggleRun();
    rebuild();
  }

  // setup canvas sizing (DPR) once
  React.useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = cv.clientWidth;
    cv.width = size * dpr; cv.height = size * dpr;
    const lc = document.getElementById('nnLoss');
    if (lc) { lc.width = lc.clientWidth * dpr; lc.height = lc.clientHeight * dpr; }
    rebuild();
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line
  }, []);

  // rebuild on dataset/neuron change
  React.useEffect(() => { rebuild(); /* eslint-disable-next-line */ }, [dataset, neurons]);

  const lrPctLabels = lr.toFixed(2);

  return (
    <div className="nnlab">
      <div className="nn-stage">
        <div className="nn-canvas-wrap">
          <canvas ref={canvasRef} className="nn-canvas" />
          <div className="nn-legend">
            <span><i className="lg1" /> Class A</span>
            <span><i className="lg0" /> Class B</span>
          </div>
        </div>

        <div className="nn-side">
          <div className="nn-readouts">
            <div className="nn-ro">
              <div className="rok">Epoch</div>
              <div className="rov">{stats.epoch}</div>
            </div>
            <div className="nn-ro">
              <div className="rok">Loss</div>
              <div className="rov">{stats.loss == null ? '—' : stats.loss.toFixed(3)}</div>
            </div>
            <div className="nn-ro">
              <div className="rok">Accuracy</div>
              <div className="rov" style={{ color: stats.acc >= 0.88 ? 'var(--accent)' : undefined }}>
                {Math.round(stats.acc * 100)}%
              </div>
            </div>
          </div>
          <div className="nn-loss">
            <div className="nn-loss-lbl">LOSS OVER TIME ↓</div>
            <canvas id="nnLoss" className="nn-loss-canvas" />
          </div>
          <div className="nn-arch">
            <div className="nn-arch-lbl">NETWORK</div>
            <div className="nn-arch-diagram">
              {[2, neurons, neurons, 1].map((c, li, arr) => (
                <React.Fragment key={li}>
                  <div className="nn-col">
                    {Array.from({ length: Math.min(c, 8) }).map((_, i) => (
                      <span key={i} className={'nn-node' + (li === 0 ? ' in' : li === arr.length - 1 ? ' out' : '')} />
                    ))}
                  </div>
                  {li < arr.length - 1 && <div className="nn-syn" />}
                </React.Fragment>
              ))}
            </div>
            <div className="nn-arch-cap">2 inputs · {neurons}×{neurons} hidden · 1 output</div>
          </div>
        </div>
      </div>

      <div className="nn-controls">
        <div className="nn-ctl-main">
          <button className={'btn ' + (running ? 'outline' : '')} onClick={toggleRun} style={{ minWidth: 116 }}>
            <Icon name={running ? 'pause' : 'play'} size={16} fill={running ? 'none' : 'currentColor'} stroke={running ? 2 : 0} />
            {running ? 'Pause' : 'Train'}
          </button>
          <button className="btn ghost sm" onClick={singleStep}>Step ×1</button>
          <button className="btn ghost sm" onClick={reset}><Icon name="refresh" size={15} /> Reset</button>
        </div>

        <div className="nn-ctl-grid">
          <div className="nn-ctl">
            <div className="nn-ctl-top"><span>Dataset</span></div>
            <div className="nn-seg">
              {DATASETS.map((d) => (
                <button key={d.id} className={dataset === d.id ? 'on' : ''} onClick={() => setDataset(d.id)}>{d.label}</button>
              ))}
            </div>
          </div>
          <div className="nn-ctl">
            <div className="nn-ctl-top"><span>Learning rate</span><b>{lrPctLabels}</b></div>
            <input type="range" className="nn-range" min="0.01" max="0.5" step="0.01" value={lr}
              onChange={(e) => setLr(Number(e.target.value))} />
          </div>
          <div className="nn-ctl">
            <div className="nn-ctl-top"><span>Neurons / layer</span><b>{neurons}</b></div>
            <input type="range" className="nn-range" min="2" max="8" step="1" value={neurons}
              onChange={(e) => setNeurons(Number(e.target.value))} />
          </div>
        </div>
      </div>
    </div>
  );
}

window.NeuralNetLab = NeuralNetLab;
