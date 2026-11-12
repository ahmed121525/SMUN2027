// Usage: import { createCursorZigzag } from './cursor-zigzag.js';

export function createCursorZigzag(opts = {}) {
  const options = Object.assign({
    container: document.body,
    zIndex: -9999,
    pointerEvents: 'none',
    count: 11,
    spacing: 0, // auto if null
    segLen: 9, // small base stroke (controls base size)
    altitudeFactor: 0.56, // triangle depth relative to segLen
    tension: 0.6,
    globalAlpha: 0.58, // BASE transparency (reduced for softer presence)
    headColor: '#c1121f',
    tailColor: '#fcbf49',
    clampMargin: 12,
    reduceOnSmall: true,
    minCountMobile: 7,
    gradientPower: 1.25,
    glow: true,
    glowBlur: 21,
    glowStrength: 0.9,
    outlineAlpha: 0.12,

    // vanish controls
    vanishNearSelectors: 'button, a, input[type="button"], input[type="submit"], [role="button"], .btn, .button, .flip-card, .flip-card *, .committee-item',
    vanishDistance: 72,
    idleTimeout: 500,
    idleMoveThreshold: 2,
    fadeSpeed: 0.12
  }, opts);

  // Hard stop for touch / coarse-pointer devices.
  const isTouchLike =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches ||
    navigator.maxTouchPoints > 0;

  if (isTouchLike) {
    return {
      destroy() {},
      setColors() {},
      el: null
    };
  }

  // --- color helpers (HSL interpolation for rich gradient) ---
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const bi = parseInt(h, 16);
    return { r: (bi >> 16) & 255, g: (bi >> 8) & 255, b: bi & 255 };
  }

  function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h = h / 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToRgb({ h, s, l }) {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;

    if (s === 0) {
      const val = Math.round(l * 255);
      return { r: val, g: val, b: val };
    }

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hk = h / 360;

    const r = Math.round(hue2rgb(p, q, hk + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, hk) * 255);
    const b = Math.round(hue2rgb(p, q, hk - 1 / 3) * 255);

    return { r, g, b };
  }

  function mixHsl(aRgb, bRgb, t) {
    const a = rgbToHsl(aRgb), b = rgbToHsl(bRgb);
    let dh = b.h - a.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;

    const h = a.h + dh * t;
    const s = Math.min(100, (a.s + (b.s - a.s) * t) * 1.04);
    const l = Math.min(100, (a.l + (b.l - a.l) * t) * (1 - 0.02 * (1 - t)));
    return hslToRgb({ h, s, l });
  }

  function rgbStr(c, a = 1) {
    return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${a})`;
  }

  const HEAD_RGB = hexToRgb(options.headColor);
  const TAIL_RGB = hexToRgb(options.tailColor);

  // --- canvas setup ---
  const canvas = document.createElement('canvas');
  const s = canvas.style;
  s.position = 'fixed';
  s.left = '0';
  s.top = '0';
  s.right = '0';
  s.bottom = '0';
  s.width = '100%';
  s.height = '100%';
  s.zIndex = String(options.zIndex);
  s.pointerEvents = options.pointerEvents;
  s.userSelect = 'none';

  options.container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // DPR & sizing
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let vw = Math.max(1, window.innerWidth);
  let vh = Math.max(1, window.innerHeight);
  let cwidth = Math.round(vw * dpr);
  let cheight = Math.round(vh * dpr);

  canvas.width = cwidth;
  canvas.height = cheight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // adaptive spacing/count
  if (options.spacing == null) {
    const base = Math.min(vw, vh);
    options.spacing = Math.max(20, Math.round(base / 18));
  }

  if (options.reduceOnSmall && Math.min(vw, vh) < 480) {
    options.count = Math.max(options.minCountMobile, Math.round(options.count * 0.75));
    options.segLen = Math.max(12, Math.round(options.segLen * 0.72));
  }

  // chain
  let joints = new Array(options.count).fill(0).map((_, i) => ({
    x: (vw / 2) - i * options.spacing,
    y: vh / 2,
    angle: 0
  }));

  // pointer / idle tracking
  const cursor = { x: vw / 2, y: vh / 2, inside: true };
  let lastMoveTime = performance.now();
  let lastMovePos = { x: cursor.x, y: cursor.y };
  let visibility = 1.0;
  let targetVisibility = 1.0;

  // canvas loop control
  let raf = null;
  let running = false;
  let hidden = document.hidden;
  let lastFrameTime = 0;
  let resizeTimer = null;

  // DOM proximity cache
  let vanishNodes = [];
  let candidatesDirty = true;
  let lastCandidateRefresh = 0;
  let mutationObserver = null;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function scheduleFrame() {
    if (raf != null) return;
    raf = requestAnimationFrame(loop);
    running = true;
  }

  function stopLoop() {
    if (raf != null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    running = false;
  }

  function invalidateCandidates() {
    candidatesDirty = true;
  }

  function refreshCandidates(force = false) {
    const now = performance.now();
    if (!force && !candidatesDirty && (now - lastCandidateRefresh) < 220) return;

    try {
      vanishNodes = Array.from(document.querySelectorAll(options.vanishNearSelectors));
    } catch {
      vanishNodes = [];
    }

    candidatesDirty = false;
    lastCandidateRefresh = now;
  }

  // helper: compute distance from cursor to DOM rect (closest point on rect)
  function rectDistanceToPoint(rect, px, py) {
    const dx = px < rect.left ? rect.left - px : (px > rect.right ? px - rect.right : 0);
    const dy = py < rect.top ? rect.top - py : (py > rect.bottom ? py - rect.bottom : 0);
    return Math.hypot(dx, dy);
  }

  function setCursorFromEventCoords(cx, cy) {
    const m = options.clampMargin;
    const clampedX = Math.max(m, Math.min(vw - m, cx));
    const clampedY = Math.max(m, Math.min(vh - m, cy));

    cursor.x = clampedX;
    cursor.y = clampedY;
    cursor.inside = true;

    const now = performance.now();
    const dx = cursor.x - lastMovePos.x;
    const dy = cursor.y - lastMovePos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > options.idleMoveThreshold) {
      lastMoveTime = now;
      lastMovePos.x = cursor.x;
      lastMovePos.y = cursor.y;
    }

    scheduleFrame();
  }

  function onMove(e) {
    let cx, cy;
    if (e.touches && e.touches[0]) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else {
      cx = e.clientX;
      cy = e.clientY;
    }
    setCursorFromEventCoords(cx, cy);
  }

  function onLeave() {
    cursor.inside = false;
    lastMoveTime = performance.now() - options.idleTimeout - 10;
    scheduleFrame();
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseleave', onLeave);
  window.addEventListener('blur', onLeave);

  function onResize() {
    const newVw = Math.max(1, window.innerWidth);
    const newVh = Math.max(1, window.innerHeight);
    const sx = newVw / vw;
    const sy = newVh / vh;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = newVw;
    vh = newVh;

    cwidth = Math.round(vw * dpr);
    cheight = Math.round(vh * dpr);
    canvas.width = cwidth;
    canvas.height = cheight;
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    joints.forEach(j => {
      j.x *= sx;
      j.y *= sy;
    });

    if (options.spacing == null) {
      options.spacing = Math.max(20, Math.round(Math.min(vw, vh) / 18));
    }

    invalidateCandidates();
    scheduleFrame();

    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
    }, 120);
  }

  window.addEventListener('resize', onResize);

  if (typeof MutationObserver !== 'undefined') {
    mutationObserver = new MutationObserver(() => {
      invalidateCandidates();
    });

    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'role', 'type']
    });
  }

  function computeVisibility(now) {
    refreshCandidates(false);

    let nearElement = false;
    const threshold = options.vanishDistance;

    for (let i = 0; i < vanishNodes.length; i++) {
      const node = vanishNodes[i];
      if (!(node instanceof Element)) continue;

      const rect = node.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      const dist = rectDistanceToPoint(rect, cursor.x, cursor.y);
      if (dist <= threshold) {
        nearElement = true;
        break;
      }
    }

    const idle = (now - lastMoveTime) >= options.idleTimeout;
    targetVisibility = (nearElement || idle || hidden) ? 0.0 : 1.0;
    visibility = lerp(visibility, targetVisibility, options.fadeSpeed);
  }

  function update(now) {
    // leader target
    const lead = joints[0];
    const tx = cursor.inside ? cursor.x : vw / 2;
    const ty = cursor.inside ? cursor.y : vh / 2;
    lead.x = lerp(lead.x, tx, 0.22);
    lead.y = lerp(lead.y, ty, 0.22);

    // spacing chain
    for (let i = 1; i < joints.length; i++) {
      const prev = joints[i - 1], cur = joints[i];
      const dx = prev.x - cur.x;
      const dy = prev.y - cur.y;
      const ang = Math.atan2(dy, dx);
      const tx2 = prev.x - Math.cos(ang) * options.spacing;
      const ty2 = prev.y - Math.sin(ang) * options.spacing;
      cur.x = lerp(cur.x, tx2, options.tension);
      cur.y = lerp(cur.y, ty2, options.tension);
      cur.angle = ang;
      cur.x = Math.max(0, Math.min(vw, cur.x));
      cur.y = Math.max(0, Math.min(vh, cur.y));
    }

    computeVisibility(now);
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const almostGone = visibility < 0.02;

    ctx.lineJoin = 'miter';
    ctx.lineCap = 'butt';

    for (let i = 0; i < joints.length; i++) {
      const s = joints[i];
      const t = i / (joints.length - 1);
      const t2 = Math.pow(t, options.gradientPower);
      const colorRgb = mixHsl(HEAD_RGB, TAIL_RGB, t2);

      const strokeAlpha = Math.min(1, options.globalAlpha * visibility * (0.9 + t * 0.18));
      if (strokeAlpha <= 0.01) continue;

      const strokeColor = rgbStr(colorRgb, strokeAlpha);
      const baseHalf = Math.max(3.2, options.segLen * 0.36 * (1 - t * 0.35));
      const tipDist = options.segLen * (options.altitudeFactor * (0.9 + t * 0.35));

      const backAng = s.angle + Math.PI;
      const tipX = s.x + Math.cos(backAng) * tipDist;
      const tipY = s.y + Math.sin(backAng) * tipDist;
      const perpX = Math.cos(s.angle + Math.PI / 2);
      const perpY = Math.sin(s.angle + Math.PI / 2);
      const baseLeftX = s.x + perpX * baseHalf;
      const baseLeftY = s.y + perpY * baseHalf;
      const baseRightX = s.x - perpX * baseHalf;
      const baseRightY = s.y - perpY * baseHalf;

      if (options.glow && !almostGone) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(baseLeftX, baseLeftY);
        ctx.lineTo(baseRightX, baseRightY);
        ctx.closePath();
        ctx.lineWidth = Math.max(6, (6 + (1 - t) * 2)) * (0.6 + 0.4 * visibility);
        ctx.strokeStyle = strokeColor;
        ctx.shadowBlur = options.glowBlur;
        ctx.shadowColor = rgbStr(colorRgb, Math.min(1, strokeAlpha * options.glowStrength));
        ctx.globalCompositeOperation = 'lighter';
        ctx.stroke();
        ctx.restore();

        if (options.outlineAlpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(baseLeftX, baseLeftY);
          ctx.lineTo(baseRightX, baseRightY);
          ctx.closePath();
          ctx.lineWidth = Math.max(1.2, 1.8 * (1 - t * 0.6));
          ctx.strokeStyle = `rgba(8,8,8,${options.outlineAlpha * visibility})`;
          ctx.shadowBlur = 0;
          ctx.globalCompositeOperation = 'source-over';
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(baseLeftX, baseLeftY);
      ctx.lineTo(baseRightX, baseRightY);
      ctx.closePath();
      ctx.lineWidth = Math.max(1.2, 1.8 * (1 - t * 0.6));
      ctx.strokeStyle = rgbStr(colorRgb, strokeAlpha);
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
      ctx.stroke();
    }

    if (visibility > 0.01) {
      const head = joints[0];
      const next = joints[1] || head;
      const hang = Math.atan2(next.y - head.y, next.x - head.x);
      const headTip = {
        x: head.x + Math.cos(hang) * (options.segLen * 0.9),
        y: head.y + Math.sin(hang) * (options.segLen * 0.9)
      };
      const headPerp = {
        x: Math.cos(hang + Math.PI / 2),
        y: Math.sin(hang + Math.PI / 2)
      };
      const headBase = Math.max(5, options.segLen * 0.44);
      const left = {
        x: head.x + headPerp.x * headBase,
        y: head.y + headPerp.y * headBase
      };
      const right = {
        x: head.x - headPerp.x * headBase,
        y: head.y - headPerp.y * headBase
      };
      const headRgb = mixHsl(HEAD_RGB, TAIL_RGB, 0);

      if (options.glow && !almostGone) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(headTip.x, headTip.y);
        ctx.lineTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.closePath();
        ctx.lineWidth = 8 * (0.6 + 0.4 * visibility);
        ctx.strokeStyle = rgbStr(headRgb, visibility);
        ctx.shadowBlur = options.glowBlur * 1.15;
        ctx.shadowColor = rgbStr(headRgb, 0.95 * visibility);
        ctx.globalCompositeOperation = 'lighter';
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.moveTo(headTip.x, headTip.y);
      ctx.lineTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.closePath();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = rgbStr(headRgb, visibility);
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
      ctx.stroke();

      ctx.lineWidth = 1.0;
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * visibility})`;
      const eyeX = head.x + Math.cos(hang) * (options.segLen * 0.4);
      const eyeY = head.y + Math.sin(hang) * (options.segLen * 0.4);
      ctx.beginPath();
      ctx.moveTo(
        eyeX - Math.cos(hang + Math.PI / 2) * 2.2,
        eyeY - Math.sin(hang + Math.PI / 2) * 2.2
      );
      ctx.lineTo(
        eyeX + Math.cos(hang + Math.PI / 2) * 2.2,
        eyeY + Math.sin(hang + Math.PI / 2) * 2.2
      );
      ctx.stroke();
    }
  }

  function shouldKeepRunning(now) {
    if (hidden) return false;

    // Keep animating while the chain is still settling, while visibility is fading,
    // or while the pointer is recently active.
    const recentlyMoved = (now - lastMoveTime) < options.idleTimeout;
    const visibilitySettling = Math.abs(visibility - targetVisibility) > 0.02;

    let chainSettling = false;
    const lead = joints[0];
    const tx = cursor.inside ? cursor.x : vw / 2;
    const ty = cursor.inside ? cursor.y : vh / 2;
    if (Math.abs(lead.x - tx) > 0.15 || Math.abs(lead.y - ty) > 0.15) {
      chainSettling = true;
    } else {
      for (let i = 1; i < joints.length; i++) {
        const prev = joints[i - 1], cur = joints[i];
        const dx = prev.x - cur.x;
        const dy = prev.y - cur.y;
        const ang = Math.atan2(dy, dx);
        const tx2 = prev.x - Math.cos(ang) * options.spacing;
        const ty2 = prev.y - Math.sin(ang) * options.spacing;
        if (Math.abs(cur.x - tx2) > 0.15 || Math.abs(cur.y - ty2) > 0.15) {
          chainSettling = true;
          break;
        }
      }
    }

    return recentlyMoved || visibilitySettling || chainSettling || visibility > 0.01;
  }

  function loop(now) {
    raf = null;

    // cap to roughly 60fps without forcing the tab to do pointless extra work.
    if (now - lastFrameTime < 16) {
      scheduleFrame();
      return;
    }
    lastFrameTime = now;

    update(now);
    render();

    if (shouldKeepRunning(now)) {
      scheduleFrame();
    } else {
      stopLoop();
    }
  }

  function onVisibilityChange() {
    hidden = document.hidden;
    if (!hidden) {
      scheduleFrame();
    } else {
      stopLoop();
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange);

  // start
  scheduleFrame();

  // API
  function destroy() {
    stopLoop();

    if (resizeTimer) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }

    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }

    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('blur', onLeave);
    window.removeEventListener('resize', onResize);

    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  function setColors(headHex, tailHex) {
    if (headHex) options.headColor = headHex;
    if (tailHex) options.tailColor = tailHex;
    Object.assign(HEAD_RGB, hexToRgb(options.headColor));
    Object.assign(TAIL_RGB, hexToRgb(options.tailColor));
    scheduleFrame();
  }

  return { destroy, setColors, el: canvas };
}
