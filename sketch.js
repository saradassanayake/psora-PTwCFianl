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

const PAGE_W = 1440;
const PAGE_H = 1024;
const SVG_W = 411;
const SVG_H = 640;
const SVG_X = (PAGE_W - SVG_W) / 2; // 514.5
const SVG_Y = (PAGE_H - SVG_H) / 2; // 192

let drawColor = [240, 84, 35, 100];
let lastPrinted = 0;
let lastBroadcast = 0;
let bodyImg;
let drawLayer;
let clearBtn, confirmBtn;

function preload() {
  bodyImg = loadImage("psora-head-svg.svg");
}

function setup() {
  createCanvas(PAGE_W, PAGE_H);
  background(255);

  drawLayer = createGraphics(SVG_W, SVG_H);
  drawLayer.clear();

  clearBtn = createButton("Clear");
  clearBtn.position(PAGE_W - 280, PAGE_H - 70);
  styleButton(clearBtn, "#fff", "#F05423");
  clearBtn.mousePressed(clearCanvas);

  confirmBtn = createButton("Confirm");
  confirmBtn.position(PAGE_W - 160, PAGE_H - 70);
  styleButton(confirmBtn, "#F05423", "#fff");
  confirmBtn.mousePressed(confirmDrawing);
}

function draw() {
  background(255);
  image(drawLayer, SVG_X, SVG_Y);
  if (bodyImg && bodyImg.width > 0) {
    image(bodyImg, SVG_X, SVG_Y, SVG_W, SVG_H);
  }

  if (mouseIsPressed) {
    let lx = pmouseX - SVG_X;
    let ly = pmouseY - SVG_Y;
    let mx = mouseX - SVG_X;
    let my = mouseY - SVG_Y;
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

function confirmDrawing() {
  drawLayer.loadPixels();
  let filled = 0;
  let total = SVG_W * SVG_H;
  for (let i = 3; i < drawLayer.pixels.length; i += 4) {
    if (drawLayer.pixels[i] > 10) filled++;
  }
  let pct = (filled / total) * 100;
  let level = min(5, max(1, ceil(pct / 6)));
  if (pct < 0.5) level = 0;
  print("Confirmed — " + nf(pct, 1, 1) + "% covered, stress level: " + level);

  dbRef.set({
    percentage: pct,
    stressLevel: level,
    timestamp: Date.now(),
    thumbnail: document.querySelector("canvas").toDataURL("image/jpeg", 0.3),
    confirmed: true,
  });

  confirmBtn.html("Sent!");
  confirmBtn.style("opacity", "0.6");
  setTimeout(() => {
    confirmBtn.html("Confirm");
    confirmBtn.style("opacity", "1");
  }, 2000);
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
