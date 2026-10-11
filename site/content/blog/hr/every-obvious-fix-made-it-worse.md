---
title: Svaki očiti popravak pogoršao je naše hrvatske titlove
description: Izmjerili smo Whisper na pravim hrvatskim podcastima, a zatim isprobali svaki očiti popravak. Nijedan nije pomogao - a nekoliko tjedana kasnije jedan smo ipak pustili u produkciju.
date: 2026-08-27
tags: [Build Log, Speech AI]
related: [titlomat]
image: /images/og/titlomat.jpg
---

YouTube ne radi automatske titlove na hrvatskom. [Titlomat](/hr/titlomat) radi: prati nove videe na kanalu i dodaje im hrvatske i engleske titlove, bez uploada i bez namještanja na vremenskoj traci.

Ispod haube je Whisper, otvoreni model za prepoznavanje govora. Svi otprilike znaju koliko je Whisper dobar na engleskom. Nitko nam nije znao reći koliko je dobar na hrvatskom podcastu. Zato smo, prije nego što smo krenuli graditi funkcionalnosti, napravili način da to izmjerimo.

## Benchmark dovoljno malen da se složi ručno

Tri isječka pravog hrvatskog zvuka od po pet minuta, namjerno odabrana da budu različita:

- **Samostalni monolog.** Jedan glas od početka do kraja.
- **Poslovni intervju.** Imena, tvrtke i brojke.
- **Tech podcast.** Razgovorni ton, s engleskim pojmovima ubačenima u hrvatske rečenice.

Za svaki isječak ručno smo napravili referentni transkript: Whisperov izlaz ispravljen riječ po riječ prema zvuku, imena provjerena prema objavljenim izvorima, a engleski pojmovi ostavljeni u engleskom pravopisu. To je spor posao, i zato je benchmark malen. Ali to je jedini dio sustava koji zna točan odgovor.

Mjera je stopa pogrešaka na razini riječi (WER), izračunata nakon prebacivanja u mala slova i uklanjanja interpunkcije, uz zadržane hrvatske dijakritike, jer su *čaša* i *casa* različite riječi. Da bismo transkript pustili van, morao je postići **WER ≤ 5%**, točno pogoditi **95% imena** i točno pogoditi **svaki broj**.

## Polazna točka

| Isječak | Stopa pogrešaka (WER) | Točna imena |
|---|---|---|
| Samostalni monolog | **1,85%** | 4 od 4 |
| Poslovni intervju | **5,28%** | 7 od 7 |
| Tech podcast | **12,48%** | 6 od 8 |

Monolog je bio odličan. Intervju je za dlaku prešao granicu. Tech podcast bio je daleko iznad nje, a objašnjenje se činilo očitim: sav taj engleski pomiješan s hrvatskim sigurno zbunjuje model kojem smo rekli da je zvuk na hrvatskom.

Pa smo isti dan isprobali očite popravke.

## Svaki očiti popravak, izmjeren

**Neka Whisper sam prepozna jezik**, pa da engleske dijelove transkribira kao engleski. Rezultat: identičnih 12,48%. Iste pogreške, plus pokvaren timing na razini riječi, koji je titlovima nužan.

**Upotrijebi brži model „turbo”**, za slučaj da drugi model bolje podnosi miješanje jezika. Rezultat: **28,12%**. Više nego dvostruko pogrešaka, a pogriješio je i jedan broj. Turbo je destilirani model koji naginje engleskom, a cijenu je platio hrvatski.

**Daj Whisperu prompt s vjerojatnim riječima.** Whisper prihvaća „initial prompt” koji usmjerava njegov vokabular. Probali smo s engleskim pojmovima iz epizode: **17,93%**. Probali smo s hrvatskim riječima vezanima uz temu: **16,79%**. Oba su rezultata bila lošija nego bez ikakvog prompta.

**Veća preciznost, veći batchevi.** Nikakve promjene. 5,28% i na float32 i na float16, 1,85% na svakoj veličini batcha.

A onda mjerenje koje je sve objasnilo. Usporedili smo Whisperov izlaz s referencama riječ po riječ, tražeći pogreške koje se ponavljaju, onakve koje bi vlastiti rječnik mogao ispraviti.

Nije ih bilo **nijedne**. Nijedna zamjena nije se pojavila dvaput, ni na jednom isječku. Svaka pogreška bila je jednokratna: malo kriv hrvatski nastavak ili krivo čuta granica između riječi. *Tržište* je ispalo kao *tržiš to*. *Vještine koje* ispalo je kao *viši ti neko*.

Time je pala i početna teorija. Pogreške u tech podcastu nisu bile u engleskim dijelovima. Bile su u samom hrvatskom. Miješanje jezika nije bilo problem.

## Jedan smo ipak pustili

Benchmark je rekao da prompt s vokabularom stvari pogoršava i da rječnik nema što popraviti. Rezultat iznad granice ipak smo prihvatili, jer je većina stvarnog sadržaja na Titlomatu jedan govornik, kao u monologu, a ne tech podcast. I planirali smo u produkciji pratiti stopu pogrešaka za svaki video.

Sedamnaest dana kasnije u produkciju je otišla funkcionalnost koja je Whisperu kao initial prompt davala vlastiti rječnik svakog kanala. To je ideja koja zvuči ispravno: reci modelu imena koja će čuti. Bio je to upravo onaj popravak koji je benchmark već izmjerio i odbacio.

Pušten je u 10:17, a vraćen u 10:56. Revert je obrisao migraciju baze koju je produkcija već bila primijenila, pa backend nije mogao pronaći vlastitu verziju sheme i ušao je u petlju rušenja. Migracija je vraćena u 11:30, a zaostali stupac obrisan je u 11:39.

Ništa u tom jutru nije bilo teško. Mjerenje je postojalo, samo ga odluka nije konzultirala.

## Što ga je zamijenilo

Vlastiti vokabular našim je korisnicima i dalje važan: nazivi kanala, gosti, brendovi. Zato je premješten tamo gdje ne može pogoršati prepoznavanje: **iza** njega. Prolaz jezičnim modelom čita gotov transkript zajedno s rječnikom kanala i ispravlja stvari poput hrvatskih padežnih nastavaka na imenima i fonetski izobličenih brendova. Radi na temperaturi 0. Ako model nije dostupan ili je rječnik prazan, vraća se na obično traženje i zamjenu, pa je najgori slučaj staro ponašanje.

U duhu ovog teksta: taj prolaz još nismo proveli kroz benchmark. To je sljedeći broj koji dugujemo sami sebi.

## Ono što WER ne vidi

Transkript može biti savršen do riječi, a opet dati loše titlove. Isto početno mjerenje obuhvatilo je i same datoteke s titlovima:

- **68–76% redaka bilo je dulje od 42 znaka**, uobičajene granice za čitljive titlove. Oznaka govornika dodavala se *nakon* što je redak već bio prelomljen.
- **6–9,5% titlova bilo je na ekranu kraće od sekunde.** Prebrzo za čitanje.
- Titl je mogao ostati na ekranu kroz **30 sekundi glazbe na odjavi** nakon zadnje izgovorene riječi.

To smo popravili zasebno: titlovi sada završavaju na zadnjoj izgovorenoj riječi i nikad ne ostaju na ekranu dulje od šest sekundi. Sam WER ništa od toga nikad ne bi označio. Druga metrika jest.

## Što vrijedi i drugdje

- **Napravite benchmark prije funkcionalnosti.** Petnaest minuta ručno provjerenog zvuka reklo nam je više nego bilo koliko čitanja o Whisperu.
- **Izmjerite očiti popravak prije nego što ga izgradite.** Sva četiri naša stvari su pogoršala ili nisu učinila ništa, a svaki je zvučao kao siguran pogodak.
- **Gledajte pogreške, ne samo stopu.** Usporedba riječ po riječ promijenila je cijelu našu teoriju problema u jednoj tablici.
- **Verifikator pomaže samo ako ga nešto konzultira.** Naš je rekao ne 10. svibnja. Ideju smo pustili 27. svibnja. Pouka: promjena koja dira prepoznavanje prvo prolazi kroz benchmark, a ne nakon.
- **Budite iskreni o veličini.** Tri isječka od pet minuta malen su benchmark. Dovoljan je da odbaci loše ideje, a za to smo ga većinom i koristili. Nije dovoljan da kupcu obećamo broj.
