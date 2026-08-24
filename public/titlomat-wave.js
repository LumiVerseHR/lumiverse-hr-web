/**
 * Titlomat "Our Product" section — speech-to-text background animation.
 *
 * An audio speech-waveform flows in from the left screen edge toward the
 * centre; at centre it stops being a wave and "expands" into characters —
 * the Titlomat copy, looping — that stream on out to the right. A literal
 * picture of what the product does: speech in, subtitles out.
 *
 * Axis sits between the "Titlomat.com" heading and the paragraph. Everything
 * lives above that baseline and fades toward the heading, so the heading and
 * paragraph stay readable. Canvas 2D; fades in, pauses offscreen / when the
 * tab is hidden; a single static frame under prefers-reduced-motion; nothing
 * at all without JS (section renders as before).
 */
(function () {
  'use strict';

  var section = document.getElementById('product');
  var canvas = document.getElementById('titlomatWave');
  if (!section || !canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ---- tunables ----------------------------------------------------------
  var OPACITY   = 0.9;    // master multiplier
  var SPEED     = 96;     // px/sec, flowing left -> right
  var OSC       = 5.2;    // per-bar bounce speed
  var SLOT      = 84;     // px per speech "word / pause" slot
  var BAR       = 5;      // px between bars
  var BAR_W     = 2.4;    // bar thickness
  var AMP       = 0.15;   // waveform amplitude (fraction of section height)
  var A_BARS    = 0.28;   // waveform alpha
  var TEXT_SIZE = 15;     // px, flowing caption text
  var A_TEXT    = 0.46;   // caption alpha
  var EXPAND    = 90;     // px over which characters expand out of the centre
  var CORAL_HI  = [255, 150, 110];  // brighter coral (text / tall bars)
  var CORAL_LO  = [255, 90, 84];    // base coral

  var LOOP = "Titlomat.com   ·   Automatic English subtitles for Croatian YouTube channels. " +
             "Connect your channel once — subtitles show up on YouTube by themselves. " +
             "No file uploads, no timeline editing.   ·   ";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, cy = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = section.clientWidth;
    H = section.clientHeight;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // baseline: midpoint between the heading and the paragraph
    cy = H * 0.42;
    var title = section.querySelector('.section-title');
    var desc = section.querySelector('.section-description');
    if (title && desc) {
      var top = section.getBoundingClientRect().top;
      var tb = title.getBoundingClientRect().bottom - top;
      var dt = desc.getBoundingClientRect().top - top;
      if (dt > tb) cy = (tb + dt) / 2;
    }
  }

  function hash(n) {
    n = (n ^ 61) ^ (n >>> 16);
    n = n + (n << 3);
    n = n ^ (n >>> 4);
    n = Math.imul(n, 0x27d4eb2d);
    n = n ^ (n >>> 15);
    return ((n >>> 0) % 100000) / 100000;
  }

  function isWord(slot) { return hash(slot) > 0.30; }

  function wordAmp(worldX) {
    var slot = Math.floor(worldX / SLOT);
    if (!isWord(slot)) return 0;
    var peak = 0.45 + 0.55 * hash(slot * 7 + 3);
    var p = worldX / SLOT - slot;
    var env = Math.pow(Math.sin(Math.PI * (p < 0 ? 0 : p > 1 ? 1 : p)), 0.7);
    return env * peak;
  }

  function draw(now) {
    var t = now / 1000;
    var scroll = reduceMotion ? SLOT * 2.4 : t * SPEED;
    ctx.clearRect(0, 0, W, H);

    var cx = W * 0.5;
    var maxBar = Math.min(H * AMP, 120);

    // ---- speech waveform: flows in from the left edge toward the centre ----
    for (var x = 0; x <= cx; x += BAR) {
      var worldX = x - scroll;                         // left -> right flow
      var amp = wordAmp(worldX);
      if (amp <= 0.01) continue;
      var bi = Math.floor(worldX / BAR);
      amp *= 0.45 + 0.55 * hash(bi * 13 + 1);          // jaggedness
      var osc = reduceMotion ? 1 : 0.32 + 0.68 * Math.abs(Math.sin(x * 0.03 + t * OSC + hash(bi) * 6.283));
      amp *= osc;                                      // in-place bounce
      var barH = amp * maxBar;
      if (barH < 0.6) continue;
      var leftFade = x < 26 ? x / 26 : 1;              // ease in from the screen edge
      var midFade = (cx - x) < 80 ? (cx - x) / 80 : 1; // dissolve approaching the centre
      var a = A_BARS * OPACITY * leftFade * midFade;
      if (a <= 0.002) continue;
      var warm = amp > 1 ? 1 : amp;
      var r = Math.round(CORAL_LO[0] + (CORAL_HI[0] - CORAL_LO[0]) * warm);
      var g = Math.round(CORAL_LO[1] + (CORAL_HI[1] - CORAL_LO[1]) * warm);
      var b = Math.round(CORAL_LO[2] + (CORAL_HI[2] - CORAL_LO[2]) * warm);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      ctx.fillRect(x - BAR_W / 2, cy - barH, BAR_W, barH);   // upward from the baseline
    }

    // ---- caption text: expands out of the centre and streams right ----
    var charW = TEXT_SIZE * 0.6;
    var P = LOOP.length * charW;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (var i = 0; i < LOOP.length; i++) {
      var ch = LOOP.charAt(i);
      if (ch === ' ') continue;
      var sx = cx + ((i * charW + scroll) % P);        // left -> right flow, looping
      if (sx < cx - charW || sx > W + charW) continue;
      var d = sx - cx;
      var scale = d < EXPAND ? 0.35 + 0.65 * (d / EXPAND) : 1;
      var inFade = d < EXPAND ? d / EXPAND : 1;         // grow + fade in at the centre
      var outFade = (W - sx) < 90 ? Math.max(0, (W - sx) / 90) : 1;
      var a2 = A_TEXT * OPACITY * inFade * outFade;
      if (a2 <= 0.003) continue;
      ctx.font = '500 ' + (TEXT_SIZE * scale).toFixed(1) + "px 'SFMono-Regular', Menlo, Consolas, monospace";
      ctx.fillStyle = 'rgba(255,158,120,' + a2 + ')';
      ctx.fillText(ch, sx, cy + TEXT_SIZE * 0.36);      // roughly centred on the baseline
    }

    // ---- soft transform glow where wave becomes text (not a line) ----
    var gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxBar * 0.9);
    gg.addColorStop(0, 'rgba(255,128,92,' + (0.16 * OPACITY) + ')');
    gg.addColorStop(1, 'rgba(255,128,92,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(cx - maxBar, cy - maxBar, maxBar * 2, maxBar * 2);

    // ---- keep the paragraph pristine: fade anything just below the baseline ----
    var scrim = ctx.createLinearGradient(0, cy + 4, 0, cy + 46);
    scrim.addColorStop(0, 'rgba(12,12,16,0)');
    scrim.addColorStop(1, 'rgba(12,12,16,1)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, cy + 4, W, 46);
  }

  var raf = null, visible = true;

  function frame(now) {
    raf = null;
    draw(now);
    if (!reduceMotion && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function play() { if (!raf) raf = requestAnimationFrame(frame); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) play();
    }, { threshold: 0 }).observe(section);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) play(); });
  window.addEventListener('resize', function () {
    resize();
    if (reduceMotion) draw(0); else play();
  });

  resize();
  canvas.classList.add('wave-active');
  if (reduceMotion) draw(0); else play();
})();
