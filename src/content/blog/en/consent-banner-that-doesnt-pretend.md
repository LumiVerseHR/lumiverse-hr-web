---
title: A Cookie Banner That Doesn't Pretend
description: We gated our analytics behind a small consent strip. A timeout grants nothing, Deny actually clears cookies - and the bug where GA wrote its cookie back mid-reload.
date: 2026-09-23
tags: [Web Craft, Privacy]
image: /images/og/index.jpg
---

Adding Microsoft Clarity to this site took one line. Doing it properly took a day, because the first question after "add the tag" was: *don't we need to ask first?*

We did. Google Analytics had been loading on every public page with no consent step at all. So this is the write-up of the small consent strip at the bottom of this page (if you haven't answered it yet): what it does, and the three things that broke on the way.

## The rules we set

Most cookie banners are designed to get a yes. We wanted one that's honest about three things:

1. **Nothing loads until you say Allow.** GA and Clarity aren't in the page at all. A small script injects them only after an explicit yes.
2. **Ignoring it is not consent.** The strip shows for ten seconds and slides away. A timeout stores nothing and grants nothing. It just stops asking for the rest of the visit, and asks again next time.
3. **Deny means gone, not "stop adding more".** Clicking Deny removes the analytics cookies that are already there.

And it had to be small: one line of copy, two equal buttons. Allow gets the brand gradient, but it's no bigger than Deny.

## The whole mechanism

The decision lives in `localStorage` and the "not now" lives in `sessionStorage`, which is exactly the difference between *you decided* and *you ignored it*:

```js
var choice = read("localStorage", "lv-consent");
if (choice === "granted") loadAnalytics();
if (choice === "denied") clearAnalyticsCookies();
if (!choice && read("sessionStorage", "lv-consent-snoozed") !== "1") {
  show({ autoDismiss: true });   // ten seconds, then snooze for this visit
}
```

The strip's markup and copy live in one shared partial, synced into all 32 pages (English and Croatian) by the same script that keeps our nav and footer identical. A pre-commit hook fails if any page drifts.

## Three things that broke

### 1. `hidden` didn't hide

The strip starts with the `hidden` attribute and is revealed by script. In the browser it was visible immediately.

The browser's own rule for `[hidden]` is just `display: none`, and our component rule `.consent { display: flex; }` outranks it. It's one of those bugs you only hit once:

```css
.consent[hidden] { display: none; }
```

### 2. Our own chat widget was in the way

This site runs [Moj Kolega](/moj-kolega), our AI assistant, in the bottom-right corner, at a z-index of 2,147,483,646. On narrower screens the consent strip slid straight under the chat bubble.

We measured where the two actually overlap and lift the strip above the bubble below 880 px. It's a boring fix, but you only find it by testing the real page with everything that's really on it.

### 3. Deny didn't fully deny

This is the one worth writing about.

The first version of Deny just remembered the choice. The `_ga` cookies from an earlier Allow stayed in the browser. So Deny got a cleanup step: find the analytics cookies and expire them on every domain variant they might be set on.

Then we tested *switching*: Allow, browse, then change your mind to Deny. The page reloads so the running tags are gone. After the reload, one cookie was still there: `_ga_KDSBK2G9NS`.

The cleanup had run. The cookie had been deleted. And then Google Analytics, still running in the 400 ms before the reload, wrote it straight back.

You can't win that race from inside the page that's being torn down. What you can do is move the cleanup somewhere nothing is racing it. So Deny now clears cookies twice: once on the click, and again on every page load while the stored choice is "denied". By then the tags aren't there to write anything back. On production, the switch from Allow to Deny now leaves zero analytics cookies behind.

## Changing your mind

A consent choice you can't revisit isn't much of a choice. The footer on every page has a **Cookie preferences** button. It reopens the strip with your current answer marked, and it doesn't auto-dismiss: you opened it on purpose.

That surfaced one last layout bug: the strip covered the very button that opens it. When the strip is visible, the footer now gets enough bottom padding to clear it.

## Why bother

None of this is hard. It's just easy to skip: a banner that pops up, sets everything anyway and makes Deny a two-click maze passes a casual look. We'd rather the small things on our own site work the way we'd build them for a client, including the parts nobody checks.
