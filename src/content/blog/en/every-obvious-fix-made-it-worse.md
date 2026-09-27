---
title: Every Obvious Fix Made Our Croatian Subtitles Worse
description: We benchmarked Whisper on real Croatian podcasts, then tested every obvious fix. None of them helped - and weeks later we shipped one of them anyway.
date: 2026-08-27
tags: [Build Log, Speech AI]
related: [titlomat]
image: /images/og/titlomat.jpg
---

YouTube doesn't auto-caption Croatian. [Titlomat](/titlomat) does: it listens to a channel's new videos and puts Croatian and English subtitles on them, with no uploads and no timeline editing.

The engine underneath is Whisper, the open speech-recognition model. Everyone knows roughly how good Whisper is on English. Nobody could tell us how good it is on a Croatian podcast. So before building features, we built a way to measure it.

## A benchmark small enough to build by hand

Three five-minute clips of real Croatian audio, chosen to be different on purpose:

- **A solo monologue.** One voice throughout.
- **A business interview.** Names, companies and numbers.
- **A tech podcast.** Conversational, with English terms dropped into Croatian sentences.

For each clip we made a reference transcript by hand: Whisper's output corrected word by word against the audio, names checked against published sources, and English terms kept in English spelling. That's slow work, which is why the benchmark is small. But it's the only part of the system that knows the right answer.

The scoring is word error rate (WER), computed after lowercasing and stripping punctuation, with Croatian accents kept, since *čaša* and *casa* are different words. Before we'd ship, a transcript had to hit **WER ≤ 5%**, get **95% of names** right and get **every number** right.

## The baseline

| Clip | Word error rate | Names correct |
|---|---|---|
| Solo monologue | **1.85%** | 4 of 4 |
| Business interview | **5.28%** | 7 of 7 |
| Tech podcast | **12.48%** | 6 of 8 |

The monologue was excellent. The interview was a hair over the bar. The tech podcast was well over, and the explanation seemed obvious: all that English mixed into the Croatian must be confusing a model that's been told the audio is Croatian.

So we spent the same day testing the obvious fixes.

## Every obvious fix, measured

**Let Whisper detect the language itself**, so English stretches get transcribed as English. Result: an identical 12.48%. The same errors, plus broken word-level timing, which subtitles need.

**Use the faster "turbo" model**, in case a different model handles code-switching better. Result: **28.12%**. More than double the errors, and it got a number wrong too. Turbo is a distilled model that leans English, and Croatian paid for it.

**Seed Whisper with a prompt of likely words.** Whisper accepts an "initial prompt" that nudges its vocabulary. We tried the English terms from the episode: **17.93%**. We tried Croatian topical words: **16.79%**. Both were worse than no prompt at all.

**Higher precision, bigger batches.** No change at all. 5.28% at float32 and float16, 1.85% at every batch size.

Then the measurement that explained all of it. We diffed Whisper's output against the references word by word, looking for repeated mistakes, the kind a custom dictionary could correct.

There were **none**. Not one substitution appeared twice, on any clip. Every error was a one-off: a Croatian ending slightly wrong, or a word boundary misheard. *Tržište* ("market") came out as *tržiš to*. *Vještine koje* ("skills that") came out as *viši ti neko*.

That also killed the original theory. The tech podcast's errors weren't in the English parts. They were in the Croatian itself. Code-switching wasn't the problem.

## We shipped one anyway

The benchmark said a vocabulary prompt makes things worse, and that a dictionary has nothing to fix. We accepted the over-the-bar result anyway, because most real Titlomat content is a single speaker, like the monologue, not the tech podcast. And we planned to track error rates per video in production.

Seventeen days later, a feature went out that seeded Whisper with each channel's custom dictionary as its initial prompt. It's an idea that sounds right: tell the model the names it's going to hear. It was the fix the benchmark had already measured, and rejected.

It shipped at 10:17 and was reverted at 10:56. The revert deleted a database migration that production had already applied, so the backend couldn't find its own schema version and started crash-looping. The migration was restored at 11:30, and the orphaned column dropped at 11:39.

Nothing about that morning was hard. The measurement existed, and the decision just didn't consult it.

## What replaced it

Custom vocabulary still matters to our users: channel names, guests, brands. So it moved to where it can't make the recognition worse: **after** it. A language-model pass reads the finished transcript alongside the channel's dictionary and corrects things like Croatian case endings on names and phonetically mangled brands. It runs at temperature 0. If the model is unavailable or the dictionary is empty, it falls back to plain find-and-replace, so the worst case is the old behaviour.

In the spirit of this post: we haven't yet put that pass through the benchmark. That's the next number we owe ourselves.

## The part WER doesn't see

A transcript can be word-perfect and still make bad subtitles. The same baseline measured the subtitle files themselves:

- **68–76% of lines were longer than 42 characters**, the usual limit for readable subtitles. The speaker label was being added *after* the line had been wrapped.
- **6–9.5% of cues were on screen for less than a second.** Too fast to read.
- A cue could stay up through **30 seconds of outro music** after the last word.

Those got fixed separately: cues now end at the last spoken word and never stay on screen longer than six seconds. WER alone would never have flagged any of it. A second metric did.

## What transfers

- **Build the benchmark before the features.** Fifteen minutes of hand-checked audio told us more than any amount of reading about Whisper.
- **Measure the obvious fix before building it.** All four of ours made things worse or did nothing, and every one of them sounded like a sure win.
- **Look at the errors, not just the rate.** The word-level diff changed our whole theory of the problem in one table.
- **A verifier only helps if something consults it.** Ours said no on 10 May. We shipped the idea on 27 May. The lesson: a change that touches recognition goes through the benchmark first, not after.
- **Be honest about the size.** Three five-minute clips is a small benchmark. It's enough to reject bad ideas, which is most of what we used it for. It's not enough to promise a number to a customer.
