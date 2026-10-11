---
title: Prednost je u provjeravaču, a ne u generatoru
description: "Generiranje je pojeftinilo, a AI rezultat vrijednim čini ono što ga provjerava: četiri projekta, četiri provjeravača i jedna provjera izvan dosega bota."
date: 2026-09-24
tags: [Agentic Engineering, AI Quality]
related: [air-laser, overserved]
image: /images/og/air-laser.jpg
---

Danas svaki model može napisati kod, članak, razinu igre ili ulazne podatke za simulaciju. Taj je dio postao obična roba i svakim je kvartalom sve jeftiniji.

Zato kad nas netko pita što zapravo donosimo AI projektu, iskren odgovor rijetko glasi „bolji prompt”. Donosimo ono što dolazi *nakon* modela i odlučuje smije li njegov rezultat u produkciju. Generator može kupiti svatko. Provjeravač morate izgraditi sami.

Nisam krenuo od te teze. Do nje sam stalno iznova dolazio kad sam se osvrnuo na naše projekte i zapitao se gdje je zapravo završio najteži dio posla.

## Četiri projekta, četiri provjeravača

### Overserved: bot koji igra svaku razinu

[Overserved](/hr/overserved) je tower-defense igra koju smo napravili za otprilike tri tjedna, ponajviše da provjerimo dokle se može stići razvojem uz pomoć AI-ja. Generirati 140 razina bilo je lako. Utvrditi je li ijedna od njih *igriva* nije.

Zato smo napravili bota koji igru igra kako treba: tornjeve postavlja prema pokrivenosti, veću važnost daje poljima blizu izlaza, štedi novac i kupuje nadogradnje. Kad je naučio dobro igrati, ručno podešeni parametri težine izgubili su smisao. Svaki val sada raste sve dok ga bot jedva ne preživi. Svih 140 razina podešeno je prema nečemu što ih je stvarno odigralo, a ne prema nagađanju dizajnera.

### The Aimito: model koji čita majice

[The Aimito](/hr/aimito) sam generira svoj katalog odjeće s motivima iz stripova. Modeli za slike odlično izrađuju dizajne, ali loše primjećuju da je tekst na dizajnu krivo napisan ili da je nakon uklanjanja pozadine oko motiva ostao vidljiv rub.

Multimodalni model koji radi na lokalnom hardveru pregledava svaki dizajn prilikom objave. Ponovno pročita tekst, uoči loše izrezane motive i označi sve što nije za tisak. Nema poziva u cloud ni troška po slici, pa može provjeriti baš sve, i to svaki put.

### Rentalica: prvo jednako, onda bolje

[Rentalica](/hr/rentalica) je bila deset godina star PHP sustav za rent-a-car koji smo iznova izgradili kao moderan SaaS. Generator je ovdje bio coding agent, a provjeravač jedno pravilo: *mijenjaj tehnologiju ili mijenjaj proizvod, nikad oboje odjednom.*

Prije bilo kakvih novosti nova je verzija morala dokazano raditi isto kao stari sustav. Automatske provjere uspoređivale su broj redaka i same zapise u starom MySQL-u i novom PostgreSQL-u sve dok se nisu poklopili. Isti pristup vidi se i u samom proizvodu: svaki SQL upit koji generira AI parsira se u sintaksno stablo, a upit koji dira tablicu izvan odobrenog skupa odbija se prije nego što stigne do baze.

### Air-laser: kritičar koji je povukao naš najbolji grafikon

[Air-laser](/hr/air-laser) je fizikalna projektna studija od 49 stranica. Izračunala ju je petlja agenata koja pokreće dvanaestak open-source simulatora. Planer predlaže, koder piše ulazne podatke, izvršitelj pokreće simulacije, analitičar crta grafikone. Zatim kritičar, prije nego što se ijednom rezultatu povjeruje, provjerava mjerne jedinice, konvergenciju i fizikalnu uvjerljivost u odnosu na objavljenu literaturu.

U jednom je trenutku simulacija prekrasno reproducirala svjetlosnu krivulju stvarne iskre u zraku. Bio je to upravo onakav grafikon oko kojeg se gradi cijelo poglavlje, a bio je pogrešan. Solver nije poštovao očuvanje energije. Kad smo ga ispravno izgradili iznova, lažni faktor pojačanja pao je s 1407× na 1,4×, a s njim je nestalo i slaganje sa stvarnom krivuljom. Rezultat smo povukli i objavili ga onakvog kakav jest.

> Niz simulacija koji nikad ništa ne povuče nije pažljiv, nego neopovrgljiv.

## Što dobri provjeravači imaju zajedničko

Kad pogledamo sva četiri projekta, provjeravači koji su se isplatili imaju nekoliko zajedničkih osobina:

- **Mjere ono što Vam je doista važno, a ne zamjenski pokazatelj.** Za razinu tower-defense igre pravo je pitanje „preživljava li bot val”. „Misli li model da je razina uravnotežena” nije.
- **Neovisni su o generatoru.** Kritičar u air-laseru rezultate uspoređuje s izmjerenim konstantama, a ne s onim što je planer očekivao. Provjeravač koji ima iste slijepe točke kao generator samo se brže slaže s njim.
- **Dovoljno su jeftini da se pokreću svaki put.** Provjera u The Aimitu radi lokalno jer bismo uz naplatu po slici mogli provjeravati samo uzorak, a uzorak uvijek nešto propusti.
- **Smiju reći ne.** Provjeru koja može samo upozoriti svi ignoriraju već u drugom tjednu. Provjera jednakosti u Rentalici zaustavila je prelazak na novi sustav. SQL provjera zaustavlja upit.

Ovo posljednje je najvažnije. Većina timova ima *nekakvu* evaluaciju. No rijetki su je postavili tako da pala provjera doista nešto i zaustavi.

## Gdje provjeravač nije dovoljan

Bilo bi zgodno ovdje stati. No Overserved nas je naučio i suprotno.

Bot je dokazao da se svaka razina može prijeći. Ali nije mogao prepoznati da su neke dosadne. U igri su završila tri namjerno prejaka tornja, a bot to nikad nije primijetio: ekonomija igre jednostavno ih je progutala. Može li se razina preživjeti, to se može izmjeriti. Je li vrijedna dvadeset minuta Vaše večeri, to se ne može.

Provjeravač, dakle, ne zamjenjuje prosudbu, nego je *premješta*. Kad se mehaničke provjere automatiziraju, čovjeku ostaje upravo ono što nijedan bot ne može ocijeniti: odlučiti što je dobro i izabrati koje pitanje vrijedi postaviti sljedeće.

## Što to znači ako naručujete AI projekt

Kad definirate opseg AI projekta, najkorisnije pitanje nije „koji model koristite?”, nego:

**„Što provjerava rezultat i što se događa kad provjera ne prođe?”**

Ako je odgovor „pregledamo ga golim okom”, imate demo, a ne sustav. Ako postoji pravi odgovor - skup testova, referentni podaci, simulator, provjera jednakosti, drugi model s drugačijim zadatkom - onda je izbor modela najmanje važna odluka u projektu. Kad sljedeći kvartal izađe jeftiniji, jednostavno ga zamijenite.

Tome posvećujemo većinu vremena. Generiranje je jeftino. Prednost je u provjeravaču.
