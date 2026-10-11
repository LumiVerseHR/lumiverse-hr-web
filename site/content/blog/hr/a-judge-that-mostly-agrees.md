---
title: Sudac koji se uglavnom slaže nije sudac
description: Testirali smo mali model kao suca za provjeru činjenica na MOJ KRAJ. Bio je brži, slagao se oko lakih odluka i objavio bi 15 od 20 članaka koje je sudac zadržao.
date: 2026-09-17
tags: [Build Log, AI Evaluation]
related: [mojkraj]
image: /images/og/mojkraj.jpg
---

[MOJ KRAJ.](/hr/mojkraj) hrvatski je news portal koji piše AI pod ljudskim uredničkim nadzorom. Prije nego što se ijedan članak objavi, mora proći niz automatskih provjera. Najvažnija je utemeljenost (grounding): pojavljuje li se svaka tvrdnja iz članka doista u izvoru koji citira?

Ta je provjera skupa. Vrti se na 35B open-weight modelu na našem vlastitom GPU-u i traje od 88 do 530 sekundi po članku. Odmah do njega, na istom stroju, stajao je 4B model: neiskorišten, s osam paralelnih slotova, a isti poziv odrađuje za otprilike 11 sekundi.

Očit potez je prebaciti posao suca na mali model. Prvo smo izmjerili. Odgovor je bio ne, a razlog je cijela poanta ovog teksta.

## Što sudac zapravo radi

Vrijedi biti precizan, jer „provjera činjenica” zvuči kao da uključuje pretraživanje weba. Ne uključuje.

1. Citirani izvor se dohvati i očisti u običan tekst: obični HTTP zahtjev i korak ekstrakcije, za manje od sekunde.
2. **Jedan** poziv modelu izvuče do deset tvrdnji iz članka i za svaku presudi u odnosu na tekst izvora.
3. Povrh toga se vrte determinističke provjere: brojevi u članku moraju odgovarati brojevima u izvoru i tako dalje.

Korak 2 jedini je skup dio i jedini dio koji traži prosudbu.

## Mjerite ono o čemu presuda odlučuje, a ne koliko brzo stiže

Primamljiv benchmark je brzina ili prosječno slaganje. Oba bi rekla da.

Mi smo izmjerili nešto drugo: **koliko često zamjena suca mijenja to hoće li se članak objaviti?** Pokrenuli smo produkcijsko ocjenjivanje s provjerom usmjerenom na 4B, na 40 članaka koje je 35B već ocijenio, i usporedili rezultate sa spremljenim presudama 35B modela.

| Članci | Promjena ocjene (medijan) | Prešli granicu |
|---|---|---|
| 20 koje je 35B ocijenio sa 71 ili više | +0 | 4 od 20 |
| 20 koje je 35B **zadržao** (65–68) | **+24** | **15 od 20** |

Na lakim slučajevima 4B se uglavnom slaže, a dashboard s prosječnim slaganjem izgledao bi u redu.

Na slučajevima u kojima presuda stvarno o nečemu odlučuje, objavio bi petnaest od dvadeset članaka koje je 35B zadržao. Neki su skočili sa 66 na 100.

## Ne razilazi se. Klizi prema 100.

Pogledajte kako je mali model griješio. Nije pratio 35B i promašivao za malo. **Devet od njegovih prvih dvadeset ocjena bilo je točno 100.**

Nije bila riječ ni o kvaliteti ekstrakcije. 4B je svaki put proizveo uredno oblikovane tvrdnje sa stvarnim citatima iz izvora. Ono što nije mogao jest presuditi protiv članka. Kad dobije nacrt i izvor, naginje prema „da, to je potkrijepljeno”.

Bilješka ostavljena uz kod to je rekla u jednom retku:

> A judge that mostly agrees is not a cheap judge, it is not a judge.

Verifikator opravdava svoje postojanje na graničnim slučajevima, onima koje bi trebao zaustaviti. Verifikator koji odobri gotovo sve samo je sporiji način da se objavi sve.

## Gdje mali model ipak pobjeđuje

Ista je istraga, jednu funkciju dalje, dala suprotan odgovor. Svaki članak na MOJ KRAJ. dobiva *kicker*, oznaku od jedne do tri riječi iznad naslova. To je mehanički posao, a odrađivao ga je veliki model s reasoningom uključenim po defaultu. Nitko to nije tražio.

| Postavka (isti prompt, 3 objavljena članka) | Vrijeme | Rezultat |
|---|---|---|
| 35B, reasoning uključen | 57–103 s | **prazno 2 od 3** |
| 35B, reasoning isključen | 0,9–54 s | točno |
| 4B, reasoning isključen | 0,3–0,6 s | identični odgovori |

Zato je kicker prešao na mali model, a budžet tokena smanjen je s 2.048 na 256. Ako mali model nije konfiguriran, poziv se vraća na veliki, pa je najgori slučaj staro ponašanje.

Isti GPU, ista istraga, dva suprotna odgovora. Razlika je u tome traži li zadatak prosudbu.

## Test koji pada na dobroj ideji

Prebaciti suca na mali model prirodna je ideja i netko će je opet predložiti, možda i mi, za šest mjeseci, kad ovo zaboravimo.

Zato za to postoji test. Čita izvorni kod provjera utemeljenosti i pristranosti i **pada ako ijedna od njih ikad zatraži mali model.** Ne testira ponašanje. Zakiva odluku za koju je trebalo mjerenje, pa da bi se poništila, treba novo mjerenje, a ne brzi refactor.

Samo mjerenje živi kao komentar uz poziv, s datumom, metodom i brojevima. Sljedeća osoba može ga ponovno pokrenuti umjesto da sve izvodi iznova.

## Mjerite ponovno kad se model promijeni

Još jedan detalj istu poantu pokazuje iz drugog kuta.

Reasoning mod skupi je dio poziva za utemeljenost, pa smo ga nekoliko dana ranije pokušali isključiti. Ponovno smo ocijenili šest objavljenih članaka bez njega. Medijan ocjene pomaknuo se za 52 boda, a pet od šest prešlo je granicu: članci koji su imali 100 vratili su se s 32, 13 i 63. Reasoning je ostao uključen.

Zatim je na serveru kratko radio noviji 27B model i isti se test preokrenuo. S reasoningom ili bez njega, razlika medijana bila je 0 i nijedan članak nije promijenio stranu. Jedini učinak reasoninga bio je da je sve 3 do 20 puta sporije.

Ista provjera, ista metoda, dva modela, suprotni odgovori. Zato kod ne kaže „reasoning uključen”. Kaže: *ovo je izmjerena postavka za ovaj model; ponovno pokreni test kad se model promijeni.* A broj koji se ponovno mjeri uvijek su prelasci granice, nikad brzina.

## Što se prenosi

Ako vodite bilo koji AI sustav s automatskom provjerom u petlji, ovo je dio koji vrijedi ukrasti:

- **Verifikator ocjenjujte po odlukama koje preokrene, a ne po prosječnom slaganju.** U slaganju dominiraju laki slučajevi. Granični slučajevi su cijeli posao.
- **Pazite na klizanje prema „da”.** Sudac koji sve ocjenjuje visoko izgleda kooperativno. A zapravo tiho zakazuje.
- **Jeftine modele stavite na mehanički posao, ne na presude.** U prvome su izvrsni, u drugome opasni.
- **Zapišite odluku tamo gdje se ne može slučajno poništiti**, s brojevima i datumom, i s testom ako možete.

Generator je lako zamijeniti. Suca ne možete pojeftiniti.
