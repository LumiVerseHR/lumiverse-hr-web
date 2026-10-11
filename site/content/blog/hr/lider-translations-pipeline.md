---
title: Jedna redakcija, deset jezika, 1,4 milijuna članaka
description: Kako hrvatsku redakciju svaki dan prevodimo na deset jezika - engleski kao posrednik, trošak po članku i bug koji je udvostručio četvrtinu naših redaka.
date: 2026-09-10
tags: [Build Log, AI Translation]
related: [lider-translations]
image: /images/og/lider-translations.jpg
---

[Lider](https://hr.lider.media) objavljuje hrvatske poslovne vijesti. Zadatak je bilo lako izreći, a nezgodno izgraditi: učiniti *cijelu* redakciju čitljivom na još deset jezika. Ne odabrani uzorak, nego cijelu tiskanu i web arhivu, plus svaku novu priču, svaki dan, svaki jezik na vlastitom pravom news portalu.

Danas je to jedanaest živih WordPress stranica: hrvatski izvornik plus engleski, njemački, francuski, talijanski, španjolski, ruski, turski, kineski, japanski i mađarski. Svaka prevedena stranica ima oko 142.000 članaka, ukupno oko 1,4 milijuna, a dnevni posao održava ih aktualnima.

Evo kako to radi i gdje je pošlo po zlu.

## Ne prevodite hrvatski deset puta

Očito rješenje je deset izravnih prijevoda: hrvatski na njemački, hrvatski na japanski i tako dalje. To je deset neovisnih i skupih putova, a kod manjeg izvornog jezika kvaliteta najviše titra na rjeđim parovima. Dobro prevesti hrvatski na japanski teže je nego dobro prevesti engleski na japanski.

Zato engleski nosi teret u sredini:

1. **Hrvatski → engleski**, jednom, pažljivo.
2. **Engleski → ostalih devet**, iz tog čistog engleskog.

Jedan dobar posrednik umjesto deset krhkih izravnih parova. Bolji rezultat na rijetkim parovima, a svaki članak plaća samo jedan prijevod s hrvatskog.

## Jeftino po dizajnu

Pri ovom volumenu jedinični trošak *jest* arhitektura. Nekoliko odluka nosi većinu toga:

- **Malen, brz model.** GPT-4o-mini radi sve: naslov, podnaslov, HTML teksta, oznake i kategoriju. Naša planska brojka bila je oko $1,50 na tisuću prijevoda članaka, a probni prijevod na njemački izašao je na otprilike četvrtinu centa po članku.
- **Strukturirani izlaz, provjeren.** Svaki odgovor mora odgovarati istoj shemi po kojoj je oblikovana baza. Modeli povremeno vrate pokvaren JSON, pa prije svakog ponovnog pokušaja postoji korak popravka. U jednom probnom prolazu od pet članaka jedan je odgovor trebalo popraviti, a nijedan nije trebao ponovni pokušaj.
- **Popravite samo ono što je krivo.** Kad treba ispraviti samo oznake, prolaz samo za oznake ponovno se izvodi za djelić cijene ponovnog prijevoda članka.
- **Skupna objava.** Gotovi članci idu u WordPress kroz batch API, desetke do stotine u minuti, umjesto jednog zahtjeva po objavi.

Ništa od ovoga samo po sebi nije pametno. Zajedno čini razliku između toga je li „prevoditi redakciju na deset jezika, zauvijek” stavka u budžetu ili proces koji se vrti u pozadini.

## Jedanaest stranica, a ne jedna stranica s prekidačem

Svaki jezik ima vlastitu WordPress instalaciju na vlastitoj poddomeni (`en.lider.media`, `de.lider.media`, …). Za održavanje je to više posla od jezičnog plugina na jednoj stranici, ali donosi dvije stvari:

- **Izolaciju.** Loše ažuriranje plugina ili skok prometa na jednoj stranici nikad ne postaje problem druge.
- **Prave stranice na svakom jeziku.** Renderirane na serveru, s vlastitim sitemapovima i Search Consoleom. Tražilica indeksira japansku stranicu kao japanski news portal, a ne kao widget na klijentskoj strani prikrpan na hrvatski.

Dizajn živi na jednom mjestu: engleska instalacija je glavna tema, koja se gura na ostalih devet, pa se prevedene stranice nikad ne raziđu u deset malo drukčijih dizajna. (Hrvatski izvornik zadržava vlastitu magazinsku temu.) Slike žive jednom, na malom media serveru iza nginxa, umjesto da se uploadaju deset puta.

## Bug koji je udvostručio četvrtinu redaka

Sad dio koji ne ulazi u studiju slučaja.

Prva verzija skripte za prevođenje birala je posao ovakvim upitom:

```sql
SELECT * FROM articles_hr
WHERE article_id NOT IN (
  SELECT article_id FROM articles_en WHERE article_id IS NOT NULL
)
```

„Daj mi svaki hrvatski članak koji još nema engleski redak.” Čita se ispravno.

U produkciji nije izdržao. Naše najbolje objašnjenje: kad su se prolazi preklapali, podupit nije uvijek vidio retke koje je drugi prolaz upravo commitao. Isti članak ponovno je pokupljen, ponovno preveden i ponovno upisan. Jedan je članak imao pet kopija, sve nastale u istoj sekundi.

Dok smo to auditirali, u deset jezičnih tablica bilo je **24.563 duplih redaka**, otprilike četvrtina prevedenih podataka. Svaki višak redak ponovno je prošao kroz model.

Popravak je bio dosadan i ispravan:

- **Provjerite prije nego što platite.** Neposredno prije poziva modela provjerite postoji li baš taj članak već na ciljnom jeziku. Ako postoji, preskočite ga. Provjera košta jedan upit u bazu. Pogreška košta jedan prijevod.
- **Čišćenje prvo na suho.** Skripta za čišćenje koja broji, pokazuje što bi obrisala, zadržava najnoviju kopiju i pokreće se tek nakon što upišete `DELETE` kao potvrdu.
- **Brojite preskočene u sažetku prolaza**, da se regresija pokaže kao broj, a ne kao iznenađenje.

Pouka zapravo nije o `NOT IN`. Radi se o tome da je pipeline imao generator (model) i izdavača (WordPress), a ništa između čiji bi posao bio pitati *„treba li ovaj redak uopće postojati?”*. Kad je to pitanje dobilo vlasnika, problem je ostao riješen.

## Gdje je sada

Dnevni posao čita nove hrvatske priče tog dana, grana ih na svih deset jezika, sinkronizira stranice, čisti predmemoriju i javlja rezultat. Usporen je na stvarni ritam objavljivanja redakcije, pa nikad ne troši tokene na šum.

Ako objavljujete nešto što zaslužuje širu publiku - vijesti, katalog, dokumentaciju - obrazac vrijedi i kod Vas: prevodite preko jednog snažnog jezika, provjerite svaki odgovor, učinite jedinični trošak dosadnim i nekome dajte posao da kaže ne prije nego što dvaput platite istu stvar.

[Pogledajte žive stranice i cijelu studiju slučaja.](/hr/lider-translations)
