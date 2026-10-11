---
title: Kako smo laserom izrezali naslovnicu iz Blender rendera
description: Tri uređaja, zlatni žičani modeli i figure poput onih s arhitektonskih maketa, izrađeni u Blenderu uz pomoć AI agenta i animirani bez WebGL-a. Plus bug sa sjenom koji je trebao četiri pokušaja.
date: 2026-10-10
tags: [Build Log, Agentic Engineering]
related: [moj-kolega, titlomat, bridj]
image: /og/laser-cut-hero.jpg
---

Nova LumiVerse naslovnica otvara se laserom. Zraka izlazi iz crvene točke u našem logotipu, dijeli se na četiri i iz ničega iscrtava uređaj svjetlećim zlatnim linijama. Drugi prolaz izrezuje ga u stvaran predmet s jednim od naših proizvoda na zaslonu. Predmet stoji nekoliko sekundi, rasplinjava se, a zatim se izrezuje sljedeći uređaj.

![Hero naslovnice usred iscrtavanja: četiri zrake iz točke u logotipu crtaju ultrawide radnu stanicu zlatnim linijama](/blog/laser-cut-hero/cover.webp)
*Četiri zrake iz točke u logotipu iscrtavaju Bridj radnu stanicu. Figure i postolje već su tu, uređaj se tek crta.*

Izgleda kao 3D u stvarnom vremenu. Nije. Ranija verzija ovog heroja vrtjela je 3D uživo u pregledniku, a jedna od prvih primjedbi u pregledu odnosila se na opterećenje procesora, ne na dizajn. Zato su ovo unaprijed renderirane slike i nekoliko stotina redaka canvas koda, a između rezova ništa se ne animira.

Posao je odradio AI agent za programiranje (Claude Code), koji je upravljao Blenderom 5.2 preko MCP-a. Svaki sam krug pregledao u pregledniku i poslao primjedbe. Primjedbe su zanimljivi dio, jer je svaka otkrila drugu vrstu pogreške.

## Jedna kamera, mnogo slojeva

Sve počinje u jednoj Blender sceni, renderiranoj u Cyclesu u 1600×1100 iz jedne fiksne kamere. Svaki se element renderira kao zaseban prozirni sloj:

- **stage:** postolje i figure, sa sjenama.
- **wire-&lt;device&gt;:** samo rubovi uređaja, koje crta Blenderov Freestyle line renderer, a sve ostalo je prozirno.
- **solid-&lt;product&gt;:** gotov uređaj sa stvarnom snimkom zaslona na ekranu.

![Tri sloja rendera jedan do drugoga: postolje s figurama, zlatni žičani model laptopa i puni laptop s Moj Kolegom na zaslonu](/blog/laser-cut-hero/layers.webp)
*Pozornica, žičani model, puni model. Budući da se kamera nikad ne pomiče, slojevi se u pregledniku poklapaju piksel za piksel.*

Preglednik animira samo otkrivanje. Za žičani model četiri zrake prolaze 2D putanjama projiciranima sa stvarnih 3D rubova, a žičani sloj prosijava kroz potez širok 26 px koji ih prati. Za puni model jedna linija reza klizi prema dolje i otkriva sloj iznad. Jedan ciklus traje 1,15 sekundi iscrtavanja, 0,85 rezanja i 4,8 mirovanja.

## Prvi krug: zlato, lakše, i više od jednog laptopa

Prve primjedbe nakon verzije sa samo laptopom:

1. Laser za rezanje je pretežak.
2. Žičani model treba svijetliti zlatno, kao na konceptnoj slici, a ne lososno-bijelo.
3. Uvijek isti laptop postaje dosadan. Dodajte monitor i radnu stanicu.
4. Crvene figure su privremene, ostale iz 3D razdoblja. Neka izgledaju stvarno.

**Laser** je gubio težinu u izmjerenim koracima. Zraka je s oreola od 5 px na 20 % neprozirnosti i jezgre od 1,1 px na 80 % prešla na oreol od 3 px na 10 % i jezgru od 0,75 px na 50 %. Linija reza prešla je s 2 px na 90 % na 1,2 px na 60 %. Točka gorenja, gdje zraka dodiruje predmet, smanjila se s 20 px na 15 px i postala zlatna, u skladu s linijama koje ostavlja za sobom.

**Zlato** je boja Freestyle linije, pomaknuta s (1.0, 0.86, 0.78) na (1.0, 0.72, 0.30), sa skrivenim rubovima u tamnom jantaru na 45 %. Sjaj dodaje CSS drop-shadow u tri koraka.

**Uređaji** su modelirani skriptom. Monitor je grafitni panel 3,6 × 2,07 nagnut 5° unatrag, na vratu i pločastom postolju. Radna stanica je zahtjevnija. Njezin ultrawide panel zakrivljen je po radijusu 5,2 i generira se prsten po prsten, tako da teksturne koordinate zaslona idu točno duž luka. Visina zaslona izvedena je iz duljine luka, pa vidljivi zaslon ispada točno 64:27, stvarni omjer 21:9.

![Tri eksponata na postolju: laptop s Moj Kolegom, monitor s Titlomatom i zakrivljeni ultrawide s Bridj nadzornom pločom](/blog/laser-cut-hero/exhibits.webp)
*Svaki proizvod na uređaju na kojem njegovi korisnici stvarno rade: laptop vlasnika webshopa, monitor kreatora, ultrawide stol analitičara.*

Zasloni prikazuju stvarna sučelja proizvoda, nikad razvučena. Titlomat je snimljen uživo u 1920×1080. Za Bridj je snimka marketinške stranice uživo, široka 2560 px, izgledala kao prazna bijela traka. Rješenje se skrivalo u postojećoj snimci zaslona iz studije slučaja: prozor nadzorne ploče u njoj imao je omjer 2,33:1, gotovo točno ultrawide. Izrezali smo ga i upotrijebili takvog kakav jest.

### Putanje lasera, generirane umjesto nacrtane

Prvi laptop imao je ručno odabrane obrise koje su zrake pratile. To se ne skalira na tri uređaja, pa je agent napisao jedan exporter. On uzima svaki rub mreže koji je granični ili se savija više od 0,5 radijana, projicira ga kroz kameru rendera u piksele i spaja segmente sa zajedničkim krajnjim točkama u linije. Zatim ih slaže od najbližeg prema daljem, tako da zraka klizi umjesto da skače. Svaka zraka zadužena je za nekoliko dijelova uređaja: okvir, zaslon, postolje, tipkovnicu.

Provjera: izračunati okvir laptopa ispao je (379, 221, 756×584). Stari, ručno izmjereni okvir bio je (384, 224, 746×576). Putanje za sva tri uređaja zauzimaju 33 KB.

### Figure iz modela za slike

3D generator nije bio dostupan, ali naš ComfyUI vrti Qwen-Image. Jedan prompt za „minijaturnu figuru s arhitektonske makete od mat koraljne smole” vratio je uvjerljivu produktnu fotografiju za otprilike 16 sekundi. Prolaz za uklanjanje pozadine izrezao ju je.

![Generirana fotografija figurice od koraljne smole, ista figura izrezana na crnoj pozadini i figura na postolju u konačnom renderu](/blog/laser-cut-hero/figure.webp)
*Generirana fotografija, izrezak, u sceni. U Blenderu je figura ravna kartica s alfa kanalom, a ne model.*

Izrezak je ušao u Blender kao ravna kartica, a nije zalijepljen na konačnu sliku. Ta odluka je važna. U sceni kartica može bacati sjenu i izrezati rupu u slojevima uređaja, pa uređaj iza figure ostaje iza nje i nakon što preglednik složi slojeve.

## Drugi krug: figura je gledala na drugu stranu

Sljedeće primjedbe bile su kratke. Lijeva figura preklapa ultrawide, lebdi iznad postolja, a sjena joj je čudna. Također: okrenite zaslone prema gledatelju i neka figure gledaju prema uređajima, a ne od njih.

U tome su se skrivala tri zasebna buga.

**Kartice su bile zrcaljene.** Rotacija kartice računala se kao `atan2(dy, dx) − 90°`, što ju je okretalo leđima prema kameri. Figura se crta emission shaderom, koji osvjetljava obje strane, pa ništa nije izgledalo pokvareno. Bila je jednostavno zrcaljena, a muškarac je gledao od uređaja kojem se trebao diviti. Ispravak je bio `atan2(dx, −dy)`.

**Lebdenje je bilo u fotografiji.** Model za slike snimio je figuricu malo odozgo, pa na slici stražnja cipela stoji 40 piksela više od prednje. To je 3 % visine figure, oko 3,4 cm u jedinicama scene. Na ravnoj okomitoj kartici to postaje procjep ispod stražnjeg stopala.

**Preklapanje je bio problem u prostoru zaslona.** Figure i uređaji ne dodiruju se u 3D-u, ali se mogu preklapati na slici. Zato je postavljanje postalo provjera, a ne procjena: projicirana glava svake figure mora biti ispod najniže projicirane točke svakog uređaja ispred kojeg stoji.

Uređaji su sada okrenuti 28° prema kameri, 8,6° više nego da su okrenuti ravno prema njoj, pa se zasloni naginju prema naslovu.

## Treći krug: četiri pokušaja sa sjenom

Zatim: sjene ispod figurica nedostaju ili su pogrešne.

Ovaj put agent je mjerio prije nego što je išta dirao:

- **Muškarčeva sjena nije imala gdje pasti.** Glavno svjetlo je reflektor gore desno, pa baca sjene ulijevo. Muškarac stoji 0,27 jedinica od lijevog ruba. Vrh njegove sjene pada na radijus 3,6, a radijus postolja je 2,75. Gotovo cijela sjena pada izvan njega.
- **Svijetla površina na kojoj stoji nije svjetlo.** Postolje je gotovo crno (albedo 0,006) i sjajno. Svijetla površina je zrcalna slika panela za popunjavajuće svjetlo od 5×5 m, a nijedna figurica ne može vidljivo zasjeniti odraz tako velikog svjetla.

Zatim je isprobao tri rješenja i svako je propalo:

1. Skrivene kopije kartica okrenute prema svjetlu, plus svjetlije postolje da se sjene mogu vidjeti. Izgled crne galerije je nestao, a muškarac i dalje nije imao sjenu.
2. Premještanje glavnog svjetla naprijed kako bi sjene padale unatrag na postolje. Padale su, ali muškarčevo mjesto i dalje je osvjetljavao odraz popunjavajućeg svjetla, pa se ondje ništa nije vidjelo.
3. Cycles light linking, kako popunjavajući panel više ne bi dosezao postolje. To je riješilo odraz i postolje učinilo sivim.

Svaki je pokušaj žrtvovao izgled koji sam već odobrio, u potrazi za fizikalnom točnošću. Rješenje koje je isporučeno prestalo je s tom potragom.

![Prije i poslije: figura lebdi s odvojenim tamnim odrazom, a ista figura stoji čvrsto s mekom sjenom koja pada prema rubu](/blog/laser-cut-hero/shadows.webp)
*Prije: odraz ravne kartice i procjep ispod stražnjeg stopala. Poslije: planarna sjena u stvarnom smjeru svjetla, koja pada preko ruba.*

**Planarna sjena je ono što sjena geometrijski jest**, pa smo izgradili upravo to. Silueta svake figure položena je na postolje u stvarnom smjeru glavnog svjetla, s duljinom dobivenom iz sličnih trokuta: 1,29 jedinica za muškarca i 0,75 za ženu. Silueta je unaprijed zamućena u četiri koraka, od 3 do 36 piksela: oštra kod potplata i mekša prema glavi, kao što se širi stvarna polusjena. Neprozirnost joj pada s 95 % na 30 %. Shader je reže na rubu postolja, pa muškarčeva sjena pada preko ruba kao što bi pala i stvarna. Odobrena rasvjeta ostala je netaknuta.

Ondje se pojavio još jedan bug. Meka kontaktna sjena ispod svakog para stopala bila je ograničena na 13 % neprozirnosti, jer se krivulja opadanja primjenjivala nakon skaliranja umjesto prije. S ispravljenim redoslijedom vrhunac joj je 55 %, a figure stoje na postolju umjesto iznad njega.

## Bugovi u pipelineu koje vrijedi znati

Dva ponašanja Blendera stajala su nas dosta vremena:

- **Skriveni objekti zadržavaju stare položaje.** Objektima u kolekciji skrivenoj u viewportu world transform se ne izračunava ponovno. Exporter putanja pročitao je stari položaj tipkovnice nakon što je ona pomaknuta, a zrake su iscrtale tipkovnicu koje nije bilo. Exporter sada otkriva svaki uređaj prije čitanja.
- **Cycles boji piksele u crno nakon osam prozirnih površina.** Prolaz za žičani model renderira svaku površinu kao prozirnu. Kod vrata monitora zraka prolazi kroz okvir, panel, kućište i vrat, više od zadanog ograničenja od osam, i 1.431 piksel ispao je potpuno crn. Podizanje ograničenja na 64 svelo je to na nulu.

Oba ispravka sada žive u verzioniranim skriptama, jednoj za render i jednoj za export putanja. Svaki render resetira sve zastavice umjesto da nasljeđuje ono što je ostavio prethodni prolaz.

## Koliko to košta

Sedam WebP slojeva, ukupno oko 290 KB, plus 33 KB putanja. Bez WebGL-a, a stranica između rezova ne radi ništa.

## Što se može prenijeti

- **Renderirajte jednom, animirajte otkrivanje.** Unaprijed renderirani slojevi iz fiksne kamere daju stvarnu rasvjetu i materijale po cijeni nekoliko slika. Preglednik samo mora pomicati masku.
- **Generirajte podatke iz izvora, a ne ručno.** Exporter rubova pretvorio je „nacrtaj putanje lasera” u jednu funkciju koja radi za bilo koji uređaj, a sam se provjerio prema starim, ručno dobivenim brojevima.
- **Provjerite postavljanje ondje gdje ga gledatelj vidi.** Stvari koje se u 3D-u nikad ne dodiruju mogu se sudariti na zaslonu. Projekcija u piksele pretvorila je „izgleda natrpano” u broj.
- **Izmjerite prije ispravljanja, a zatim znajte kada stati.** Dijagnoza sjene bila je točna iz prvog pokušaja. Sva tri ispravka rasvjete bila su fizikalno razumna i svaki je sliku učinio gorom. Sjena se samo mora čitati kao sjena, pa smo izgradili jednu.
- **Modeli za slike dobri su rekviziti.** Generacija od 16 sekundi, postavljena kao kartica u stvarnu scenu, pobijedila je ručno modeliranu low-poly figuru u svakom pregledu.
