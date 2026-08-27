/* Consent gate for the analytics tags.
 *
 * GA and Clarity used to load unconditionally in <head>. Both set
 * non-essential cookies, so both now wait behind an explicit choice.
 *
 * Three states, and only one of them loads anything:
 *
 *   granted  -> load now, and on every later visit without asking again
 *   denied   -> never load, never ask again
 *   no answer-> load nothing, ask again next visit
 *
 * The 10s auto-dismiss is the third case, not the first: silence stores no
 * decision and grants nothing. It only stops the banner following you from
 * page to page for the rest of one visit. Treating a timeout as consent is
 * what makes a banner decorative, and that is the whole thing worth avoiding
 * here.
 */
(function () {
  "use strict";

  var CHOICE_KEY = "lv-consent";
  var SNOOZE_KEY = "lv-consent-snoozed";
  var GA_ID = "G-KDSBK2G9NS";
  var CLARITY_ID = "y93two6ppk";
  var VISIBLE_MS = 10000;
  var EXIT_MS = 400;

  /* Safari in private mode throws on both storages rather than no-opting, and
     a thrown getItem here would take the whole page's JS with it. */
  function read(store, key) {
    try { return window[store].getItem(key); } catch (e) { return null; }
  }

  function write(store, key, value) {
    try { window[store].setItem(key, value); } catch (e) { /* nothing to do */ }
  }

  function loadAnalytics() {
    var tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(tag);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);

    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  var choice = read("localStorage", CHOICE_KEY);
  if (choice === "granted") { loadAnalytics(); return; }
  if (choice === "denied") return;
  if (read("sessionStorage", SNOOZE_KEY) === "1") return;

  var banner = document.querySelector("[data-consent]");
  if (!banner) return;

  var timer = null;

  function hide() {
    banner.classList.remove("is-visible");
    window.setTimeout(function () { banner.hidden = true; }, EXIT_MS);
  }

  /* Denying does not retract cookies the tags already set, so do it here.
     Only reachable when someone allowed earlier and the stored choice was
     since cleared — but "Deny" should mean the same thing on that path too.
     The domain variants cover how GA scopes its cookies; the ones that do not
     apply simply do nothing. */
  function clearAnalyticsCookies() {
    var host = window.location.hostname;
    var domains = ["", host, "." + host];
    var parts = host.split(".");
    if (parts.length > 2) domains.push("." + parts.slice(-2).join("."));

    document.cookie.split(";")
      .map(function (c) { return c.split("=")[0].trim(); })
      .filter(function (n) { return /^(_ga|_gid|_gat|_clck|_clsk)/.test(n); })
      .forEach(function (name) {
        domains.forEach(function (domain) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" +
            (domain ? "; domain=" + domain : "");
        });
      });
  }

  function decide(value) {
    window.clearTimeout(timer);
    timer = null;
    write("localStorage", CHOICE_KEY, value);
    hide();
    if (value === "granted") loadAnalytics();
    else clearAnalyticsCookies();
  }

  /* Ignored, not answered: remembered for the visit so it stops asking on
     every page, but no consent is recorded and nothing loads. */
  function snooze() {
    write("sessionStorage", SNOOZE_KEY, "1");
    hide();
  }

  function pause() {
    window.clearTimeout(timer);
    timer = null;
  }

  /* Someone reading or tabbing through it should not have it yanked away
     mid-sentence, so the countdown only runs while they are elsewhere. */
  function resume() {
    window.setTimeout(function () {
      if (timer || banner.hidden) return;
      if (banner.matches(":hover") || banner.contains(document.activeElement)) return;
      timer = window.setTimeout(snooze, VISIBLE_MS);
    }, 0);
  }

  banner.querySelector("[data-consent-allow]").addEventListener("click", function () { decide("granted"); });
  banner.querySelector("[data-consent-deny]").addEventListener("click", function () { decide("denied"); });
  banner.addEventListener("mouseenter", pause);
  banner.addEventListener("mouseleave", resume);
  banner.addEventListener("focusin", pause);
  banner.addEventListener("focusout", resume);

  banner.hidden = false;
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () { banner.classList.add("is-visible"); });
  });
  timer = window.setTimeout(snooze, VISIBLE_MS);
})();
