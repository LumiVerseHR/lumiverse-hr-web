---
title: Kako smo za 0,10 $ destilirali Jev za trijažu MOJ KRAJ.-a
description: Model od 322M na našem GPU-u sad donosi većinu trijažnih odluka MOJ KRAJ.-a. Naučio je iz Jevovih odgovora vrijednih 0,10 $ i izjednačen je s LLM-om.
date: 2026-10-11
tags: [Build Log, AI Evaluation]
related: [mojkraj]
image: /images/og/mojkraj.jpg
---

[MOJ KRAJ.](/hr/mojkraj) hrvatski je news portal koji piše AI pod ljudskim uredničkim nadzorom. Svaka stavka koja uđe u njegovu redakciju dobiva trijažnu odluku prije nego što itko o njoj napiše i redak. To je otprilike 13.000 stavki tjedno iz 145 izvora.

Trijaža postavlja četiri pitanja. Je li to vijest? Je li to servisna obavijest (voda, struja, promet)? U koju od sedam rubrika pripada? Je li lokalno?

Do rujna je svaka od tih odluka bila poziv LLM-u, DeepSeek v4.1 flash. Danas većinu donosi model od 322 milijuna parametara na našem vlastitom GPU-u, za otprilike 12 ms. Na stavkama označenima naslijepo jednak je LLM-u: 94,4 % prema 93,7 %. Posao je naučio iz odgovora komercijalnog modela za odlučivanje vrijednih desetak centi.

## Rutinske odluke ne trebaju chatbot

Poziv LLM-u trajao je 0,65 sekundi i stajao otprilike 0,33 $ na 1.000 stavki. Odgovor je stizao kao JSON koji je trebalo parsirati, a u dnevniku smjena 210 trijažnih izlaza palo je na provjeri sheme.

TypeSafe tvrdi da ovakve odluke uopće ne trebaju generator teksta. Njihov [„System One” model, Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), prima stanje i tipizirana pitanja (odaberi jedno, ocijeni, da/ne) i vraća kalibrirane vjerojatnosti. Nema proze i nema što parsirati.

Htjeli smo isto, ali otvoreno i lokalno:

- isti API,
- na našem vlastitom GPU-u,
- bez troška po pozivu,
- bez podataka koji napuštaju stroj.

Htjeli smo i pošten odgovor na pitanje mogu li otvoreni modeli danas raditi Jevov posao.

## Polazište: otvoreni model s napuhanim rezultatom

Otvoreni model na kojem smo gradili je [Laya](https://huggingface.co/convaiinnovations/laya) (Apache-2.0). Svaku opciju odgovora ocjenjuje na vlastitom [MASK] tokenu, pa jedan prolaz kroz model odgovara na jedno pitanje. Dolazi u tri checkpointa:

- engleski, 421M parametara,
- višejezični, 322M parametara, za 100+ jezika,
- jedan fino podešen na benchmarku [typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions).

Kartica modela tvrdi da Laya pobjeđuje Jeva, 0,766 prema 0,727. Čitanje koda pokazalo je da taj broj pripada fino podešenom checkpointu, mjerenom na testnom dijelu tog istog benchmarka. Bez dodatnog treniranja osnovni checkpointi postižu oko 0,36. To je ispod stalnog pogađanja najčešćeg odgovora (0,461).

Sam kod bio je čist: samo safetensors, bez udaljenog koda, bez telemetrije.

## openjev: Jevov API, lokalno

Napravili smo **openjev**, poslužitelj koji odgovara na Jevov API iz lokalnih Laya checkpointa. TypeSafeov službeni SDK adresu poslužitelja čita iz varijable okruženja, pa radi s openjevom bez izmjena koda. Prebacivanje aplikacije svodi se na jednu postavku.

- **Ponaša se kao Jev.** Odgovori se poklapaju sa živim Jevom: isto zaokruživanje, redoslijed opcija, formula pouzdanosti i tijela grešaka. Testovi to provjeravaju prema snimljenim Jevovim odgovorima. Naša kopija Layina koda reproducira izvorni paket unutar 0,004 vjerojatnosti.
- **Usmjerava po jeziku.** U Layin detektor jezika dodali smo hrvatske stop-riječi. Prije toga hrvatski pisan bez dijakritika („molim vas vratite novac sto prije”) završavao je na engleskom modelu. Ta je greška skupa: hrvatska klasifikacija tema postiže 48,5 % na engleskom modelu i 76,0 % na višejezičnom.
- **Siguran je na dijeljenom GPU-u.** Ostali poslužitelji modela zauzimaju većinu kartice. openjev ograničava vlastitu memoriju i ne učitava se na GPU ako ne ostane slobodno barem 8 GB; inače radi na CPU-u. Ako ostane bez memorije, prepolovi batch. U testu s ograničenjem od 1,25 GiB zahtjev s 96 pitanja prepolovio se četiri puta i ipak završio na GPU-u.

## Bez treniranja, Laya nije Jev

Jevu 1.13 i Layi poslali smo bajt-identične zahtjeve na 11 javnih zadataka i 8 ručno označenih Jevovih primjena. Laya je bila otprilike 20× brža, 9–18 ms po zahtjevu prema 258–288 ms. Ali konkurentna je bila samo na kratkim tekstovima s malo opcija. Jevova strana ovog benchmarka stajala je 0,10 $.

| Zadatak (odluke) | Laya trenirana na njemu? | Jev | Laya | Laya − Jev, 95 % CI |
|---|---|--:|--:|---|
| AG News tema, 4 opcije (200) | da | 86,5 % | 93,5 % | +7,0 (+2,0, +12,5) |
| Emocija, 6 opcija (210) | ne | 49,5 % | 44,3 % | −5,2 (−12,4, +1,4) |
| Provjera prompt injectiona, da/ne (116) | ne | 75,9 % | 70,7 % | −5,2 (−13,8, +3,4) |
| XNLI na 5 jezika (750) | ne | 77,7 % | 71,1 % | −6,7 (−10,3, −2,9) |
| BoolQ, prvo odlomak (300) | da | 92,3 % | 83,0 % | −9,3 (−14,0, −5,0) |
| SIB-200 tema, hrvatski + engleski (408) | nepoznato | 91,2 % | 78,2 % | −13,0 (−17,4, −8,8) |
| Yelp zvjezdice, ocjena u 5 razina (250) | nepoznato | 60,8 % | 33,6 % | −27,2 (−34,4, −19,6) |
| BoolQ, prvo pitanje (300) | da | 90,7 % | 62,0 % | −28,7 (−35,3, −22,0) |
| typed-decisions, 4 tijeka rada (2.000) | ne | 73,8 % | 36,4 % | −37,4 (−40,2, −34,4) |
| Banking77 namjera, 77 opcija (308) | ne | 83,1 % | 44,5 % | −38,6 (−44,2, −33,1) |
| Sljedeća akcija browser agenta (22) | ne | 100 % | 18,2 % | −81,8 (−95,5, −63,6) |

Ako Layu koristite izravno, pazite na tri stvari:

- **Redoslijed ključeva u ulazu mijenja odgovor.** BoolQ s odlomkom prije pitanja postiže 83 %. Isti podaci sa zamijenjenim ključevima postižu 62 %. Jev je iznad 90 % u oba slučaja. Dokaze stavite prve.
- **Samouvjerena je kad griješi.** Na Banking77 je stvarnoj namjeri dala vjerojatnost 0,00 u 30 % slučajeva. Nijedna temperatura to ne popravlja, jer postavka koja popravi slabe zadatke spljošti one u kojima je Laya dobra.
- **Previše opcija prelijeva fiksni budžet.** Sve opcije dijele jedan prostor od 192–256 tokena, pa 77 oznaka dobije otprilike 3 tokena svaka.

Jedan je rezultat ohrabrivao: Layin fino podešeni checkpoint postigao je 76,9 % na testnom dijelu typed-decisionsa, iznad Jevovih 73,8 %. To je sugeriralo plan. Naučiti Layu jedan po jedan tijek rada.

## 2.000 Jevovih odgovora napravilo je trijažni model

Višejezični checkpoint fino smo podesili na Jevovim odgovorima na četiri trijažna pitanja MOJ KRAJ.-a. S 48,0 % narastao je na 94,4 % na stavkama označenima naslijepo.

1. **Podaci.** Stvarne ulazne stavke: naslov i očišćeni sažetak iz feeda, točno ono što vidi produkcijska trijaža. Stavke od prije 14. rujna išle su u trening (2.000) i validaciju (200). Sljedeći tjedan (400 stavki) ostavljen je za testiranje, pa ništa iz testnog tjedna nije procurilo u trening.
2. **Učitelj.** Jev je odgovorio na sva četiri pitanja za 2.953 stavke, za 0,10 $. Zadržali smo njegove pune vjerojatnosti, ne samo najvjerojatniji odgovor.
3. **Učenik.** Potpuno fino podešavanje checkpointa od 322M, treniranog da oponaša Jevove vjerojatnosti (soft cross-entropy), po Layinu receptu. Trajalo je 5 minuta.
4. **Zlatne oznake.** Dva AI agenta-urednika naslijepo su označila 200 testnih stavki prema pisanoj trijažnoj politici portala. Označili su odluke koje bi drugi urednik razumno mogao procijeniti drukčije. 698 od 800 odluka bilo je jednoznačno i njih smo mjerili.
5. **Usporedba.** Točan produkcijski poziv na istim stavkama: produkcijski prompt poslan DeepSeeku v4.1 flash, bez zamjenskog modela.

| Model | Točnost na jasnim oznakama | Vijest | Servisna obavijest | Rubrika | Lokalno | Medijan latencije |
|---|--:|--:|--:|--:|--:|--:|
| Jev 1.13 (učitelj, cloud) | 97,3 % | 94,8 % | 98,9 % | 97,4 % | 97,8 % | 269 ms |
| DeepSeek v4.1 flash (produkcija) | 93,7 % | 87,3 % | 95,3 % | 99,3 % | 93,4 % | 647 ms |
| Laya višejezična, netrenirana | 48,0 % | 15,6 % | 73,2 % | 53,6 % | 47,8 % | 17 ms |
| Laya fino podešena na Jevovim odgovorima | **94,4 %** | 93,1 % | 97,4 % | 92,8 % | 94,0 % | **12 ms** |

To je statističko izjednačenje s produkcijom: +0,7 boda, uz interval pouzdanosti od 95 % od −1,7 do +3,0. Mali model bolje prepoznaje što nije vijest. LLM bolje bira rubriku.

Podataka nije trebalo puno. Istrenirali smo pet verzija na različitim količinama stavki koje je označio Jev:

| Stavke za trening | Točnost na jasnim oznakama | Slaganje s Jevom |
|--:|--:|--:|
| 125 | 89,3 % | 86,9 % |
| 250 | 92,7 % | 90,6 % |
| 500 | 93,7 % | 92,1 % |
| 1.000 | 93,7 % | 92,2 % |
| 2.000 | 94,4 % | 92,8 % |

Većina dobitka stiže s prvih 250 stavki, koje su stajale manje od centa Jevova vremena. Nakon 500 učenik se ustali tik ispod učitelja.

## Prvo lokalno, LLM samo kad nije siguran

Korištenje obaju modela bolje je od svakog zasebno. Lokalni model odgovara na ono u što je siguran, a LLM preuzima ostatak. Uz prag pouzdanosti od 0,6 kombinacija je postigla 96,4 %, prema 94,4 % samog lokalnog modela i 93,7 % samog LLM-a. Ta dva modela griješe na različitim mjestima.

Odlučuje jedno pravilo. Ako je bilo koji od četiri odgovora manje siguran od praga, cijela stavka ide LLM-u točno kao i prije. Isto vrijedi za svaki kvar lokalnog puta: istek vremena, grešku ili odgovor koji ne može pročitati. Pokvaren lokalni model košta jedan dodatni poziv LLM-u, nikad članak ili smjenu.

| Minimalna pouzdanost za lokalni odgovor | Stavke odgovorene lokalno | Ukupna točnost |
|--:|--:|--:|
| 0,6 | 70 % | 96,4 % |
| 0,7 | 50,5 % | 95,4 % |
| 0,8 | 27,5 % | 94,8 % |
| 0,9 | 5 % | 94,0 % |

Niži prag zadržava više stavki lokalno, a ovdje i postiže više, jer je lokalni model bolji sudac o tome što je vijest. Sa samo 200 testnih stavki točan najbolji prag je nepouzdan, ali svaki koji smo isprobali bio je jednak produkciji ili bolji. Pustili smo 0,6.

## U produkciji od 21. rujna

Kombinacija je krenula uživo u 23:08 21. rujna, između dvije smjene redakcije.

- **Posluživanje.** openjev radi kao nadzirani servis na stroju redakcije, uz naše ostale poslužitelje modela. Trijažni model zauzima 0,6 GB memorije GPU-a i prelazi na CPU ako je GPU ikad pun.
- **Isti ulaz kao u treningu.** Lokalni model dobiva točno ono na čemu je treniran: isto čišćenje teksta i zaključanu datoteku s pitanjima. Test pada ako netko izmijeni tu datoteku bez ponovnog treniranja.
- **Prekidač.** Upravljaju ga četiri postavke. Prazna adresa poslužitelja isključuje ga.
- **Evidencija.** Lokalni odgovori i predaje LLM-u broje se odvojeno, pa dnevni izvještaj pokazuje omjer.
- **Testovi.** 20 novih testova pokriva svaki zamjenski put, a cijeli backend prolazi (1.218 testova).

Na prvih 20 stvarnih stavki lokalni model odgovorio je na 14, za otprilike 18 ms svaku. Šest koje su otišle LLM-u trajale su 0,8–2,3 s. Bile su to stavke o slavnima i tračevima, gdje je „je li ovo vijest?” doista granično.

Prva smjena uživo, u 00:11 22. rujna, trijažirala je 9 stavki. Lokalni model odlučio je o 7: četiri sportske priče, lokalna nezgoda, lokalni sportaši i slikarska kolonija. LLM je odlučio o preostale dvije, tekstu o slavnima i pozivu na udomljavanje spašenih pasa, i obje preskočio. Smjena je napisala 7 članaka, a 4 su prošla provjeru kvalitete.

Prva noć otkrila je i bug. Lokalni odgovori nisu se brojali. openjev prijavljuje broj tokena pod Jevovim nazivima polja, evidencija potrošnje u redakciji očekuje OpenAI-jeve, a pozive s nula tokena tiho preskače. Unit testovi zamijenili su evidenciju stubom, pa to nisu vidjeli. Popravak, s testom na stvarnim nazivima polja, otišao je uživo u 00:23. Stavke te prve smjene ponovno smo propustili kroz isti deterministički model i kod kako bismo dobili gornji omjer.

## Koliko je stajalo

Otprilike 0,27 $ API poziva za cijeli projekt:

| Stavka | Pozivi | Trošak |
|---|--:|--:|
| Jev: benchmark bez treniranja, 11 zadataka + 8 primjena | 3.685 | 0,103 $ |
| Jev: trijažne oznake za trening, validaciju i test | 2.953 | 0,101 $ |
| DeepSeek v4.1 flash: produkcijska usporedba na 200 zlatnih stavki | 200 | 0,065 $ |
| DeepSeek v4.1 flash: predaje u prvom testu uživo | 6 | ~0,002 $ |
| Pet finih podešavanja, benchmarci, posluživanje | – | 0 $, vlastiti GPU |

Trijaža stoji otprilike 0,33 $ na 1.000 stavki kad o svemu odlučuje LLM. Uz 70 % odgovorenih lokalno, to pada na otprilike 0,10 $.

## Što smo naučili

Otvoreni „System One” modeli još nisu opća zamjena za Jeva. Ali destilacija jakog komercijalnog modela za odlučivanje u mali otvoreni model, jedan po jedan tijek rada, jeftina je i radi. 250 oznaka bilo je dovoljno za 92,7 %.

- **Mjerite prema oznakama naslijepo, ne prema izlazu samog sustava.** Objavljene rubrike MOJ KRAJ.-a izgledale su kao istina, ali ih je izabrala sama produkcijska trijaža. Tek su neovisne oznake pokazale da je mali model izjednačen s LLM-om.
- **Ne vjerujte broju koji izgleda predobro ili preloše.** Layinih 62 % na BoolQ-u, skupu podataka na kojem je trenirana, pokazalo se kao problem redoslijeda ključeva. Otkrili smo to pitajući zašto prije nego što smo izvijestili.
- **Usmjeravajte između modela umjesto da jedan zamijenite.** Jeftin model koji zna kad nije siguran, uz skupi za ostatak, pobijedio je oba.
- **Prvo napravite zamjenski put, onda značajku.** Svaki kvar lokalnog puta pretvara se u stari poziv LLM-u. Zato je bilo sigurno pustiti ga iste noći.

Što ovo još ne pokazuje:

- Zlatne oznake dolaze od dva AI agenta-urednika koji slijede pisanu politiku, ne od ljudskih urednika.
- Testni tjedan došao je odmah nakon podataka za trening, pa sezonski pomak nije testiran.
- S 200 testnih stavki razlike manje od otprilike 3 boda unutar su šuma.

Sljedeće ćemo dva tjedna pratiti omjer lokalno/LLM uz odbijanja urednika, mjesečno ponovno destilirati (stoji centima) i isti recept primijeniti na sljedeću rutinsku odluku redakcije.

**Izvori:** [TypeSafe dokumentacija](https://docs.typesafe.ai/llms.txt) i predavanje osnivača, [„AI: too good to be true, too bad to be useful”](https://www.youtube.com/watch?v=o-y1HJ6buGQ). Laya [težine](https://huggingface.co/convaiinnovations/laya) i [kod](https://github.com/NandhaKishorM/laya). Benchmarci Jeva trećih strana: [jev-benchmarks](https://github.com/AbdelStark/jev-benchmarks), [decision-model-benchmark](https://github.com/nibzard/decision-model-benchmark), [jev-cyrillic-audit](https://github.com/AHTOOOXA/jev-cyrillic-audit), [jev-frontier-bench](https://github.com/manjunathshiva/jev-frontier-bench). Raniji otvoreni pokušaji: [TheoLeeCJ/openjev](https://github.com/TheoLeeCJ/openjev) i [jevlike](https://github.com/vinnylarouge/jevlike).
