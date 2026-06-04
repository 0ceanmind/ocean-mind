/* ============================================================
   OceanMind — platform content model
   Real, accurate AI-education content organized by depth.
   Exposed as window.OM
   ============================================================ */
(function () {
  // Six depths of the descent. tint = relative depth color used in the iceberg UI.
  const depths = [
    {
      id: "surface", no: "01", name: "Surface", range: "0–40 m",
      who: "Curious beginners, zero prior knowledge",
      blurb: "What AI actually is, where it came from, and how to think clearly about it.",
      reqXP: 0,
    },
    {
      id: "shallows", no: "02", name: "Just Below the Surface", range: "40–120 m",
      who: "Beginners moving toward intermediate",
      blurb: "How machines learn from data — neurons, training, loss, and generalization.",
      reqXP: 120,
    },
    {
      id: "middepth", no: "03", name: "Mid Depth", range: "120–400 m",
      who: "Intermediate learners going deeper",
      blurb: "Inside large language models: tokens, embeddings, attention, and prompting.",
      reqXP: 520,
    },
    {
      id: "deepwaters", no: "04", name: "Deep Waters", range: "400–1000 m",
      who: "Builders shipping with AI",
      blurb: "Engineering with models: APIs, retrieval, agents, and evaluation.",
      reqXP: 1200,
    },
    {
      id: "abyss", no: "05", name: "Abyss Zone", range: "1000–4000 m",
      who: "Experts who read research papers",
      blurb: "Fine-tuning, alignment, and reading the literature without drowning.",
      reqXP: 2600,
    },
    {
      id: "floor", no: "06", name: "Deep Ocean Floor", range: "4000 m +",
      who: "Researchers contributing to the field",
      blurb: "Reproduce papers, push the frontier. In development.",
      reqXP: 5000, inDev: true,
    },
  ];

  // Lesson kinds carry an icon + label in the UI.
  // type: "read" (concept), "lab" (live interactive), "quiz", "video"
  const courses = {
    "ai-really": {
      id: "ai-really", depth: "surface", title: "What Is AI, Really?",
      blurb: "Strip away the hype. Build an honest mental model of what these systems do and don't do.",
      hours: "2.5h", lessons: [
        { id: "l1", t: "The word everyone misuses", type: "read", dur: "8 min", free: true },
        { id: "l2", t: "Pattern machines, not minds", type: "read", dur: "10 min", free: true },
        { id: "l3", t: "Myth vs. reality", type: "quiz", dur: "6 min", free: false },
        { id: "l4", t: "A 70-year timeline you can scrub", type: "lab", dur: "12 min", free: false },
        { id: "l5", t: "Where AI fails (and why)", type: "read", dur: "9 min", free: false },
      ],
    },
    "ml-foundations": {
      id: "ml-foundations", depth: "shallows", title: "Understanding Machine Learning",
      blurb: "The single idea under all of modern AI: a system that improves at a task by adjusting numbers in response to data.",
      hours: "4h", featured: true, lessons: [
        { id: "l1", t: "What 'learning' actually means", type: "read", dur: "9 min", free: true },
        { id: "l2", t: "Features & labels, by hand", type: "lab", dur: "11 min", free: true },
        { id: "l3", t: "The neuron: one tiny decision", type: "read", dur: "10 min", free: false },
        { id: "l4", t: "Watch a neural network learn", type: "lab", dur: "18 min", free: false, hero: true },
        { id: "l5", t: "Loss: measuring how wrong you are", type: "read", dur: "8 min", free: false },
        { id: "l6", t: "Gradient descent, intuitively", type: "read", dur: "12 min", free: false },
        { id: "l7", t: "Overfitting & generalization", type: "read", dur: "10 min", free: false },
        { id: "l8", t: "Checkpoint", type: "quiz", dur: "7 min", free: false },
      ],
    },
    "llm-inside": {
      id: "llm-inside", depth: "middepth", title: "How Large Language Models Work",
      blurb: "Open the black box: from a stream of tokens to a probability over the next word.",
      hours: "5h", lessons: [
        { id: "l1", t: "Text becomes numbers: tokenization", type: "lab", dur: "12 min", free: true },
        { id: "l2", t: "Embeddings: meaning as geometry", type: "read", dur: "11 min", free: false },
        { id: "l3", t: "Attention, visualized", type: "lab", dur: "15 min", free: false },
        { id: "l4", t: "Predicting the next token", type: "read", dur: "10 min", free: false },
        { id: "l5", t: "Temperature & sampling", type: "lab", dur: "9 min", free: false },
      ],
    },
    "prompt-mastery": {
      id: "prompt-mastery", depth: "middepth", title: "Prompt Engineering Mastery",
      blurb: "Reliable results from unreliable models. Patterns that survive contact with production.",
      hours: "3.5h", lessons: [
        { id: "l1", t: "The anatomy of a good prompt", type: "read", dur: "9 min", free: true },
        { id: "l2", t: "Live prompt studio", type: "lab", dur: "14 min", free: false },
        { id: "l3", t: "Few-shot & structure", type: "read", dur: "10 min", free: false },
        { id: "l4", t: "Evaluating outputs", type: "read", dur: "8 min", free: false },
      ],
    },
    "build-apps": {
      id: "build-apps", depth: "deepwaters", title: "Building AI-Powered Applications",
      blurb: "Wire models into real software: APIs, retrieval, tools, and guardrails.",
      hours: "6h", lessons: [
        { id: "l1", t: "Your first API call", type: "lab", dur: "12 min", free: true },
        { id: "l2", t: "Retrieval-augmented generation", type: "read", dur: "14 min", free: false },
        { id: "l3", t: "Tool use & agents", type: "read", dur: "13 min", free: false },
        { id: "l4", t: "Evaluation & cost", type: "read", dur: "11 min", free: false },
      ],
    },
    "fine-tune": {
      id: "fine-tune", depth: "abyss", title: "Fine-Tuning and Custom Models",
      blurb: "When prompting isn't enough: adapt a base model to your own distribution.",
      hours: "5h", lessons: [
        { id: "l1", t: "When to fine-tune (and when not to)", type: "read", dur: "10 min", free: true },
        { id: "l2", t: "Fine-tune simulator", type: "lab", dur: "16 min", free: false },
        { id: "l3", t: "LoRA & parameter-efficient methods", type: "read", dur: "13 min", free: false },
      ],
    },
    "research": {
      id: "research", depth: "floor", title: "Research Track",
      blurb: "Reproduce landmark papers and contribute original work. Opening soon.",
      hours: "—", inDev: true, lessons: [],
    },
  };

  // Long-form concept body + the hero lab's framing copy (accurate).
  const lessonBodies = {
    "ml-foundations:l4": {
      kind: "lab",
      lab: "neuralnet",
      title: "Watch a neural network learn",
      intro:
        "A neural network is just a stack of tiny adjustable decisions. On its own, one neuron can only draw a straight line. Stack a few together and train them, and the network can bend that line into almost any shape — learning to separate data no straight line could.",
      steps: [
        "Below is a live network with two inputs (the x and y position of each dot) and a small hidden layer. The background shows what the network currently believes: teal regions it calls one class, dark regions the other.",
        "Press Train. The network makes a guess, measures how wrong it is (the loss), and nudges every weight a little to do better. Watch the boundary bend in real time as the loss falls.",
        "Try the controls. A higher learning rate descends faster but can overshoot. More neurons can carve more complex shapes. Switch the dataset to the spiral and see why depth matters.",
      ],
      takeaways: [
        "Learning = repeatedly measuring error and adjusting weights to reduce it.",
        "A single neuron is linear; hidden layers let a network compose curved boundaries.",
        "Learning rate trades speed for stability; capacity trades flexibility for overfitting.",
      ],
    },
  };

  // B2C pricing (mirrors the investor brief)
  const plansB2C = [
    { name: "Free", price: "$0", sub: "forever", tier: "free",
      feats: ["Browse all six depths", "3 free lessons per depth", "No live AI tools", "No progress tracking"] },
    { name: "Explorer", price: "$14", per: "/mo", sub: "or $120 / year", tier: "explorer", feat: true, tag: "Popular",
      feats: ["Full access, all depths", "Every live AI tool", "Certificates", "Progress & streaks"] },
    { name: "Deep Diver", price: "$29", per: "/mo", sub: "or $240 / year", tier: "diver",
      feats: ["Everything in Explorer", "Priority AI speed", "Downloadable notes", "Community access"] },
  ];

  // B2B org seats (for the admin dashboard)
  const org = {
    name: "Meridian Labs",
    plan: "Team", seats: 50, seatsUsed: 38, renew: "Mar 2027",
    members: [
      { name: "Ava Chen", role: "ML Engineer", depth: 4, xp: 1840, streak: 22, active: "2h ago" },
      { name: "Marcus Hill", role: "Product", depth: 2, xp: 410, streak: 5, active: "1d ago" },
      { name: "Priya Nair", role: "Data Analyst", depth: 3, xp: 980, streak: 14, active: "4h ago" },
      { name: "Tomás Vidal", role: "Designer", depth: 1, xp: 90, streak: 0, active: "6d ago" },
      { name: "Lena Park", role: "Eng Manager", depth: 3, xp: 1120, streak: 9, active: "1h ago" },
      { name: "Sam Okoye", role: "Backend Eng", depth: 4, xp: 2010, streak: 31, active: "just now" },
    ],
    depthDistribution: [9, 12, 8, 6, 2, 0],
    weeklyActive: [22, 25, 28, 31, 30, 34, 38],
  };

  // Sample goals for onboarding
  const goals = [
    { id: "career", t: "Future-proof my career", d: "Stay ahead of how AI changes my field." },
    { id: "build", t: "Build with AI", d: "Ship products and tools powered by models." },
    { id: "understand", t: "Genuinely understand it", d: "Go past the hype to how it really works." },
    { id: "team", t: "Upskill my team", d: "Bring my whole org up the curve." },
  ];

  window.OM = { depths, courses, lessonBodies, plansB2C, org, goals };
})();
