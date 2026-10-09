---
title: The Judge Failed Croatian, Not the Bot
description: Our eval judge failed a correct answer 12 times in a row. The agent was right; the judge couldn't read Croatian negation. How we tested the tester.
date: 2026-09-03
tags: [Agentic Engineering, AI Evaluation]
related: [moj-kolega]
image: /images/og/moj-kolega.jpg
---

[Moj Kolega](/moj-kolega) is our AI employee for webshops. It sits on a shop's site, answers customers from the shop's own catalogue and policies, and says "I don't know" instead of inventing things.

That last promise is the whole product, so we test it constantly. Every agent has a pack of test conversations, and an AI judge grades each answer as pass, partial or fail. When the judge says fail, we go and fix the agent.

This is the story of the week the judge said fail and the agent was right.

## A fabrication, then a fix, then a failure that wasn't

It started with a real bug. A customer asked one of our demo shops *"mogu li platiti pouzećem?"*, "can I pay cash on delivery?". The agent said yes.

The shop didn't offer cash on delivery. The policy tool had just returned the payment options: card, Klarna, PayPal, bank transfer. The agent ignored its own tool result and gave the answer that sounded helpful.

We fixed it with a deterministic rule rather than more prompting. Correct answers on that case went from roughly none out of four to roughly three out of four. Then we re-ran the eval to confirm, and it kept failing, including on answers that looked perfectly correct:

> *"Plaćanje pouzećem nije dostupno; možete platiti karticama…"*
> ("Cash on delivery is **not** available; you can pay by card…")

The judge graded that FAIL, with the reasoning: *"incorrectly states cash-on-delivery is available."*

## Make it reproducible before you believe it

One odd verdict could be noise, so we captured that exact input: the question, the agent's answer, its tool calls and the expected behaviour. Then we re-judged it again and again.

**Fail, 12 times out of 12.** Not noise. A deterministic bug, in the judge.

Then an A/B on the same input:

| Judge | Verdict on the correct answer |
|---|---|
| gpt-4o-mini, original prompt | fail 12/12 |
| gpt-4o-mini + one clause about negation | **pass 12/12** |
| gpt-4o, original prompt | pass 12/12 |
| gpt-4.1-mini, original prompt | pass 12/12 |

The small judge model was skimming the Croatian, catching "pouzećem … dostupno" and missing the *nije* ("not") in between. Bigger models read it fine, and the same answer in English passed.

We kept the cheap model and fixed the prompt: a short LANGUAGE CARE clause telling the judge to resolve Croatian negation (*ne, nije, nema, bez…*) before grading. Same cost, correct verdict.

## A fix to a judge has to be tested both ways

Here's the trap. It's easy to "fix" a judge by making it more lenient. It stops failing the correct answer because it's stopped failing anything.

So the fix had to pass two tests, not one:

- **The correct denial** ("not available") → pass **10/10**, where it had failed 12/12.
- **A genuine fabrication** ("cash on delivery *is* available", when it isn't listed) → still fail **10/10**.

Both directions held. From then on, a fail on that case meant a real agent mistake again.

## Then we went looking for the others

One blind spot usually means more. So we built a small adversarial sweep: **eleven cases where we knew the right verdict in advance**, each judged six times. They covered prices, counts, negation, answers in German and Slovenian, multi-part answers and polite refusals.

It found two more. All three had the same shape: **the English answer passed, the Croatian one didn't.**

1. **Negation dropped.** The one above.
2. **A Croatian redirect not recognised as a redirect.** When the agent politely declines an off-topic question and steers back ("rado pomažem s proizvodima…", "happy to help with products…"), the judge graded it only partial, six times out of six.
3. **Examples read as a checklist.** If the expected behaviour said "mention e.g. A, B or C", the judge demanded all three.

The fix for 2 and 3 was the same kind of thing: judge the *meaning*, not the surface wording or the language, and treat "e.g." lists as examples while explicit requirements stay strict.

After the fix: **11 out of 11 correct verdicts.** One more check mattered as much. A case built to fail, an answer that leaves out a whole required part, **still failed 6 out of 6.** Grading got more accurate, not more generous.

One method note, because it cost us time: the blind spots only reproduced on *real* captured inputs. Hand-written test strings that looked equivalent passed. If your judge misbehaves in production, capture the exact tuple and replay it. Don't paraphrase it.

## What a trustworthy judge showed us

With the judge fixed, we scored the live agents: the one on mojkolega.hr scored 9 of 12, and the one on this site 8 of 12. The results pointed at two real problems, and both were exactly what the eval exists to find:

- **A language gap.** Spanish and Japanese visitors were being answered in Croatian, and Italian was misread as Slovenian. The language detector knew only five languages. A wider one is written and on its way to production.
- **A test pack with a bias.** Several demo shops scored badly, but on inspection the pack was written for an electronics catalogue: headphones, adapters. A textile shop or a pharmacy "failed" by honestly not stocking skateboards. The agent was right again. This time it was the test that was wrong.

## The pattern

Look at the chain in that week:

- A **tool** that returned the payment options.
- A **rule** that stops the agent contradicting its tools.
- A **judge** that checks the agent.
- A **sweep** with known answers that checks the judge.
- **Both-direction tests** that check the fix to the judge.
- A **scorecard** that checked the test pack, and caught it.

Every checker needed its own check, and every one of them was wrong at least once. That isn't a failure of the approach. It *is* the approach. A verifier you never verify is just another model you're trusting.

If you run LLM evals in any language that isn't English, this is the one to steal: **take your judge's failures, replay them exactly, and flip the language.** If the English version passes and yours doesn't, it's not your agent.
