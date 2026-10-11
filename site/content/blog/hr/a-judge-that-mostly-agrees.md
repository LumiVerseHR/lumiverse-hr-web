---
title: Sudac koji se uglavnom slaže nije sudac
description: Isprobali smo mali model kao suca za provjeru činjenica na MOJ KRAJ. Bio je brži, ali bi objavio 15 od 20 članaka koje je pravi sudac zadržao.
date: 2026-09-17
tags: [Build Log, AI Evaluation]
related: [mojkraj]
image: /images/og/mojkraj.jpg
---

[MOJ KRAJ.](/hr/mojkraj) hrvatski je informativni portal čije članke piše AI pod nadzorom ljudskih urednika. Prije objave svaki članak mora proći niz automatskih provjera. Najvažnija je utemeljenost (grounding): nalazi li se svaka tvrdnja iz članka doista u izvoru na koji se poziva?

Ta je provjera skupa. Vrti se na 35B open-weight modelu na našem vlastitom GPU-u i traje od 88 do 530 sekundi po članku. Na istom je stroju, odmah pokraj, stajao 4B model: besposlen, s osam paralelnih slotova, a isti poziv odrađuje za otprilike 11 sekundi.

Najočitije bi bilo posao suca prepustiti malom modelu. Prije toga smo mjerili. Odgovor je bio ne, a o tome zašto govori cijeli ovaj tekst.

## Što sudac zapravo radi

Ovdje treba biti precizan, jer „provjera činjenica” zvuči kao da uključuje pretraživanje weba. Ne uključuje.

1. Navedeni izvor se dohvati i svede na čisti tekst: običan HTTP zahtjev i ekstrakcija, sve za manje od sekunde.
2. **Jedan** poziv modelu izvuče iz članka do deset tvrdnji i o svakoj presudi prema tekstu izvora.
3. Uz to se izvode determinističke provjere: brojevi u članku moraju odgovarati onima u izvoru i slično.

Skup je samo korak 2 i jedino on traži prosudbu.

## Mjerite ono o čemu presuda odlučuje, a ne koliko brzo stiže

Kao benchmark nameću se brzina ili prosječno slaganje. I jedno i drugo reklo bi da.

Mi smo mjerili nešto drugo: **koliko često zamjena suca promijeni odluku o tome hoće li članak biti objavljen?** Produkcijsko ocjenjivanje pustili smo s provjerom preusmjerenom na 4B, na 40 članaka koje je 35B već ocijenio, i rezultate usporedili sa spremljenim presudama 35B modela.

| Članci | Promjena ocjene (medijan) | Prešli granicu |
|---|---|---|
| 20 kojima je 35B dao 71 ili više | +0 | 4 od 20 |
| 20 koje je 35B **zadržao** (65–68) | **+24** | **15 od 20** |

U lakim se slučajevima 4B uglavnom slaže, pa bi dashboard s prosječnim slaganjem izgledao sasvim u redu.

Ondje gdje presuda doista nešto odlučuje, objavio bi petnaest od dvadeset članaka koje je 35B zadržao. Neki su skočili sa 66 na 100.

## Ne odstupa. Klizi prema 100.

Pogledajte kako je mali model griješio. Nije pratio 35B uz manja odstupanja. **Devet od njegovih prvih dvadeset ocjena bilo je točno 100.**

Problem nije bio ni u kvaliteti ekstrakcije. 4B je svaki put izvukao uredno oblikovane tvrdnje sa stvarnim citatima iz izvora. Ono što nije znao jest presuditi protiv članka. Kad bi dobio nacrt i izvor, naginjao je odgovoru „da, to je potkrijepljeno”.

Bilješka uz kod sažela je to u jednu rečenicu:

> A judge that mostly agrees is not a cheap judge, it is not a judge.

Verifikator dokazuje svoju vrijednost na graničnim slučajevima, upravo onima koje bi trebao zaustaviti. Verifikator koji propušta gotovo sve samo je sporiji način da se objavi sve.

## Gdje mali model ipak pobjeđuje

Ista je analiza, samo jednu funkciju dalje, dala suprotan odgovor. Svaki članak na MOJ KRAJ. dobiva *kicker*, nadnaslov od jedne do tri riječi. To je mehanički posao, a obavljao ga je veliki model sa zadano uključenim reasoningom. Nitko to nije ni tražio.

| Postavka (isti prompt, 3 objavljena članka) | Vrijeme | Rezultat |
|---|---|---|
| 35B, reasoning uključen | 57–103 s | **prazno u 2 od 3** |
| 35B, reasoning isključen | 0,9–54 s | točno |
| 4B, reasoning isključen | 0,3–0,6 s | isti odgovori |

Kicker je zato preseljen na mali model, a budžet tokena smanjen s 2.048 na 256. Ako mali model nije konfiguriran, poziv ide velikome, pa je u najgorem slučaju sve kao prije.

Isti GPU, ista analiza, dva suprotna odgovora. Razlika je samo u tome traži li zadatak prosudbu.

## Test koji pada na dobroj ideji

Prebaciti suca na mali model sasvim je prirodna ideja i netko će je za šest mjeseci opet predložiti, možda i mi sami, kad ovo zaboravimo.

Zato postoji test. Čita izvorni kod provjera utemeljenosti i pristranosti i **pada ako ijedna od njih ikad zatraži mali model.** Ne testira ponašanje, nego zaključava odluku koja je donesena tek nakon mjerenja. Da bi se ona poništila, potrebno je novo mjerenje, a ne brzi refactor.

Samo mjerenje zapisano je kao komentar uz poziv, s datumom, metodom i brojevima. Tko god dođe sljedeći, može ga ponoviti umjesto da sve izvodi ispočetka.

## Kad se promijeni model, mjerite ponovno

Još jedan detalj pokazuje isto iz drugog kuta.

Upravo reasoning poskupljuje poziv za utemeljenost, pa smo ga nekoliko dana ranije pokušali isključiti. Šest objavljenih članaka ponovno smo ocijenili bez njega. Medijan ocjene pomaknuo se za 52 boda, a pet od šest članaka prešlo je granicu: oni koji su imali 100 sada su dobili 32, 13 i 63. Reasoning je ostao uključen.

Zatim je na serveru kratko radio noviji 27B model i isti je test dao obrnut rezultat. S reasoningom ili bez njega, razlika medijana bila je 0 i nijedan članak nije prešao na drugu stranu granice. Reasoning je samo sve usporio, 3 do 20 puta.

Ista provjera, ista metoda, dva modela, suprotni odgovori. Zato u kodu ne piše „reasoning uključen”, nego: *ovo je izmjerena postavka za ovaj model; ponovi test kad se model promijeni.* A pri ponovnom mjerenju uvijek se broje prelasci granice, nikad brzina.

## Što vrijedi i drugdje

Ako imate bilo kakav AI sustav s automatskom provjerom u petlji, ovo slobodno preuzmite:

- **Verifikator ocjenjujte po odlukama koje promijeni, a ne po prosječnom slaganju.** Prosječno slaganje diktiraju laki slučajevi. Sav je posao u graničnima.
- **Pazite na klizanje prema „da”.** Sudac koji svemu daje visoke ocjene djeluje kooperativno, a zapravo tiho zakazuje.
- **Jeftinim modelima prepustite mehanički posao, ne presude.** U prvome su izvrsni, u drugome opasni.
- **Zapišite odluku tamo gdje se ne može slučajno poništiti**, s brojevima i datumom, a po mogućnosti i s testom.

Generator se lako mijenja. Na sucu ne možete štedjeti.
