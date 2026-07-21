/**
 * Case-study image showcase — a slideshow whose transition is a WebGL mosaic:
 * the frame breaks into tiles that flip to the next image in a diagonal wave,
 * each tile popping slightly and catching a coral flash as it turns.
 *
 * Progressive enhancement, three levels:
 *   1. No JS            → the first <img> is visible, exactly as before.
 *   2. JS, no WebGL     → CSS opacity crossfade between the same <img> elements.
 *   3. JS + WebGL       → the mosaic transition on a canvas laid over them.
 *
 * The <img> elements always stay in the DOM: they are the texture sources, and
 * they keep the alt text available to screen readers and crawlers.
 *
 * Markup:
 *   <div class="showcase" data-showcase data-interval="5200">
 *     <img class="showcase-slide" src="…" alt="…">
 *     <img class="showcase-slide" src="…" alt="…">
 *   </div>
 */
(function () {
  'use strict';

  var TRANSITION_MS = 1150;
  var DEFAULT_INTERVAL_MS = 5200;

  var VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform sampler2D u_from;',
    'uniform sampler2D u_to;',
    'uniform vec2 u_res;',
    'uniform vec2 u_tiles;',
    'uniform float u_progress;',
    'uniform float u_fromAspect;',
    'uniform float u_toAspect;',
    '',
    'float hash21(vec2 p) {',
    '  p = fract(p * vec2(123.34, 456.21));',
    '  p += dot(p, p + 45.32);',
    '  return fract(p.x * p.y);',
    '}',
    '',
    // object-fit: cover, in shader form — crop the long axis instead of
    // stretching, so a slide that isn't the container's aspect still reads right.
    'vec2 coverUV(vec2 uv, float imgAspect, float boxAspect) {',
    '  vec2 s = imgAspect > boxAspect',
    '    ? vec2(boxAspect / imgAspect, 1.0)',
    '    : vec2(1.0, imgAspect / boxAspect);',
    '  return (uv - 0.5) * s + 0.5;',
    '}',
    '',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / u_res;',
    '',
    '  vec2 tile = floor(uv * u_tiles);',
    '  vec2 center = (tile + 0.5) / u_tiles;',
    '  float h = hash21(tile);',
    '',
    // Diagonal sweep: left-to-right, biased downward, plus per-tile jitter so
    // the wave front reads as organic rather than a hard ruler line.
    '  float sweep = center.x * 0.62 + (1.0 - center.y) * 0.38;',
    '  float delay = sweep * 0.58 + h * 0.17;',
    '  float local = clamp((u_progress - delay) / 0.30, 0.0, 1.0);',
    '  local = local * local * (3.0 - 2.0 * local);',
    '',
    // Outgoing tile drifts back, incoming settles forward into place.
    '  vec2 fromBox = center + (uv - center) * (1.0 + 0.22 * local);',
    '  vec2 toBox   = center + (uv - center) * (0.84 + 0.16 * local);',
    '',
    '  float boxAspect = u_res.x / u_res.y;',
    '  vec2 fromUV = coverUV(fromBox, u_fromAspect, boxAspect);',
    '  vec2 toUV   = coverUV(toBox, u_toAspect, boxAspect);',
    '',
    '  vec3 a = texture2D(u_from, clamp(fromUV, 0.0, 1.0)).rgb;',
    '  vec3 b = texture2D(u_to, clamp(toUV, 0.0, 1.0)).rgb;',
    '  vec3 col = mix(a, b, local);',
    '',
    // Coral flash peaking mid-flip, and a seam that only exists while a tile
    // is actually turning — so a settled frame is a clean, unbroken image.
    '  float flash = local * (1.0 - local) * 4.0;',
    '  vec2 f = fract(uv * u_tiles);',
    '  float seam = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));',
    '  float edge = smoothstep(0.0, 0.035, seam);',
    '  col *= mix(1.0, 0.72 + 0.28 * edge, flash);',
    '  col += vec3(1.0, 0.30, 0.30) * flash * 0.16;',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function makeTexture(gl, img) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    // Non-power-of-two images: clamp + linear, no mipmaps.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    return t;
  }

  function initShowcase(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.showcase-slide'));
    if (slides.length < 2) return;

    var interval = parseInt(root.getAttribute('data-interval'), 10) || DEFAULT_INTERVAL_MS;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var index = 0;
    var busy = false;
    var timer = null;
    var visible = true;
    var hovered = false;

    // ---- controls -------------------------------------------------------
    var ui = document.createElement('div');
    ui.className = 'showcase-ui';

    function arrow(dir, label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'showcase-arrow showcase-arrow-' + dir;
      b.setAttribute('aria-label', label);
      var icon = document.createElement('i');
      icon.className = 'fas fa-chevron-' + (dir === 'prev' ? 'left' : 'right');
      b.appendChild(icon);
      b.addEventListener('click', function () {
        go(dir === 'prev' ? index - 1 : index + 1);
        restart();
      });
      return b;
    }

    var dots = document.createElement('div');
    dots.className = 'showcase-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Choose screenshot');

    var dotEls = slides.map(function (slide, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'showcase-dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Screenshot ' + (i + 1) + ' of ' + slides.length);
      d.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      d.addEventListener('click', function () {
        go(i);
        restart();
      });
      dots.appendChild(d);
      return d;
    });

    ui.appendChild(arrow('prev', 'Previous screenshot'));
    ui.appendChild(dots);
    ui.appendChild(arrow('next', 'Next screenshot'));
    root.appendChild(ui);

    function syncDots() {
      dotEls.forEach(function (d, i) {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    // ---- WebGL setup (falls through to CSS fade on any failure) ----------
    var gl = null, prog = null, canvas = null, textures = [], uni = {};

    function setupGL() {
      canvas = document.createElement('canvas');
      canvas.className = 'showcase-canvas';
      canvas.setAttribute('aria-hidden', 'true');

      var opts = { antialias: false, depth: false, stencil: false, alpha: false, powerPreference: 'low-power' };
      gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
      if (!gl) return false;

      var vs = compile(gl, gl.VERTEX_SHADER, VERT);
      var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;

      prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      textures = slides.map(function (img) { return makeTexture(gl, img); });

      uni.res = gl.getUniformLocation(prog, 'u_res');
      uni.tiles = gl.getUniformLocation(prog, 'u_tiles');
      uni.progress = gl.getUniformLocation(prog, 'u_progress');
      uni.fromAspect = gl.getUniformLocation(prog, 'u_fromAspect');
      uni.toAspect = gl.getUniformLocation(prog, 'u_toAspect');
      gl.uniform1i(gl.getUniformLocation(prog, 'u_from'), 0);
      gl.uniform1i(gl.getUniformLocation(prog, 'u_to'), 1);

      root.appendChild(canvas);
      root.classList.add('showcase-gl');
      resize();
      draw(0, 0, 0);
      return true;
    }

    function resize() {
      if (!gl) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(root.clientWidth * dpr));
      var h = Math.max(1, Math.round(root.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function aspectOf(i) {
      var img = slides[i];
      return (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1.6;
    }

    function draw(from, to, progress) {
      if (!gl) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[from]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[to]);
      gl.uniform2f(uni.res, canvas.width, canvas.height);
      // Roughly square tiles, scaled to the element's width.
      var cols = Math.max(8, Math.min(22, Math.round(root.clientWidth / 62)));
      var rows = Math.max(5, Math.round(cols / (root.clientWidth / Math.max(1, root.clientHeight))));
      gl.uniform2f(uni.tiles, cols, rows);
      gl.uniform1f(uni.progress, progress);
      gl.uniform1f(uni.fromAspect, aspectOf(from));
      gl.uniform1f(uni.toAspect, aspectOf(to));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // ---- transitions ----------------------------------------------------
    function cssShow(i) {
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
    }

    function go(next) {
      next = ((next % slides.length) + slides.length) % slides.length;
      if (busy || next === index) return;

      var from = index;
      index = next;
      syncDots();

      if (!gl || reduceMotion) {
        cssShow(index);
        return;
      }

      busy = true;
      // The shader owns the pixels during the flip; the <img> underneath is
      // swapped at the end so a later context loss still shows the right frame.
      var start = performance.now();
      (function frame(now) {
        var p = Math.min(1, (now - start) / TRANSITION_MS);
        draw(from, index, p);
        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          cssShow(index);
          busy = false;
        }
      })(start);
    }

    // ---- autoplay -------------------------------------------------------
    function tick() {
      if (visible && !hovered && !document.hidden) go(index + 1);
    }

    function restart() {
      if (timer) clearInterval(timer);
      if (!reduceMotion) timer = setInterval(tick, interval);
    }

    root.addEventListener('mouseenter', function () { hovered = true; });
    root.addEventListener('mouseleave', function () { hovered = false; });
    root.addEventListener('focusin', function () { hovered = true; });
    root.addEventListener('focusout', function () { hovered = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.25 }).observe(root);
    }

    window.addEventListener('resize', function () {
      resize();
      if (!busy) draw(index, index, 0);
    });

    // Keyboard: arrow keys move between screenshots once the strip has focus.
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); restart(); }
      else if (e.key === 'ArrowRight') { go(index + 1); restart(); }
    });

    if (!reduceMotion) setupGL();
    root.classList.add('showcase-ready');
    cssShow(0);
    restart();
  }

  function whenLoaded(root, cb) {
    var imgs = Array.prototype.slice.call(root.querySelectorAll('.showcase-slide'));
    var pending = imgs.length;
    if (!pending) return;
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth) {
        if (--pending === 0) cb();
      } else {
        img.addEventListener('load', function () { if (--pending === 0) cb(); });
        img.addEventListener('error', function () { if (--pending === 0) cb(); });
      }
    });
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-showcase]'), function (root) {
      whenLoaded(root, function () { initShowcase(root); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
