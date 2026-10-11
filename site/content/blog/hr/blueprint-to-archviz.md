---
title: Od nacrta do arhitektonskih rendera u Blenderu bez ekrana
description: "Jedan nacrt, jedan brief i dan u kojem Claude piše Blender skripte: sedam rendera 2400×1600 i web model kroz koji se šeće. Što je trebalo i što je puklo."
date: 2026-10-11
tags: [Build Log, Agentic Engineering]
related: []
image: /og/blueprint-to-archviz.jpg
---

![Render u zlatnom satu: bijela dvokatnica sa zabatom, tamnim limenim krovom na falc, crnim okvirima prozora, hrastovim dvokrilnim vratima, brezama i popločanom stazom preko travnjaka](/blog/blueprint-to-archviz/cover.webp)
*Glavni kadar. Svaki mesh, materijal i biljku u njemu Claude je napisao kao Python, a Blender ih je renderirao bez priključenog ekrana.*

Claudeu smo dali nacrt male dvokatnice (pročelje i dva tlocrta) i kratak brief: opremi prostorije, dodaj detalje i okoliš, istraži kako se radi arhitektonska fotografija i napravi slike dovoljno dobre za arhitektonski časopis. Sve dokumentiraj.

Otprilike sedam sati kasnije isporučio je:

- sedam završnih rendera u 2400×1600: zlatni sat, plavi sat, pročelje, blagovaonicu, spavaću sobu i dva presjeka,
- scenu od oko 450 objekata, 23 rasvjetna tijela, otprilike 640.000 vlati trave i tri simulacije tkanine,
- interaktivni web model koji možete okretati, proletjeti kroz njega i rezati kat po kat,
- i radni dnevnik svake odluke i svake greške, iz kojeg je nastao ovaj tekst.

Nitko nije otvorio Blender. Claude nije imao viewport; svoj rad vidio je samo tako da renderira kadar i pročita sliku.

## Ukratko o postavu

MCP poslužitelju koji naš studio već koristi za modele slike i videa dodali smo tri Blender alata. Claude napiše Python skriptu i pošalje je kao posao. Svježi Blender 4.2 proces izvrši je bez ekrana, samo na CPU-u, i vrati rendere, log i datoteke koje je skripta spremila. Kasniji posao može otvoriti scenu koju je spremio raniji, pa se rad gradi korak po korak.

Nije bilo dodataka ni preuzetih 3D modela. Ono malo ravnih slika u sceni, tri umjetnine i izrezi drveća, napravili su modeli slike istog poslužitelja, sve skupa za manje od minute.

## Od volumena do kadra za časopis

![Lijevo: rani volumenski model kuće na sivom travnjaku, s debelim bijelim okvirima i kamerom nagnutom prema dolje. Desno: završni render u zlatnom satu s tankim crnim okvirima, uređenim vrtom, drvećem i ravnom kamerom](/blog/blueprint-to-archviz/massing-to-final.webp)
*Lijevo, prvi prolaz: zidovi, krov i otvori prema nacrtu, u tri pokretanja od 7 do 39 s. Desno, završni render.*

Prva verzija trajala je minutama i tako je i izgledala: prazna ljuska, ravne boje, sivi pod i kamera nagnuta prema dolje, pa se svaka okomica naginjala. Prije ikakvih izmjena Claude je istražio kako se takve slike rade i zapisao umjetnički smjer.

- **Materijali:** toplo bijela žbuka, tamni čelični krov na falc i tanki crni aluminijski okviri, česta kombinacija kod suvremenih kuća sa zabatom.
- **Interijer:** bijeli zidovi, svijetli hrast i tamno hrastovo stubište, po uzoru na Villu S+E Todda Saundersa kraj Bergena, čiji tlocrt ima isti oblik kao onaj s nacrta.
- **Kamera:** ravna, u visini očiju, kadrirana pomakom objektiva umjesto naginjanja, pa okomice ostaju okomite kao u arhitektonskoj fotografiji.
- **Svjetlo:** nisko sunce zlatnog sata za glavni kadar i kadar u plavom satu, gdje topli interijer svijetli nasuprot hladnom pročelju.

Zatim je kuću izgradio iznova, tako da se može opremiti: prava debljina zidova, dva kata, gornja etaža pod kosim stropom, ravno lebdeće hrastovo stubište i prozorski okviri široki 60 mm. Primijetio je i da nacrt griješi. Nacrtano stubište u obliku slova L ne stane u tu visinu etaže; trebalo bi mu oko 4,2 m duljine. Zato je postalo ravni krak uz stražnji zid, i to piše u dnevniku.

## Tamne sobe iza pravog stakla

![Lijevo: rani render dnevnog boravka, taman i mutan sa svijetlim točkicama na podu. Desno: završni render blagovaonice i kuhinje, svijetao, sa suncem na hrastovom podu, crnim visilicama i brezom u velikom prozoru](/blog/blueprint-to-archviz/interior-light.webp)
*Lijevo, prvi test interijera. Desno, završni kadar blagovaonice.*

Prvi interijer izašao je taman i pun točkica. Uzrok je klasičan za path tracing. Sunčeva svjetlost koja prolazi kroz staklo koje lomi svjetlo kaustični je put s kojim se renderer loše nosi, pa su sobe bile osvijetljene gotovo samo šumovitim odbijenim svjetlom.

Rješenje je standardan trik arhitektonske vizualizacije. Za kameru staklo ostaje reflektirajuće, ali zrake sjena i odbijanja vide ga kao potpuno prozirno. Sunce i dnevno svjetlo tada ulaze ravno unutra. Dobar kut za interijer trebao je četiri pokušaja; prva tri izgledala su kao hodnik ili su pokazivala uglavnom kauč.

## Posteljina koja više ne izgleda kao spužva

![Lijevo: rani render spavaće sobe na kojem jastuci izgledaju kao valjci, a poplun kao drugi madrac. Desno: završna spavaća soba s mekanom posteljinom, mekim jastucima i prozirnim zavjesama koje svijetle na prozoru](/blog/blueprint-to-archviz/bedroom-cloth.webp)
*Lijevo, spavaća soba prije prolaza za realizam. Desno, završni render sa simuliranom tkaninom i prozirnim zavjesama.*

Claudeova vlastita kritika prve spavaće sobe bila je izravna: jastuci izgledaju kao valjci, a poplun kao drugi madrac. Modelirane kutije ne izgledaju kao tkanina, pa ih je simulirao. Jastuci se napušu tlakom, zatim se poplun i pokrivač spuste na krevet i slegnu. Sve tri simulacije izvršile su se u jednom poslu za 8,7 sekundi, bez viewporta. U istom prolazu dodane su nabrane prozirne zavjese koje svijetle na svjetlu. U dnevniku Claude to naziva najvećim pojedinačnim skokom realizma u projektu.

## Plavi sat i svjetiljke koje su se vidjele kao kugle

![Lijevo: rani test plavog sata s crnim horizontom i svjetlećom bijelom kuglom u prozoru na katu. Desno: završni render plavog sata s toplo osvijetljenim prozorima, osvijetljenim ulazom, drvećem i nebom u sumrak](/blog/blueprint-to-archviz/blue-hour.webp)
*Lijevo, prvi test plavog sata. Desno, završni render, koji je Claude ocijenio najjačom slikom serije.*

Kadar u plavom satu radio je od prvog testa: topli prozori nasuprot hladnom pročelju klasična su slika iz časopisa. Ali jedno stropno svjetlo pojavilo se kao svjetleća kugla u prozoru na katu. Svjetla su u Blenderu po defaultu vidljiva kameri.

Sakriti ih od kamere nije bilo dovoljno. Kugla se vratila *kroz* staklo, jer gornji trik sa staklom šalje zrake transmisije, a svjetla se odazivaju i njima. Svako od 23 rasvjetna tijela sada je skriveno od kamere, transmisije i refleksije, a sjenila i dalje svijetle. Crni horizont dobio je kartice šume, a tamna vrata dva reflektora ispod nadstrešnice.

## Presjeci i model kroz koji se šeće

![Dva aksonometrijska presjeka kuće odozgo: gornji kat prerezan na 5,3 m s dvije spavaće sobe i prizemlje prerezano na 2,5 m s kuhinjom, blagovaonicom, dnevnim boravkom i stubištem](/blog/blueprint-to-archviz/cutaways.webp)
*Dva presjeka, prerezana na 5,3 m i na 2,5 m.*

Presjeci režu sve na odabranoj visini jednim velikim booleanom i gledaju odozgo ortografskom kamerom. Do njih je trebalo proći kroz dva rušenja Blendera. Jedno je izazvalo dvostruko učitavanje scene u istoj skripti, drugo dodavanje modifikatora dok se prolazi kroz tu istu kolekciju. Treći problem prikazao je prvo rušenje kao neko drugo: ispis koji nije bio flushan izgubio se u rušenju.

![Interaktivni web preglednik koji prikazuje kuću u browseru, s panelom gotovih pogleda, rasvjetom zlatnog i plavog sata, kliznikom za presjek i uključivanjem slojeva](/blog/blueprint-to-archviz/viewer.webp)
*Web preglednik: devet gotovih pogleda, dva ugođaja rasvjete i klizač za presjek. Napravljen iz iste scene.*

Posljednji korak izvezao je scenu za browser: 195.000 trokuta u datoteci od 6,3 MB. Preglednik u three.jsu na jednoj stranici nudi okretanje i let, devet pogleda preuzetih iz Blenderovih kamera, rasvjetu zlatnog i plavog sata i klizač koji reže kuću kat po kat. Ono što format izvoza nije mogao prenijeti napravljeno je iznova u browseru: tekstura travnjaka, oko 2.400 busena trave i drveće koje je uvijek okrenuto prema gledatelju.

## Bug od kojeg je izrastao travnjak od 4 metra

Najčudnija greška bila je vani. Nakon što je dodan travnjak, test u zlatnom satu vratio se kao crne okomite pruge, a renderi su se jako usporili. Skripta za provjeru ispisala je duljinu trave: 4 metra, na svakom sustavu.

Blenderove postavke čestica imaju dvije vrijednosti koje obje upravljaju duljinom dlake, a postavljanje druge tiho je poništilo prvu. Travnjak je imao oko 2 milijuna vlati, svaku visoku 4 m, a kamera je bila zakopana u njemu. Postavljanje vrijednosti pravim redom to je popravilo, i isti kadar pao je s 93 sekunde crnila na 19 sekundi pravog rendera. Divovski travnjak vjerojatno je izazvao i 40-minutni ispad poslužitelja koji je prekinuo dan. To je vjerojatno, ali nismo dokazali.

## Drveće iz modela slike, izrezano ručno

![Izlazi modela slike na ravnoj magenta pozadini: breza, hrast i dugačka traka ruba šume](/blog/blueprint-to-archviz/tree-cards.webp)
*Drveće generirano na ravnoj magenta pozadini, spremno za izrezivanje u Blenderu.*

Drveće su ravne kartice sa slikom, pa im je trebala prozirna pozadina. Model slike umjesto toga vratio je JPG s ljubičastim rubom. Alat za uklanjanje pozadine napravio je čisti PNG, ali na krivom stroju, do kojeg poslužitelj za render nije mogao doći.

Zato je Claude zatražio svako stablo na čistoj magenti i izrezao ga u Blenderu s nekoliko redaka NumPyja, kao zeleni ekran. Breza, hrast i duga traka šume izašli su čisto.

## Što smo naučili

- **Gledanje je petlja.** Gotovo svako poboljšanje počelo je Claudeovom kritikom vlastitog rendera. Hrastov pod izgledao je breskvasto; zagrijavajuća drvena kugla izgledala je „više kao zebra nego drvo”; interijer je izgledao kao hodnik. Bez viewporta renderirani kadar jedina je povratna informacija, pa se isplati često renderirati male preglede. Naši su trajali 10–13 sekundi po kadru.
- **Razmislite prije rendera.** Neki bugovi nikad nisu došli do rendera. Prolazak kroz rotacije uhvatio je fotelje okrenute od sobe i sliku koja lebdi 15 cm od zida.
- **Provjerite, ne pogađajte.** Blenderov Python API mijenja se među verzijama. Kad naziv postavke nije prošao, jedna skripta za provjeru ispisala je valjane nazive umjesto da pada pogodak po pogodak.
- **Vodite dnevnik.** Svaka iteracija je zapisana: cilj, izmjena, rezultat, kritika, sljedeći korak. Taj dnevnik omogućio je ovaj tekst i bilježi mane koje su još tu.

A mane postoje:

- Travnjak kroz prozor blagovaonice izgleda izbijeljeno pri tako niskom suncu.
- Uzglavlje u spavaćoj sobi ima prugastu teksturu s jedne strane.
- Živica iza kuće izgleda tamno u malim veličinama.
- Nebo je obično fizikalno nebo, jer je posao za fotografsku pozadinu s oblacima zapeo u redu čekanja.

Profesionalni vizualizator uhvatio bi sve četiri. Ali jedan radni dan skriptiranih iteracija odveo je jedan nacrt do serije slika i modela kroz koji se šeće, na koje klijent može reagirati, a da nitko nije dotaknuo 3D alat.
