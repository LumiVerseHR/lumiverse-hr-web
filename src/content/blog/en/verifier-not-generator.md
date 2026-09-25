---
title: The Moat Is the Verifier, Not the Generator
description: Generation got cheap. What makes AI output worth shipping is whatever checks it - four of our projects, four verifiers, and the one check a bot couldn't do.
date: 2026-09-25
tags: [Agentic Engineering, AI Quality]
related: [air-laser, overserved]
image: /images/og/air-laser.jpg
---

Every model can write the code, the article, the level, the simulation deck. That part is a commodity now, and it gets cheaper every quarter.

So when someone asks what we actually bring to an AI project, the honest answer is rarely "a better prompt". It's the thing that sits *after* the model and decides whether its output is allowed to ship. The generator is the part everyone can buy. The verifier is the part you have to build.

I didn't start with that as a thesis. It's what kept turning up when I looked back at our own projects and asked where the hard work had actually gone.

## Four projects, four verifiers

### Overserved: a bot that plays every level

[Overserved](/overserved) is a tower-defense game we built in about three weeks, mostly as a test of how far AI-assisted development goes. Generating 140 levels was easy. Knowing whether any of them were *playable* was not.

So we built a bot that plays the game properly: it places towers by coverage, weights the tiles near the exit, banks currency, buys upgrades. Once it could play well, the hand-tuned difficulty knobs became noise. Each wave now grows until the bot barely survives it. All 140 levels are tuned by something that played them, not by a designer guessing.

### The Aimito: a model that reads the shirt back

[The Aimito](/aimito) generates its own catalogue of comic-book apparel. Image models are great at producing designs and terrible at noticing that the text on a design is misspelled or the background removal left a halo.

A multimodal model on local hardware reviews every design at publish time. It reads the text back, catches botched cut-outs and flags anything that isn't print-worthy. No cloud call and no per-image cost, so it can run on everything, every time.

### Rentalica: parity before progress

[Rentalica](/rentalica) was a decade-old PHP rent-a-car system rebuilt as a modern SaaS. The generator there was a coding agent. The verifier was a rule: *change the technology or change the product, never both at once.*

Before anything new was allowed, the rebuild had to be provably identical to the old system. Automated cross-database checks compared row counts and records between the old MySQL and the new PostgreSQL until they matched. The same instinct shows up in the product itself. Every AI-generated SQL query is parsed into a syntax tree, and anything touching a table outside the approved set is rejected before it reaches the database.

### Air-laser: a critic that retracted our best figure

[Air-laser](/air-laser) is a 49-page physics design study, computed by an agent loop driving about a dozen open-source simulators. A planner proposes, a coder writes the input deck, a runner executes, an analyst plots. Then a critic checks units, convergence and physical plausibility against the published literature before anything is trusted.

At one point a simulation reproduced a real air-spark's light curve beautifully. It was exactly the figure you build a section around, and it was wrong. The solver wasn't conserving energy. Rebuilt properly, a spurious amplification factor collapsed from 1407× to 1.4×, and the agreement collapsed with it. We withdrew the result and published it as what it was.

> A simulation campaign that never retracts anything isn't careful. It's unfalsifiable.

## What the good ones have in common

Looking across the four, the verifiers that earned their keep shared a few traits:

- **They measure the thing you care about, not a proxy.** "Does the bot survive the wave" is the real question for a tower-defense level. "Does the model think the level is balanced" is not.
- **They're independent of the generator.** The critic in air-laser checks against measured constants, not against what the planner expected. A verifier that shares the generator's blind spots just agrees with it faster.
- **They're cheap enough to run every time.** The Aimito's check runs locally because a per-image fee would have turned it into a sampling exercise, and sampling misses things.
- **They're allowed to say no.** A check that can only warn gets ignored by week two. Rentalica's parity gate blocked the cutover. The SQL check blocks the query.

That last one matters most. Most teams have *some* evaluation. Far fewer have wired it so a failing check actually stops something.

## Where the verifier ran out

It would be tidy to stop there. But Overserved taught the opposite lesson too.

The bot proved every level was winnable. It could not tell that some of them were dull. Three deliberately overpowered towers went into the game, and the bot never noticed: the economy absorbed them. "Survivable" is measurable. "Worth twenty minutes of your evening" is not.

So the verifier doesn't replace judgement. It *moves* it. Once the mechanical checks are automated, a human's whole job becomes the part no bot can score: deciding what's good, and choosing which question is worth asking next.

## What this means if you're buying AI work

If you're scoping an AI project, the most useful question isn't "which model are you using?". It's:

**"What checks the output, and what happens when the check fails?"**

If the answer is "we review it by eye", you have a demo, not a system. If there's a real answer - a test suite, a ground truth, a simulator, a parity gate, a second model with a different job - the model underneath becomes the least important decision in the project. You can swap it next quarter when a cheaper one ships.

That's where we spend our time. Generation is cheap. The moat is the verifier.
