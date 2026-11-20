import type {Strings} from '../strings';

// Finnish. Same keys as English in src/strings.ts.
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
    pickTitle: 'Valitse veturi',
    entries: (count: number) =>
      count === 1 ? '1 ajoneuvo' : `${count} ajoneuvoa`,
    search: 'Hae nimellä tai osoitteella',
    add: 'Lisää veturi',
    edit: 'Järjestä',
    done: 'Valmis',
    sortByName: 'Järjestä A–Ö',
    sortByAddress: 'Järjestä osoitteen mukaan',
    moveUp: 'Siirrä ylös',
    moveDown: 'Siirrä alas',
    empty: 'Ei vielä vetureita. Lisää ensimmäinen veturi +-painikkeella.',
    noMatches: 'Haulla ei löytynyt veturia.',
    driveByAddress: 'Aja osoitteella',
    addConsist: 'Lisää veturiyhdistelmä',
    consistBadge: 'Yhdistelmä',
    consistMembers: (count: number) =>
      count === 1 ? '1 veturi' : `${count} veturia`,
    loadError: 'Kalustoluetteloa ei voitu avata.',
    noPhoto: 'Ei kuvaa',
  },

  editor: {
    newTitle: 'Uusi veturi',
    dataTab: 'Tiedot',
    functionsTab: 'Toiminnot',
    photo: 'Kuva',
    takePhoto: 'Ota kuva',
    choosePhoto: 'Valitse kuva',
    removePhoto: 'Poista kuva',
    cameraDenied:
      'Sovellus ei saa käyttää kameraa. Salli se puhelimen asetuksista tai valitse kuva galleriasta.',
    photoFailed: 'Kuvaa ei voitu tallentaa.',
    name: 'Nimi',
    address: 'Osoite (1–10239)',
    speedSteps: 'Nopeusportaat',
    maxSpeed: 'Huippunopeus (km/h)',
    acceleration: 'Kiihtyvyys (km/h sekunnissa)',
    accelerationHint:
      'Käytetään ajokahvatilassa kiihdytykseen ja jarrutukseen.',
    speedDisplay: 'Näytä nopeus',
    speedDisplays: {kmh: 'km/h', step: 'Nopeusporras', mph: 'mph'},
    notes: 'Muistiinpanot',
    details: 'Lisätiedot',
    fullName: 'Koko nimi',
    railway: 'Rautatieyhtiö',
    articleNumber: 'Tuotenumero',
    decoderType: 'Dekooderi',
    buildYear: 'Valmistusvuosi',
    save: 'Tallenna',
    cancel: 'Peruuta',
    duplicate: 'Monista',
    delete: 'Poista veturi',
    deleteTitle: 'Poistetaanko veturi?',
    deleteMessage: (name: string) =>
      `”${name}” sekä sen toiminnot ja kuva poistetaan. Tätä ei voi perua.`,
    deleteConfirm: 'Poista',
    keep: 'Säilytä',
    discardTitle: 'Hylätäänkö muutokset?',
    discardMessage: 'Veturin muutoksia ei ole tallennettu.',
    discard: 'Hylkää',
    keepEditing: 'Jatka muokkausta',
    copyName: (name: string) => `${name} (kopio)`,
    notFound: 'Tätä veturia ei ole enää.',
    saveFailed: 'Veturia ei voitu tallentaa.',
    functionsHint:
      'Napauta toimintoa muuttaaksesi sitä tai tyhjää paikkaa lisätäksesi toiminnon. Sivut ovat samat kuin ajonäkymässä.',
    problems: {
      nameMissing: 'Anna nimi.',
      addressInvalid: 'Anna osoite väliltä 1–10239.',
      maxSpeedInvalid: 'Anna huippunopeus väliltä 1–500 km/h.',
      accelerationInvalid: 'Anna kiihtyvyys väliltä 0,1–100 km/h sekunnissa.',
      functionNumberInvalid: 'Toimintojen numerot ovat väliltä 0–31.',
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
      'Vie ratasi Rocon Z21-sovelluksessa ja jaa .z21-tiedosto tähän laitteeseen, esimerkiksi tallentamalla se Tiedostoihin tai lähettämällä se sähköpostilla. Valitse se sitten tästä.',
    choose: 'Valitse vientitiedosto',
    reading: 'Luetaan tiedostoa…',
    invalid:
      'Tiedostoa ei voitu lukea. Valitse Rocon Z21-sovelluksesta viety .z21-tiedosto.',
    found: (file: string, locos: number, consists: number) =>
      `${file}: ${locos === 1 ? '1 veturi' : `${locos} veturia`} ja ${
        consists === 1 ? '1 yhdistelmä' : `${consists} yhdistelmää`
      }.`,
    duplicatesTitle: (count: number) =>
      count === 1
        ? '1 veturin osoite on jo kalustossasi'
        : `${count} veturin osoite on jo kalustossasi`,
    allDuplicates: 'Kaikille',
    choices: {skip: 'Ohita', replace: 'Korvaa', keepBoth: 'Pidä molemmat'},
    choiceHints: {
      skip: 'Pidä oma veturisi; älä tuo tätä.',
      replace: 'Korvaa oma veturisi tuodulla.',
      keepBoth: 'Tuo se lisäveturina samalla osoitteella.',
    },
    existing: (name: string) => `Kalustossasi: ${name}`,
    wagon: 'Vaunu, tuodaan veturina',
    summary: (
      added: number,
      replaced: number,
      skipped: number,
      consists: number,
    ) =>
      `Lisätään ${added}, korvataan ${replaced} ja ohitetaan ${skipped} veturia sekä lisätään ${consists} ${
        consists === 1 ? 'yhdistelmä' : 'yhdistelmää'
      }.`,
    stepsNote:
      'Roco-sovellus ei tallenna nopeusportaita; uudet veturit saavat 128 porrasta. Voit muuttaa tämän veturikohtaisesti.',
    start: 'Tuo',
    importing: 'Tuodaan… Jos kuvia on paljon, tämä voi kestää minuutin.',
    doneTitle: 'Tuonti valmis',
    done: (
      added: number,
      replaced: number,
      skipped: number,
      consists: number,
    ) =>
      `${added} lisätty, ${replaced} korvattu, ${skipped} ohitettu, ${consists} ${
        consists === 1 ? 'yhdistelmä' : 'yhdistelmää'
      } lisätty.`,
    problemsTitle: 'Ei tuotu tai muutettu',
    issues: {
      invalidAddress: (name: string, address: number | null) =>
        `${name}: osoite ${address ?? 'puuttuu'} ei ole kelvollinen DCC-osoite.`,
      unsupportedType: (name: string) =>
        `${name}: tällaista ajoneuvoa ei tueta.`,
      missingPhoto: (name: string) => `${name}: kuva puuttuu tiedostosta.`,
      unknownIcon: (name: string, icon: string) =>
        `${name}: toiminnon kuvake ”${icon}” on tuntematon; näytetään numerona.`,
      functionSkipped: (name: string, number: number) =>
        `${name}: toimintoa F${number} ei voitu sijoittaa.`,
      missingMember: (name: string) =>
        `${name}: yhdistelmän veturi puuttuu tiedostosta.`,
      failed: (name: string) => `${name}: ei voitu tallentaa.`,
    },
    toLibrary: 'Näytä kalusto',
  },

  consistEditor: {
    newTitle: 'Uusi veturiyhdistelmä',
    name: 'Nimi',
    members: 'Veturit edestä taakse',
    membersHint:
      'Ensimmäinen veturi johtaa: sen toiminnot ja nopeus näytetään ajettaessa.',
    addMember: 'Lisää veturi',
    chooseMember: 'Valitse lisättävä veturi',
    noLocosLeft: 'Kaikki kaluston veturit ovat jo tässä yhdistelmässä.',
    reversed: 'Kytketty takaperin',
    reversedHint: 'Tämä veturi ajaa vastakkaiseen suuntaan.',
    speedOffset: 'Nopeusero',
    speedOffsetValue: (offset: number, steps: number) =>
      `${offset > 0 ? '+' : ''}${offset} / ${steps} nopeusporrasta`,
    speedOffsetHint:
      'Tekee tästä veturista hieman nopeamman tai hitaamman, jotta kaikki veturit kulkevat samaa nopeutta. Ei koskaan liikuta seisovaa junaa.',
    slower: 'Hitaammin',
    faster: 'Nopeammin',
    slowerSymbol: '−',
    fasterSymbol: '+',
    moveUp: 'Siirrä junassa eteenpäin',
    moveDown: 'Siirrä junassa taaksepäin',
    removeMember: 'Poista yhdistelmästä',
    delete: 'Poista yhdistelmä',
    deleteTitle: 'Poistetaanko yhdistelmä?',
    deleteMessage: (name: string) =>
      `”${name}” poistetaan. Sen veturit jäävät kalustoon.`,
    notFound: 'Tätä yhdistelmää ei ole enää.',
    problems: {
      nameMissing: 'Anna nimi.',
      membersMissing: 'Lisää vähintään yksi veturi.',
      memberDuplicate: 'Kukin veturi voi olla yhdistelmässä vain kerran.',
      offsetInvalid: 'Nopeuserojen on oltava väliltä −30…+30.',
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
      'Päällä vain niin kauan kuin painiketta pidetään, esim. äänimerkki.',
    remove: 'Poista toiminto',
    done: 'Valmis',
    allNumbersUsed: 'Kaikki 32 toimintonumeroa ovat käytössä.',
  },

  functionIcons: {
    none: 'Pelkkä numero',
    light: 'Valo',
    headlight: 'Etuvalot',
    lowBeam: 'Lähivalot',
    tailLight: 'Takavalot',
    cabLight: 'Ohjaamon valo',
    interiorLight: 'Sisävalaistus',
    sound: 'Ääni',
    horn: 'Äänitorvi',
    whistle: 'Pilli',
    bell: 'Kello',
    announcement: 'Kuulutus',
    music: 'Musiikki',
    mute: 'Mykistys',
    volumeUp: 'Kovemmalle',
    volumeDown: 'Hiljemmalle',
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
    couple: 'Kytke',
    uncouple: 'Irrota',
    shunting: 'Vaihtotyö',
    momentum: 'Hitaus',
    crane: 'Nosturi',
    rotateLeft: 'Käännä vasemmalle',
    rotateRight: 'Käännä oikealle',
    up: 'Ylös',
    down: 'Alas',
    wiper: 'Pyyhin',
    generic: 'Muu',
  },

  connection: {
    connected: 'Yhdistetty',
    connectingShort: 'Odota',
    connecting: 'Yhdistetään…',
    reconnecting: 'Keskusyksikkö ei vastaa, yritetään uudelleen…',
    disconnected: 'Ei yhteyttä',
    connectedShort: 'Yhteys',
    disconnectedShort: 'Irti',
    localNetworkDenied:
      'Throttle ei saa käyttää paikallisverkkoa, joten se ei tavoita keskusyksikköä. Salli Throttlelle ”Lähellä olevat laitteet” tai paikallisverkon käyttö puhelimen asetuksista.',
    openSettings: 'Avaa asetukset',
    locked:
      'Tämä z21 start on lukittu. Sovelluksilla ajaminen vaatii Rocon Z21 WLAN -avauskoodin.',
  },

  stop: {
    label: 'STOP',
    accessibilityHint: {
      emergencyStopThenPowerOff:
        'Pysäyttää kaikki junat. Napauta kahdesti nopeasti katkaistaksesi myös raidevirran.',
      emergencyStopOnly: 'Pysäyttää kaikki junat. Raidevirta pysyy päällä.',
      powerOff: 'Katkaisee raidevirran.',
    },
    notConnected: 'Ei yhteyttä: STOP ei tavoita rataa.',
  },

  track: {
    normal: 'Raidevirta päällä',
    emergencyStop: 'Hätäpysäytys: kaikki junat pysäytetty',
    powerOff: 'Raidevirta on pois päältä',
    shortCircuit: 'OIKOSULKU: raidevirta on pois päältä',
    programming: 'Ohjelmointitila',
    unknown: 'Radan tila tuntematon',
    short: {
      emergencyStop: 'SEIS',
      powerOff: 'POIS',
      shortCircuit: 'OIKOSULKU',
      programming: 'OHJ.',
    },
    resumeHint: 'Napauta jatkaaksesi. Junat jatkavat entisillä nopeuksillaan.',
    powerOnHint:
      'Napauta kytkeäksesi raidevirran. Junat jatkavat entisillä nopeuksillaan.',
  },

  drive: {
    title: 'Aja',
    loco: 'Veturi',
    address: 'Osoite',
    speedStep: 'Porras',
    of: '/',
    speed: 'Nopeus',
    setForward: 'Aja eteenpäin',
    setReverse: 'Aja taaksepäin',
    locoStop: 'STOP',
    locoStopHint: 'Pysäyttää tämän veturin heti.',
    waitingForLoco: 'Odotetaan keskusyksikköä…',
    shared: 'Ajetaan myös muualta',
    sharedHint: 'Toinen ohjain ajaa myös tätä veturia.',
    functions: 'Toiminnot',
    function: 'Toiminto',
    functionLetter: 'F',
    chooseLoco: 'Valitse veturi',
    chooseLocoTitle: 'Ajettava veturi',
    speedSteps: 'Nopeusportaat',
    invalidAddress: 'Anna osoite väliltä 1–10239.',
    use: 'Aja tällä veturilla',
    cancel: 'Peruuta',
    addressPrefix: '#',
    pages: ['C I', 'C II', 'C III'],
    pageRange: (first: number, last: number) =>
      `C ${['I', 'II', 'III'][first]}–${['I', 'II', 'III'][last]}`,
    page: (number: number) => `Toimintosivu ${number}`,
    speedUnits: {kmh: 'km/h', mph: 'mph'},
    library: 'Valitse kalustosta',
    recent: 'Äskettäin ajetut',
    allVehicles: 'Koko kalusto',
    switchTo: (name: string) => `Aja: ${name}`,
    current: 'Ajossa nyt',
    addressOnly: (address: number) => `Osoite ${address}`,
    changeAddressHint: 'Avaa ikkunan toisen osoitteen ajamiseen.',
    powerHandle: 'Ajo ja jarrutus',
    handleState: (percent: number) =>
      percent > 0
        ? `Ajo ${percent} %`
        : percent < 0
          ? `Jarru ${-percent} %`
          : 'Rullaus',
    noLoco: 'Tällä ajosäätimellä ei ole veturia.',
    consistEmpty:
      'Tässä yhdistelmässä ei ole vetureita. Lisää niitä Kalusto-näkymässä.',
    members: 'Yhdistelmän veturit',
    memberFunctions: (name: string) => `Näytä veturin ${name} toiminnot`,
    conflictTitle: 'Veturia ajetaan jo',
    conflictMessage: (addresses: number[]) =>
      `${addresses.length === 1 ? 'Veturi' : 'Veturit'} ${addresses.join(', ')} ${
        addresses.length === 1 ? 'on' : 'ovat'
      } myös toisella ajosäätimellä. Jos veturia ajetaan yhtä aikaa yksin ja yhdistelmässä, se voi kulkea väärään suuntaan.`,
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
    deviceUnknown: 'Ei ilmoitettu',
    invalidPort: 'Anna portti väliltä 1–65535.',
    stopSection: 'STOP-painike',
    stopModes: {
      emergencyStopThenPowerOff: {
        title: 'Hätäpysäytys, kaksoisnapautus: virta pois',
        detail:
          'Yksi napautus pysäyttää kaikki junat. Kaksi nopeaa napautusta katkaisee myös raidevirran.',
      },
      emergencyStopOnly: {
        title: 'Vain hätäpysäytys',
        detail: 'Pysäyttää kaikki junat. Raidevirta pysyy päällä.',
      },
      powerOff: {
        title: 'Raidevirta pois',
        detail: 'Jokainen napautus katkaisee raidevirran.',
      },
    },
    driveModeSection: 'Ajotapa',
    driveModes: {
      speed: {
        title: 'Nopeussäädin',
        detail: 'Liukusäädin asettaa nopeuden suoraan.',
      },
      powerHandle: {
        title: 'Ajokahva',
        detail:
          'Keskellä rullaus, ylös kiihdytys, alas jarrutus, kunkin veturin kiihtyvyydellä. STOP toimii kuten ennenkin.',
      },
    },
    vehicleBarSection: 'Ajonäkymän kalustopalkki',
    vehicleBarModes: {
      recent: {
        title: 'Äskettäin ajetut',
        detail: 'Viimeksi ajettu ajoneuvo on ensimmäisenä.',
      },
      all: {
        title: 'Koko kalusto',
        detail: 'Kaikki ajoneuvot kalustoluettelon järjestyksessä.',
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
      'Android-emulaattori: käytä osoitetta 10.0.2.2 tämän tietokoneen palvelimeen.',
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
    powerOn: 'Raidevirta päälle',
    powerOff: 'Raidevirta pois',
    stop: 'STOP',
    loco: 'Veturi',
    locoAddress: 'Veturin osoite',
    watch: 'Seuraa',
    noLocoInfo: 'Ei veturitietoja',
    reverse: 'Vaihda suuntaa',
    light: 'F0',
    locoStop: 'Veturin pysäytys',
    busy: 'varattu',
    log: 'Protokollaloki',
    logEnabled: 'Kirjaa datasetit',
    clearLog: 'Tyhjennä loki',
  },
};
