# Araçlar

Ham Meshy GLB'lerini sayfaya gömülecek boyuta (2–3 MB) küçültür. Çıktı `src/models/<id>.glb` olur; `build.py` bunları base64 ile sayfaya gömer.

**Önemli bilgi:** Dokulu Meshy modellerini basit mesh sadeleştirmesiyle (UV'leri korumayan veya sadece UV ağırlıklı) küçültme. Meshy dokuyu çok küçük parçalara böler, sadeleştirme dokuyu karıştırır ve çatlaklar çıkarır. Doğru yol: konum-bazlı (çatlaksız) sadeleştir, sonra orijinal dokuyu yeni mesh'e yeniden pişir.

Kurulum: `npm install` ve `pip install -r requirements.txt` (depo kökünde).

## 1. Ham GLB'yi aç
```
mkdir work/purifier && python3 tools/extract_glb.py originals/purifier.glb work/purifier
```

## 2a. Silindirik / karışık şekilli nesne (hava temizleyici gibi) — `glb-purifier/`
`work/purifier` içinde çalış (dosyalar göreli yol bekler):
```
node ../../tools/glb-purifier/simp.mjs 110000    # çatlaksız sadeleştirme (üçgen sayısı)
python3 ../../tools/glb-purifier/bake.py          # silindirik açılım + doku pişirme (~40 sn)
python3 ../../tools/glb-purifier/pack.py          # f_*.bin ve f_*.jpg
QUANT=1 node ../../tools/glb-purifier/build.mjs out.glb
```
Not: `bake.py` içindeki silindir ekseni Y ve kapakları üst/alt varsayıyor (hava temizleyici). Başka nesne için açılımı (ve `ymin/ymax` kapak eşiklerini) uyarlamak gerekir.

## 2b. Neredeyse düz kabartma nesne (duvar saati gibi) — `glb-relief/`
Yükseklik haritası yöntemi: nesneyi yukarıdan ölçer, düzenli ızgara mesh'i kurar, dokuyu ortografik olarak pişirir. İnce parçalar (akrep/yelkovan) sadeleştirmede kaybolmaz.
```
python3 ../../tools/glb-relief/hf.py        # zbuffer + renk (R=2048), ızgara yükseklikleri
python3 ../../tools/glb-relief/mesh_hf.py   # ızgara mesh + kenar eteği + f_* dosyaları
node ../../tools/glb-relief/build.mjs out.glb
```

## 3. Sayfaya ekle
`out.glb` dosyasını `src/models/<id>.glb` olarak kaydet, `src/build.json` içindeki `order` listesine `<id>` ekle, `src/js/12-gomulu-modeller.js` içindeki `EMBEDDED` listesine ölçüsüyle (`w`, `d`, `h`, istenirse `elev`, `noShadow`) ekle, ayrıca `10-esyalar.js` içindeki `BUILTIN` listesine bir yer tutucuyla ekle.

## Notlar
- `KHR_mesh_quantization` (QUANT=1) r128 yükleyicisiyle çalışıyor, ama UV'ler [0,1] dışındaysa (silindirik açılımda u>1) UV'ler nicemlenmiyor. Saat gibi düz modelde nicemleme çıktıyı bozdu, orada kullanma.
- Meshopt sıkıştırma (EXT_meshopt_compression) kullanma: wasm yayınlanmış sayfanın güvenlik politikasında çalışmayabilir.
