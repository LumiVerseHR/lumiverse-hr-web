---
title: Iz hrvatskog je pao sudac, a ne bot
description: Naš AI sudac 12 puta zaredom srušio je točan odgovor. Agent je bio u pravu, a sudac nije razumio hrvatsku negaciju. Evo kako smo testirali onoga tko testira.
date: 2026-09-03
tags: [Agentic Engineering, AI Evaluation]
related: [moj-kolega]
image: /images/og/moj-kolega.jpg
---

[Moj Kolega](/hr/moj-kolega) naš je AI zaposlenik za webshopove. Nalazi se na stranici trgovine, kupcima odgovara na temelju njezina kataloga i uvjeta poslovanja te kaže „ne znam” umjesto da izmišlja.

Upravo je to obećanje cijeli proizvod, pa ga neprestano testiramo. Svaki agent ima svoj skup testnih razgovora, a AI sudac svaki odgovor ocjenjuje kao pass, partial ili fail. Kad sudac kaže fail, popravljamo agenta.

Ovo je priča o tjednu u kojem je sudac rekao fail, a agent je bio u pravu.

## Izmišljotina, popravak i pad koji to nije bio

Sve je počelo stvarnim bugom. Kupac je u jednoj od naših demo trgovina pitao *„mogu li platiti pouzećem?”*. Agent je odgovorio da može.

Trgovina nije nudila plaćanje pouzećem. Alat za uvjete poslovanja netom je vratio dostupne načine plaćanja: kartica, Klarna, PayPal, bankovna uplata. Agent je zanemario rezultat vlastitog alata i odgovorio ono što je zvučalo uslužno.

Umjesto daljnjeg dorađivanja prompta, problem smo riješili determinističkim pravilom. Na tom je slučaju broj točnih odgovora narastao s gotovo nijednog od četiri na otprilike tri od četiri. Zatim smo ponovno pokrenuli eval da to potvrdimo, a on je i dalje javljao pad, i to čak i na odgovorima koji su izgledali savršeno točno:

> *"Plaćanje pouzećem nije dostupno; možete platiti karticama…"*

Sudac je to ocijenio kao FAIL, uz obrazloženje: *"incorrectly states cash-on-delivery is available."* („pogrešno tvrdi da je plaćanje pouzećem dostupno”).

## Prvo reproducirajte, tek onda vjerujte

Jedna neobična presuda može biti i šum, pa smo spremili upravo taj ulaz: pitanje, agentov odgovor, pozive alata i očekivano ponašanje. Zatim smo ga sucu davali na ocjenu iznova i iznova.

**Fail, 12 puta od 12.** Nije bio šum, nego deterministički bug, i to u sucu.

Slijedio je A/B test na istom ulazu:

| Sudac | Presuda o točnom odgovoru |
|---|---|
| gpt-4o-mini, originalni prompt | fail 12/12 |
| gpt-4o-mini + jedna rečenica o negaciji | **pass 12/12** |
| gpt-4o, originalni prompt | pass 12/12 |
| gpt-4.1-mini, originalni prompt | pass 12/12 |

Mali model u ulozi suca hrvatski je tekst samo preletio: uhvatio je „pouzećem … dostupno” i previdio *nije* između. Veći modeli nisu imali problema, a isti je odgovor na engleskom prolazio.

Zadržali smo jeftini model i popravili prompt: dodali smo kratku klauzulu LANGUAGE CARE koja od suca traži da prije ocjenjivanja razriješi hrvatsku negaciju (*ne, nije, nema, bez…*). Trošak je ostao isti, a presuda je sada točna.

## Popravak suca treba testirati u oba smjera

U tome je zamka. Suca je lako „popraviti” tako da postane blaži. Prestane rušiti točan odgovor jer više ne ruši ništa.

Zato je popravak morao proći ne jedan, nego dva testa:

- **Točno odbijanje** („nije dostupno”) → pass **10/10**, a prije je bio fail 12/12.
- **Prava izmišljotina** („plaćanje pouzećem *je* dostupno”, iako ga nema na popisu) → i dalje fail **10/10**.

Popravak je izdržao u oba smjera. Od tada je fail na tom slučaju opet značio stvarnu pogrešku agenta.

## Zatim smo potražili i ostale

Gdje postoji jedna slijepa točka, obično ih ima još. Zato smo složili mali adversarial sweep: **jedanaest slučajeva za koje smo unaprijed znali točnu presudu**, a svaki je ocijenjen šest puta. Obuhvaćali su cijene, količine, negaciju, odgovore na njemačkom i slovenskom, odgovore od više dijelova i pristojna odbijanja.

Sweep je otkrio još dvije. Sve tri imale su isti obrazac: **engleski odgovor je prolazio, a hrvatski nije.**

1. **Previđena negacija.** Ona opisana gore.
2. **Preusmjeravanje na hrvatskom nije prepoznato kao preusmjeravanje.** Kad agent pristojno odbije pitanje izvan teme i vrati razgovor na trgovinu („rado pomažem s proizvodima…”), sudac mu je dao tek partial, šest puta od šest.
3. **Primjeri shvaćeni kao obavezan popis.** Ako je u očekivanom ponašanju pisalo „spomeni npr. A, B ili C”, sudac je tražio sva tri.

Za 2 i 3 popravak je bio sličan: ocjenjuj *značenje*, a ne doslovnu formulaciju ili jezik; popise s „npr.” shvati kao primjere, a izričite zahtjeve i dalje provjeravaj strogo.

Nakon popravka: **11 od 11 točnih presuda.** Jednako je važna bila još jedna provjera. Slučaj koji je namjerno složen da padne, odgovor u kojem nedostaje cijeli obavezni dio, **i dalje je pao 6 od 6.** Ocjenjivanje je postalo točnije, a ne popustljivije.

I jedna napomena o metodi, jer nas je koštala vremena: slijepe točke mogli smo reproducirati samo na *stvarnim* spremljenim ulazima. Ručno napisani testni primjeri koji su izgledali isto prolazili su bez problema. Ako se Vaš sudac u produkciji ponaša čudno, spremite točan ulaz i pokrenite ga ponovno. Nemojte ga parafrazirati.

## Što nam je pokazao pouzdan sudac

S popravljenim sucem ocijenili smo agente u produkciji: onaj na mojkolega.hr dobio je 9 od 12, a onaj na ovoj stranici 8 od 12. Rezultati su otkrili dva stvarna problema, upravo onakva kakve eval i treba pronaći:

- **Rupa u jezicima.** Posjetitelji koji su pisali na španjolskom i japanskom dobivali su odgovore na hrvatskom, a talijanski je pogrešno prepoznat kao slovenski. Detektor jezika poznavao je samo pet jezika. Novi, s više jezika, već je napisan i uskoro ide u produkciju.
- **Pristran skup testova.** Nekoliko demo trgovina dobilo je loše ocjene, no kad smo pogledali bolje, pokazalo se da su testovi pisani za katalog elektronike: slušalice, adaptere. Trgovina tekstilom ili ljekarna „padala” je zato što je pošteno rekla da nema skateboarde. Agent je opet bio u pravu. Ovaj put pogriješio je test.

## Obrazac

Pogledajte lanac provjera iz tog tjedna:

- **Alat** koji je vratio načine plaćanja.
- **Pravilo** koje agentu ne dopušta da proturječi vlastitim alatima.
- **Sudac** koji provjerava agenta.
- **Sweep** s unaprijed poznatim odgovorima, koji provjerava suca.
- **Testovi u oba smjera** koji provjeravaju popravak suca.
- **Scorecard** koji je provjerio skup testova i u njemu ulovio pogrešku.

Svaki provjeravač i sam je trebao provjeru i svaki je barem jednom pogriješio. To ne znači da pristup ne valja. To *jest* pristup. Provjeravač kojeg nikad ne provjerite samo je još jedan model kojem vjerujete na riječ.

Ako pokrećete LLM evale na bilo kojem jeziku osim engleskog, ovo slobodno preuzmite: **uzmite slučajeve koje je sudac srušio, ponovite ih doslovno i promijenite jezik.** Ako engleska verzija prolazi, a Vaša ne, problem nije u Vašem agentu.
