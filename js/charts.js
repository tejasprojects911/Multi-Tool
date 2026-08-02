/**
 * FinFlex MultiTools - HTML5 Canvas Chart Visualizer Engine
 * Fixed Canvas Sizing (No Overflow / Expansion on Input Update)
 */

function renderDonutChart(canvasId, labels, values, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Set fixed high-res internal drawing dimensions so redrawing never mutates layout size
  const renderWidth = 440;
  const renderHeight = 220;

  if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
    canvas.width = renderWidth;
    canvas.height = renderHeight;
  }

  ctx.clearRect(0, 0, renderWidth, renderHeight);

  // Validate values
  const validValues = values.map(v => Math.max(0, parseFloat(v) || 0));
  const total = validValues.reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 13px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No data to display', renderWidth / 2, renderHeight / 2);
    return;
  }

  const centerX = 110;
  const centerY = renderHeight / 2;
  const outerRadius = 80;
  const innerRadius = 50;

  let startAngle = -Math.PI / 2;

  // Draw Doughnut Slices
  validValues.forEach((val, i) => {
    if (val <= 0) return;
    const sliceAngle = (val / total) * (2 * Math.PI);
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = colors[i] || '#2563eb';
    ctx.fill();

    // Clean white slice separation line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    startAngle = endAngle;
  });

  // Center Text inside Donut
  ctx.fillStyle = '#0f172a';
  ctx.font = '400 13px Poppins, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Breakdown', centerX, centerY - 6);

  ctx.fillStyle = '#64748b';
  ctx.font = '400 11px Poppins, sans-serif';
  ctx.fillText('Overview', centerX, centerY + 10);

  // Draw Legend on the Right Side
  const legendX = 220;
  let legendY = 35;

  labels.forEach((label, i) => {
    const val = validValues[i];
    const pct = ((val / total) * 100).toFixed(1);

    // Color Swatch Circle
    ctx.beginPath();
    ctx.arc(legendX, legendY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = colors[i] || '#2563eb';
    ctx.fill();

    // Label Text
    ctx.fillStyle = '#0f172a';
    ctx.font = '400 12px Poppins, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Truncate long labels for clean display
    const cleanLabel = label.length > 18 ? label.substring(0, 16) + '...' : label;
    ctx.fillText(cleanLabel, legendX + 12, legendY);

    // Percentage
    ctx.fillStyle = '#64748b';
    ctx.font = '400 11px Poppins, sans-serif';
    ctx.fillText(`${pct}%`, legendX + 12, legendY + 15);

    legendY += 40;
  });
}
