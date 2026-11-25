# Throttle: asennus ja käytön aloitus

Throttle on sovellus, jolla ajetaan pienoisrautatien junia puhelimella tai tabletilla. Se
yhdistää radan Roco Z21 -keskusyksikköön radan Wi-Fi-verkon kautta.

- Tunnusta ei tarvita, eikä sovellus käytä internetiä.
- Veturit, kuvat ja asetukset tallentuvat vain omaan puhelimeesi.
- Kerro, jos jokin toimii oudosti (ks. ohjeen loppu).
- Sovellus on suomeksi, jos puhelimen kieli on suomi (muuten englanniksi). Kielen voi vaihtaa
  asetuksista. Tässä ohjeessa painikkeiden nimet on kirjoitettu englanninkielisen sovelluksen
  mukaan, **lihavoituna**.

Siirry oman puhelimesi kohtaan: [Android](#android) · [iPhone ja iPad](#iphone-ja-ipad)

## Android

Throttle ei ole Google Play -kaupassa, vaan se ladataan projektin GitHub-sivulta. Se on turvallista,
mutta Android pyytää vahvistamaan asian muutaman kerran.

### Asennus

1. Avaa puhelimella tämä sivu: **<linkki julkaisusivulle>**
2. Napauta uusimman version kohdalta tiedostoa **`throttle-…apk`**. Puhelin lataa sen.
3. Avaa ladattu tiedosto: napauta ilmoitusta latauksen valmistumisesta, tai avaa **Tiedostot**
   (Files) -sovellus ja katso kansiosta **Lataukset** (Downloads).
4. Android ilmoittaa, ettei tästä lähteestä saa asentaa sovelluksia. Napauta **Asetukset**
   (Settings), laita päälle **Salli tästä lähteestä** (Allow from this source) ja palaa takaisin.
5. Napauta **Asenna** (Install).
6. Google Play Protect saattaa varoittaa tuntemattomasta sovelluksesta. Napauta **Lisätietoja**
   (More details) ja sitten **Asenna silti** (Install anyway). Sanamuodot vaihtelevat hieman
   puhelimesta toiseen. Varoitus on tavallinen sovelluksille, jotka eivät ole Play-kaupassa.
7. Avaa **Throttle**.

### Ensimmäinen käynnistys

Android 17:ssä ja uudemmissa sovellus kysyy lupaa löytää lähellä olevia laitteita ja yhdistää
niihin. Napauta **Salli** (Allow). Sovellus tarvitsee luvan tavoittaakseen keskusyksikön
Wi-Fi-verkossa. Vanhemmat Android-versiot eivät kysy.

Jos napautit vahingossa **Älä salli** (Don't allow), sovellus näyttää tumman palkin, jossa on
painike **Open settings**. Napauta sitä, valitse **Käyttöoikeudet → Lähellä olevat laitteet →
Salli** (Permissions → Nearby devices → Allow) ja palaa sovellukseen.

### Päivittäminen

Kun uusi versio ilmestyy, lataa se samalta sivulta ja asenna samalla tavalla. Se asentuu vanhan
päälle, ja veturit ja asetukset säilyvät.

**Älä poista sovellusta ennen päivitystä.** Poistaminen hävittää veturit ja kuvat.

## iPhone ja iPad

Throttle asennetaan **TestFlightin** kautta (Applen sovellus uusien sovellusten testaamiseen) tai
App Storesta linkin kautta (hakemalla sitä ei löydä).

### Asennus TestFlightilla

1. Avaa kutsulinkki: **<TestFlight-linkki>**
2. Jos puhelimessa ei vielä ole **TestFlight**-sovellusta, sivu ohjaa App Storeen hakemaan sen.
   Asenna se ja avaa linkki uudelleen.
3. Napauta TestFlightissa **Accept** ja sitten **Install**.
4. Avaa **Throttle**.

TestFlight päivittää sovelluksen, kun uusi versio tulee (tai näyttää **Update**-painikkeen).
Testiversio lakkaa toimimasta 90 päivän jälkeen; asenna silloin uudempi TestFlightista.

### Ensimmäinen käynnistys

Sovellus kysyy, saako se etsiä ja yhdistää paikallisverkon laitteisiin. Napauta **Salli**
(Allow). Ilman lupaa sovellus ei tavoita keskusyksikköä, eikä iPhone kerro syytä.

Jos napautit **Älä salli** (Don't Allow): avaa iPhonen **Asetukset → Tietosuoja ja turvallisuus →
Paikallisverkko** ja laita **Throttle** päälle.

Sovellus pyytää lupaa kameraan tai kuviin vasta, kun lisäät veturille kuvan.

## Yhdistäminen rataan

1. Yhdistä puhelin **radan Wi-Fi-verkkoon**. Verkon nimen ja salasanan saat radan ylläpitäjältä.
2. Radan verkossa ei ole internetiä. Puhelin voi ilmoittaa **Ei internetyhteyttä** tai tarjota
   vaihtoa mobiilidataan tai toiseen verkkoon. Valitse, että **pysyt** radan verkossa.
3. Avaa Throttle. Oikeassa yläkulmassa näkyy:
   - **Online** (vihreä): yhteys on. Voit ajaa.
   - **Weak** (keltainen): yhteys on, mutta radan Wi-Fi-verkossa katoaa viestejä. Voit silti
     ajaa.
   - **Wait**: yhdistetään.
   - **Offline** (punainen): ei yhteyttä.
4. Jos tila pysyy **Offline**-tilassa, napauta yhteyden tilaa (tai **Menu → Settings**).
   Tarkista, että **IP address** on keskusyksikön osoite, ja napauta **Connect**. Rocon
   oletusosoite on `192.168.0.111`.

## Ajaminen

- Avaa **Menu → Drive**.
- **Liukusäädin** säätää nopeuden. Veturin kuvan molemmin puolin olevat **nuolet** vaihtavat
  suunnan: korostettu nuoli näyttää, mihin suuntaan veturi kulkee.
- **Toimintopainikkeet** (valot, äänet …) ovat vasemmalla. Lisää löytyy napauttamalla **C I,
  C II, C III**.
- Veturin oma **STOP** pysäyttää vain sen veturin.
- Toisen veturin valitset napauttamalla vasemman alakulman **ruudukkopainiketta**. Äskettäin
  ajetut veturit ovat näytön alareunassa.
- Ajatko veturia pelkällä osoitteella (**Vehicles → Drive by address**)? Vaihda osoite
  napauttamalla sitä kuvan alla.

### Ajokahva (Power handle)

Jos haluat ajaa kuin oikealla junalla, valitse **Menu → Settings → Drive mode → Power handle**.
Liukusäädin toimii silloin kuin veturin ajokahva:

- **Keskellä:** rullaus. Juna pitää nopeutensa. Kun juna seisoo, näytössä lukee
  **Pysähdyksissä**.
- **Ylös:** kiihdytys. Mitä ylempänä, sitä nopeammin juna kiihtyy.
- **Alas:** jarrutus. Mitä alempana, sitä voimakkaammin juna jarruttaa, pysähdykseen asti.

Kunkin kalustoyksikön kiihtyvyyden ja hidastuvuuden voit asettaa sen tiedoista kohdista
**Kiihtyvyys** ja **Hidastuvuus** (**Kalusto**-näkymässä; oletus 5 km/h sekunnissa).
STOP-painikkeet toimivat kuten ennenkin, ja kahva palaa keskelle pysäytyksen jälkeen.

### Punainen STOP ylhäällä

Yläpalkin keskellä oleva punainen **STOP** pysäyttää **kaikki** radan junat heti.

- **Yksi napautus:** kaikki junat pysähtyvät. Ajovirta pysyy päällä.
- **Kaksi nopeaa napautusta:** kaikki junat pysähtyvät, ja myös **ajovirta katkaistaan**.
- Kun junat ovat pysähdyksissä, STOPin paikalle tulee värillinen merkki: **STOPPED** (keltainen,
  kaikki junat pysäytetty), **OFF** (sininen, ajovirta pois) tai **SHORT** (punainen,
  oikosulku). Jatka **napauttamalla tätä merkkiä**. Junat jatkavat samoilla nopeuksilla kuin
  ennen.

Sovellus ei koskaan kysy STOPista "oletko varma?", vaan toimii heti.

### Asetukset

Kohdassa **Menu → Settings** voit myös valita, mitä ajonäkymän alareunan palkki näyttää
(**Recently driven** eli äskettäin ajetut, tai **All vehicles** eli kaikki ajoneuvot
ajoneuvoluettelon järjestyksessä), sekä kielen.

## Veturien tuonti Rocon Z21-sovelluksesta

Jos olet käyttänyt Rocon Z21-sovellusta, voit siirtää veturit, kuvat, toimintopainikkeet ja
veturiyhdistelmät (consists) Throttleen.

1. Vie (export) Rocon Z21-sovelluksessa ratasi ja tallenna **`.z21`**-tiedosto puhelimeen.
   iPhonessa valitse **Tallenna Tiedostoihin** (Save to Files).
2. Avaa Throttlessa **Menu → Vehicles → Import from Roco app → Choose export file** ja valitse
   tiedosto.
3. Sovellus näyttää, montako veturia se löysi. Jos samalla osoitteella oleva veturi on jo
   Throttlessa, valitse **Skip** (ohita), **Replace** (korvaa) tai **Keep both** (pidä
   molemmat).
4. Napauta **Import**. Jos kuvia on paljon, tämä voi kestää noin minuutin.

Rocon vientitiedostossa ei ole nopeusportaita, joten tuodut veturit saavat 128 porrasta. Voit
muuttaa tämän kunkin veturin kohdalta **Vehicles**-näkymässä.

## Jos jokin ei toimi

| Mitä näet                                                       | Mitä teet                                                                                                                                            |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Weak** usein                                                  | Radan Wi-Fi on ruuhkainen tai signaali heikko. Ajaminen toimii silti; sovellus toistaa kadonneet käskyt. Siirry lähemmäs Wi-Fi-tukiasemaa, jos voit. |
| **Offline** tai **Wait** koko ajan                              | Onko puhelin **radan** Wi-Fi-verkossa (ei mobiilidatalla, ei kodin verkossa)? Onko keskusyksikkö päällä? Onko Settingsin IP-osoite oikein?           |
| Tumma palkki "Throttle may not use the local network" (Android) | Napauta **Open settings → Käyttöoikeudet → Lähellä olevat laitteet → Salli**.                                                                        |
| iPhonessa mikään ei yhdistä, eikä virheilmoitusta tule          | **Asetukset → Tietosuoja ja turvallisuus → Paikallisverkko → Throttle** päälle.                                                                      |
| Palkki "This z21 start is locked"                               | Keskusyksikön lukitus pitää avata sovelluksilla ajamista varten. Kerro radan ylläpitäjälle.                                                          |
| Punainen **SHORT**-merkki ylhäällä                              | Jokin radalla aiheuttaa oikosulun (usein suistunut vaunu). Poista syy ja kytke virta takaisin napauttamalla **SHORT**-merkkiä.                       |
| "Also driven elsewhere" veturin kohdalla                        | Joku muu ajaa samaa veturia. Se on sallittua; näet myös hänen muutoksensa.                                                                           |
| Tuonti ilmoittaa, ettei tiedostoa voi lukea                     | Valitse Rocon Z21-sovelluksesta viety `.z21`-tiedosto.                                                                                               |

Jotain muuta? Ilmoita siitä **<linkki GitHub Issuesiin>**. Kerro, mikä
puhelin sinulla on ja mitä tapahtui.
