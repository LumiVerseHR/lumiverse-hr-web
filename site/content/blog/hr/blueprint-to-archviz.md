---
title: Od nacrta do arhitektonskih rendera u Blenderu bez ekrana
description: "Jedan nacrt, kratke upute i dan u kojem Claude piše skripte za Blender: sedam rendera u 2400×1600 i 3D model za šetnju u pregledniku. Što je trebalo i gdje je zapelo."
date: 2026-10-11
tags: [Build Log, Agentic Engineering]
related: []
image: /og/blueprint-to-archviz.jpg
---

![Render u zlatnom satu: bijela dvokatnica sa zabatom, tamnim limenim krovom na falc, crnim prozorskim okvirima, hrastovim dvokrilnim vratima, brezama i popločanom stazom preko travnjaka](/blog/blueprint-to-archviz/cover.webp)
*Glavni kadar. Svaki model, materijal i biljku u njemu Claude je napisao u Pythonu, a Blender ih je renderirao bez ekrana.*

Claudeu smo dali nacrt male dvokatnice (pročelje i dva tlocrta) i kratke upute: opremi prostorije, dodaj detalje i okoliš, istraži kako se snima arhitektura i napravi slike dovoljno dobre za arhitektonski časopis. I sve dokumentiraj.

Sedam sati kasnije imali smo:

- sedam završnih rendera u 2400×1600: zlatni sat, plavi sat, pročelje, blagovaonicu, spavaću sobu i dva presjeka,
- scenu s oko 450 objekata, 23 rasvjetna tijela, otprilike 640.000 vlati trave i tri simulacije tkanine,
- interaktivni 3D model u pregledniku, koji možete okretati, kroz koji možete prošetati i koji možete prerezati po katovima,
- radni dnevnik svake odluke i svake pogreške, iz kojeg je nastao ovaj tekst.

Nitko pritom nije otvorio Blender. Claude nije imao viewport: svoj je rad vidio samo tako da renderira kadar i pogleda sliku.

## Ukratko o postavu

MCP poslužitelju preko kojeg naš studio već koristi modele za slike i video dodali smo tri alata za Blender. Claude napiše skriptu u Pythonu i pošalje je kao zadatak. Za svaki se zadatak Blender 4.2 pokreće iznova, bez ekrana i samo na procesoru, i vraća rendere, zapisnik i datoteke koje je skripta spremila. Sljedeći zadatak može otvoriti scenu koju je spremio prethodni, pa se rad nadograđuje korak po korak.

Nismo koristili dodatke ni gotove 3D modele s interneta. Ono malo ravnih slika u sceni, tri slike na zidovima i drveće, napravili su generatori slika na istom poslužitelju, sve zajedno za manje od minute.

## Od volumenskog modela do kadra za časopis

![Lijevo: rani volumenski model kuće na sivom travnjaku, s debelim bijelim okvirima i kamerom nagnutom prema dolje. Desno: završni render u zlatnom satu s tankim crnim okvirima, uređenim vrtom, drvećem i ravnom kamerom](/blog/blueprint-to-archviz/massing-to-final.webp)
*Lijevo, prva verzija: zidovi, krov i otvori prema nacrtu, iz tri pokušaja od 7 do 39 s. Desno, završni render.*

Prva verzija nastala je za nekoliko minuta i tako je i izgledala: prazna ljuska, plošne boje, sivo tlo i kamera nagnuta prema dolje, pa su se sve okomite linije naginjale. Prije ikakvih izmjena Claude je istražio kako se takve slike rade i zapisao vizualni smjer.

- **Materijali:** toplo bijela žbuka, tamni čelični krov na falc i tanki crni aluminijski okviri, česta kombinacija kod suvremenih kuća sa zabatom.
- **Interijer:** bijeli zidovi, svijetli hrast i tamno hrastovo stubište, po uzoru na Villu S+E Todda Saundersa kraj Bergena, čiji je tlocrt sličan onome s nacrta.
- **Kamera:** vodoravna, u visini očiju, a kadar se namješta pomakom objektiva umjesto naginjanjem, pa okomice ostaju okomite, kao u arhitektonskoj fotografiji.
- **Svjetlo:** nisko sunce zlatnog sata za glavni kadar i kadar u plavom satu, u kojem toplo osvijetljen interijer odskače od hladnog pročelja.

Zatim je kuću sagradio iznova, ovaj put tako da se može opremiti: zidovi prave debljine, dvije etaže, potkrovlje s kosim stropom, ravno lebdeće hrastovo stubište i prozorski okviri široki 60 mm. Usput je uočio i grešku u nacrtu. Nacrtano stubište u obliku slova L ne može stati u tu visinu etaže, jer bi mu trebalo oko 4,2 m duljine. Zato je postalo ravno stubište uz stražnji zid, što je i zabilježeno u dnevniku.

## Tamne sobe iza pravog stakla

![Lijevo: rani render dnevnog boravka, taman i mutan, sa svijetlim točkicama na podu. Desno: završni render blagovaonice i kuhinje, svijetao, sa suncem na hrastovom podu, crnim visilicama i brezom u velikom prozoru](/blog/blueprint-to-archviz/interior-light.webp)
*Lijevo, prvi test interijera. Desno, završni kadar blagovaonice.*

Prvi interijer ispao je taman i pun svijetlih točkica. Uzrok je dobro poznat problem path tracinga. Sunčevo svjetlo koje prolazi kroz staklo i pritom se lomi stvara kaustike, s kojima se renderer loše nosi, pa su sobe bile osvijetljene gotovo samo zrnatim odbijenim svjetlom.

Rješenje je standardan trik iz arhitektonske vizualizacije. Za kameru staklo ostaje staklo, s odsjajima, ali za zrake sjena i odbijenog svjetla potpuno je prozirno. Sunce i dnevno svjetlo tada ulaze ravno u sobu. Za dobar kut interijera trebala su četiri pokušaja: u prva tri prostor je izgledao kao hodnik ili je kadrom dominirao kauč.

## Posteljina koja više ne izgleda kao spužva

![Lijevo: rani render spavaće sobe na kojem jastuci izgledaju kao valjci, a poplun kao drugi madrac. Desno: završna spavaća soba s mekom posteljinom, mekanim jastucima i prozirnim zavjesama kroz koje prolazi svjetlo](/blog/blueprint-to-archviz/bedroom-cloth.webp)
*Lijevo, spavaća soba prije dorade. Desno, završni render sa simuliranom tkaninom i prozirnim zavjesama.*

Claude je prvu spavaću sobu sam ocijenio bez uljepšavanja: jastuci izgledaju kao valjci, a poplun kao drugi madrac. Modelirane kutije ne izgledaju kao tkanina, pa ih je simulirao. Jastuci se napušu poput balona, a zatim se na krevet spuste poplun i prekrivač i slegnu se. Sve tri simulacije izvršile su se u jednom zadatku za 8,7 sekundi, bez viewporta. U istom su koraku dodane nabrane prozirne zavjese kroz koje se probija svjetlo. U dnevniku Claude to naziva najvećim skokom u realističnosti u cijelom projektu.

## Plavi sat i svjetiljke koje su izgledale kao kugle

![Lijevo: rani test plavog sata s crnim horizontom i svjetlećom bijelom kuglom u prozoru na katu. Desno: završni render plavog sata s toplo osvijetljenim prozorima, osvijetljenim ulazom, drvećem i nebom u sumrak](/blog/blueprint-to-archviz/blue-hour.webp)
*Lijevo, prvi test plavog sata. Desno, završni render, koji je Claude ocijenio najboljom slikom u seriji.*

Kadar u plavom satu uspio je već iz prvog pokušaja: topli prozori na hladnom pročelju klasična su slika iz časopisa. Ali jedno se stropno svjetlo vidjelo kao svjetleća kugla u prozoru na katu. U Blenderu su svjetla zadano vidljiva kameri.

Nije bilo dovoljno sakriti ih od kamere. Kugla se ponovno pojavila, ovaj put *kroz* staklo, jer spomenuti trik sa staklom koristi zrake transmisije, a svjetla su vidljiva i njima. Sada je svako od 23 rasvjetna tijela skriveno od kamere, transmisije i odsjaja, a sjenila i dalje svijetle. Crnom horizontu dodan je rub šume, a tamna vrata osvjetljavaju dva reflektora ispod nadstrešnice.

## Presjeci i model kroz koji se možete prošetati

![Dva aksonometrijska presjeka kuće odozgo: kat prerezan na 5,3 m s dvije spavaće sobe i prizemlje prerezano na 2,5 m s kuhinjom, blagovaonicom, dnevnim boravkom i stubištem](/blog/blueprint-to-archviz/cutaways.webp)
*Dva presjeka, na visini od 5,3 m i 2,5 m.*

Presjek nastaje tako da jedna velika booleova operacija prereže sve na odabranoj visini, a ortografska kamera gleda odozgo. Usput se Blender dvaput srušio. Prvi put zato što je ista skripta dvaput učitala scenu, a drugi put zato što je dodavala modifikatore dok je prolazila kroz istu kolekciju. Treći problem zavarao je trag: ispis koji se nije stigao zapisati izgubio se u rušenju, pa je izgledalo da se Blender srušio na drugom mjestu.

![Interaktivni preglednik koji prikazuje kuću u browseru, s izbornikom gotovih pogleda, rasvjetom zlatnog i plavog sata, klizačem za presjek i uključivanjem slojeva](/blog/blueprint-to-archviz/viewer.webp)
*Preglednik u browseru: devet gotovih pogleda, dvije rasvjete i klizač za presjek. Napravljen je iz iste scene.*

U zadnjem je koraku scena izvezena za browser: 195.000 trokuta u datoteci od 6,3 MB. Preglednik je jedna stranica u three.jsu. Kućom se možete kretati okretanjem ili letom, a na raspolaganju su devet pogleda preuzetih iz kamera u Blenderu, rasvjeta zlatnog i plavog sata te klizač koji reže kuću kat po kat. Ono što format izvoza nije mogao prenijeti napravljeno je iznova u browseru: tekstura travnjaka, oko 2.400 busena ukrasne trave i drveće koje je uvijek okrenuto prema promatraču.

## Bug zbog kojeg je trava narasla četiri metra

Najčudnija greška bila je u vrtu. Nakon što je dodan travnjak, probni render u zlatnom satu vratio se kao crne okomite pruge, a renderiranje se jako usporilo. Kontrolna skripta ispisala je duljinu trave: 4 metra, u svakom sustavu čestica.

U Blenderovim postavkama čestica duljinom dlake upravljaju dvije vrijednosti, a postavljanje druge tiho je poništilo prvu. Travnjak je tako imao oko 2 milijuna vlati visokih 4 m, a kamera je bila zakopana u njima. Kad su vrijednosti postavljene pravim redom, isti je kadar umjesto 93 sekunde crnila za 19 sekundi dao pravi render. Divovska trava vjerojatno je srušila i poslužitelj, koji je usred dana četrdesetak minuta bio nedostupan, ali to nismo dokazali.

## Drveće iz generatora slika, izrezano kao na zelenom platnu

![Rezultati generatora slika na jednoličnoj magenta pozadini: breza, hrast i dugačka traka ruba šume](/blog/blueprint-to-archviz/tree-cards.webp)
*Drveće generirano na jednoličnoj magenta pozadini, spremno za izrezivanje u Blenderu.*

Drveće u sceni čine ravne plohe sa slikom stabla, pa je slikama trebala prozirna pozadina. Generator slika umjesto toga vratio je JPG s ljubičastim obrubom. Alat za uklanjanje pozadine napravio je čist PNG, ali na krivom računalu: poslužitelj za render do njega nije mogao doći.

Zato je Claude zatražio svako stablo na čistoj magenta pozadini i izrezao ga u samom Blenderu s nekoliko redaka NumPyja, kao na zelenom platnu. Breza, hrast i duga traka šume izrezani su čisto.

## Što smo naučili

- **Sve počinje gledanjem.** Gotovo svako poboljšanje počelo je tako što je Claude kritizirao vlastiti render. Hrastov pod bio je boje breskve, drvena kugla iz probnog zadatka izgledala je „više kao zebra nego kao drvo”, a interijer kao hodnik. Bez viewporta renderirani kadar jedina je povratna informacija, pa se isplati često renderirati male probne slike. Naše su trajale 10–13 sekundi po kadru.
- **Razmislite prije renderiranja.** Neke greške uhvaćene su prije ikakvog rendera. Provjerom rotacija otkrivene su fotelje okrenute od sobe i slika koja lebdi 15 cm od zida.
- **Provjerite, nemojte pogađati.** Blenderov Python API mijenja se iz verzije u verziju. Kad neki naziv postavke nije radio, jedna je kontrolna skripta ispisala sve ispravne nazive, umjesto da se pogađa jedan po jedan.
- **Vodite dnevnik.** Svaka je iteracija zapisana: cilj, izmjena, rezultat, kritika i sljedeći korak. Iz tog dnevnika nastao je ovaj tekst, a u njemu su zapisane i mane koje su ostale.

A mane postoje:

- Travnjak kroz prozor blagovaonice pri tako niskom suncu izgleda izblijedjelo.
- Uzglavlje u spavaćoj sobi s jedne strane ima prugastu teksturu.
- Živica iza kuće na malim slikama izgleda pretamno.
- Nebo je samo fizikalni model neba, jer je zadatak za fotografiju oblaka zapeo u redu čekanja.

Iskusan vizualizator uočio bi sve četiri. No jedan radni dan skriptiranih iteracija od jednog je nacrta napravio seriju slika i model za šetnju u pregledniku, na koje klijent već može dati povratnu informaciju, a da nitko nije otvorio 3D program.
