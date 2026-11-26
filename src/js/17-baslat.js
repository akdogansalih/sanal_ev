/* ================= Başlat ================= */
function init(){
  buildTextures(); buildMaterials();
  buildRoom(); buildFurniture();
  if (tvScreen) tvScreen.material = state.tv ? MAT.tvOn : MAT.tvOff;
  $('#views').innerHTML = VIEWS.map(v => '<button data-v="' + v.id + '" aria-pressed="false">' + v.name + '</button>').join('');
  $('#views').addEventListener('click', e => { const b = e.target.closest('button'); if (b) goView(b.dataset.v); });
  renderPresets(); renderWallChips(); renderWallCtrl(); renderPalette(); renderLightCtrl(); renderItems(); renderDims(); updateMeter();
  setBg(); if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setBg);
  resize(); goView(state.view || 'masa', true);
  $('#loading').remove();
  requestAnimationFrame(tick);
  restoreImported();
  loadEmbedded();
}
try { init(); }
catch (err) { console.error(err); const l = $('#loading'); if (l) l.textContent = 'Oda çizilemedi: ' + (err && err.message ? err.message : err) + '. Sayfayı yenile; tekrar olursa bana yaz.'; }
})();
