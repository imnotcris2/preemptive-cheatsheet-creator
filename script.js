// Canvas Setup
const mainCanvas = document.getElementById("mainCanvas");
const ctx = mainCanvas.getContext("2d");

const wallpaperCanvas = document.getElementById("wallpaperCanvas");
const wpCtx = wallpaperCanvas.getContext("2d");

const wallpaperEditor = document.getElementById("wallpaperEditor");
const toggleBtn = document.getElementById("toggleWallpaperBtn");

// Template image
const templateImage = new Image();
templateImage.src = "images/template.png";

// Wait for fonts and template
Promise.all([new Promise(res => templateImage.onload = res), document.fonts.ready])
  .then(() => draw());

// Background toggle
const showBgCheckbox = document.getElementById("showBackground");
const bgSettings = document.getElementById("backgroundSettings");

function toggleBackgroundSettings() {
  bgSettings.style.display = showBgCheckbox.checked ? "flex" : "none";
  draw();
}

showBgCheckbox.addEventListener("change", toggleBackgroundSettings);
toggleBackgroundSettings();

// Main Draw Function
function draw(customCanvas = null, customCtx = null) {
  const canvasEl = customCanvas || mainCanvas;
  const ctxEl = customCtx || ctx;

  ctxEl.clearRect(0, 0, canvasEl.width, canvasEl.height);

  // Background
  if (showBgCheckbox.checked) {
    const bgColor = document.getElementById("bgColor").value;
    const outlineColor = document.getElementById("outlineColor").value;
    const outlineWidth = Number(document.getElementById("outlineWidth").value);

    ctxEl.fillStyle = bgColor;
    ctxEl.fillRect(0, 0, canvasEl.width, canvasEl.height);

    if (outlineWidth > 0) {
      ctxEl.strokeStyle = outlineColor;
      ctxEl.lineWidth = outlineWidth;
      ctxEl.strokeRect(0, 0, canvasEl.width, canvasEl.height);
    }
  }

  // Template
  ctxEl.drawImage(templateImage, 0, 0, canvasEl.width, canvasEl.height);

  const pieOutlineColor = document.getElementById("pieOutlineColor").value;
  const pieOutlineWidth = Number(document.getElementById("pieOutlineWidth").value);

  const positions = [
    [340, 130],
    [730, 130],
    [340, 380],
    [730, 380]
  ];

  for (let i = 0; i < 4; i++) {
    drawPie(ctxEl, positions[i][0], positions[i][1], 100, pieOutlineColor, pieOutlineWidth, i);
  }
}

// Pie Drawing
function drawPie(ctxEl, x, y, radius, outlineColor, outlineWidth, index) {
  const showOrange = document.getElementById("showOrange").checked;
  const showPink = document.getElementById("showPink").checked;
  const showGreen = document.getElementById("showGreen").checked;

  let orange = Number(document.getElementById(`orange_${index}`).value);
  let green = Number(document.getElementById(`green_${index}`).value);
  orange = Math.max(0, Math.min(100, orange));
  green = Math.max(0, Math.min(100, green));
  let pink = 100 - (orange + green);
  if (pink < 0) pink = 0;

  const slices = [
    { value: orange, color: "#e76f51" },
    { value: pink, color: "#d84bbf" },
    { value: green, color: "#4cc96c" }
  ];

  const pieSlices = [...slices].sort((a, b) => b.value - a.value);
  let startAngle = -Math.PI / 2;

  pieSlices.forEach(slice => {
    if (slice.value <= 0) return;
    const sliceAngle = (slice.value / 100) * 2 * Math.PI;

    ctxEl.beginPath();
    ctxEl.moveTo(x, y);
    ctxEl.arc(x, y, radius, startAngle, startAngle + sliceAngle);
    ctxEl.closePath();

    ctxEl.fillStyle = slice.color;
    ctxEl.fill();

    if (outlineWidth > 0) {
      ctxEl.strokeStyle = outlineColor;
      ctxEl.lineWidth = outlineWidth;
      ctxEl.stroke();
    }

    startAngle += sliceAngle;
  });

  if (outlineWidth > 0) {
    ctxEl.beginPath();
    ctxEl.arc(x, y, radius, 0, 2 * Math.PI);
    ctxEl.strokeStyle = outlineColor;
    ctxEl.lineWidth = outlineWidth;
    ctxEl.stroke();
  }

  drawStackedText(ctxEl, x, y, radius, [
    { value: orange, color: "#f3a94e", show: showOrange },
    { value: pink, color: "#e88cff", show: showPink },
    { value: green, color: "#45cc65", show: showGreen }
  ]);
}

// Text on Pie
function drawStackedText(ctxEl, x, y, radius, slices) {
  const textSize = Number(document.getElementById("textSize").value);
  const textOutlineWidth = Number(document.getElementById("textOutlineWidth").value);

  const visibleSlices = slices.filter(s => s.show && s.value > 0);
  if (!visibleSlices.length) return;

  const totalHeight = visibleSlices.length * textSize + (visibleSlices.length - 1) * 4;
  let startY = y - totalHeight / 2 + textSize / 2 + 35;

  visibleSlices.forEach(slice => {
    ctxEl.font = `bold ${textSize}px Minecraft`;
    ctxEl.textAlign = "center";
    ctxEl.textBaseline = "middle";

    if (textOutlineWidth > 0) {
      ctxEl.lineWidth = textOutlineWidth;
      ctxEl.strokeStyle = "#000000";
      ctxEl.strokeText(slice.value, x + radius * 0.45, startY);
    }

    ctxEl.fillStyle = slice.color;
    ctxEl.fillText(slice.value, x + radius * 0.45, startY);

    startY += textSize + 4;
  });
}

// Wallpaper Editor Toggle
let isWallpaperVisible = false;
toggleBtn.addEventListener("click", () => {
  isWallpaperVisible = !isWallpaperVisible;
  wallpaperEditor.style.display = isWallpaperVisible ? "flex" : "none";
  toggleBtn.textContent = isWallpaperVisible ? "Remove Wallpaper" : "Add Wallpaper";
  if (isWallpaperVisible) renderWallpaper();
});

// Render Wallpaper Canvas
function renderWallpaper() {
  const x = Number(document.getElementById("wpX").value);
  const y = Number(document.getElementById("wpY").value);
  const scale = Number(document.getElementById("wpScale").value);
  const bgColor = document.getElementById("wpBgColor").value;

  wpCtx.clearRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);

  wpCtx.fillStyle = bgColor;
  wpCtx.fillRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);

  wpCtx.save();
  wpCtx.translate(x, y);
  wpCtx.scale(scale, scale);
  wpCtx.drawImage(mainCanvas, 0, 0);
  wpCtx.restore();
}

// Download Functions
function download() {
  const link = document.createElement("a");
  link.download = "cheatsheet.png";
  link.href = mainCanvas.toDataURL();
  link.click();
}

function downloadWallpaper() {
  const link = document.createElement("a");
  link.download = "wallpaper.png";
  link.href = wallpaperCanvas.toDataURL();
  link.click();
}

// Real-time Updates
["bgColor", "outlineColor", "outlineWidth", "pieOutlineColor", "pieOutlineWidth", "textSize", "textOutlineWidth"]
  .forEach(id => document.getElementById(id).addEventListener("input", () => { draw(); renderWallpaper(); }));

["showOrange", "showPink", "showGreen", "showBackground"]
  .forEach(id => document.getElementById(id).addEventListener("change", () => { draw(); renderWallpaper(); }));

for (let i = 0; i < 4; i++) {
  document.getElementById(`orange_${i}`).addEventListener("input", () => { draw(); renderWallpaper(); });
  document.getElementById(`green_${i}`).addEventListener("input", () => { draw(); renderWallpaper(); });
}

["wpX", "wpY", "wpScale", "wpBgColor"].forEach(id =>
  document.getElementById(id).addEventListener("input", renderWallpaper)
);