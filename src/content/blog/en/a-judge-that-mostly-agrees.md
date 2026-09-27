---
title: A Judge That Mostly Agrees Is Not a Judge
description: We tested a small model as MOJ KRAJ.'s fact-check judge. It was faster, agreed on the easy calls, and would have published 15 of 20 articles the real judge held.
date: 2026-09-17
tags: [Build Log, AI Evaluation]
related: [mojkraj]
image: /images/og/mojkraj.jpg
---

[MOJ KRAJ.](/mojkraj) is a Croatian news portal written by AI under human editorial oversight. Before any article can publish, a set of automated checks has to pass. The most important one is grounding: does every claim in the article actually appear in the source it cites?

That check is expensive. It runs on a 35B open-weight model on our own GPU and takes anywhere from 88 to 530 seconds an article. Sitting next to it on the same machine was a 4B model: idle, eight parallel slots, answering the same call in about 11 seconds.

The obvious move is to hand the judge's job to the small model. We measured it first. The answer was no, and the reason is the whole point of this post.

## What the judge actually does

It's worth being precise, because "fact-checking" sounds like it involves searching the web. It doesn't.

1. The cited source is fetched and cleaned to plain text: an ordinary HTTP request and an extraction step, under a second.
2. **One** model call pulls up to ten claims out of the article and rules on each one against the source text.
3. Deterministic checks run on top: numbers in the article must match numbers in the source, and so on.

Step 2 is the only expensive part, and it's the only part that exercises judgement.

## Measure what the verdict decides, not how fast it arrives

The tempting benchmark is speed, or average agreement. Both would have said yes.

We measured something else: **how often does swapping the judge change whether an article publishes?** We ran production scoring with the checker pointed at the 4B, over 40 articles the 35B had already judged, and compared against the 35B's stored verdicts.

| Articles | Score change (median) | Crossed the line |
|---|---|---|
| 20 the 35B scored 71 or higher | +0 | 4 of 20 |
| 20 the 35B **held back** (65–68) | **+24** | **15 of 20** |

On the easy cases the 4B mostly agrees, and a dashboard of average agreement would look fine.

On the cases where the verdict actually decides something, it would have published fifteen of the twenty articles the 35B held back. Some jumped from 66 to 100.

## It doesn't disagree. It drifts to 100.

Look at how the small model was wrong. It wasn't tracking the 35B and landing a bit off. **Nine of its first twenty scores were exactly 100.**

This wasn't a question of extraction quality, either. The 4B produced well-formed claims with real quotes from the source, every time. What it couldn't do was rule against the article. Given a draft and a source, it leaned toward "yes, that's supported".

The note left next to the code put it in one line:

> A judge that mostly agrees is not a cheap judge, it is not a judge.

A verifier earns its keep on the borderline cases, the ones it's supposed to stop. A verifier that approves nearly everything is just a slower way of publishing everything.

## Where the small model does win

The same investigation had the opposite answer one function over. Every MOJ KRAJ. article gets a *kicker*, the one-to-three-word label above the headline. That's mechanical work, and it had been running through the big model with reasoning switched on by default. Nobody had asked for it.

| Setup (same prompt, 3 published articles) | Time | Result |
|---|---|---|
| 35B, reasoning on | 57–103 s | **empty 2 of 3** |
| 35B, reasoning off | 0.9–54 s | correct |
| 4B, reasoning off | 0.3–0.6 s | identical answers |

So the kicker moved to the small model, with a token budget cut from 2,048 to 256. Leave the small model unconfigured and the call goes back to the big one, so the worst case is the old behaviour.

Same GPU, same investigation, two opposite answers. The difference is whether the task needs judgement.

## A test that fails on a good idea

Moving the judge to the small model is a natural idea, and someone will propose it again, possibly us, in six months, having forgotten this.

So there's a test for it. It reads the source code of the grounding and bias checks and **fails if either of them ever asks for the small model.** It isn't testing behaviour. It's pinning a decision that took a measurement to make, so undoing it takes another measurement rather than a quick refactor.

The measurement itself lives as a comment next to the call, with the date, the method and the numbers. The next person can re-run it instead of re-deriving it.

## Re-measure when the model changes

One more wrinkle makes the same point from another angle.

Reasoning mode is the expensive part of the grounding call, so a few days earlier we'd tried switching it off. We re-scored six published articles without it. The median score moved by 52 points and five of six crossed the line: articles that had scored 100 came back at 32, 13 and 63. Reasoning stayed on.

Then the server briefly ran a newer 27B model, and the same test inverted. Reasoning on or off, the median difference was 0, and not one article changed sides. The only effect of reasoning was being 3 to 20 times slower.

Same check, same method, two models, opposite answers. So the code doesn't say "reasoning on". It says: *this is a measured setting for this model; re-run the test when the model changes.* And the number to re-run is always the gate crossings, never the speed.

## What transfers

If you run any AI system with an automated check in the loop, this is the part worth stealing:

- **Evaluate a verifier on the decisions it flips, not on average agreement.** Agreement is dominated by easy cases. The borderline cases are the whole job.
- **Watch for drift toward "yes".** A judge that scores everything high looks cooperative. It's failing silently.
- **Put cheap models on mechanical work, not on verdicts.** They're superb at the first and dangerous at the second.
- **Write the decision down where it can't be undone by accident**, with the numbers and a date, and a test if you can.

The generator is the easy part to swap. The judge is the part you can't cheapen.
