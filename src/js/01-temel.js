
(function(){
'use strict';
const T = THREE;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const KEY = 'sanal-salon-v1';
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

const DIM_DEFAULT = {
  leftWin:{z0:267, w:170, sill:13.5},
  bigWin:{x0:106, w:170, sill:13.5},
  winTop:235,
  door:{z0:18, w:90, h:210},
  ceil:262,
  room:{w:396, l:620, dx:363, dl:126, c1w:54, c1d:35, c2w:20, c2l:58}
};

const LIGHT_MODES = [
  {id:'kis', name:'Kış gündüzü', win:2.3, winColor:0xdde6f3, spots:false, hemi:0.55, sky:0xdfe5ee, ground:0x8b8177, glass:1.0, glow:0.28},
  {id:'karma', name:'Gündüz + spot', win:2.3, winColor:0xdde6f3, spots:true, hemi:0.6, sky:0xe9e6e0, ground:0x8b8177, glass:1.0, glow:0.28},
  {id:'gunes', name:'Güneşli', win:5.2, winColor:0xfff0da, spots:false, hemi:0.85, sky:0xf3eee4, ground:0x958a7c, glass:1.25, glow:0.5},
  {id:'aksam', name:'Akşam', win:0, winColor:0x000000, spots:true, hemi:0.26, sky:0xffdfbd, ground:0x5b5047, glass:0.06, glow:0}
];
const CURTAIN_MODES = [['kapali','Kapalı'],['acik','Kenarda'],['yok','Yok']];

