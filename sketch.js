/* firebase */
firebase.initializeApp({
  apiKey: "AIzaSyDtbPICrsVz5mBs7XIuGdGJ4WqELORQElk",
  authDomain: "psora-9110d.firebaseapp.com",
  databaseURL: "https://psora-9110d-default-rtdb.firebaseio.com",
  projectId: "psora-9110d",
  storageBucket: "psora-9110d.firebasestorage.app",
  messagingSenderId: "671697488457",
  appId: "1:671697488457:web:875c8978b37473782acd98"
});
let dbRef = firebase.database().ref("psora/canvas");

const SVG_W = 411;
const SVG_H = 640;
const BTN_AREA = 80;
let SVG_X, SVG_Y, svgScale, dispW, dispH;

function computeLayout() {
  svgScale = min(1, windowWidth / SVG_W, (windowHeight - BTN_AREA) / SVG_H);
  dispW = SVG_W * svgScale;
  dispH = SVG_H * svgScale;
  SVG_X = (windowWidth - dispW) / 2;
  SVG_Y = (windowHeight - dispH - BTN_AREA) / 2;
}

let drawColor = [240, 84, 35, 100];
let lastPrinted = 0;
let lastBroadcast = 0;
let drawLayer;
let clearBtn;

function positionHeadImg() {
  var img = document.getElementById('headSvg');
  img.style.left   = SVG_X + 'px';
  img.style.top    = SVG_Y + 'px';
  img.style.width  = dispW + 'px';
  img.style.height = dispH + 'px';
  img.style.display = 'block';
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  computeLayout();
  positionHeadImg();

  drawLayer = createGraphics(SVG_W, SVG_H);
  drawLayer.clear();

  clearBtn = createButton("Clear");
  clearBtn.position(SVG_X + dispW / 2 - 50, SVG_Y + dispH + 24);
  styleButton(clearBtn, "#fff", "#F05423");
  clearBtn.mousePressed(clearCanvas);
}

function draw() {
  clear();
  image(drawLayer, SVG_X, SVG_Y, dispW, dispH);

  if (mouseIsPressed) {
    let lx = (pmouseX - SVG_X) / svgScale;
    let ly = (pmouseY - SVG_Y) / svgScale;
    let mx = (mouseX - SVG_X) / svgScale;
    let my = (mouseY - SVG_Y) / svgScale;
    if (mx >= 0 && mx <= SVG_W && my >= 0 && my <= SVG_H) {
      drawLayer.noStroke();
      drawLayer.fill(drawColor);
      let d = dist(lx, ly, mx, my);
      let steps = max(1, ceil(d / 3));
      for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let x = lerp(lx, mx, t);
        let y = lerp(ly, my, t);
        drawLayer.ellipse(x, y, 20, 20);
      }
    }
  }

  checkFill();
}

function checkFill() {
  drawLayer.loadPixels();
  let filled = 0;
  let total = SVG_W * SVG_H;
  for (let i = 3; i < drawLayer.pixels.length; i += 4) {
    if (drawLayer.pixels[i] > 10) filled++;
  }
  let pct = (filled / total) * 100;
  let rounded = floor(pct);
  if (rounded > lastPrinted) {
    print(rounded + "%");
    lastPrinted = rounded;
  }

  if (millis() - lastBroadcast > 200) {
    lastBroadcast = millis();
    let level = min(5, max(1, ceil(pct / 6)));
    if (pct < 0.5) level = 0;
    dbRef.set({
      percentage: pct,
      stressLevel: level,
      timestamp: Date.now(),
      thumbnail: document.querySelector("canvas").toDataURL("image/jpeg", 0.3),
    });
  }
}

function clearCanvas() {
  drawLayer.clear();
  lastPrinted = 0;
  print("Canvas cleared");
  dbRef.set({
    percentage: 0,
    stressLevel: 0,
    timestamp: Date.now(),
    thumbnail: null,
  });
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeLayout();
  positionHeadImg();
  clearBtn.position(SVG_X + dispW / 2 - 50, SVG_Y + dispH + 24);
}

function styleButton(btn, bg, textCol) {
  btn.style("font-family", "sans-serif");
  btn.style("font-size", "15px");
  btn.style("padding", "14px 32px");
  btn.style("border-radius", "100px");
  btn.style("border", "1.5px solid #F05423");
  btn.style("background", bg);
  btn.style("color", textCol);
  btn.style("cursor", "pointer");
}

document.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});
