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

let drawColor = [240, 84, 35, 100];
let lastPrinted = 0;
let lastBroadcast = 0;
let bodyImg;
let bodyLines;
let drawLayer;
let clearBtn, confirmBtn;

function preload() {
  bodyLines = loadStrings("drawing1.txt");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  let svgString = bodyLines.join("\n");
  let blob = new Blob([svgString], { type: "image/svg+xml" });
  let url = URL.createObjectURL(blob);
  bodyImg = loadImage(url);

  drawLayer = createGraphics(width, height);
  drawLayer.clear();

  clearBtn = createButton("Clear");
  clearBtn.position(width - 280, height - 70);
  styleButton(clearBtn, "#fff", "#F05423");
  clearBtn.mousePressed(clearCanvas);

  confirmBtn = createButton("Confirm");
  confirmBtn.position(width - 160, height - 70);
  styleButton(confirmBtn, "#F05423", "#fff");
  confirmBtn.mousePressed(confirmDrawing);
}

function draw() {
  background(255);
  drawBody();
  image(drawLayer, 0, 0);

  if (mouseIsPressed) {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      drawLayer.noStroke();
      drawLayer.fill(drawColor);
      let d = dist(pmouseX, pmouseY, mouseX, mouseY);
      let steps = max(1, ceil(d / 3));
      for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let x = lerp(pmouseX, mouseX, t);
        let y = lerp(pmouseY, mouseY, t);
        drawLayer.ellipse(x, y, 20, 20);
      }
    }
  }

  checkFill();
}

function drawBody() {
  if (bodyImg && bodyImg.width > 0) {
    let s = max(width / 1440, height / 1024);
    let w = 1440 * s;
    let h = 1024 * s;
    image(bodyImg, (width - w) / 2, (height - h) / 2, w, h);
  }
}

function checkFill() {
  drawLayer.loadPixels();
  let filled = 0;
  let total = width * height;
  for (let i = 3; i < drawLayer.pixels.length; i += 4) {
    if (drawLayer.pixels[i] > 10) filled++;
  }
  let pct = (filled / total) * 100;
  let rounded = floor(pct);
  if (rounded > lastPrinted) {
    print(rounded + "%");
    lastPrinted = rounded;
  }

  // only broadcast every 200ms
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
  let total = width * height;
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