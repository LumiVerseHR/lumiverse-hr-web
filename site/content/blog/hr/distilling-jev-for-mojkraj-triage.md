---
title: Kako smo za 0,10 $ destilirali Jev za trijažu MOJ KRAJ.-a
description: Model od 322M na našem GPU-u sad donosi većinu trijažnih odluka MOJ KRAJ.-a. Naučio je iz Jevovih odgovora vrijednih 0,10 $ i izjednačen je s LLM-om.
date: 2026-09-22
tags: [Build Log, AI Evaluation]
related: [mojkraj]
image: /images/og/mojkraj.jpg
---

[MOJ KRAJ.](/hr/mojkraj) hrvatski je news portal koji piše AI pod ljudskim uredničkim nadzorom. O svakoj stavci koja stigne u redakciju donosi se trijažna odluka prije nego što itko o njoj napiše ijedan redak. To je otprilike 13.000 stavki tjedno iz 145 izvora.

Trijaža postavlja četiri pitanja. Je li to vijest? Je li to servisna obavijest (voda, struja, promet)? U koju od sedam rubrika pripada? Je li lokalna?

Do rujna se za svaku od tih odluka pozivao LLM, DeepSeek v4.1 flash. Danas većinu donosi model od 322 milijuna parametara na našem vlastitom GPU-u, za otprilike 12 ms. Na stavkama koje su neovisno označene naslijepo točan je jednako kao LLM: 94,4 % prema 93,7 %. Posao je naučio iz odgovora komercijalnog modela za odlučivanje, koji su stajali desetak centi.

## Rutinske odluke ne trebaju chatbot

Poziv LLM-u trajao je 0,65 sekundi i stajao otprilike 0,33 $ na 1.000 stavki. Odgovor je stizao kao JSON koji je trebalo parsirati, a u dnevniku smjena zabilježeno je 210 trijažnih odgovora koji nisu prošli provjeru sheme.

TypeSafe tvrdi da ovakve odluke uopće ne trebaju generator teksta. Njihov [„System One” model, Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), prima stanje i tipizirana pitanja (odaberi jedno, ocijeni, da/ne) i vraća kalibrirane vjerojatnosti. Nema proze i nema što parsirati.

Htjeli smo isto, ali otvoreno i lokalno:

- isti API,
- na našem vlastitom GPU-u,
- bez troška po pozivu,
- bez podataka koji izlaze iz naše kuće.

Htjeli smo i pošten odgovor na pitanje mogu li otvoreni modeli već danas obavljati Jevov posao.

## Polazište: otvoreni model s napuhanim rezultatom

Otvoreni model na kojem smo gradili je [Laya](https://huggingface.co/convaiinnovations/laya) (Apache-2.0). Svaku opciju odgovora ocjenjuje na vlastitom [MASK] tokenu, pa jedan prolaz kroz model odgovara na jedno pitanje. Dostupna je u tri checkpointa:

- engleski, 421M parametara,
- višejezični, 322M parametara, za 100+ jezika,
- jedan fino podešen na benchmarku [typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions).

Kartica modela tvrdi da Laya pobjeđuje Jeva, 0,766 prema 0,727. Iz koda se vidi da taj broj pripada fino podešenom checkpointu, mjerenom na testnom dijelu tog istog benchmarka. Bez dodatnog treniranja osnovni checkpointi postižu oko 0,36. To je lošije od pukog pogađanja najčešćeg odgovora (0,461).

Sam kod bio je čist: samo safetensors, bez udaljenog koda, bez telemetrije.

## openjev: Jevov API, lokalno

Napravili smo **openjev**, poslužitelj koji odgovara na Jevov API iz lokalnih Laya checkpointa. TypeSafeov službeni SDK adresu poslužitelja čita iz varijable okruženja, pa radi s openjevom bez izmjena koda. Prebacivanje aplikacije svodi se na jednu postavku.

<figure><picture><source media="(max-width: 600px)" srcset="/blog/distilling-jev-for-mojkraj-triage/architecture-hr-sm.webp"><img src="/blog/distilling-jev-for-mojkraj-triage/architecture-hr.webp" alt="Dijagram: aplikacija sa službenim TypeSafe SDK-om šalje POST /v1/systemone openjevu, koji tekst na engleskom šalje modelu laya-en (421M), sve ostale jezike modelu laya-multilingual (322M), a zahtjeve koji ga traže imenom MOJ KRAJ. trijažnom modelu" loading="lazy"></picture><figcaption>openjev odgovara na Jevov API iz lokalnih checkpointa. Jezik odlučuje o modelu, osim ako ga pozivatelj ne zatraži imenom.</figcaption></figure>

- **Ponaša se kao Jev.** Odgovori su jednaki onima pravog Jeva: isto zaokruživanje, redoslijed opcija, formula pouzdanosti i poruke o greškama. Testovi to provjeravaju prema snimljenim Jevovim odgovorima. Naša kopija Layina koda daje iste vjerojatnosti kao izvorni paket, uz razliku manju od 0,004.
- **Usmjerava po jeziku.** U Layin detektor jezika dodali smo hrvatske stop-riječi. Prije toga hrvatski pisan bez dijakritika („molim vas vratite novac sto prije”) završavao je na engleskom modelu. Ta je greška skupa: hrvatska klasifikacija tema postiže 48,5 % na engleskom modelu i 76,0 % na višejezičnom.
- **Siguran je na dijeljenom GPU-u.** Većinu memorije kartice zauzimaju drugi modeli. openjev ograničava vlastitu memoriju i ne učitava se na GPU ako ne ostane slobodno barem 8 GB; inače radi na CPU-u. Ako ostane bez memorije, prepolovi batch. U testu s ograničenjem od 1,25 GiB batch zahtjeva s 96 pitanja prepolovio se četiri puta, a zahtjev je ipak završio na GPU-u.

## Bez treniranja, Laya nije Jev

Jevu 1.13 i Layi poslali smo bajt-identične zahtjeve na 11 javnih zadataka i 8 ručno označenih primjera Jevove upotrebe. Laya je bila otprilike 20× brža, 9–18 ms po zahtjevu prema 258–288 ms. Ali s Jevom se mogla mjeriti samo na kratkim tekstovima s malo opcija. Jevov dio ovog benchmarka stajao je 0,10 $.

<figure><picture><source media="(max-width: 600px)" srcset="/blog/distilling-jev-for-mojkraj-triage/zero-shot-hr-sm.webp"><img src="/blog/distilling-jev-for-mojkraj-triage/zero-shot-hr.webp" alt="Grafikon razlike točnosti Laye i Jeva na 11 zadataka. Laya je ispred samo na AG Newsu (+7,0); na svim ostalima zaostaje, od −5,2 na Emociji do −81,8 na zadatku browser agenta" loading="lazy"></picture><figcaption>Bez treniranja, Laya protiv Jeva 1.13 na bajt-identičnim zahtjevima. Točke su razlika u postotnim bodovima, crte interval pouzdanosti od 95 %; desni stupac pokazuje točnost svakog modela. Broj odluka u zagradama.</figcaption></figure>

Ako Layu koristite izravno, pazite na tri stvari:

- **Redoslijed ključeva u ulazu mijenja odgovor.** BoolQ s odlomkom prije pitanja postiže 83 %. Isti podaci sa zamijenjenim ključevima postižu 62 %. Jev je iznad 90 % u oba slučaja. Dokaze stavite na početak.
- **Samouvjerena je kad griješi.** Na Banking77 je u 30 % slučajeva točnoj namjeri dala vjerojatnost 0,00. Nijedna temperatura to ne popravlja, jer postavka koja popravi slabe zadatke pokvari one u kojima je Laya dobra.
- **Previše opcija ne stane u fiksni prostor.** Sve opcije dijele jedan prostor od 192–256 tokena, pa 77 oznaka dobije otprilike 3 tokena svaka.

Jedan je rezultat ohrabrivao: Layin fino podešeni checkpoint postigao je 76,9 % na testnom dijelu typed-decisionsa, iznad Jevovih 73,8 %. Odatle plan: naučiti Layu jedan po jedan tijek rada.

## Od 2.000 Jevovih odgovora do trijažnog modela

Višejezični checkpoint fino smo podesili na Jevovim odgovorima na četiri trijažna pitanja MOJ KRAJ.-a. Točnost na stavkama označenima naslijepo narasla mu je s 48,0 % na 94,4 %.

1. **Podaci.** Stvarne ulazne stavke: naslov i očišćeni sažetak iz feeda, točno ono što vidi produkcijska trijaža. Stavke od prije 14. rujna korištene su za trening (2.000) i validaciju (200). Sljedeći tjedan (400 stavki) ostavljen je za testiranje, pa ništa iz testnog tjedna nije procurilo u trening.
2. **Učitelj.** Jev je odgovorio na sva četiri pitanja za 2.953 stavke, za 0,10 $. Zadržali smo njegove pune vjerojatnosti, ne samo najvjerojatniji odgovor.
3. **Učenik.** Cijeli checkpoint od 322M fino smo podesili da oponaša Jevove vjerojatnosti (soft cross-entropy), po Layinu receptu. Trajalo je 5 minuta.
4. **Zlatne oznake.** Dva AI agenta-urednika naslijepo su označila 200 testnih stavki prema pisanoj trijažnoj politici portala. Posebno su označili odluke koje bi drugi urednik s pravom mogao donijeti drukčije. Jednoznačno je bilo 698 od 800 odluka i na njima smo mjerili.
5. **Usporedba.** Isti poziv kao u produkciji, na istim stavkama: produkcijski prompt poslan DeepSeeku v4.1 flash, bez zamjenskog modela.

| Model | Točnost na jasnim oznakama | Vijest | Servisna obavijest | Rubrika | Lokalno | Medijan latencije |
|---|--:|--:|--:|--:|--:|--:|
| Jev 1.13 (učitelj, cloud) | 97,3 % | 94,8 % | 98,9 % | 97,4 % | 97,8 % | 269 ms |
| DeepSeek v4.1 flash (produkcija) | 93,7 % | 87,3 % | 95,3 % | 99,3 % | 93,4 % | 647 ms |
| Laya višejezična, netrenirana | 48,0 % | 15,6 % | 73,2 % | 53,6 % | 47,8 % | 17 ms |
| Laya fino podešena na Jevovim odgovorima | **94,4 %** | 93,1 % | 97,4 % | 92,8 % | 94,0 % | **12 ms** |

Statistički je to izjednačeno s produkcijom: +0,7 boda, uz interval pouzdanosti od 95 % od −1,7 do +3,0. Mali model bolje prepoznaje što nije vijest. LLM bolje bira rubriku.

<figure><picture><source media="(max-width: 600px)" srcset="/blog/distilling-jev-for-mojkraj-triage/speed-accuracy-hr-sm.webp"><img src="/blog/distilling-jev-for-mojkraj-triage/speed-accuracy-hr.webp" alt="Grafikon točnosti prema medijanu latencije: fino podešena Laya 94,4 % i 12 ms, Jev 97,3 % i 269 ms, DeepSeek v4.1 flash 93,7 % i 647 ms, netrenirana Laya 48,0 % i 17 ms" loading="lazy"></picture><figcaption>Točnost na jasnim zlatnim odlukama prema medijanu latencije po stavci. Fino podešavanje podiglo je lokalni model s dna grafikona na razinu produkcijskog LLM-a, uz otprilike pedeseti dio njegove latencije.</figcaption></figure>

Podataka nije trebalo puno. Istrenirali smo pet verzija na različitim količinama stavki koje je označio Jev:

<figure><picture><source media="(max-width: 600px)" srcset="/blog/distilling-jev-for-mojkraj-triage/learning-curve-hr-sm.webp"><img src="/blog/distilling-jev-for-mojkraj-triage/learning-curve-hr.webp" alt="Linijski grafikon točnosti prema broju stavki za trening koje je označio Jev: 89,3 % na 125, 92,7 % na 250, 93,7 % na 500 i 1.000, 94,4 % na 2.000; slaganje s Jevom 2 do 3 boda niže" loading="lazy"></picture><figcaption>Pet finih podešavanja na 125 do 2.000 stavki koje je označio Jev. Netreniran, isti model postiže 48,0 %.</figcaption></figure>

Najveći dio napretka donosi prvih 250 stavki, za koje je Jev naplatio manje od centa. Nakon 500 stavki učenik se zaustavlja tik ispod učitelja.

## Prvo lokalno, LLM samo kad nije siguran

Dva modela zajedno bolja su od svakog zasebno. Lokalni model odgovara na ono u što je siguran, a LLM preuzima ostatak. Uz prag pouzdanosti od 0,6 kombinacija je postigla 96,4 %, prema 94,4 % samog lokalnog modela i 93,7 % samog LLM-a. Ta dva modela griješe na različitim mjestima.

<figure><picture><source media="(max-width: 600px)" srcset="/blog/distilling-jev-for-mojkraj-triage/cascade-hr-sm.webp"><img src="/blog/distilling-jev-for-mojkraj-triage/cascade-hr.webp" alt="Dijagram toka: ulazna stavka ide lokalnom modelu; ako svaki odgovor ima p od barem 0,6, vrijedi lokalna odluka, inače odlučuje LLM s produkcijskim promptom; istek vremena, greška ili nečitljiv odgovor također idu LLM-u" loading="lazy"></picture><figcaption>Jedno pravilo usmjerava svaku stavku. Svaka sumnja i svaki kvar lokalnog puta vraćaju se na izvorni poziv LLM-u.</figcaption></figure>

Odlučuje jedno pravilo. Ako je bilo koji od četiri odgovora manje siguran od praga, cijela stavka ide LLM-u točno kao i prije. Isto vrijedi za svaki kvar lokalnog puta: istek vremena, grešku ili odgovor koji ne može pročitati. Ako se lokalni model pokvari, to košta jedan poziv LLM-u više, a nikad članak ili smjenu.

<figure><picture><source media="(max-width: 600px)" srcset="/blog/distilling-jev-for-mojkraj-triage/thresholds-hr-sm.webp"><img src="/blog/distilling-jev-for-mojkraj-triage/thresholds-hr.webp" alt="Dva grafikona: stavke odgovorene lokalno padaju sa 70 % uz prag 0,6 na 5 % uz 0,9; ukupna točnost pada s 96,4 % na 94,0 %, iznad samog lokalnog modela (94,4 %) i samog LLM-a (93,7 %) za pragove do 0,8" loading="lazy"></picture><figcaption>Simulirano na 200 zlatnih stavki označenih naslijepo. Niži prag zadržava više stavki lokalno i, s ovim parom modela, ujedno je točniji.</figcaption></figure>

Niži prag zadržava više stavki lokalno, a s ovim parom modela daje i bolji rezultat, jer lokalni model bolje procjenjuje što je vijest. Na samo 200 testnih stavki najbolji prag ne može se pouzdano odrediti, ali svaki koji smo isprobali bio je barem jednako dobar kao produkcija. U rad smo pustili 0,6.

## U produkciji od 21. rujna

Sustav je pušten u rad 21. rujna u 23:08, između dvije smjene redakcije.

- **Pokretanje.** openjev radi kao nadzirani servis na računalu redakcije, uz naše ostale poslužitelje modela. Trijažni model zauzima 0,6 GB memorije GPU-a i prelazi na CPU ako je GPU ikad pun.
- **Isti ulaz kao u treningu.** Lokalni model dobiva točno ono na čemu je treniran: isto čišćenje teksta i zaključanu datoteku s pitanjima. Test pada ako netko izmijeni tu datoteku bez ponovnog treniranja.
- **Uključivanje.** Upravlja se s četiri postavke, a prazna adresa poslužitelja isključuje ga.
- **Evidencija.** Lokalni odgovori i stavke proslijeđene LLM-u broje se odvojeno, pa dnevni izvještaj pokazuje omjer.
- **Testovi.** 20 novih testova pokriva svaki slučaj prebacivanja na LLM, a cijeli backend prolazi (1.218 testova).

Na prvih 20 stvarnih stavki lokalni model odgovorio je na 14, za otprilike 18 ms svaku. Šest stavki proslijeđenih LLM-u trajalo je 0,8–2,3 s. Bile su to stavke o slavnima i tračevima, gdje je „je li ovo vijest?” doista granično.

Prva prava smjena, 22. rujna u 00:11, trijažirala je 9 stavki. Lokalni model odlučio je o 7: četiri sportske priče, lokalna nezgoda, lokalni sportaši i slikarska kolonija. LLM je odlučio o preostalima dvjema, tekstu o slavnima i pozivu na udomljavanje spašenih pasa, i obje odbacio. Smjena je napisala 7 članaka, a 4 su prošla provjeru kvalitete.

Prva noć otkrila je i bug. Lokalni odgovori nisu se brojali. openjev prijavljuje broj tokena pod Jevovim nazivima polja, evidencija potrošnje u redakciji očekuje OpenAI-jeve, a pozive s nula tokena tiho preskače. U unit testovima evidencija je bila zamijenjena stubom, pa to nisu uhvatili. Popravak, s testom na stvarnim nazivima polja, pušten je u 00:23. Stavke te prve smjene ponovno smo propustili kroz isti deterministički model i kod kako bismo dobili gornji omjer.

## Koliko je stajalo

API pozivi za cijeli projekt stajali su otprilike 0,27 $:

| Stavka | Pozivi | Trošak |
|---|--:|--:|
| Jev: benchmark bez treniranja, 11 zadataka + 8 primjena | 3.685 | 0,103 $ |
| Jev: trijažne oznake za trening, validaciju i test | 2.953 | 0,101 $ |
| DeepSeek v4.1 flash: produkcijska usporedba na 200 zlatnih stavki | 200 | 0,065 $ |
| DeepSeek v4.1 flash: proslijeđene stavke u prvom testu uživo | 6 | ~0,002 $ |
| Pet finih podešavanja, benchmarci, posluživanje | – | 0 $, vlastiti GPU |

Trijaža stoji otprilike 0,33 $ na 1.000 stavki kad o svemu odlučuje LLM. Uz 70 % odgovorenih lokalno, to pada na otprilike 0,10 $.

## Što smo naučili

Otvoreni „System One” modeli još nisu opća zamjena za Jeva. Ali destilacija jakog komercijalnog modela za odlučivanje u mali otvoreni model, jedan po jedan tijek rada, jeftina je i funkcionira. 250 oznaka bilo je dovoljno za 92,7 %.

- **Mjerite prema oznakama naslijepo, ne prema izlazu samog sustava.** Objavljene rubrike MOJ KRAJ.-a izgledale su kao točni odgovori, ali ih je izabrala sama produkcijska trijaža. Tek su neovisne oznake pokazale da je mali model izjednačen s LLM-om.
- **Ne vjerujte broju koji izgleda predobro ili preloše.** Layinih 62 % na BoolQ-u, skupu podataka na kojem je trenirana, pokazalo se posljedicom redoslijeda ključeva. Otkrili smo to jer smo se zapitali zašto, prije nego što smo objavili rezultat.
- **Kombinirajte modele umjesto da jedan zamijenite drugim.** Jeftin model koji zna kad nije siguran, uz skupi za ostatak, pobijedio je oba.
- **Prvo osigurajte povratak na staro, onda gradite novo.** Svaki kvar lokalnog puta pretvara se u stari poziv LLM-u. Zato je bilo sigurno pustiti ga iste noći.

Što ovo još ne pokazuje:

- Zlatne oznake dolaze od dva AI agenta-urednika koji slijede pisanu politiku, ne od ljudskih urednika.
- Testni tjedan došao je odmah nakon podataka za trening, pa nismo provjerili kako na model utječu godišnja doba.
- S 200 testnih stavki razlike manje od otprilike 3 boda unutar su šuma.

Sljedeće ćemo dva tjedna pratiti omjer lokalno/LLM uz odbijanja urednika, jednom mjesečno ponoviti destilaciju (stoji nekoliko centi) i isti recept primijeniti na sljedeću rutinsku odluku redakcije.

**Izvori:** [TypeSafe dokumentacija](https://docs.typesafe.ai/llms.txt) i predavanje osnivača, [„AI: too good to be true, too bad to be useful”](https://www.youtube.com/watch?v=o-y1HJ6buGQ). Laya [težine](https://huggingface.co/convaiinnovations/laya) i [kod](https://github.com/NandhaKishorM/laya). Benchmarci Jeva trećih strana: [jev-benchmarks](https://github.com/AbdelStark/jev-benchmarks), [decision-model-benchmark](https://github.com/nibzard/decision-model-benchmark), [jev-cyrillic-audit](https://github.com/AHTOOOXA/jev-cyrillic-audit), [jev-frontier-bench](https://github.com/manjunathshiva/jev-frontier-bench). Raniji otvoreni pokušaji: [TheoLeeCJ/openjev](https://github.com/TheoLeeCJ/openjev) i [jevlike](https://github.com/vinnylarouge/jevlike).
