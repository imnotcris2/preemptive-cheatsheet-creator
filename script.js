// Canvas Setup
const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

// Load Template Image
const templateImage = new Image();
templateImage.src = "images/template.png";

// Draw canvas when font and image are ready
Promise.all([
  new Promise(resolve => templateImage.onload = resolve),
  document.fonts.ready
]).then(() => {
  draw();
});

// Background Toggle Setup
// Grab elements
const showBgCheckbox = document.getElementById("showBackground");
const bgSettings = document.getElementById("backgroundSettings");

// Function to show/hide background settings
function toggleBackgroundSettings() {
  if (showBgCheckbox.checked) {
    bgSettings.style.display = "flex";
  } else {
    bgSettings.style.display = "none";
  }
}

// Listen for changes
showBgCheckbox.addEventListener("change", () => {
  toggleBackgroundSettings();
  draw();
});

// Initial call on page load
toggleBackgroundSettings();

// Main Draw Function
function draw() {
  const showBackground = document.getElementById("showBackground").checked;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background only if checkbox is checked
  if (showBackground) {
    const bgColor = document.getElementById("bgColor").value;
    const outlineColor = document.getElementById("outlineColor").value;
    const outlineWidth = Number(document.getElementById("outlineWidth").value);

    // Background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outline
    if (outlineWidth > 0) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineWidth;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Template image always drawn
  ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

  // Draw outer outline
  if (outlineWidth > 0) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  const pieOutlineColor = document.getElementById("pieOutlineColor").value;
  const pieOutlineWidth = Number(document.getElementById("pieOutlineWidth").value);

  // Pie positions
  const positions = [
    [340, 130],  // Only Spawner
    [730, 130],  // Chest in front
    [340, 380],  // Chest behind
    [730, 380]   // Library
  ];

  // Draw all 4 pies
  for (let i = 0; i < 4; i++) {
    drawPie(
      positions[i][0],
      positions[i][1],
      100,
      pieOutlineColor,
      pieOutlineWidth,
      i // pie index
    );
  }
}

function drawPie(x, y, radius, outlineColor, outlineWidth, index) {
  const showOrange = document.getElementById("showOrange").checked;
  const showPink = document.getElementById("showPink").checked;
  const showGreen = document.getElementById("showGreen").checked;

  // Get values
  let orange = Number(document.getElementById(`orange_${index}`).value);
  let green = Number(document.getElementById(`green_${index}`).value);
  orange = Math.max(0, Math.min(100, orange));
  green = Math.max(0, Math.min(100, green));
  let pink = 100 - (orange + green);
  if (pink < 0) pink = 0;

  // Pie slices objects
  let slices = [
    { value: orange, color: "#e76f51" },
    { value: pink, color: "#d84bbf" },
    { value: green, color: "#4cc96c" }
  ];

  // Sort slices for drawing clockwise by value descending
  let pieSlices = [...slices].sort((a, b) => b.value - a.value);

  // Draw pie slices clockwise
  let startAngle = -Math.PI / 2;
  pieSlices.forEach(slice => {
    if (slice.value <= 0) return;
    const sliceAngle = (slice.value / 100) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();

    ctx.fillStyle = slice.color;
    ctx.fill();

    if (outlineWidth > 0) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineWidth;
      ctx.stroke();
    }

    startAngle += sliceAngle;
  });

  // Outer border
  if (outlineWidth > 0) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.stroke();
  }

  // Draw text in fixed order: orange → pink → green
  drawStackedText(x, y, radius, [
    { value: orange, textColor: "#f3a94e", show: showOrange },
    { value: pink, textColor: "#e88cff", show: showPink },
    { value: green, textColor: "#45cc65", show: showGreen }
  ]);
}

function drawStackedText(x, y, radius, slices) {
  const textSize = Number(document.getElementById("textSize").value);
  const textOutlineWidth = Number(document.getElementById("textOutlineWidth").value);

  // Only show slices with show=true
  const visibleSlices = slices.filter(s => s.show && s.value > 0);
  if (visibleSlices.length === 0) return;

  const totalHeight = visibleSlices.length * textSize + (visibleSlices.length - 1) * 4;
  const verticalOffset = 30;
  let startY = y - totalHeight / 2 + textSize / 2 + verticalOffset;

  visibleSlices.forEach(slice => {
    const textX = x + radius * 0.45;
    const textY = startY;

    ctx.font = `bold ${textSize}px Minecraft`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (textOutlineWidth > 0) {
      ctx.lineWidth = textOutlineWidth;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(slice.value, textX, textY);
    }

    ctx.fillStyle = slice.textColor;
    ctx.fillText(slice.value, textX, textY);

    startY += textSize + 4;
  });
}

// Download PNG
function download() {
  const link = document.createElement("a");
  link.download = "cheatsheet.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Live updates for controls
["bgColor", "outlineColor", "outlineWidth", "pieOutlineColor", "pieOutlineWidth", "textSize", "textOutlineWidth"].forEach(id => {
  document.getElementById(id).addEventListener("input", draw);
});
["showPink", "showOrange", "showGreen"].forEach(id => {
  document.getElementById(id).addEventListener("change", draw);
});
for (let i = 0; i < 4; i++) {
  document.getElementById(`orange_${i}`).addEventListener("input", draw);
  document.getElementById(`green_${i}`).addEventListener("input", draw);
}
document.getElementById("showBackground").addEventListener("change", draw);