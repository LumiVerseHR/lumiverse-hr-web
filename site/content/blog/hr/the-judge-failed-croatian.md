---
title: Hrvatski je pao sudac, a ne bot
description: Naš eval sudac 12 puta zaredom srušio je točan odgovor. Agent je bio u pravu; sudac nije znao pročitati hrvatsku negaciju. Kako smo testirali onoga tko testira.
date: 2026-09-03
tags: [Agentic Engineering, AI Evaluation]
related: [moj-kolega]
image: /images/og/moj-kolega.jpg
---

[Moj Kolega](/hr/moj-kolega) naš je AI zaposlenik za webshopove. Stoji na stranici trgovine, odgovara kupcima iz kataloga i pravila same trgovine i kaže „ne znam” umjesto da izmišlja.

To posljednje obećanje cijeli je proizvod, pa ga neprestano testiramo. Svaki agent ima paket testnih razgovora, a AI sudac svaki odgovor ocjenjuje kao pass, partial ili fail. Kad sudac kaže fail, idemo popraviti agenta.

Ovo je priča o tjednu u kojem je sudac rekao fail, a agent je bio u pravu.

## Izmišljotina, pa popravak, pa pad koji to nije bio

Počelo je stvarnim bugom. Kupac je u jednoj od naših demo trgovina pitao *„mogu li platiti pouzećem?”*. Agent je rekao da.

Trgovina nije nudila plaćanje pouzećem. Alat za pravila upravo je vratio načine plaćanja: kartica, Klarna, PayPal, bankovna uplata. Agent je zanemario rezultat vlastitog alata i dao odgovor koji je zvučao uslužno.

Popravili smo to determinističkim pravilom umjesto dodatnim promptanjem. Točni odgovori na tom slučaju porasli su s otprilike nijednog od četiri na otprilike tri od četiri. Zatim smo ponovno pokrenuli eval da to potvrdimo, a on je i dalje padao, uključujući i odgovore koji su izgledali savršeno točno:

> *"Plaćanje pouzećem nije dostupno; možete platiti karticama…"*

Sudac je to ocijenio s FAIL, uz obrazloženje: *"incorrectly states cash-on-delivery is available."* („pogrešno tvrdi da je plaćanje pouzećem dostupno”).

## Prvo reproducirajte, pa onda vjerujte

Jedna čudna presuda mogla je biti šum, pa smo zabilježili točno taj ulaz: pitanje, agentov odgovor, njegove pozive alata i očekivano ponašanje. Zatim smo ga dali sucu na ponovno ocjenjivanje, iznova i iznova.

**Fail, 12 puta od 12.** Nije šum. Deterministički bug, i to u sucu.

Zatim A/B test na istom ulazu:

| Sudac | Presuda o točnom odgovoru |
|---|---|
| gpt-4o-mini, originalni prompt | fail 12/12 |
| gpt-4o-mini + jedna rečenica o negaciji | **pass 12/12** |
| gpt-4o, originalni prompt | pass 12/12 |
| gpt-4.1-mini, originalni prompt | pass 12/12 |

Mali model u ulozi suca letimično je čitao hrvatski, hvatao „pouzećem … dostupno” i propuštao *nije* između. Veći modeli čitali su to bez problema, a isti je odgovor na engleskom prolazio.

Zadržali smo jeftini model i popravili prompt: kratka klauzula LANGUAGE CARE koja sucu nalaže da razriješi hrvatsku negaciju (*ne, nije, nema, bez…*) prije ocjenjivanja. Isti trošak, točna presuda.

## Popravak suca treba testirati u oba smjera

Evo zamke. Suca je lako „popraviti” tako da postane blaži. Prestane rušiti točan odgovor jer je prestao rušiti bilo što.

Zato je popravak morao proći dva testa, ne jedan:

- **Točno odbijanje** („nije dostupno”) → pass **10/10**, gdje je prije bilo fail 12/12.
- **Prava izmišljotina** („plaćanje pouzećem *je* dostupno”, iako nije na popisu) → i dalje fail **10/10**.

Oba smjera su izdržala. Od tada je fail na tom slučaju opet značio stvarnu pogrešku agenta.

## Onda smo krenuli tražiti ostale

Jedna slijepa točka obično znači da ih ima još. Zato smo složili mali adversarial sweep: **jedanaest slučajeva za koje smo unaprijed znali točnu presudu**, svaki ocijenjen šest puta. Pokrivali su cijene, količine, negaciju, odgovore na njemačkom i slovenskom, odgovore iz više dijelova i pristojna odbijanja.

Pronašao je još dvije. Sve tri imale su isti oblik: **engleski odgovor je prolazio, hrvatski nije.**

1. **Ispuštena negacija.** Ona opisana gore.
2. **Hrvatsko preusmjeravanje nije prepoznato kao preusmjeravanje.** Kad agent pristojno odbije pitanje izvan teme i vrati razgovor na trgovinu („rado pomažem s proizvodima…”), sudac je to ocijenio samo kao partial, šest puta od šest.
3. **Primjeri čitani kao checklista.** Ako je u očekivanom ponašanju pisalo „spomeni npr. A, B ili C”, sudac je tražio sva tri.

Popravak za 2 i 3 bio je iste vrste: ocjenjuj *značenje*, a ne površinsku formulaciju ili jezik, i liste s „npr.” tretiraj kao primjere, dok eksplicitni zahtjevi ostaju strogi.

Nakon popravka: **11 od 11 točnih presuda.** Jednako je važna bila još jedna provjera. Slučaj napravljen da padne, odgovor kojem nedostaje cijeli obavezni dio, **i dalje je pao 6 od 6.** Ocjenjivanje je postalo točnije, a ne velikodušnije.

Jedna napomena o metodi, jer nas je stajala vremena: slijepe točke reproducirale su se samo na *stvarnim* zabilježenim ulazima. Ručno napisani testni stringovi koji su izgledali jednako prolazili su. Ako Vam se sudac ponaša čudno u produkciji, zabilježite točan ulaz i ponovite ga. Nemojte ga parafrazirati.

## Što nam je pokazao sudac kojem se može vjerovati

S popravljenim sucem ocijenili smo agente u produkciji: onaj na mojkolega.hr dobio je 9 od 12, a onaj na ovoj stranici 8 od 12. Rezultati su upozorili na dva stvarna problema, i oba su bila upravo ono što eval postoji da pronađe:

- **Jezična rupa.** Posjetiteljima na španjolskom i japanskom odgovaralo se na hrvatskom, a talijanski je bio pogrešno prepoznat kao slovenski. Detektor jezika poznavao je samo pet jezika. Širi je napisan i na putu je u produkciju.
- **Pristran testni paket.** Nekoliko demo trgovina dobilo je loše ocjene, ali pokazalo se da je paket pisan za katalog elektronike: slušalice, adaptere. Trgovina tekstilom ili ljekarna „padala” je zato što pošteno nije imala skateboarde. Agent je opet bio u pravu. Ovaj put pogrešan je bio test.

## Obrazac

Pogledajte lanac iz tog tjedna:

- **Alat** koji je vratio načine plaćanja.
- **Pravilo** koje agentu ne da proturječiti vlastitim alatima.
- **Sudac** koji provjerava agenta.
- **Sweep** s poznatim odgovorima koji provjerava suca.
- **Testovi u oba smjera** koji provjeravaju popravak suca.
- **Scorecard** koji je provjerio testni paket i uhvatio ga.

Svaki provjeravatelj trebao je vlastitu provjeru i svaki je barem jednom pogriješio. To nije neuspjeh pristupa. To *jest* pristup. Verifikator koji nikad ne provjerite samo je još jedan model kojem vjerujete.

Ako vodite LLM evale na bilo kojem jeziku osim engleskog, ovo je ono što vrijedi ukrasti: **uzmite sučeve padove, ponovite ih točno i zamijenite jezik.** Ako engleska verzija prolazi, a Vaša ne, problem nije u Vašem agentu.
