/* ================= Renk verisi ================= */
// [ad, kod, hex, satıcı RGB değeri mi]
const PALETTE = [
  {fam:'Beyazlar ve kırık beyazlar', items:[
    ['Yeni Kar','Cİ-6720','#F1F0EB'],
    ['Buz Beyazı','Cİ-7341','#EDEFEA'],
    ['Masum Beyaz','Cİ-6341 / 1580','#EEEAE1'],
    ['Sakız Beyazı','Cİ-6201 / 4000','#ECE8DF'],
    ['Porselen','Cİ-6950','#EAE8E2'],
    ['Sade Beyaz','Cİ-6890','#EBE7DD'],
    ['Beyaz Gece','Cİ-6910','#E7E4DC'],
    ['Yalın Beyaz','Cİ-6381 / 1570','#E6E0D3',true],
    ['Olgun Beyaz','Cİ-6880','#E5DED0'],
    ['Beyaz Çikolata','Cİ-6630','#E9E0CF'],
    ['Açık Fildişi','Cİ-6291','#EEE6D4'],
    ['Tatlı Şampanya','Cİ-6384 / 1670','#E8DECB']
  ]},
  {fam:'Griler ve greige', items:[
    ['Sabah Sisi','Cİ-6202 / 4001','#DDD9D6',true],
    ['Güvercin','Cİ-6930','#DEDBD5'],
    ['Masum Gri','Cİ-7621','#DADAD5'],
    ['Dingin Gri','Cİ-7601','#D0D1CC'],
    ['Doğal Gri','Cİ-6203 / 4002','#CEC9C1'],
    ['Sakin Gri','Cİ-7622','#C6C7C1'],
    ['Marjinal Gri','Cİ-7602','#BDBBB5'],
    ['Zengin Gri','Cİ-6204 / 4003','#BAB4AB'],
    ['Gri Toprak','Cİ-6364','#B5AB9F'],
    ['Elegan Gri','Cİ-6205 / 4004','#A69F96'],
    ['Karizmatik Gri','Cİ-7623','#A7A8A3'],
    ['Kül Grisi','Cİ-7605','#999893'],
    ['Kadife Gri','Cİ-7624','#8C8D89']
  ]},
  {fam:'Bejler', items:[
    ['Kumsal Beji','Cİ-6262','#E4D9C5'],
    ['Sade Bej','Cİ-6271','#DFD4C1'],
    ['Sahra Beji','Cİ-6342','#DACBB3'],
    ['İstanbul Beji','Cİ-6294','#D6C7AE']
  ]},
  {fam:'Yeşiller ve mint', items:[
    ['Yeni Yeşil Pamuk','Cİ-6740','#DBE2D5'],
    ['Yeşil Rüya','Cİ-7321','#D0DBC6'],
    ['Mint Yeşili','Cİ-7422','#C9DFD1'],
    ['Nil Yeşili','Cİ-7392','#C2D5BE'],
    ['Nehir Yeşili','Cİ-7421','#B3CCBF'],
    ['Elegan Yeşil','Cİ-7334','#A5B398'],
    ['Kadife Yeşil','Cİ-7335','#8A9A80']
  ]},
  {fam:'Maviler', items:[
    ['Salda Mavisi','Cİ-7424','#BCD6D7'],
    ['Mutlu Mavi','Cİ-7441','#C7D6E0'],
    ['Marina','Cİ-7413','#8DAABB']
  ]},
  {fam:'Koyu referanslar', items:[
    ['Mevcut füme (yaklaşık)','fotoğraflardan','#7A6D61'],
    ['Antrasit (referans)','kod yok','#4B4D4F']
  ]}
];
const STUCCO = [
  ['Mevcut ton','koyu beton','#67665F'],
  ['Orta beton','','#8B8881'],
  ['Açık beton','','#A9A59D'],
  ['Sıcak açık beton','','#B3AB9F'],
  ['Mikro beton açık','','#C5C1B9']
];
const BRICK_OPTS = [['dogal','Doğal'],['hafif','Hafif badana'],['badana','Beyaz badana']];
const GROUPS = [
  {id:'koltuk', name:'Koltuk arkası', kind:'paint', lambri:true},
  {id:'ic', name:'İç duvar', kind:'paint', lambri:true},
  {id:'kapi', name:'Kapı bölümü', kind:'paint', lambri:true},
  {id:'tv', name:'TV duvarı', kind:'stucco'},
  {id:'brick', name:'Tuğla duvar', kind:'brick'},
  {id:'tavan', name:'Tavan', kind:'paint', lambri:false}
];
const ALL = PALETTE.flatMap(f => f.items.map(([name,code,hex,ver]) => ({name, code, hex, ver: !!ver})));
const P = n => { const c = ALL.find(x => x.name === n); return {name:c.name, code:c.code, hex:c.hex}; };
const S = n => { const c = STUCCO.find(x => x[0] === n); return {name:c[0], code:c[1], hex:c[2]}; };
const paint = (top, bottom, split, stripe, rustic) => ({top, bottom: bottom || top, split: split || 0, stripe: !!stripe, rustic: !!rustic});

const PRESETS = [
  {id:'mevcut', name:'Şu anki hal', walls:{koltuk:paint(P('Mevcut füme (yaklaşık)')), ic:paint(P('Mevcut füme (yaklaşık)')), kapi:paint(P('Mevcut füme (yaklaşık)'))}, stucco:S('Mevcut ton'), brick:'dogal'},
  {id:'kirik', name:'Kırık beyaz', walls:{koltuk:paint(P('Yalın Beyaz')), ic:paint(P('Yalın Beyaz')), kapi:paint(P('Yalın Beyaz'))}, stucco:S('Açık beton'), brick:'dogal'},
  {id:'lambri', name:'Adaçayı lambri', walls:{koltuk:paint(P('Yalın Beyaz'), P('Elegan Yeşil'), 1.0, true), ic:paint(P('Yalın Beyaz'), P('Elegan Yeşil'), 1.0, true), kapi:paint(P('Yalın Beyaz'))}, stucco:S('Orta beton'), brick:'dogal'},
  {id:'mint', name:'Mint eskitme', walls:{koltuk:paint(P('Mint Yeşili'), null, 0, false, true), ic:paint(P('Mint Yeşili'), null, 0, false, true), kapi:paint(P('Sabah Sisi'))}, stucco:S('Orta beton'), brick:'dogal'},
  {id:'sis', name:'Sabah Sisi', walls:{koltuk:paint(P('Sabah Sisi')), ic:paint(P('Sabah Sisi')), kapi:paint(P('Sabah Sisi'))}, stucco:S('Açık beton'), brick:'hafif'}
];
