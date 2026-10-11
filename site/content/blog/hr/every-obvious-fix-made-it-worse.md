---
title: Svaki očiti popravak samo je pogoršao naše hrvatske titlove
description: Testirali smo Whisper na stvarnim hrvatskim podcastima i isprobali svaki očiti popravak. Nijedan nije pomogao, a tjednima kasnije jedan smo ipak pustili u rad.
date: 2026-08-27
tags: [Build Log, Speech AI]
related: [titlomat]
image: /images/og/titlomat.jpg
---

YouTube ne izrađuje automatske titlove na hrvatskom. [Titlomat](/hr/titlomat) ih izrađuje: prati nove videozapise na kanalu i dodaje im hrvatske i engleske titlove, bez uploada i bez ručnog namještanja na vremenskoj crti.

U pozadini radi Whisper, otvoreni model za prepoznavanje govora. Svi otprilike znaju koliko je Whisper dobar na engleskom, ali nitko nam nije znao reći kako se snalazi s hrvatskim podcastom. Zato smo, prije nego što smo počeli razvijati funkcionalnosti, smislili kako to izmjeriti.

## Benchmark dovoljno malen da se složi ručno

Tri petominutna isječka stvarnog hrvatskog govora, namjerno odabrana tako da se međusobno razlikuju:

- **Monolog.** Jedan glas od početka do kraja.
- **Poslovni intervju.** Imena, tvrtke i brojke.
- **Tech podcast.** Razgovorni ton, s engleskim pojmovima ubačenima u hrvatske rečenice.

Za svaki smo isječak ručno izradili referentni transkript: Whisperov smo izlaz riječ po riječ ispravili prema snimci, imena provjerili u objavljenim izvorima, a engleske pojmove ostavili u izvornom pravopisu. To je spor posao i zato je benchmark malen. No to je jedini dio sustava koji zna točan odgovor.

Mjerimo stopu pogrešaka na razini riječi (WER), i to nakon što tekst prebacimo u mala slova i uklonimo interpunkciju. Dijakritike zadržavamo, jer su *čaša* i *casa* različite riječi. Da bi transkript mogao u rad, morao je imati **WER ≤ 5%**, točno prepoznati **95% imena** i točno prepoznati **svaki broj**.

## Početno stanje

| Isječak | Stopa pogrešaka (WER) | Točna imena |
|---|---|---|
| Monolog | **1,85%** | 4 od 4 |
| Poslovni intervju | **5,28%** | 7 od 7 |
| Tech podcast | **12,48%** | 6 od 8 |

Monolog je bio odličan, a intervju je za dlaku prešao granicu. Tech podcast bio je daleko iznad nje, a objašnjenje se činilo očitim: sav taj engleski usred hrvatskog sigurno zbunjuje model kojem smo rekli da sluša hrvatski.

Istoga smo dana zato isprobali očite popravke.

## Izmjerili smo svaki očiti popravak

**Neka Whisper sam prepozna jezik**, pa da engleske dijelove transkribira kao engleski. Rezultat: jednakih 12,48%. Iste pogreške, a uz to i pokvaren timing pojedinih riječi, bez kojeg nema titlova.

**Brži model „turbo”**, za slučaj da se neki drugi model bolje snalazi s miješanjem jezika. Rezultat: **28,12%**. Više nego dvostruko više pogrešaka, a pogriješio je i jedan broj. Turbo je destilirani model sklon engleskom, a cijenu je platio hrvatski.

**Prompt s riječima koje će se vjerojatno pojaviti.** Whisper prihvaća „initial prompt” kojim se usmjerava njegov vokabular. S engleskim pojmovima iz epizode dobili smo **17,93%**, a s hrvatskim riječima vezanima uz temu **16,79%**. Oba su rezultata lošija nego bez ikakvog prompta.

**Veća preciznost, veći batchevi.** Bez ikakve promjene: 5,28% i na float32 i na float16, 1,85% uz svaku veličinu batcha.

A onda je stiglo mjerenje koje je sve objasnilo. Whisperov izlaz usporedili smo s referentnim transkriptima riječ po riječ i tražili pogreške koje se ponavljaju, upravo one koje bi mogao ispraviti prilagođeni rječnik.

Nije bilo **nijedne**. Nijedna se zamjena nije ponovila, ni u jednom isječku. Svaka je pogreška bila jednokratna: blago pogrešan hrvatski nastavak ili krivo čuta granica između riječi. *Tržište* je postalo *tržiš to*, a *vještine koje* postale su *viši ti neko*.

Time je pala i početna teorija. Pogreške u tech podcastu nisu bile u engleskim dijelovima, nego u samom hrvatskom. Miješanje jezika nije bilo problem.

## Jedan smo ipak pustili u rad

Benchmark je pokazao da prompt s vokabularom samo pogoršava rezultat i da rječnik nema što ispraviti. Rezultat iznad granice ipak smo prihvatili jer na Titlomatu većinom govori jedna osoba, kao u monologu, a ne kao u tech podcastu. Usto smo planirali u produkciji pratiti stopu pogrešaka za svaki video.

Sedamnaest dana kasnije u produkciju je otišla funkcionalnost koja je Whisperu kao initial prompt davala prilagođeni rječnik pojedinog kanala. Ideja zvuči logično: unaprijed reći modelu koja će imena čuti. No bio je to upravo onaj popravak koji je benchmark već izmjerio i odbacio.

U rad je pušten u 10:17, a povučen u 10:56. Revert je obrisao migraciju baze koja je u produkciji već bila primijenjena, pa backend nije mogao pronaći vlastitu verziju sheme i stalno se iznova rušio. Migracija je vraćena u 11:30, a zaostali stupac uklonjen u 11:39.

Ništa tog jutra nije bilo teško. Mjerenje je postojalo, samo ga nitko nije pogledao prije odluke.

## Čime smo ga zamijenili

Prilagođeni vokabular našim je korisnicima i dalje važan: nazivi kanala, gosti, brendovi. Zato smo ga premjestili tamo gdje ne može pokvariti prepoznavanje: **nakon** njega. Jezični model u zasebnom prolazu čita gotov transkript zajedno s rječnikom kanala i ispravlja, primjerice, padežne nastavke na imenima i fonetski iskrivljene nazive brendova. Radi na temperaturi 0. Ako model nije dostupan ili je rječnik prazan, sustav se vraća na obično pretraživanje i zamjenu, pa je u najgorem slučaju sve kao prije.

U duhu ovog teksta priznajemo: taj prolaz još nismo pustili kroz benchmark. To je sljedeći broj koji dugujemo sami sebi.

## Ono što WER ne vidi

Transkript može biti točan do posljednje riječi, a titlovi svejedno loši. Isto početno mjerenje obuhvatilo je i same datoteke s titlovima:

- **68–76% redaka bilo je dulje od 42 znaka**, uobičajene granice za čitljive titlove. Oznaka govornika dodavala se *nakon* što je redak već bio prelomljen.
- **6–9,5% titlova bilo je na ekranu kraće od sekunde.** Prebrzo za čitanje.
- Titl je mogao ostati na ekranu i nakon posljednje izgovorene riječi, kroz **30 sekundi odjavne glazbe**.

To smo popravili zasebno: titlovi sada nestaju s posljednjom izgovorenom riječi i nikad ne ostaju na ekranu dulje od šest sekundi. Sam WER ništa od toga ne bi otkrio. Otkrila je to druga metrika.

## Što vrijedi i drugdje

- **Napravite benchmark prije funkcionalnosti.** Petnaest minuta ručno provjerenih snimki reklo nam je više od svega što smo pročitali o Whisperu.
- **Izmjerite očiti popravak prije nego što ga ugradite.** Sva su četiri naša popravka stvari pogoršala ili nisu promijenila ništa, a svaki je zvučao kao siguran pogodak.
- **Gledajte same pogreške, ne samo njihovu stopu.** Jedna tablica s usporedbom riječ po riječ srušila je cijelu našu teoriju o problemu.
- **Verifikator pomaže samo ako ga netko pita.** Naš je 10. svibnja rekao ne. Ideju smo u rad pustili 27. svibnja. Pouka: svaka promjena koja dira prepoznavanje najprije prolazi kroz benchmark, a ne naknadno.
- **Budite iskreni kad je riječ o veličini.** Tri petominutna isječka malen su benchmark. Dovoljan je za odbacivanje loših ideja, a za to smo ga uglavnom i koristili. Nije dovoljan da kupcu obećamo konkretan broj.
