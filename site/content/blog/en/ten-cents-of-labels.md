---
title: Ten Cents of Labels Took Over Most of Our Triage
description: A 322M model on our own GPU now makes most of MOJ KRAJ.'s triage calls. It learned from $0.10 of a commercial model's answers and ties the production LLM.
date: 2026-10-11
tags: [Build Log, AI Evaluation]
related: [mojkraj]
image: /images/og/mojkraj.jpg
---

[MOJ KRAJ.](/mojkraj) is a Croatian news portal written by AI under human editorial oversight. Every item that enters its newsroom gets a triage decision before anyone writes about it. That's about 13,000 items a week, from 145 sources.

Triage asks four questions. Is it news? Is it a service notice (water, power, traffic)? Which of seven sections does it belong to? Is it local?

Until September, each of those decisions was a call to an LLM, DeepSeek v4.1 flash. Today most of them are made by a 322M-parameter model running on our own GPU, in about 12 ms. On blind-labelled items it matches the LLM: 94.4% against 93.7%. It learned the job from about ten cents' worth of answers from a commercial decision model.

## Routine decisions shouldn't need a chatbot

The LLM call took 0.65 seconds and cost about $0.33 per 1,000 items. Its answer came back as JSON that had to be parsed, and 210 triage outputs in the shift log had failed schema validation.

TypeSafe makes the case that decisions like this don't need a text generator at all. Their ["System One" model, Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), takes a state plus typed questions (pick one, score, yes/no) and returns calibrated probabilities. There's no prose and nothing to parse.

We wanted the same thing, open and local:

- the same API,
- running on our own GPU,
- at zero cost per call,
- with no data leaving the machine.

We also wanted an honest answer to whether open weights can do Jev's job today.

## Our starting point: an open model with an inflated score

The open model we built on is [Laya](https://huggingface.co/convaiinnovations/laya) (Apache-2.0). It scores each answer option at its own [MASK] token, so one forward pass answers one question. It comes as three checkpoints:

- an English one, 421M parameters,
- a multilingual one, 322M parameters, covering 100+ languages,
- one fine-tuned on the [typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions) benchmark.

The model card claims Laya beats Jev, 0.766 against 0.727. Reading the code showed that number belongs to the fine-tuned checkpoint, scored on that benchmark's own test split. Out of the box, the base checkpoints score about 0.36. That's below always guessing the most common answer (0.461).

The code itself was clean: safetensors only, no remote code, no telemetry.

## openjev: Jev's API, served locally

We built **openjev**, a server that answers Jev's API from local Laya checkpoints. TypeSafe's official SDK reads its server address from an environment variable, so it works against openjev without code changes. Switching an app over is one setting.

- **It behaves like Jev.** Responses match live Jev: the same rounding, option order, confidence formula and error bodies. Tests check this against captured Jev responses. Our copy of Laya's code reproduces the upstream package to within 0.004 probability.
- **It routes by language.** We added Croatian stopwords to Laya's language detector. Before that, Croatian written without diacritics ("molim vas vratite novac sto prije") landed on the English model. That mistake is expensive: Croatian topic classification scores 48.5% on the English model and 76.0% on the multilingual one.
- **It's safe on a shared GPU.** Other model servers use most of the card. openjev caps its own memory and won't load onto the GPU unless 8 GB stays free; otherwise it runs on the CPU. If it runs out of memory, it halves its batch. In a test with a 1.25 GiB cap, a 96-question request halved four times and still finished on the GPU.

## Out of the box, Laya is no Jev

We sent byte-identical requests to Jev 1.13 and to Laya on 11 public tasks and 8 hand-labelled Jev use cases. Laya was about 20× faster, 9–18 ms per request against 258–288 ms. But it was only competitive on short texts with few options. The Jev side of this benchmark cost $0.10.

| Task (decisions) | Laya trained on it? | Jev | Laya | Laya − Jev, 95% CI |
|---|---|--:|--:|---|
| AG News topic, 4 options (200) | yes | 86.5% | 93.5% | +7.0 (+2.0, +12.5) |
| Emotion, 6 options (210) | no | 49.5% | 44.3% | −5.2 (−12.4, +1.4) |
| Prompt-injection check, yes/no (116) | no | 75.9% | 70.7% | −5.2 (−13.8, +3.4) |
| XNLI in 5 languages (750) | no | 77.7% | 71.1% | −6.7 (−10.3, −2.9) |
| BoolQ, passage first (300) | yes | 92.3% | 83.0% | −9.3 (−14.0, −5.0) |
| SIB-200 topic, Croatian + English (408) | unknown | 91.2% | 78.2% | −13.0 (−17.4, −8.8) |
| Yelp stars, 5-level score (250) | unknown | 60.8% | 33.6% | −27.2 (−34.4, −19.6) |
| BoolQ, question first (300) | yes | 90.7% | 62.0% | −28.7 (−35.3, −22.0) |
| typed-decisions, 4 workflows (2,000) | no | 73.8% | 36.4% | −37.4 (−40.2, −34.4) |
| Banking77 intent, 77 options (308) | no | 83.1% | 44.5% | −38.6 (−44.2, −33.1) |
| Browser agent next action (22) | no | 100% | 18.2% | −81.8 (−95.5, −63.6) |

If you use Laya directly, watch out for three things:

- **The order of the input keys changes the answer.** BoolQ with the passage before the question scores 83%. The same data with the keys swapped scores 62%. Jev scores above 90% either way. Put the evidence first.
- **It's confident when it's wrong.** On Banking77 it gave the true intent a probability of 0.00 in 30% of cases. No single temperature fixes this, because a setting that repairs the weak tasks flattens the ones Laya is good at.
- **Many options overflow a fixed budget.** All options share one 192–256-token slot, so 77 labels get about 3 tokens each.

One result was encouraging: Laya's own fine-tuned checkpoint scored 76.9% on the typed-decisions test split, above Jev's 73.8%. That suggested the plan. Teach Laya one workflow at a time.

## 2,000 Jev answers made a triage model

We fine-tuned the multilingual checkpoint on Jev's answers to MOJ KRAJ.'s four triage questions. It went from 48.0% to 94.4% on blind-labelled items.

1. **Data.** Real intake items: title plus cleaned feed summary, exactly what production triage sees. Items from before 14 September went into training (2,000) and validation (200). The following week (400 items) was held out for testing, so nothing from the test week leaked into training.
2. **Teacher.** Jev answered all four questions for 2,953 items, for $0.10. We kept its full probabilities, not just its top answer.
3. **Student.** A full fine-tune of the 322M checkpoint, trained to match Jev's probabilities (soft cross-entropy) with Laya's own recipe. It took 5 minutes.
4. **Gold labels.** Two AI editor agents labelled 200 test items blind, following the portal's written triage policy. They flagged decisions a second editor could reasonably call the other way. 698 of the 800 decisions were clear-cut, and those are what we scored.
5. **Baseline.** The exact production call on the same items: the production prompt, sent to DeepSeek v4.1 flash, with no fallback model.

| Model | Clear-gold accuracy | Is news | Service notice | Section | Local | Median latency |
|---|--:|--:|--:|--:|--:|--:|
| Jev 1.13 (teacher, cloud) | 97.3% | 94.8% | 98.9% | 97.4% | 97.8% | 269 ms |
| DeepSeek v4.1 flash (production) | 93.7% | 87.3% | 95.3% | 99.3% | 93.4% | 647 ms |
| Laya multilingual, untrained | 48.0% | 15.6% | 73.2% | 53.6% | 47.8% | 17 ms |
| Laya fine-tuned on Jev's answers | **94.4%** | 93.1% | 97.4% | 92.8% | 94.0% | **12 ms** |

That's a statistical tie with production: +0.7 points, with a 95% confidence interval of −1.7 to +3.0. The small model is better at spotting what isn't news. The LLM is better at picking the section.

The data didn't need to be large. We trained five versions on different amounts of Jev-labelled items:

| Training items | Accuracy on clear gold | Agreement with Jev |
|--:|--:|--:|
| 125 | 89.3% | 86.9% |
| 250 | 92.7% | 90.6% |
| 500 | 93.7% | 92.1% |
| 1,000 | 93.7% | 92.2% |
| 2,000 | 94.4% | 92.8% |

Most of the gain arrives with the first 250 items, which cost less than a cent of Jev time. Past 500, the student levels off just below its teacher.

## Local first, LLM only when unsure

Using both models beats either one alone. The local model answers what it's sure of, and the LLM takes the rest. At a 0.6 confidence threshold the combination scored 96.4%, against 94.4% for the local model alone and 93.7% for the LLM alone. The two make different mistakes.

One rule decides. If any of the four answers is less sure than the threshold, the whole item goes to the LLM exactly as before. So does any failure of the local path: a timeout, an error, or a response it can't read. A broken local model costs one extra LLM call, never an article or a shift.

| Minimum confidence to answer locally | Items answered locally | Combined accuracy |
|--:|--:|--:|
| 0.6 | 70% | 96.4% |
| 0.7 | 50.5% | 95.4% |
| 0.8 | 27.5% | 94.8% |
| 0.9 | 5% | 94.0% |

A lower threshold keeps more items local, and here it also scores higher, because the local model is the better judge of what is news. With only 200 test items the exact best threshold is noisy, but every one we tried matched or beat production. We shipped 0.6.

## Live since 21 September

The combination went live at 23:08 on 21 September, between two newsroom shifts.

- **Serving.** openjev runs as a supervised service on the newsroom machine, next to our other model servers. The triage model holds 0.6 GB of GPU memory and falls back to the CPU if the GPU is ever full.
- **Same input as in training.** The local model gets exactly what it was trained on: the same text cleaning and a pinned questions file. A test fails if anyone edits that file without retraining.
- **Off switch.** It's controlled by four settings. An empty server address turns it off.
- **Accounting.** Local answers and hand-offs to the LLM are counted separately, so the daily report shows the split.
- **Tests.** 20 new tests cover every fallback path, and the full backend suite passes (1,218 tests).

On the first 20 real items, the local model answered 14, at about 18 ms each. The 6 that went to the LLM took 0.8–2.3 s. They were celebrity and gossip items, where "is this news?" is genuinely borderline.

The first live shift, at 00:11 on 22 September, triaged 9 items. The local model decided 7: four sports stories, a local accident, local athletes and a painters' colony. The LLM decided the other 2, a celebrity piece and a call to adopt rescued dogs, and skipped both. The shift wrote 7 articles, and 4 passed the quality gate.

The first night also exposed a bug. The local answers weren't being counted. openjev reports token counts under Jev's field names, while the newsroom's usage recorder expects OpenAI's, and the recorder silently skips calls with zero tokens. The unit tests had stubbed out the recorder, so they never saw it. A fix, with a test against the real field names, went live at 00:23. We replayed that first shift's items through the same deterministic model and code to recover the split above.

## What it cost

About $0.27 in API calls for the whole project:

| Item | Calls | Cost |
|---|--:|--:|
| Jev: zero-shot benchmark, 11 tasks + 8 use cases | 3,685 | $0.103 |
| Jev: triage labels for training, validation and test | 2,953 | $0.101 |
| DeepSeek v4.1 flash: production baseline on 200 gold items | 200 | $0.065 |
| DeepSeek v4.1 flash: hand-offs in the first live test | 6 | ~$0.002 |
| Five fine-tunes, benchmarks, serving | – | $0, own GPU |

Triage costs about $0.33 per 1,000 items when the LLM decides everything. With 70% answered locally, that falls to about $0.10.

## What we learned

Open "System One" models aren't general Jev replacements yet. But distilling a strong commercial decision model into a small open one, one workflow at a time, is cheap and it works. 250 labels were enough for 92.7%.

- **Score against blind labels, not a system's own output.** MOJ KRAJ.'s published sections looked like ground truth, but production triage had picked them itself. Only independent labels showed that the small model tied the LLM.
- **Distrust a number that looks too good or too bad.** Laya's 62% on BoolQ, a dataset it was trained on, turned out to be the key-order problem. We found it by asking why before reporting.
- **Route between models instead of replacing one.** A cheap model that knows when it's unsure, plus an expensive one for the rest, beat both.
- **Build the fallback before the feature.** Every failure of the local path turns into the old LLM call. That's what made it safe to ship the same night.

What this doesn't show yet:

- The gold labels come from two AI editor agents following the written policy, not from human editors.
- The test week came right after the training data, so drift over the seasons is untested.
- With 200 test items, differences under about 3 points are within noise.

Next, we'll watch two weeks of the local/LLM split alongside editor rejections, re-distil monthly (it costs cents), and apply the same recipe to the newsroom's next routine decision.

**Sources:** [TypeSafe docs](https://docs.typesafe.ai/llms.txt) and the founder's talk, ["AI: too good to be true, too bad to be useful"](https://www.youtube.com/watch?v=o-y1HJ6buGQ). Laya [weights](https://huggingface.co/convaiinnovations/laya) and [code](https://github.com/NandhaKishorM/laya). Third-party Jev benchmarks: [jev-benchmarks](https://github.com/AbdelStark/jev-benchmarks), [decision-model-benchmark](https://github.com/nibzard/decision-model-benchmark), [jev-cyrillic-audit](https://github.com/AHTOOOXA/jev-cyrillic-audit), [jev-frontier-bench](https://github.com/manjunathshiva/jev-frontier-bench). Earlier open attempts: [TheoLeeCJ/openjev](https://github.com/TheoLeeCJ/openjev) and [jevlike](https://github.com/vinnylarouge/jevlike).
