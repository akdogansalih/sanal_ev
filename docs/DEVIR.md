# Devir notu (chat'ten depoya geçiş, 26 Kasım 2026)

Sayfanın yayınlanmış son hali (artifact) ile `build.py` çıktısı davranış olarak aynıdır. Bölme sırasında tek fark: sabit değerler (`DIM_DEFAULT`, `LIGHT_MODES`) boya verisinden `01-temel.js` dosyasına taşındı.

Salonda açık işler:
- L koltuk ölçüleri (uzun kol, kısa kol ve yönü, derinlik, sırt yüksekliği); şu an 340 cm düz koltuk yer tutucusu
- Diğer Meshy modelleri: berjerler, masaj koltuğu, bitkiler, lambalar
- Yer tutucu ölçülerin doğrulanması
- Renk kararı ve duvarda numune denemesi
- Ada için Govee şeridi (5 m) ve HA'ya bağlama

Bu salon oturumunda alınan ölçü kararları `src/js/01-temel.js` içindeki `DIM_DEFAULT` değerlerinde.
