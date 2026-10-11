---
title: Prednost je u provjeravaču, ne u generatoru
description: Generiranje je postalo jeftino. AI rezultat vrijedan isporuke čini ono što ga provjerava - četiri naša projekta, četiri provjeravača i jedna provjera koju bot nije mogao napraviti.
date: 2026-09-24
tags: [Agentic Engineering, AI Quality]
related: [air-laser, overserved]
image: /images/og/air-laser.jpg
---

Svaki model može napisati kod, članak, razinu igre, ulazne podatke za simulaciju. Taj je dio danas roba široke potrošnje i svakog kvartala postaje jeftiniji.

Zato kad nas netko pita što zapravo donosimo AI projektu, iskren odgovor rijetko je „bolji prompt”. To je ono što stoji *nakon* modela i odlučuje smije li njegov rezultat u produkciju. Generator je dio koji svatko može kupiti. Provjeravač je dio koji morate izgraditi.

Nisam krenuo od toga kao teze. To se stalno pojavljivalo kad sam se osvrnuo na naše projekte i zapitao gdje je zapravo otišao težak posao.

## Četiri projekta, četiri provjeravača

### Overserved: bot koji igra svaku razinu

[Overserved](/hr/overserved) je tower-defense igra koju smo izgradili za otprilike tri tjedna, uglavnom kao test koliko daleko seže razvoj uz pomoć AI-ja. Generirati 140 razina bilo je lako. Znati je li ijedna od njih *igriva* nije.

Zato smo izgradili bota koji igru igra kako treba: postavlja tornjeve prema pokrivenosti, daje veću težinu poljima blizu izlaza, štedi valutu, kupuje nadogradnje. Kad je naučio dobro igrati, ručno podešeni parametri težine postali su šum. Svaki val sada raste dok ga bot jedva ne preživi. Svih 140 razina podesilo je nešto što ih je odigralo, a ne dizajner koji nagađa.

### The Aimito: model koji pročita majicu

[The Aimito](/hr/aimito) generira vlastiti katalog odjeće s motivima stripova. Modeli za slike odlični su u izradi dizajna, a loši u primjećivanju da je tekst na dizajnu pogrešno napisan ili da je uklanjanje pozadine ostavilo oreol.

Multimodalni model na lokalnom hardveru pregledava svaki dizajn pri objavi. Ponovno čita tekst, hvata loše izreske i označava sve što nije dostojno tiska. Nema poziva u cloud ni troška po slici, pa može raditi na svemu, svaki put.

### Rentalica: jednakost prije napretka

[Rentalica](/hr/rentalica) je desetljeće star PHP sustav za rent-a-car, iznova izgrađen kao moderan SaaS. Generator je ondje bio agent za programiranje. Provjeravač je bilo pravilo: *mijenjaj tehnologiju ili mijenjaj proizvod, nikad oboje odjednom.*

Prije nego što je išta novo bilo dopušteno, nova verzija morala je dokazivo biti identična starom sustavu. Automatske provjere između baza uspoređivale su broj redaka i zapise između starog MySQL-a i novog PostgreSQL-a dok se nisu poklopili. Isti instinkt vidi se i u samom proizvodu. Svaki SQL upit koji generira AI parsira se u sintaksno stablo, a sve što dira tablicu izvan odobrenog skupa odbija se prije nego što stigne do baze.

### Air-laser: kritičar koji je povukao naš najbolji grafikon

[Air-laser](/hr/air-laser) je fizikalna projektna studija na 49 stranica, izračunata petljom agenata koja upravlja dvanaestak open-source simulatora. Planer predlaže, koder piše ulazne podatke, izvršitelj pokreće, analitičar crta. Zatim kritičar provjerava mjerne jedinice, konvergenciju i fizikalnu uvjerljivost prema objavljenoj literaturi prije nego što se ičemu povjeruje.

U jednom trenutku simulacija je prekrasno reproducirala svjetlosnu krivulju stvarne iskre u zraku. Bio je to točno onaj grafikon oko kojeg gradite cijelo poglavlje, i bio je pogrešan. Solver nije čuvao energiju. Kad je ispravno ponovno izgrađen, lažni faktor pojačanja pao je s 1.407× na 1,4×, a s njim je nestalo i slaganje. Povukli smo rezultat i objavili ga kao ono što jest.

> Simulacijska kampanja koja nikad ništa ne povuče nije pažljiva. Nemoguće ju je opovrgnuti.

## Što dobri provjeravači imaju zajedničko

Gledajući sva četiri, provjeravači koji su opravdali svoje mjesto dijelili su nekoliko osobina:

- **Mjere ono do čega Vam je stalo, a ne zamjensku mjeru.** „Preživljava li bot val” stvarno je pitanje za razinu tower-defense igre. „Misli li model da je razina uravnotežena” nije.
- **Neovisni su o generatoru.** Kritičar u air-laseru provjerava prema izmjerenim konstantama, a ne prema onome što je planer očekivao. Provjeravač koji dijeli slijepe točke generatora samo se brže slaže s njim.
- **Dovoljno su jeftini da se pokreću svaki put.** Provjera u The Aimitu radi lokalno jer bi je naknada po slici pretvorila u uzorkovanje, a uzorkovanje propušta stvari.
- **Smiju reći ne.** Provjeru koja može samo upozoriti do drugog tjedna svi ignoriraju. Rentalicina provjera jednakosti blokirala je prelazak na novi sustav. SQL provjera blokira upit.

Ovo posljednje najvažnije je. Većina timova ima *nekakvu* evaluaciju. Puno ih je manje povezalo tako da neuspjela provjera stvarno nešto zaustavi.

## Gdje provjeravač više ne pomaže

Bilo bi uredno ovdje stati. Ali Overserved nas je naučio i suprotnu lekciju.

Bot je dokazao da je svaka razina prolazna. Nije mogao prepoznati da su neke od njih dosadne. U igru su namjerno ubačena tri prejaka tornja, a bot to nikad nije primijetio: ekonomija ih je apsorbirala. „Preživljivo” je mjerljivo. „Vrijedno dvadeset minuta Vaše večeri” nije.

Dakle provjeravač ne zamjenjuje prosudbu. On je *premješta*. Kad se mehaničke provjere automatiziraju, čovjekov se cijeli posao svodi na dio koji nijedan bot ne može ocijeniti: odlučiti što je dobro i izabrati koje pitanje vrijedi postaviti sljedeće.

## Što to znači ako kupujete AI rad

Ako definirate opseg AI projekta, najkorisnije pitanje nije „koji model koristite?”. Nego:

**„Što provjerava rezultat i što se događa kad provjera ne prođe?”**

Ako je odgovor „pregledavamo ga okom”, imate demo, a ne sustav. Ako postoji pravi odgovor - skup testova, referentna istina, simulator, provjera jednakosti, drugi model s drugačijim zadatkom - model ispod toga postaje najmanje važna odluka u projektu. Možete ga zamijeniti sljedeći kvartal kad izađe jeftiniji.

Tu provodimo svoje vrijeme. Generiranje je jeftino. Prednost je u provjeravaču.
