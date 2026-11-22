import type {Strings} from '../strings';

// Finnish. Same keys as English in src/strings.ts.
//
// Professional railway terms: a library entry (loco, railcar, multiple unit,
// control car or coach with a decoder) is a "kalustoyksikkö"; the collection
// is "kalusto"; a consist is a "moniajo"; a throttle is an "ajosäädin".
export const fi: Strings = {
  appName: 'Throttle',
  back: 'Takaisin',

  menu: {
    vehicles: 'Kalusto',
    drive: 'Aja',
    settings: 'Asetukset',
  },

  library: {
    title: 'Kalusto',
    pickTitle: 'Valitse kalustoyksikkö',
    entries: (count: number) =>
      count === 1 ? '1 kalustoyksikkö' : `${count} kalustoyksikköä`,
    search: 'Hae nimellä tai osoitteella',
    add: 'Lisää kalustoyksikkö',
    edit: 'Muuta järjestystä',
    done: 'Valmis',
    sortByName: 'Järjestä A–Ö',
    sortByAddress: 'Järjestä osoitteen mukaan',
    moveUp: 'Siirrä ylös',
    moveDown: 'Siirrä alas',
    empty: 'Ei kalustoa lisätty.',
    noMatches: 'Haulla ei löytynyt kalustoyksiköitä.',
    driveByAddress: 'Aja osoitteella',
    addConsist: 'Lisää moniajo',
    consistBadge: 'Moniajo',
    consistMembers: (count: number) =>
      count === 1 ? '1 kalustoyksikkö' : `${count} kalustoyksikköä`,
    loadError: 'Kalustoa ei voitu avata.',
    noPhoto: 'Ei kuvaa',
  },

  editor: {
    newTitle: 'Uusi kalustoyksikkö',
    dataTab: 'Tiedot',
    functionsTab: 'Toiminnot',
    photo: 'Kuva',
    takePhoto: 'Ota kuva',
    choosePhoto: 'Valitse kuva',
    removePhoto: 'Poista kuva',
    cameraDenied:
      'Sovelluksella ei ole lupaa käyttää kameraa. Salli se puhelimen asetuksista tai valitse kuva galleriasta.',
    photoFailed: 'Kuvaa ei voitu tallentaa.',
    name: 'Nimi',
    address: 'Osoite (1–10239)',
    speedSteps: 'Nopeusportaat',
    maxSpeed: 'Huippunopeus (km/h)',
    acceleration: 'Kiihtyvyys (km/h sekunnissa)',
    accelerationHint:
      'Ajokahvatilassa kalustoyksikkö kiihtyy ja jarruttaa tällä nopeudella.',
    speedDisplay: 'Näytä nopeus',
    speedDisplays: {kmh: 'km/h', step: 'Nopeusporras', mph: 'mph'},
    notes: 'Muistiinpanot',
    details: 'Lisätietoja',
    fullName: 'Koko nimi',
    railway: 'Rautatie / liikennöitsijä',
    articleNumber: 'Tuotenumero',
    decoderType: 'Dekooderi',
    buildYear: 'Valmistusvuosi',
    save: 'Tallenna',
    cancel: 'Peruuta',
    duplicate: 'Monista',
    delete: 'Poista kalustoyksikkö',
    deleteTitle: 'Poistetaanko kalustoyksikkö?',
    deleteMessage: (name: string) =>
      `”${name}” sekä sen toiminnot ja kuva poistetaan. Tätä ei voi perua.`,
    deleteConfirm: 'Poista',
    keep: 'Säilytä',
    discardTitle: 'Hylätäänkö muutokset?',
    discardMessage: 'Kalustoyksikköön tehtyjä muutoksia ei ole tallennettu.',
    discard: 'Hylkää',
    keepEditing: 'Jatka muokkausta',
    copyName: (name: string) => `${name} (kopio)`,
    notFound: 'Tätä kalustoyksikköä ei ole enää.',
    saveFailed: 'Kalustoyksikköä ei voitu tallentaa.',
    functionsHint:
      'Muuta toimintoa napauttamalla sitä, tai lisää toiminto napauttamalla tyhjää paikkaa. Sivut ovat samat kuin ajonäkymässä.',
    problems: {
      nameMissing: 'Anna nimi.',
      addressInvalid: 'Anna osoite väliltä 1–10239.',
      maxSpeedInvalid: 'Anna huippunopeus väliltä 1–500 km/h.',
      accelerationInvalid: 'Anna kiihtyvyys väliltä 0,1–100 km/h sekunnissa.',
      functionNumberInvalid: 'Toiminnon numeron on oltava väliltä 0–31.',
      functionNumberDuplicate:
        'Kutakin toimintonumeroa voi käyttää vain kerran.',
      functionSlotInvalid: 'Toiminto on toimintosivujen ulkopuolella.',
      functionSlotDuplicate: 'Kaksi toimintoa on samassa paikassa.',
    },
  },

  importer: {
    title: 'Tuonti Rocon Z21-sovelluksesta',
    menuEntry: 'Tuo Roco-sovelluksesta',
    intro:
      'Tee Rocon Z21-sovelluksessa vienti (export) ja siirrä .z21-tiedosto tähän laitteeseen, esimerkiksi tallentamalla se Tiedostoihin tai lähettämällä se sähköpostilla. Valitse tiedosto sitten tästä.',
    choose: 'Valitse vientitiedosto',
    reading: 'Luetaan tiedostoa…',
    invalid:
      'Tiedostoa ei voitu lukea. Valitse Rocon Z21-sovelluksesta viety .z21-tiedosto.',
    found: (file: string, locos: number, consists: number) =>
      `${file}: ${locos === 1 ? '1 kalustoyksikkö' : `${locos} kalustoyksikköä`} ja ${
        consists === 1 ? '1 moniajo' : `${consists} moniajoa`
      }.`,
    duplicatesTitle: (count: number) =>
      count === 1
        ? '1 kalustoyksikön osoite on jo kalustossasi'
        : `${count} kalustoyksikön osoite on jo kalustossasi`,
    allDuplicates: 'Kaikille kerralla',
    choices: {skip: 'Ohita', replace: 'Korvaa', keepBoth: 'Pidä molemmat'},
    choiceHints: {
      skip: 'Pidä oma kalustoyksikkösi; tätä ei tuoda.',
      replace: 'Korvaa oma kalustoyksikkösi tuodulla.',
      keepBoth: 'Tuo se uutena kalustoyksikkönä samalla osoitteella.',
    },
    existing: (name: string) => `Kalustossasi: ${name}`,
    wagon: 'Vaunu, tuodaan kalustoyksikkönä',
    summary: (
      added: number,
      replaced: number,
      skipped: number,
      consists: number,
    ) =>
      `Kalustoyksiköitä lisätään ${added}, korvataan ${replaced} ja ohitetaan ${skipped}. Moniajoja lisätään ${consists}.`,
    stepsNote:
      'Roco-sovellus ei tallenna nopeusportaita, joten tuodut kalustoyksiköt saavat 128 porrasta. Voit muuttaa tämän kunkin kalustoyksikön tiedoista.',
    start: 'Tuo',
    importing: 'Tuodaan… Jos kuvia on paljon, tämä voi kestää noin minuutin.',
    doneTitle: 'Tuonti valmis',
    done: (
      added: number,
      replaced: number,
      skipped: number,
      consists: number,
    ) =>
      `Kalustoyksiköitä lisätty ${added}, korvattu ${replaced} ja ohitettu ${skipped}. Moniajoja lisätty ${consists}.`,
    problemsTitle: 'Tuomatta jääneet tai muutetut',
    issues: {
      invalidAddress: (name: string, address: number | null) =>
        `${name}: osoite ${address ?? 'puuttuu'} ei ole kelvollinen DCC-osoite.`,
      unsupportedType: (name: string) =>
        `${name}: tämän tyyppistä kalustoa ei tueta.`,
      missingPhoto: (name: string) => `${name}: kuva puuttuu tiedostosta.`,
      unknownIcon: (name: string, icon: string) =>
        `${name}: toimintokuvake ”${icon}” on tuntematon, joten toiminto näytetään numerona.`,
      functionSkipped: (name: string, number: number) =>
        `${name}: toimintoa F${number} ei voitu sijoittaa.`,
      missingMember: (name: string) =>
        `${name}: moniajon kalustoyksikkö puuttuu tiedostosta.`,
      failed: (name: string) => `${name}: ei voitu tallentaa.`,
    },
    toLibrary: 'Näytä kalusto',
  },

  consistEditor: {
    newTitle: 'Uusi moniajo',
    name: 'Nimi',
    members: 'Kalustoyksiköt edestä taakse',
    membersHint:
      'Ensimmäinen kalustoyksikkö on johtava: sen toiminnot ja nopeus näytetään ajettaessa.',
    addMember: 'Lisää kalustoyksikkö',
    chooseMember: 'Valitse lisättävä kalustoyksikkö',
    noLocosLeft: 'Koko kalusto on jo tässä moniajossa.',
    reversed: 'Kytketty toisin päin',
    reversedHint:
      'Tämä kalustoyksikkö ajaa muihin nähden vastakkaiseen suuntaan.',
    speedOffset: 'Nopeusero',
    speedOffsetValue: (offset: number, steps: number) =>
      `${offset > 0 ? '+' : ''}${offset} / ${steps} nopeusporrasta`,
    speedOffsetHint:
      'Tekee tästä kalustoyksiköstä hieman nopeamman tai hitaamman, jotta kaikki kulkevat samaa nopeutta. Ei koskaan liikuta seisovaa junaa.',
    slower: 'Hitaammin',
    faster: 'Nopeammin',
    slowerSymbol: '−',
    fasterSymbol: '+',
    moveUp: 'Siirrä junassa eteenpäin',
    moveDown: 'Siirrä junassa taaksepäin',
    removeMember: 'Poista moniajosta',
    delete: 'Poista moniajo',
    deleteTitle: 'Poistetaanko moniajo?',
    deleteMessage: (name: string) =>
      `”${name}” poistetaan. Sen kalustoyksiköt jäävät kalustoon.`,
    notFound: 'Tätä moniajoa ei ole enää.',
    problems: {
      nameMissing: 'Anna nimi.',
      membersMissing: 'Lisää vähintään yksi kalustoyksikkö.',
      memberDuplicate: 'Sama kalustoyksikkö voi olla moniajossa vain kerran.',
      offsetInvalid: 'Nopeuseron on oltava väliltä −30…+30.',
    },
  },

  functionEditor: {
    title: (number: number) => `Toiminto F${number}`,
    addHere: 'Lisää toiminto tähän',
    number: 'Toiminnon numero (0–31)',
    numberTaken: 'Tämä numero on jo toisen toiminnon käytössä.',
    name: 'Nimi (valinnainen)',
    icon: 'Kuvake',
    momentary: 'Hetkellinen',
    momentaryHint:
      'Päällä vain niin kauan kuin painiketta painetaan, esim. äänimerkki.',
    remove: 'Poista toiminto',
    done: 'Valmis',
    allNumbersUsed: 'Kaikki 32 toimintonumeroa ovat käytössä.',
  },

  functionIcons: {
    none: 'Pelkkä numero',
    light: 'Valot',
    headlight: 'Ajovalot',
    lowBeam: 'Himmennetyt valot',
    tailLight: 'Takavalot',
    cabLight: 'Ohjaamon valot',
    interiorLight: 'Sisävalaistus',
    sound: 'Ääni',
    horn: 'Torvi',
    whistle: 'Pilli',
    bell: 'Kello',
    announcement: 'Kuulutus',
    music: 'Musiikki',
    mute: 'Mykistys',
    volumeUp: 'Äänenvoimakkuus +',
    volumeDown: 'Äänenvoimakkuus −',
    engine: 'Moottori',
    brake: 'Jarru',
    compressor: 'Kompressori',
    fan: 'Tuuletin',
    sand: 'Hiekoitus',
    smoke: 'Savu',
    steam: 'Höyry',
    pantograph: 'Virroitin',
    doorOpen: 'Ovet auki',
    doorClose: 'Ovet kiinni',
    couple: 'Kytkentä',
    uncouple: 'Irrotus',
    shunting: 'Vaihtotyö',
    momentum: 'Ajohitaus',
    crane: 'Nosturi',
    rotateLeft: 'Käännä vasemmalle',
    rotateRight: 'Käännä oikealle',
    up: 'Ylös',
    down: 'Alas',
    wiper: 'Pyyhkimet',
    generic: 'Muu',
  },

  connection: {
    connected: 'Yhdistetty',
    connecting: 'Yhdistetään…',
    reconnecting: 'Keskusyksikkö ei vastaa, yritetään uudelleen…',
    disconnected: 'Ei yhteyttä',
    connectedShort: 'Yhteys',
    connectingShort: 'Odota',
    disconnectedShort: 'Irti',
    localNetworkDenied:
      'Throttle ei saa käyttää paikallisverkkoa, joten se ei tavoita keskusyksikköä. Salli Throttlelle ”Lähellä olevat laitteet” tai paikallisverkon käyttö puhelimen asetuksista.',
    openSettings: 'Avaa asetukset',
    locked:
      'Tämä z21 start on lukittu. Sovelluksilla ajamiseen tarvitaan Rocon Z21 WLAN -avauskoodi.',
  },

  stop: {
    label: 'STOP',
    accessibilityHint: {
      emergencyStopThenPowerOff:
        'Pysäyttää kaikki junat. Kaksi nopeaa napautusta katkaisee myös ajovirran.',
      emergencyStopOnly: 'Pysäyttää kaikki junat. Ajovirta pysyy päällä.',
      powerOff: 'Katkaisee ajovirran.',
    },
    notConnected: 'Ei yhteyttä: STOP ei tavoita rataa.',
  },

  track: {
    normal: 'Ajovirta päällä',
    emergencyStop: 'Hätäpysäytys: kaikki junat pysäytetty',
    powerOff: 'Ajovirta on katkaistu',
    shortCircuit: 'OIKOSULKU: ajovirta on katkaistu',
    programming: 'Ohjelmointitila',
    unknown: 'Radan tila ei tiedossa',
    short: {
      emergencyStop: 'SEIS',
      powerOff: 'POIS',
      shortCircuit: 'OIKOSULKU',
      programming: 'OHJ.',
    },
    resumeHint: 'Jatka napauttamalla. Junat jatkavat aiemmilla nopeuksillaan.',
    powerOnHint:
      'Kytke ajovirta napauttamalla. Junat jatkavat aiemmilla nopeuksillaan.',
  },

  drive: {
    title: 'Aja',
    loco: 'Kalustoyksikkö',
    address: 'Osoite',
    speedStep: 'Porras',
    of: '/',
    speed: 'Nopeus',
    setForward: 'Aja eteenpäin',
    setReverse: 'Aja taaksepäin',
    locoStop: 'STOP',
    locoStopHint: 'Pysäyttää tämän kalustoyksikön heti.',
    waitingForLoco: 'Odotetaan keskusyksikköä…',
    shared: 'Ohjataan myös muualta',
    sharedHint: 'Myös toinen ajosäädin ohjaa tätä kalustoyksikköä.',
    functions: 'Toiminnot',
    function: 'Toiminto',
    functionLetter: 'F',
    chooseLoco: 'Valitse kalustoyksikkö',
    chooseLocoTitle: 'Osoite',
    speedSteps: 'Nopeusportaat',
    invalidAddress: 'Anna osoite väliltä 1–10239.',
    use: 'Aja',
    cancel: 'Peruuta',
    addressPrefix: '#',
    pages: ['C I', 'C II', 'C III'],
    pageRange: (first: number, last: number) =>
      `C ${['I', 'II', 'III'][first]}–${['I', 'II', 'III'][last]}`,
    page: (number: number) => `Toimintosivu ${number}`,
    speedUnits: {kmh: 'km/h', mph: 'mph'},
    library: 'Valitse kalustosta',
    recent: 'Viimeksi ajetut',
    allVehicles: 'Koko kalusto',
    switchTo: (name: string) => `Aja: ${name}`,
    current: 'Ajossa nyt',
    addressOnly: (address: number) => `Osoite ${address}`,
    changeAddressHint: 'Avaa ikkunan, jossa voit vaihtaa osoitteen.',
    powerHandle: 'Ajokahva',
    handleState: (percent: number) =>
      percent > 0
        ? `Veto ${percent} %`
        : percent < 0
          ? `Jarrutus ${-percent} %`
          : 'Rullaus',
    noLoco: 'Tälle ajosäätimelle ei ole valittu kalustoyksikköä.',
    consistEmpty:
      'Tässä moniajossa ei ole kalustoyksiköitä. Lisää niitä Kalusto-näkymässä.',
    members: 'Moniajon kalustoyksiköt',
    memberFunctions: (name: string) => `Näytä toiminnot: ${name}`,
    conflictTitle: 'Kalustoyksikkö on jo ajossa',
    conflictMessage: (addresses: number[]) =>
      `${addresses.length === 1 ? 'Kalustoyksikkö' : 'Kalustoyksiköt'} ${addresses.join(', ')} ${
        addresses.length === 1 ? 'on' : 'ovat'
      } myös toisella ajosäätimellä. Jos kalustoyksikköä ajetaan samaan aikaan yksin ja moniajossa, se voi kulkea väärään suuntaan.`,
    driveAnyway: 'Aja silti',
  },

  settings: {
    title: 'Asetukset',
    connectionSection: 'Keskusyksikkö',
    host: 'IP-osoite',
    port: 'Portti',
    connect: 'Yhdistä',
    disconnect: 'Katkaise yhteys',
    status: 'Tila',
    device: 'Laite',
    firmware: 'laiteohjelmisto',
    deviceUnknown: 'Ei tiedossa',
    invalidPort: 'Anna portti väliltä 1–65535.',
    stopSection: 'STOP-painike',
    stopModes: {
      emergencyStopThenPowerOff: {
        title: 'Hätäpysäytys, kaksoisnapautus: virta pois',
        detail:
          'Yksi napautus pysäyttää kaikki junat. Kaksi nopeaa napautusta katkaisee myös ajovirran.',
      },
      emergencyStopOnly: {
        title: 'Vain hätäpysäytys',
        detail: 'Pysäyttää kaikki junat. Ajovirta pysyy päällä.',
      },
      powerOff: {
        title: 'Ajovirta pois',
        detail: 'Jokainen napautus katkaisee ajovirran.',
      },
    },
    driveModeSection: 'Ajotapa',
    driveModes: {
      speed: {
        title: 'Nopeuden säätö',
        detail: 'Liukusäädin asettaa nopeuden suoraan.',
      },
      powerHandle: {
        title: 'Ajokahva',
        detail:
          'Keskellä rullaus, ylhäällä veto, alhaalla jarrutus, kunkin kalustoyksikön kiihtyvyydellä. STOP toimii samoin kuin muutenkin.',
      },
    },
    vehicleBarSection: 'Ajonäkymän alapalkki',
    vehicleBarModes: {
      recent: {
        title: 'Viimeksi ajetut',
        detail: 'Viimeksi ajettu kalustoyksikkö ensimmäisenä.',
      },
      all: {
        title: 'Koko kalusto',
        detail: 'Kaikki kalustoyksiköt samassa järjestyksessä kuin kalustossa.',
      },
    },
    languageSection: 'Kieli',
    languageSystem: (language: string) => `Puhelimen kieli (${language})`,
    developerSection: 'Kehittäjille',
    connectionTest: 'Yhteystesti ja protokollaloki',
  },

  hardware: {
    0x200: 'Z21 (musta, 2012)',
    0x201: 'Z21 (musta, 2013)',
    0x202: 'SmartRail',
    0x203: 'z21 (valkoinen)',
    0x204: 'z21 start',
    0x211: 'Z21 XL',
    unknown: 'Tuntematon keskusyksikkö',
  },

  debug: {
    title: 'Yhteystesti',
    host: 'Keskusyksikön IP-osoite',
    hostHint:
      'Android-emulaattori: käytä osoitetta 10.0.2.2 tavoittaaksesi tämän tietokoneen palvelimen.',
    port: 'Portti',
    connect: 'Yhdistä',
    disconnect: 'Katkaise',
    connection: 'Yhteys',
    track: 'Rata',
    device: 'Keskusyksikkö',
    deviceUnknown: 'Ei laitetietoja',
    firmware: 'laiteohjelmisto',
    lockCode: 'lukituskoodi',
    requestStatus: 'Kysy tila',
    powerOn: 'Ajovirta päälle',
    powerOff: 'Ajovirta pois',
    stop: 'STOP',
    loco: 'Kalustoyksikkö',
    locoAddress: 'Kalustoyksikön osoite',
    watch: 'Seuraa',
    noLocoInfo: 'Ei kalustoyksikön tietoja',
    reverse: 'Vaihda suuntaa',
    light: 'F0',
    locoStop: 'Kalustoyksikön pysäytys',
    busy: 'varattu',
    log: 'Protokollaloki',
    logEnabled: 'Kirjaa datasetit',
    clearLog: 'Tyhjennä loki',
  },
};
