# Sanal Salon — çalışma notları (Claude için)

Kullanıcı: Kral. Dil: Türkçe. Proje, evin 3D sanal kopyası; önce salon (boya/badana mockup'ı), sonra her oda ve en sonda tüm ev.

## Depo yapısı
- `src/index.template.html`: sayfa iskeleti (`@@STYLE@@`, `@@MODELS@@`, `@@SCRIPT@@` yer tutucuları)
- `src/styles.css`: stiller
- `src/js/NN-*.js`: tek bir IIFE'nin parçaları; `src/build.json` içindeki sırayla **art arda eklenir** (modül değil, aynı kapsamı paylaşırlar)
- `src/models/<id>.glb`: küçültülmüş GLB'ler (her biri 2–3 MB). Ham Meshy dosyaları (yüzlerce MB) depoya girmez (`originals/`, `.gitignore`)
- `build.py`: her şeyi `dist/sanal-salon.html` tek dosyasına birleştirir, GLB'leri base64 ile gömer
- `tools/`: GLB küçültme ve test betikleri (`tools/README.md`)
- `dist/` git'e girmez; çıktı her zaman `build.py` ile üretilir

## Çalıştırma ve test
- `python3 build.py --local-three` → `dist/dev.html`
- `npm install` (three@0.128.0 `node_modules`'a iner), `pip install -r requirements.txt`, `playwright install chromium`
- `python3 tools/test/screenshot.py --views "Koltuktan,Kuş bakışı" --tab "Ölçüler"` başsız Chromium'da açar, sayfa hatalarını yazar ve `shots/` altına ekran görüntüsü alır. Yazılım WebGL yavaştır, gerekirse `--size 1000x640` kullan.
- Değişiklikten sonra mutlaka bu testi çalıştır ve görüntüye bak; sadece sözdizimi kontrolü yetmez.

## Kısıtlar (yayın ortamı)
Sayfa claude.ai'da artifact olarak yayınlanıyor (link: https://claude.ai/artifact/CcNLjWS5gHzVAf4bHXHvSs). Claude Code'da Artifact aracı yok; `dist/sanal-salon.html` dosyasını chat'te yayınlatmak gerekir. Bu yüzden yayın uyumunu bozma:
- Harici script sadece `cdnjs.cloudflare.com` ve `cdn.jsdelivr.net/npm/` üzerinden, **sabit sürümle** (three **r128**; yeni sürüme geçme, `three.min.js` global `THREE` bekleniyor).
- Başka siteye ağ isteği yok. `localStorage` ve `IndexedDB` çalışıyor.
- Toplam dosya boyutu 16 MB sınırının altında, hedef yaklaşık 10 MB (şu an 8,9 MB, çoğu GLB).
- Meshopt/Draco sıkıştırma kullanma (wasm). `KHR_mesh_quantization` r128'de çalışıyor.

## Önemli kodlama bilgileri
- Birimler: sahnede metre, arayüzde cm. `M(cm)` dönüştürür.
- Oda: `07-geometri.js` içindeki `buildRoom()`. Oda ölçüleri `DIM_DEFAULT` (`01-temel.js`) içinde, `state.dims` olarak saklanır: pencere/kapı/kolon/oda eni-boyu/tavan. Ölçüler sekmesindeki **kroki** (`15-arayuz.js`, `planSvg`) bu değerleri düzenletir ve "Odayı yeniden çiz" ile `buildRoom()` çalışır.
- Kayıtlı durum `localStorage` anahtarı `sanal-salon-v1`. Varsayılan ölçüleri değiştirirsen `dimsVer` değerini (`02-durum.js`, iki yer) artır, yoksa kullanıcının eski kayıtlı ölçüleri geçerli kalır.
- Eşyalar: `10-esyalar.js` içinde `BUILTIN` listesi (yer tutucu geometrisi + varsayılan konum, `movable`). Gerçek Meshy modelleri `12-gomulu-modeller.js` içindeki `EMBEDDED` listesindeki kayıtla, yüklenince yer tutucunun yerine geçer (`w`, `d`, `h` cm cinsinden m olarak; `elev` yerden yükseklik, `noShadow`). Modeli gömmek için `src/models/<id>.glb` + `src/build.json` `order` listesi.
- GLB yükleyici: `11-glb-iceaktarma.js` (r128 `GLTFLoader`; `createImageBitmap` kapatılıyor, doku yüklemesi için).
- Duvara bitişik eşyalar (`tvduvar`, `radyator`, `saat`, `tvunite`) oda eni değişince `rebuildWallItems` ile kayar.
- Oda yönleri: x=0 sol duvar (koltuk arkası), x=oda eni TV duvarı (stucco), z=0 yemek köşesi tarafı (iç duvar), z=oda boyu tuğla duvar. Kapı duvarı x=363 cm'de.

## Boya modülü hakkında (kaldırma planı)
Boya/badana işi tüm odalarda bitince boya modülü kaldırılacak. Boya ile ilgili parçalar:
- `src/js/01b-boya-verisi-BOYA.js`: Polisan kartela (`PALETTE`), `STUCCO`, `BRICK_OPTS`, `GROUPS`, `PRESETS`
- `src/js/09-renk-uygulama-BOYA.js`
- `08-isiklar.js` içinde `reflectance()` (ışık yansıtma ölçeri)
- `15-arayuz.js` içinde Renk sekmesi: `renderPresets`, `renderWallChips`, `renderWallCtrl`, `renderPalette`, `updateMeter`, kartela fotoğrafı penceresi
- `index.template.html` içinde Renk sekmesi ve kartela fotoğrafı penceresi
- `06-malzemeler.js` içinde duvar malzemesinin üst/alt renk (lambri) gölgelendiricisi

**Dikkat:** Boya modülü duvar durumuna (`state.walls`) ve `defaultState()` içine bağlı; sadece dosya silmek yetmez. Kaldırma, "dondurma" refaktörüdür: her duvarın seçilen **son rengi** sabit olarak yazılır, palet/öntanım/arayüz silinir. Modülün koda ve veriye maliyeti birkaç on KB; sayfanın asıl ağırlığı GLB modeller. Kaldırmanın amacı sade bir 3D ev bırakmak, boyut tasarrufu değil. Bu yüzden: yeni özellikler (canlı mod, ölçüler, eşyalar) boya modülüne bağımlı olmasın, boya koduna yeni ekleme yapma.

## Ev geneli çalışma düzeni
- Her oda ayrı chat/oturumunda yapılır (ölçü planı + boya mockup'ı). Odalar kendi `rooms/<oda>/` verisini ekler; ortak motor `src/` içinde kalır (ikinci odaya geçerken oda verisini motordan ayırmak ilk iş).
- Tüm odalar bitince ayrı oturumda ev birleştirilir: odalar ortak duvar ve kapı üzerinden eklenir. Her oda iç ölçüyle ölçülür, birleştirmede odalar arasına duvar kalınlığı (yaklaşık 10–25 cm) eklenir. Kat bilgisi (zemin kat / üst kat) ayrıca tutulur.
- Sonraki hedef: Home Assistant'ta canlı 3D panel (lamba, sıcaklık, robot süpürge, hava temizleyici) ve Google TV / evdeki Huawei tablette gösterim. Bu yüzden modeller hafif kalmalı: gölge yok, dokular pişirilmiş, düşük poligon.

## Git kuralları
- Küçük, anlamlı commit'ler; mesajlar Türkçe ve ne/neden içersin.
- `main`'e doğrudan push etmeden önce kullanıcıya sor; mümkünse `oda/<ad>` veya `ozellik/<ad>` dalında çalış.
- Büyük ikili dosya ekleme (>5 MB). Ham Meshy GLB'leri depoya koyma; gerekirse Git LFS.
- Her commit öncesi `python3 build.py` çalışsın ve test betiği hatasız bitsin.
- Sır yok: HA token'ı, adres ve parolalar depoya girmez.
