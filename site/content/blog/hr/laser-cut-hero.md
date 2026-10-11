---
title: Kako smo laserom izrezali naslovnicu iz Blender rendera
description: Tri uređaja, zlatni žičani modeli i figurice s makete, izrađeni u Blenderu uz AI agenta i animirani bez WebGL-a. I bug sa sjenom koji je tražio četiri pokušaja.
date: 2026-10-10
tags: [Build Log, Agentic Engineering]
related: [moj-kolega, titlomat, bridj]
image: /og/laser-cut-hero.jpg
---

Nova naslovnica LumiVersea otvara se laserom. Zraka izlazi iz crvene točke u našem logotipu, dijeli se na četiri i ni iz čega svjetlećim zlatnim linijama iscrtava uređaj. U drugom prolazu laser ga izrezuje u stvaran predmet, a na zaslonu se pojavi jedan od naših proizvoda. Predmet se zadrži nekoliko sekundi, rasprši se, a zatim laser izrezuje sljedeći uređaj.

![Hero naslovnice usred iscrtavanja: četiri zrake iz točke u logotipu crtaju ultrawide radnu stanicu zlatnim linijama](/blog/laser-cut-hero/cover.webp)
*Četiri zrake iz točke u logotipu iscrtavaju Bridj radnu stanicu. Figure i postolje već su na mjestu, a uređaj se tek crta.*

Izgleda kao 3D u stvarnom vremenu, ali nije. Ranija verzija ove hero sekcije vrtjela je 3D uživo u pregledniku, a jedna od prvih primjedbi na pregledu nije se ticala dizajna, nego opterećenja procesora. Zato ovu verziju čine unaprijed renderirane slike i nekoliko stotina redaka canvas koda, a između rezova ništa se ne animira.

Posao je odradio AI agent za programiranje (Claude Code), koji je Blenderom 5.2 upravljao preko MCP-a. Svaki sam krug pregledao u pregledniku i vratio primjedbe. Upravo su primjedbe najzanimljiviji dio, jer je svaka razotkrila drugu vrstu pogreške.

## Jedna kamera, mnogo slojeva

Sve počinje od jedne Blender scene, koju Cycles renderira u 1600×1100 iz jedne fiksne kamere. Svaki se element renderira u zaseban prozirni sloj:

- **stage:** postolje i figure, zajedno sa sjenama.
- **wire-&lt;device&gt;:** samo rubovi uređaja, iscrtani Blenderovim Freestyle line rendererom; sve ostalo je prozirno.
- **solid-&lt;product&gt;:** gotov uređaj sa stvarnom snimkom zaslona na ekranu.

![Tri sloja rendera jedan do drugoga: postolje s figurama, zlatni žičani model laptopa i puni laptop s Moj Kolegom na zaslonu](/blog/laser-cut-hero/layers.webp)
*Pozornica, žičani model, puni model. Budući da se kamera nikad ne pomiče, slojevi se u pregledniku poklapaju piksel za piksel.*

Preglednik animira samo otkrivanje. Kod žičanog modela četiri zrake prate 2D putanje projicirane sa stvarnih 3D rubova, a žičani sloj vidi se kroz potez širok 26 px koji ide za njima. Kod punog modela jedna linija reza klizi prema dolje i otkriva sloj iznad. U jednom ciklusu 1,15 sekundi otpada na iscrtavanje, 0,85 na rezanje i 4,8 na mirovanje.

## Prvi krug: zlato, lakši laser i više od jednog laptopa

Prve primjedbe, dok je na naslovnici bio samo laptop:

1. Laser za rezanje djeluje pretežak.
2. Žičani model treba svijetliti zlatno, kao na konceptnoj slici, a ne lososno-bijelo.
3. Stalno isti laptop brzo dosadi. Dodajte monitor i radnu stanicu.
4. Crvene figure privremeno su rješenje iz 3D faze. Neka izgledaju stvarno.

**Laser** smo olakšavali u odmjerenim koracima. Zraka je imala oreol od 5 px s 20 % neprozirnosti i jezgru od 1,1 px s 80 %, a sada ima oreol od 3 px s 10 % i jezgru od 0,75 px s 50 %. Linija reza stanjena je s 2 px pri 90 % na 1,2 px pri 60 %. Točka gorenja, mjesto na kojem zraka dodiruje predmet, smanjila se s 20 px na 15 px i postala zlatna, kao i linije koje ostavlja za sobom.

**Zlato** je boja Freestyle linije, koju smo promijenili s (1.0, 0.86, 0.78) na (1.0, 0.72, 0.30), a skriveni rubovi iscrtani su tamnim jantarom na 45 %. Sjaj dodaje CSS drop-shadow u tri koraka.

**Uređaje** smo modelirali skriptom. Monitor je grafitni panel dimenzija 3,6 × 2,07, nagnut 5° unatrag, na vratu s pločastim postoljem. Radna stanica bila je zahtjevnija. Njezin ultrawide panel zakrivljen je radijusom 5,2 i generira se prsten po prsten, kako bi teksturne koordinate zaslona točno pratile luk. Visinu zaslona izračunali smo iz duljine luka, pa vidljivi dio ima točno omjer 64:27, odnosno stvarnih 21:9.

![Tri eksponata na postolju: laptop s Moj Kolegom, monitor s Titlomatom i zakrivljeni ultrawide s Bridj nadzornom pločom](/blog/laser-cut-hero/exhibits.webp)
*Svaki je proizvod prikazan na uređaju za kojim njegovi korisnici doista rade: na laptopu vlasnika webshopa, monitoru kreatora i ultrawide zaslonu na stolu analitičara.*

Zasloni prikazuju stvarna sučelja proizvoda, bez razvlačenja. Titlomat je snimljen uživo u 1920×1080. Kod Bridja je snimka žive marketinške stranice, široka 2560 px, izgledala kao prazna bijela traka. Rješenje se skrivalo u postojećoj snimci zaslona iz studije slučaja: prozor nadzorne ploče u njoj imao je omjer 2,33:1, gotovo točno ultrawide. Izrezali smo ga i upotrijebili bez ikakvih izmjena.

### Putanje lasera: generirane, a ne nacrtane

Na prvom laptopu zrake su pratile ručno odabrane obrise. Za tri uređaja to više nije održivo, pa je agent napisao exporter. Exporter uzima svaki rub mreže koji je granični ili se lomi za više od 0,5 radijana, projicira ga kroz kameru rendera u piksele i segmente sa zajedničkim krajnjim točkama spaja u linije. Zatim ih poreda od najbliže prema daljima, pa zraka klizi umjesto da skače. Svaka je zraka zadužena za nekoliko dijelova uređaja: okvir, zaslon, postolje, tipkovnicu.

Provjera: izračunati okvir laptopa iznosi (379, 221, 756×584), a stari, ručno izmjereni bio je (384, 224, 746×576). Putanje za sva tri uređaja zauzimaju 33 KB.

### Figure iz modela za generiranje slika

3D generator nismo imali na raspolaganju, ali na našem ComfyUI-ju vrti se Qwen-Image. Jedan prompt za „minijaturnu figuru s arhitektonske makete od mat koraljne smole” za otprilike 16 sekundi dao je uvjerljivu produktnu fotografiju. Alat za uklanjanje pozadine zatim je figuru izrezao.

![Generirana fotografija figurice od koraljne smole, ista figura izrezana na crnoj pozadini i figura na postolju u konačnom renderu](/blog/laser-cut-hero/figure.webp)
*Generirana fotografija, izrezak i figura u sceni. U Blenderu je figura ravna kartica s alfa kanalom, a ne model.*

Izrezak smo u Blender unijeli kao ravnu karticu, umjesto da ga zalijepimo na konačnu sliku. Ta je odluka ključna. Kartica u sceni može bacati sjenu i izrezati rupu u slojevima uređaja, pa uređaj iza figure ostaje iza nje i kad preglednik složi slojeve.

## Drugi krug: figura je gledala na drugu stranu

Sljedeće primjedbe bile su kratke: lijeva figura prekriva ultrawide, lebdi iznad postolja i ima čudnu sjenu. Osim toga: okrenite zaslone prema gledatelju, a figure neka gledaju prema uređajima, a ne od njih.

Iza toga krila su se tri zasebna buga.

**Kartice su bile zrcaljene.** Rotacija kartice računala se kao `atan2(dy, dx) − 90°`, pa je kartica kameri bila okrenuta stražnjom stranom. Figura se iscrtava emission shaderom, koji osvjetljava obje strane, pa ništa nije izgledalo pokvareno. Slika je jednostavno bila zrcaljena, a muškarac je gledao od uređaja kojem se trebao diviti. Ispravak je bio `atan2(dx, −dy)`.

**Lebdenje je bilo u samoj fotografiji.** Model je figuricu snimio malo odozgo, pa je na slici stražnja cipela 40 piksela viša od prednje. To je 3 % visine figure, oko 3,4 cm u jedinicama scene. Na ravnoj okomitoj kartici zbog toga se ispod stražnjeg stopala vidi procjep.

**Preklapanje se događalo tek na zaslonu.** Figure i uređaji u 3D-u se ne dodiruju, ali na slici se mogu preklopiti. Zato položaj više ne određujemo odokativno, nego provjerom: projicirana glava svake figure mora biti niže od najniže projicirane točke svakog uređaja ispred kojeg figura stoji.

Uređaji su sada zakrenuti 28° prema kameri, 8,6° više nego da gledaju ravno u nju, pa su zasloni nagnuti prema naslovu.

## Treći krug: četiri pokušaja sa sjenom

Sljedeća primjedba: sjene ispod figurica nedostaju ili su pogrešne.

Ovaj je put agent prvo mjerio, a tek onda išta mijenjao:

- **Muškarčeva sjena nije imala gdje pasti.** Glavno svjetlo je reflektor gore desno, pa sjene padaju ulijevo. Muškarac stoji 0,27 jedinica od lijevog ruba. Vrh njegove sjene pada na radijus 3,6, a postolje ima radijus 2,75, pa gotovo cijela sjena završi izvan njega.
- **Svijetla mrlja na kojoj stoji nije svjetlo.** Postolje je gotovo crno (albedo 0,006) i sjajno. Svijetla mrlja zapravo je zrcalni odraz panela popunjavajućeg svjetla veličine 5×5 m, a nijedna figurica ne može vidljivo zasjeniti odraz tako velikog izvora svjetla.

Zatim je isprobao tri rješenja i nijedno nije uspjelo:

1. Skrivene kopije kartica okrenute prema svjetlu i svjetlije postolje na kojem bi se sjene vidjele. Nestao je izgled crne galerije, a muškarac i dalje nije imao sjenu.
2. Premještanje glavnog svjetla naprijed, kako bi sjene padale unatrag na postolje. Sjene su doista pale na postolje, ali mjesto na kojem stoji muškarac i dalje je osvjetljavao odraz popunjavajućeg svjetla, pa se ondje ništa nije vidjelo.
3. Cycles light linking, kako svjetlo s panela više ne bi dopiralo do postolja. Odraz je nestao, ali postolje je posivjelo.

U potrazi za fizikalnom točnošću svaki je pokušaj žrtvovao izgled koji sam već odobrio. Rješenje koje je na kraju otišlo u produkciju od te je potrage odustalo.

![Prije i poslije: figura lebdi s odvojenim tamnim odrazom, a ista figura stoji čvrsto s mekom sjenom koja pada prema rubu](/blog/laser-cut-hero/shadows.webp)
*Prije: odraz ravne kartice i procjep ispod stražnjeg stopala. Poslije: planarna sjena u stvarnom smjeru svjetla, koja pada preko ruba.*

**Geometrijski gledano, sjena i jest planarna projekcija**, pa smo napravili upravo to. Silueta svake figure položena je na postolje u stvarnom smjeru glavnog svjetla, a duljinu smo izračunali iz sličnih trokuta: 1,29 jedinica za muškarca i 0,75 za ženu. Silueta je unaprijed zamućena u četiri koraka, od 3 do 36 piksela: oštra uz potplate i sve mekša prema glavi, baš kao što se širi stvarna polusjena. Neprozirnost joj pada s 95 % na 30 %. Shader je odsijeca na rubu postolja, pa muškarčeva sjena pada preko ruba kao što bi pala i prava. Odobrena rasvjeta ostala je netaknuta.

Usput se pojavio još jedan bug. Meka kontaktna sjena ispod svakog para stopala bila je ograničena na 13 % neprozirnosti, jer se krivulja slabljenja primjenjivala nakon skaliranja, a ne prije njega. Kad smo ispravili redoslijed, sjena doseže najviše 55 %, a figure stoje na postolju umjesto da lebde iznad njega.

## Bugovi u pipelineu koje vrijedi zapamtiti

Dvije Blenderove osobitosti odnijele su nam dosta vremena:

- **Skriveni objekti zadržavaju stare položaje.** Ako je kolekcija skrivena u viewportu, Blender njezinim objektima ne izračunava ponovno world transform. Exporter putanja zato je pročitao stari položaj tipkovnice iako je ona već bila pomaknuta, pa su zrake iscrtale tipkovnicu koje nije bilo. Exporter sada prije čitanja svaki uređaj učini vidljivim.
- **Nakon osam prozirnih površina Cycles piksele boji u crno.** Prolaz za žičani model renderira svaku površinu kao prozirnu. Kod vrata monitora zraka prolazi kroz okvir, panel, kućište i vrat, što je više od zadane granice od osam, pa je 1.431 piksel ispao potpuno crn. Kad smo granicu podigli na 64, crnih piksela više nije bilo.

Oba su ispravka sada u verzioniranim skriptama, jednoj za render, a drugoj za export putanja. Svaki render iznova postavlja sve zastavice umjesto da naslijedi ono što je za sobom ostavio prethodni prolaz.

## Koliko to košta

Sedam WebP slojeva, ukupno oko 290 KB, i još 33 KB putanja. Nema WebGL-a, a između rezova stranica miruje.

## Što vrijedi i drugdje

- **Renderirajte jednom, animirajte otkrivanje.** Unaprijed renderirani slojevi iz fiksne kamere daju Vam stvarnu rasvjetu i materijale, a koštaju koliko i nekoliko slika. Preglednik samo pomiče masku.
- **Generirajte podatke iz izvora, a ne ručno.** Exporter rubova pretvorio je „nacrtaj putanje lasera” u jednu funkciju koja radi za bilo koji uređaj, a usto se sam provjerio usporedbom sa starim, ručno dobivenim brojevima.
- **Raspored provjerite ondje gdje ga gledatelj vidi.** Predmeti koji se u 3D-u nikad ne dodiruju na zaslonu se mogu sudariti. Projekcijom u piksele „izgleda natrpano” postalo je broj.
- **Prvo mjerite, zatim popravljajte, i znajte kada stati.** Dijagnoza sjene bila je točna već iz prve. Sva tri ispravka rasvjete bila su fizikalno opravdana, a svaki je sliku pogoršao. Sjena samo mora izgledati kao sjena, pa smo je jednostavno napravili.
- **Modeli za generiranje slika dobri su za rekvizite.** Slika generirana za 16 sekundi i postavljena kao kartica u stvarnu scenu pobijedila je ručno modeliranu low-poly figuru na svakom pregledu.
