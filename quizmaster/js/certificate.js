/* ============================================================
   certificate.js — Canvas Certificate Renderer & Downloader
   QuizMaster Pro
   ============================================================ */

function drawRoundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);    ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);    ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
  ctx.lineTo(x, y + r);         ctx.quadraticCurveTo(x, y,         x + r, y);
  ctx.closePath();
  if (fill)   ctx.fill();
  if (stroke) ctx.stroke();
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR, color) {
  let rot  = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR); rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR); rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function renderCertificate(canvas, { name, quizTitle, score, date, certId }) {
  const W = 1200, H = 848;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  /* Background gradient */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#080d1c");
  bg.addColorStop(0.5, "#0b1122");
  bg.addColorStop(1,   "#060a18");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* Centre radial glow */
  const cg = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, 520);
  cg.addColorStop(0, "rgba(99,102,241,0.09)");
  cg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, W, H);

  /* Outer frame */
  ctx.strokeStyle = "rgba(240,180,41,0.55)"; ctx.lineWidth = 2.5;
  drawRoundRect(ctx, 22, 22, W-44, H-44, 8, false, true);
  ctx.strokeStyle = "rgba(240,180,41,0.2)";  ctx.lineWidth = 1;
  drawRoundRect(ctx, 35, 35, W-70, H-70, 4, false, true);

  /* Gold accent bars */
  const barGrad = () => {
    const g = ctx.createLinearGradient(80, 0, W-80, 0);
    g.addColorStop(0,    "rgba(240,180,41,0)");
    g.addColorStop(0.25, "rgba(240,180,41,0.85)");
    g.addColorStop(0.75, "rgba(240,180,41,0.85)");
    g.addColorStop(1,    "rgba(240,180,41,0)");
    return g;
  };
  ctx.fillStyle = barGrad(); ctx.fillRect(80, 76,    W-160, 3);
  ctx.fillStyle = barGrad(); ctx.fillRect(80, H-79,  W-160, 3);

  /* Corner dots */
  [[78,78],[W-78,78],[78,H-78],[W-78,H-78]].forEach(([cx,cy]) => {
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI*2);
    ctx.fillStyle = "#f0b429"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI*2);
    ctx.strokeStyle = "rgba(240,180,41,0.35)"; ctx.lineWidth = 1; ctx.stroke();
  });

  /* Side dotted lines */
  ctx.strokeStyle = "rgba(240,180,41,0.12)"; ctx.lineWidth = 1;
  ctx.setLineDash([3, 7]);
  ctx.beginPath(); ctx.moveTo(78, 100); ctx.lineTo(78, H-100); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W-78, 100); ctx.lineTo(W-78, H-100); ctx.stroke();
  ctx.setLineDash([]);

  /* Medal */
  const mx = W/2, my = 168;
  const mg = ctx.createRadialGradient(mx-12, my-12, 8, mx, my, 55);
  mg.addColorStop(0, "#fde68a"); mg.addColorStop(0.5, "#f59e0b"); mg.addColorStop(1, "#92400e");
  ctx.beginPath(); ctx.arc(mx, my, 55, 0, Math.PI*2);
  ctx.fillStyle = mg; ctx.fill();
  ctx.beginPath(); ctx.arc(mx, my, 60, 0, Math.PI*2);
  ctx.strokeStyle = "rgba(240,180,41,0.45)"; ctx.lineWidth = 2; ctx.stroke();
  drawStar(ctx, mx, my, 5, 30, 13, "#fffbeb");

  /* Headings */
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f0b429";
  ctx.font = "bold 15px Georgia, serif";
  ctx.letterSpacing = "10px";
  ctx.fillText("C E R T I F I C A T E", W/2, 270);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "rgba(148,163,184,0.8)";
  ctx.font = "11px Georgia, serif";
  ctx.letterSpacing = "5px";
  ctx.fillText("O F   A C H I E V E M E N T", W/2, 295);
  ctx.letterSpacing = "0px";

  /* Divider */
  const div = ctx.createLinearGradient(340, 0, 860, 0);
  div.addColorStop(0,   "rgba(240,180,41,0)");
  div.addColorStop(0.5, "rgba(240,180,41,0.45)");
  div.addColorStop(1,   "rgba(240,180,41,0)");
  ctx.strokeStyle = div; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(340, 314); ctx.lineTo(860, 314); ctx.stroke();

  /* "This certifies that" */
  ctx.fillStyle = "rgba(100,116,139,0.9)";
  ctx.font = "italic 16px Georgia, serif";
  ctx.fillText("This certifies that", W/2, 352);

  /* Name */
  ctx.shadowColor = "rgba(240,180,41,0.25)"; ctx.shadowBlur = 18;
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "bold 50px Georgia, serif";
  ctx.fillText(name, W/2, 422);
  ctx.shadowBlur = 0;

  /* Name underline */
  const nw = Math.min(ctx.measureText(name).width + 100, 720);
  const ul = ctx.createLinearGradient(W/2 - nw/2, 0, W/2 + nw/2, 0);
  ul.addColorStop(0, "rgba(240,180,41,0)"); ul.addColorStop(0.5, "rgba(240,180,41,0.55)"); ul.addColorStop(1, "rgba(240,180,41,0)");
  ctx.strokeStyle = ul; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W/2 - nw/2, 440); ctx.lineTo(W/2 + nw/2, 440); ctx.stroke();

  /* "has successfully completed" */
  ctx.fillStyle = "rgba(100,116,139,0.9)";
  ctx.font = "italic 16px Georgia, serif";
  ctx.fillText("has successfully completed the assessment", W/2, 480);

  /* Quiz title */
  const tg = ctx.createLinearGradient(300, 0, 900, 0);
  tg.addColorStop(0, "#818cf8"); tg.addColorStop(1, "#a78bfa");
  ctx.fillStyle = tg;
  ctx.font = "bold 30px Georgia, serif";
  ctx.fillText(quizTitle, W/2, 530);

  /* Score pill */
  const pw = 250, ph = 50, px = W/2 - pw/2, py = 556;
  const pg = ctx.createLinearGradient(px, py, px+pw, py);
  pg.addColorStop(0, "rgba(99,102,241,0.18)"); pg.addColorStop(1, "rgba(139,92,246,0.18)");
  ctx.fillStyle = pg;
  drawRoundRect(ctx, px, py, pw, ph, 25, true, false);
  ctx.strokeStyle = "rgba(129,140,248,0.45)"; ctx.lineWidth = 1;
  drawRoundRect(ctx, px, py, pw, ph, 25, false, true);
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D";
  ctx.fillStyle = "#f0b429";
  ctx.font = "bold 17px Georgia, serif";
  ctx.fillText(`Score: ${score}%  ·  Grade: ${grade}`, W/2, 588);

  /* Footer lines */
  ctx.strokeStyle = "rgba(51,65,85,0.7)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(160, 714); ctx.lineTo(430, 714); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(770, 714); ctx.lineTo(1040, 714); ctx.stroke();

  ctx.fillStyle = "rgba(100,116,139,0.6)"; ctx.font = "12px Georgia, serif";
  ctx.fillText("Date Issued",   295, 734);
  ctx.fillText("Authorized By", 905, 734);
  ctx.fillStyle = "rgba(148,163,184,0.85)"; ctx.font = "bold 13px Georgia, serif";
  ctx.fillText(date,              295, 754);
  ctx.fillText(Store.getSettings().institution || "QuizMaster Pro", 905, 754);

  /* Centre seal */
  const sx = W/2, sy = 730;
  const sg = ctx.createRadialGradient(sx, sy, 5, sx, sy, 36);
  sg.addColorStop(0, "rgba(99,102,241,0.22)"); sg.addColorStop(1, "rgba(99,102,241,0.04)");
  ctx.beginPath(); ctx.arc(sx, sy, 36, 0, Math.PI*2);
  ctx.fillStyle = sg; ctx.fill();
  ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(240,180,41,0.55)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(sx, sy, 32, 0, Math.PI*2); ctx.stroke();
  ctx.setLineDash([]);
  drawStar(ctx, sx, sy, 6, 16, 8, "rgba(240,180,41,0.85)");

  /* Certificate ID */
  ctx.fillStyle = "rgba(71,85,105,0.5)";
  ctx.font = "10px monospace";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`Certificate ID: ${certId}`, W/2, H - 32);
}

/* Open modal and render certificate */
function openCertModal(result) {
  const modal   = document.getElementById("certModal");
  const canvas  = document.getElementById("certCanvas");
  const infoEl  = document.getElementById("certInfo");
  const certIdEl= document.getElementById("certIdDisplay");
  const dlBtn   = document.getElementById("certDownloadBtn");

  const certId = `QMP-${result.quizId}-${String(result.id).slice(-6)}-${String(result.score).padStart(3,"0")}`;

  setTimeout(() => {
    renderCertificate(canvas, {
      name:      result.userName,
      quizTitle: result.quizTitle,
      score:     result.score,
      date:      result.date,
      certId,
    });
    if (infoEl)   infoEl.innerHTML   = `Awarded to <strong>${result.userName}</strong> for completing <strong style="color:var(--ind2)">${result.quizTitle}</strong> with a score of <strong style="color:var(--gold)">${result.score}%</strong>`;
    if (certIdEl) certIdEl.textContent = `Certificate ID: ${certId}`;
    dlBtn.disabled = false;
    dlBtn.onclick  = () => downloadCert(canvas, result, certId);
  }, 80);

  dlBtn.disabled = true;
  modal.classList.add("open");
}

function downloadCert(canvas, result, certId) {
  const link = document.createElement("a");
  link.download = `Certificate_${result.userName.replace(/ /g,"_")}_${result.quizTitle.replace(/ /g,"_")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function closeCertModal() {
  document.getElementById("certModal").classList.remove("open");
}
