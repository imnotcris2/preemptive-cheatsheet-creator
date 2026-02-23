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

// --- CHEAT SHEET DRAW FUNCTIONS ---
function draw(customCanvas = null, customCtx = null) {
  const canvasEl = customCanvas || mainCanvas;
  const ctxEl = customCtx || ctx;
  ctxEl.clearRect(0, 0, canvasEl.width, canvasEl.height);

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

function drawPie(ctxEl, x, y, radius, outlineColor, outlineWidth, index) {
  const showOrange = document.getElementById("showOrange").checked;
  const showPink = document.getElementById("showPink").checked;
  const showGreen = document.getElementById("showGreen").checked;

  const orangeInput = document.getElementById(`orange_${index}`);
  const greenInput = document.getElementById(`green_${index}`);

  let orange = Math.max(0, Math.min(100, Number(orangeInput.value)));
  let green = Math.max(0, Math.min(100, Number(greenInput.value)));

  if (orange + green > 100) {
    if (document.activeElement === orangeInput) {
      green = 100 - orange;
      greenInput.value = green;
    } else {
      orange = 100 - green;
      orangeInput.value = orange;
    }
  }

  const pink = 100 - (orange + green);

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

// --- WALLPAPER EDITOR ---
let offsetX = 200;
let offsetY = 200;
let scale = 1;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

const wpX = document.getElementById('wpX');
const wpY = document.getElementById('wpY');
const wpScale = document.getElementById('wpScale');
const wpBgColor = document.getElementById('wpBgColor');
const wpBgType = document.getElementById('wpBgType');
const wpColorControls = document.getElementById('wpColorControls');
const wpGradientControls = document.getElementById('wpGradientControls');
const wpGradientColor1 = document.getElementById('wpGradientColor1');
const wpGradientColor2 = document.getElementById('wpGradientColor2');
const wpGradientRotation = document.getElementById('wpGradientRotation');
const wpGradientOffset = document.getElementById('wpGradientOffset');
const wpFade = document.getElementById('wpFade');
const wpImageControls = document.getElementById('wpImageControls');
const wpBgImageInput = document.getElementById('wpBgImageInput');
let wallpaperBgImage = null;

// Draw wallpaper function
function drawWallpaper() {
  wpCtx.clearRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);

  if (wpBgType.value === 'color') {
    wpCtx.fillStyle = wpBgColor.value;
    wpCtx.fillRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);
  } else if (wpBgType.value === 'gradient') {
    const angleRad = wpGradientRotation.value * Math.PI / 180;
    const x2 = wallpaperCanvas.width * Math.cos(angleRad);
    const y2 = wallpaperCanvas.height * Math.sin(angleRad);

    const grad = wpCtx.createLinearGradient(0, 0, x2, y2);

    // --- NEW: calculate offset & softness ---
    const offset = parseFloat(wpGradientOffset.value);   // -1 to 1
    const softness = parseFloat(wpFade.value);           // 0 to 1

    // map offset to 0–1 range
    const middle = 0.5 + offset / 2; // 0.5 is center

    // apply softness to create two stops around middle
    const stop1 = Math.max(0, middle - softness / 2);
    const stop2 = Math.min(1, middle + softness / 2);

    const color1 = wpGradientColor1.value;
    const color2 = wpGradientColor2.value;

    grad.addColorStop(0, color1);     // start
    grad.addColorStop(stop1, color1); // hold first color until softened middle
    grad.addColorStop(stop2, color2); // transition to second color
    grad.addColorStop(1, color2);     // end

    wpCtx.fillStyle = grad;
    wpCtx.fillRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);
  } else if (wpBgType.value === 'image') {
    if (wallpaperBgImage && wallpaperBgImage.complete) {
      const imgScale = Math.max(
        wallpaperCanvas.width / wallpaperBgImage.width,
        wallpaperCanvas.height / wallpaperBgImage.height
      );
      const drawWidth = wallpaperBgImage.width * imgScale;
      const drawHeight = wallpaperBgImage.height * imgScale;
      const drawX = (wallpaperCanvas.width - drawWidth) / 2;
      const drawY = (wallpaperCanvas.height - drawHeight) / 2;
      wpCtx.drawImage(wallpaperBgImage, drawX, drawY, drawWidth, drawHeight);
    } else {
      wpCtx.fillStyle = wpBgColor.value;
      wpCtx.fillRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);
    }
  }

  // Draw cheat sheet
  wpCtx.save();
  wpCtx.translate(offsetX, offsetY);
  wpCtx.scale(scale, scale);
  wpCtx.drawImage(mainCanvas, 0, 0);
  wpCtx.restore();

  // Sync number inputs
  wpX.value = Math.round(offsetX);
  wpY.value = Math.round(offsetY);
  wpScale.value = parseFloat(scale.toFixed(2));
}

// Initialize wallpaper editor
wallpaperEditor.style.display = 'none';
updateWallpaperBgControls();
drawWallpaper();

// --- Helpers ---
function updateWallpaperBgControls() {
  if (!wpBgType) return;
  wpColorControls.style.display = wpBgType.value === 'color' ? 'flex' : 'none';
  wpGradientControls.style.display = wpBgType.value === 'gradient' ? 'flex' : 'none';
  wpImageControls.style.display = wpBgType.value === 'image' ? 'flex' : 'none';
}

// Resize dropdown
function resizeWpBgType() {
  const temp = document.createElement('span');
  temp.style.visibility = 'hidden';
  temp.style.whiteSpace = 'pre';
  temp.style.font = window.getComputedStyle(wpBgType).font;
  temp.textContent = wpBgType.options[wpBgType.selectedIndex].text;
  document.body.appendChild(temp);
  wpBgType.style.width = (temp.getBoundingClientRect().width + 30) + 'px';
  document.body.removeChild(temp);
}
resizeWpBgType();
wpBgType.addEventListener('change', () => {
  updateWallpaperBgControls();
  resizeWpBgType();
  drawWallpaper();
});

if (wpBgImageInput) {
  wpBgImageInput.addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      wallpaperBgImage = null;
      drawWallpaper();
      return;
    }

    const reader = new FileReader();
    reader.onload = loadEvent => {
      const img = new Image();
      img.onload = () => {
        wallpaperBgImage = img;
        drawWallpaper();
      };
      img.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Toggle wallpaper editor
let isWallpaperVisible = false;
toggleBtn.addEventListener('click', () => {
  isWallpaperVisible = !isWallpaperVisible;
  wallpaperEditor.style.display = isWallpaperVisible ? 'flex' : 'none';
  toggleBtn.textContent = isWallpaperVisible ? 'Remove Wallpaper' : 'Add Wallpaper';
  if (isWallpaperVisible) drawWallpaper();
});

// Wallpaper dragging & zoom
function getMousePos(e) {
  const rect = wallpaperCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (wallpaperCanvas.width / rect.width),
    y: (e.clientY - rect.top) * (wallpaperCanvas.height / rect.height)
  };
}

wallpaperCanvas.addEventListener('mousedown', e => {
  isDragging = true;
  const pos = getMousePos(e);
  dragStartX = pos.x - offsetX;
  dragStartY = pos.y - offsetY;
});
wallpaperCanvas.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const pos = getMousePos(e);
  offsetX = pos.x - dragStartX;
  offsetY = pos.y - dragStartY;
  drawWallpaper();
});
wallpaperCanvas.addEventListener('mouseup', () => isDragging = false);
wallpaperCanvas.addEventListener('mouseleave', () => isDragging = false);
wallpaperCanvas.addEventListener('wheel', e => {
  e.preventDefault();
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.1, scale), 5);
  drawWallpaper();
});

// Number input events
[wpX, wpY, wpScale].forEach(el => {
  if (!el) return;
  el.addEventListener('input', () => {
    offsetX = parseFloat(wpX.value);
    offsetY = parseFloat(wpY.value);
    scale = parseFloat(wpScale.value);
    drawWallpaper();
  });
});

// Input events to redraw main canvas & wallpaper
[
  "bgColor", "outlineColor", "outlineWidth",
  "pieOutlineColor", "pieOutlineWidth",
  "textSize", "textOutlineWidth"
].forEach(id => document.getElementById(id).addEventListener("input", () => { draw(); drawWallpaper(); }));

["showOrange", "showPink", "showGreen", "showBackground"].forEach(id =>
  document.getElementById(id).addEventListener("change", () => { draw(); drawWallpaper(); })
);

for (let i = 0; i < 4; i++) {
  document.getElementById(`orange_${i}`).addEventListener("input", () => { draw(); drawWallpaper(); });
  document.getElementById(`green_${i}`).addEventListener("input", () => { draw(); drawWallpaper(); });
}

[
  wpBgColor,
  wpGradientColor1,
  wpGradientColor2,
  wpGradientRotation,
  wpGradientOffset,
  wpFade
].forEach(el => {
  if (!el) return;
  el.addEventListener('input', drawWallpaper);
});

// Download functions
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
