---
title: Jedna redakcija, deset jezika, 1,4 milijuna članaka
description: Kako članke hrvatske redakcije svaki dan prevodimo na deset jezika - engleski kao posrednik, trošak po članku i bug koji je udvostručio četvrtinu redaka.
date: 2026-09-10
tags: [Build Log, AI Translation]
related: [lider-translations]
image: /images/og/lider-translations.jpg
---

[Lider](https://hr.lider.media) objavljuje hrvatske poslovne vijesti. Zadatak je bilo lako izreći, a nezgodno izvesti: *cijelu* redakciju učiniti čitljivom na još deset jezika. Ne pomno odabran uzorak, nego cijelu tiskanu i web arhivu, uz svaki novi članak, svaki dan, i to svaki jezik na vlastitom, pravom news portalu.

Danas je to jedanaest aktivnih WordPress stranica: hrvatski izvornik te stranice na engleskom, njemačkom, francuskom, talijanskom, španjolskom, ruskom, turskom, kineskom, japanskom i mađarskom. Svaka prevedena stranica ima oko 142.000 članaka, ukupno oko 1,4 milijuna, a dnevni zadatak brine se da budu ažurne.

Evo kako sustav radi i što je pošlo po zlu.

## Ne prevodite hrvatski deset puta

Prvo što pada na pamet jest deset izravnih prijevoda: s hrvatskog na njemački, s hrvatskog na japanski i tako dalje. To je deset neovisnih i skupih putova, a kad je izvorni jezik malen, kvaliteta najviše oscilira upravo kod rjeđih jezičnih parova. Kvalitetan prijevod s hrvatskog na japanski teže je postići nego s engleskog na japanski.

Zato glavni posao u sredini obavlja engleski:

1. **Hrvatski → engleski**, jednom, pažljivo.
2. **Engleski → ostalih devet**, polazeći od tog čistog engleskog teksta.

Jedan dobar posrednički jezik umjesto deset krhkih izravnih parova. Rjeđi parovi daju bolje rezultate, a za svaki se članak s hrvatskog plaća samo jedan prijevod.

## Niska cijena kao dio arhitekture

Pri ovolikom obujmu jedinični trošak *jest* arhitektura. Većinu toga određuje nekoliko odluka:

- **Mali, brzi model.** GPT-4o-mini radi sve: naslov, podnaslov, HTML teksta, oznake i kategoriju. U planu smo računali s oko $1,50 na tisuću prevedenih članaka, a probni prijevod na njemački stajao je otprilike četvrtinu centa po članku.
- **Strukturirani izlaz uz provjeru.** Svaki odgovor mora odgovarati shemi prema kojoj je oblikovana i baza. Modeli povremeno vrate pokvaren JSON, pa ga sustav prije svakog ponovnog pokušaja najprije pokuša popraviti. U jednom probnom prolazu s pet članaka jedan je odgovor trebalo popraviti, a ponovni pokušaj nije trebao nijedan.
- **Popravljajte samo ono što ne valja.** Kad treba ispraviti samo oznake, ponovno se pokreće prolaz samo za oznake, koji košta djelić cijene novog prijevoda cijelog članka.
- **Skupno objavljivanje.** Gotovi članci odlaze u WordPress preko batch API-ja, od nekoliko desetaka do nekoliko stotina u minuti, umjesto da svaki članak traži zaseban zahtjev.

Ništa od ovoga samo za sebe nije osobito pametno. No zajedno odlučuje hoće li „trajno prevoditi redakciju na deset jezika” biti stavka u budžetu ili proces koji se tiho vrti u pozadini.

## Jedanaest stranica umjesto jedne s prekidačem jezika

Svaki jezik ima zasebnu WordPress instalaciju na vlastitoj poddomeni (`en.lider.media`, `de.lider.media`, …). To traži više održavanja nego jezični plugin na jednoj stranici, ali donosi dvije prednosti:

- **Izolaciju.** Loše ažuriranje plugina ili skok prometa na jednoj stranici nikad ne postaje problem druge.
- **Prave stranice na svakom jeziku.** Renderiraju se na serveru i imaju vlastite sitemapove i Search Console. Tražilica japansku stranicu indeksira kao japanski news portal, a ne kao widget na strani klijenta nakalemljen na hrvatski portal.

Dizajn se održava na jednom mjestu: engleska instalacija nosi glavnu temu, koja se zatim prenosi na ostalih devet, pa se prevedene stranice nikad ne razilaze u deset malo drukčijih dizajna. (Hrvatski izvornik zadržava vlastitu magazinsku temu.) I slike postoje samo jednom, na malom media serveru iza nginxa, umjesto da ih uploadamo deset puta.

## Bug koji je udvostručio četvrtinu redaka

A sada dio koji nije ušao u studiju slučaja.

Prva verzija skripte za prevođenje birala je članke za obradu ovakvim upitom:

```sql
SELECT * FROM articles_hr
WHERE article_id NOT IN (
  SELECT article_id FROM articles_en WHERE article_id IS NOT NULL
)
```

„Daj mi svaki hrvatski članak koji još nema engleski redak.” Na papiru izgleda ispravno.

U produkciji nije izdržao. Najvjerojatnije objašnjenje: kad su se prolazi preklapali, podupit nije uvijek vidio retke koje je drugi prolaz upravo commitao. Isti je članak tako ponovno preuzet, ponovno preveden i ponovno upisan. Jedan je članak imao pet kopija, sve nastale u istoj sekundi.

Kad smo napravili reviziju, u deset jezičnih tablica našli smo **24.563 duplicirana retka**, otprilike četvrtinu prevedenih podataka. Svaki je suvišan redak još jednom prošao kroz model.

Popravak je bio dosadan, ali ispravan:

- **Provjerite prije nego što platite.** Neposredno prije poziva modela provjerite postoji li baš taj članak već na ciljnom jeziku. Ako postoji, preskočite ga. Provjera stoji jedan upit u bazu, a pogreška jedan prijevod.
- **Prvo proba, onda čišćenje.** Skripta za čišćenje prebroji duplikate, pokaže što bi obrisala, zadrži najnoviju kopiju i pokrene se tek kad za potvrdu upišete `DELETE`.
- **Broj preskočenih upišite u sažetak prolaza**, kako bi se regresija pokazala kao broj, a ne kao iznenađenje.

Pouka se zapravo ne odnosi na `NOT IN`. Pipeline je imao generator (model) i izdavača (WordPress), ali između njih nije bilo ničega čiji bi posao bio pitati *„treba li ovaj redak uopće postojati?”*. Otkad je za to pitanje netko zadužen, problem se nije vratio.

## Gdje smo danas

Dnevni zadatak preuzima nove hrvatske članke tog dana, šalje ih na prijevod na svih deset jezika, sinkronizira stranice, čisti cache i šalje izvještaj. Tempo mu je prilagođen stvarnom ritmu objavljivanja u redakciji, pa nikad ne troši tokene u prazno.

Ako objavljujete nešto što zaslužuje širu publiku - vijesti, katalog, dokumentaciju - isti pristup vrijedi i za Vas: prevodite preko jednog snažnog jezika, provjeravajte svaki odgovor, svedite jedinični trošak na dosadnu brojku i zadužite nekoga da kaže „ne” prije nego što dvaput platite istu stvar.

[Pogledajte stranice uživo i cijelu studiju slučaja.](/hr/lider-translations)
