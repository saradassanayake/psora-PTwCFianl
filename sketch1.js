let currentSlide = 1;
let slideStartTime = 0;

// Assumptions for slide 2
let phrases = [
  { text: '"Ouch. What\'s that on your hand?"',  px: 0.16, py: 0.47 },
  { text: '"Are you ok?"',                        px: 0.06, py: 0.30 },
  { text: '"Why is your skin like that?"',        px: 0.60, py: 0.13 },
  { text: '"Why is your skin red?"',              px: 0.43, py: 0.29 },
  { text: '"What\'s that on your neck?"',         px: 0.59, py: 0.46 },
  { text: '"Is your skin peeling off?"',          px: 0.07, py: 0.66 },
  { text: '"Is it contagious?"',                  px: 0.16, py: 0.82 },
  { text: '"Is that an infection?"',              px: 0.70, py: 0.66 },
  { text: '"That looks painful"',                 px: 0.40, py: 0.75 },
  { text: '"Is that a rash?"',                    px: 0.65, py: 0.87 },
  { text: '"Do you have a skin disease?"',        px: 0.40, py: 0.55 },
];

let PHRASE_INTERVAL = 1000; //how fast each phrase is animated form the previous one


function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Satoshi');
  slideStartTime = millis(); //time
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  switch (currentSlide) {
    case 1: drawSlide1(); break;
    case 2: drawSlide2(); break;
    case 3: drawSlide3(); break;
    case 4: drawSlide4(); break;
    case 5: drawSlide5(); break;
    case 6: drawSlide6(); break;
    case 7: drawSlide7(); break;
  }
}

// Startup Screen/Welcome
function drawSlide1() {
  background(255);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(width * 0.014);
  text("Welcome to Psora. Click anywhere to begin the experience.", width / 2, height / 2);
}

// Slide 2
function drawSlide2() {
  background(255);
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(width * 0.016);

  let elapsed = millis() - slideStartTime;

  for (let i = 0; i < phrases.length; i++) {
    if (elapsed >= i * PHRASE_INTERVAL) {
      let p = phrases[i];
      text(p.text, p.px * width, p.py * height);
    }
  }

  let allVisibleTime = phrases.length * PHRASE_INTERVAL;
  if (elapsed >= allVisibleTime + 2000) {
    goToSlide(3);
  }
}

// Slide 3
function drawSlide3() {
  background(255);
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(width * 0.016);

  let prefix = '"Do you have a ';
  let prefixW = textWidth(prefix);
  let baseX = 0.40 * width;
  let baseY = 0.55 * height;

  text("skin disease", baseX + prefixW, baseY);

  if (millis() - slideStartTime >= 5000) {
    goToSlide(4);
  }
}

// Slide 4
function drawSlide4() {
  background(255);
  document.getElementById('defSvg').style.display = 'block';
  if (millis() - slideStartTime >= 5000) {
    goToSlide(5);
  }
}

// ─── SLIDE 5: Stats ──────────────────────────────────────────
function drawSlide5() {
  background(255);
  document.getElementById('slide5Svg').style.display = 'block';
  if (millis() - slideStartTime >= 5000) {
    goToSlide(6);
  }
}

// ─── SLIDE 6: Black bg text ─────────────────────────────────
function drawSlide6() {
  background(0);
  document.getElementById('slide6Svg').style.display = 'block';
  if (millis() - slideStartTime >= 5000) {
    goToSlide(7);
  }
}

// ─── SLIDE 7: Stress reflection ──────────────────────────────
function drawSlide7() {
  background(0);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text(
    "Current stress management tools often ask you to\nrate your stress from 1-5. Individuals with psoriatic\nconditions can't simply condense their stress into a\nnumber, given it shows up physically on their body.",
    width / 2,
    height / 2 - 40
  );

  if (millis() - slideStartTime >= 5000) {
    textSize(18);
    text("But what if they could...", width / 2, height / 2 + 80);
  }

  if (millis() - slideStartTime >= 10000) {
    window.location.href = "laptop-viewer.html";
  }
}

// ─── HELPERS ─────────────────────────────────────────────────
function goToSlide(n) {
  currentSlide = n;
  slideStartTime = millis();
  ['defSvg', 'slide5Svg', 'slide6Svg'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function mousePressed() {
  if (currentSlide === 1) {
    goToSlide(2);
  }
}