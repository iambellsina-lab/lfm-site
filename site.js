(function(){
var RM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* reveal on scroll */
var items = document.querySelectorAll('.rev');
if (RM || !('IntersectionObserver' in window)) {
  Array.prototype.forEach.call(items, function(e){ e.classList.add('in'); });
} else {
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.1, rootMargin:'0px 0px -5% 0px'});
  Array.prototype.forEach.call(items, function(e){ io.observe(e); });
}

/* scroll progress */
var prog = document.getElementById('prog'), ticking = false;
function runProg(){
  if(prog){
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h>0 ? (y/h*100) : 0) + '%';
  }
  ticking = false;
}
window.addEventListener('scroll', function(){ if(!ticking){ ticking=true; requestAnimationFrame(runProg); } }, {passive:true});
window.addEventListener('resize', runProg); runProg();

/* the constellation, on every canvas.flow */
Array.prototype.forEach.call(document.querySelectorAll('canvas.flow'), function(fc){
  if(!fc.getContext) return;
  var cx = fc.getContext('2d'), W=0, H=0, PTS=[], rAF=0,
      DPR = Math.min(window.devicePixelRatio||1, 2),
      LINE = fc.dataset.line || '19,221,230',
      DOT  = fc.dataset.dot  || '49,255,174',
      AB   = parseFloat(fc.dataset.alpha || '.4');
  function rs(){ W = fc.width = fc.offsetWidth*DPR; H = fc.height = fc.offsetHeight*DPR; }
  function mk(){ PTS=[]; var n = Math.min(60, Math.round(fc.offsetWidth/16));
    for(var i=0;i<n;i++) PTS.push({x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.28*DPR, vy:(Math.random()-.5)*.28*DPR}); }
  function frame(mv){
    cx.clearRect(0,0,W,H);
    var md = (120*DPR)*(120*DPR);
    for(var i=0;i<PTS.length;i++){
      var p = PTS[i];
      if(mv){ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1; }
      for(var j=i+1;j<PTS.length;j++){
        var q = PTS[j], dx = p.x-q.x, dy = p.y-q.y, d = dx*dx+dy*dy;
        if(d<md){ var a = (1-d/md)*AB;
          cx.strokeStyle = 'rgba('+LINE+','+a+')'; cx.lineWidth = DPR;
          cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(q.x,q.y); cx.stroke(); }
      }
    }
    for(var k=0;k<PTS.length;k++){
      cx.fillStyle = 'rgba('+DOT+',.75)';
      cx.beginPath(); cx.arc(PTS[k].x, PTS[k].y, 1.4*DPR, 0, 7); cx.fill();
    }
    if(mv) rAF = requestAnimationFrame(function(){ frame(true); });
  }
  function boot(){ cancelAnimationFrame(rAF); rs(); mk(); frame(!RM); }
  window.addEventListener('resize', boot);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ es.forEach(function(e){
      if(e.isIntersecting) boot(); else cancelAnimationFrame(rAF); }); },{threshold:.02}).observe(fc);
  } else boot();
});

/* the recognition checklist */
var box = document.getElementById('checks');
if(box){
  var btns = [].slice.call(box.querySelectorAll('.chk')),
      n = document.getElementById('tallyN'), m = document.getElementById('tallyM');
  var msg = ['Tick whatever is true.',
    'One is enough to start a conversation. It rarely stays at one.',
    'Two. These usually turn out to be the same problem wearing different clothes.',
    'Three. A pattern rather than a rough patch, and patterns respond to being named.',
    'Four. You are describing the exact couple we built this for, and none of it is a character flaw.',
    'Five. Nothing here gets fixed by working harder, which is probably what you have already tried.',
    'Six. You are not the exception. You are the normal outcome of building the income first.',
    'Seven. Start with the scan. Eight minutes, and you will have a figure instead of a feeling.',
    'Eight. Every one. Take the scan, then let us talk properly.'];
  var draw = function(){
    var c = btns.filter(function(b){ return b.getAttribute('aria-pressed')==='true'; }).length;
    n.textContent = c + ' of 8'; m.textContent = msg[c];
  };
  btns.forEach(function(b){ b.addEventListener('click', function(){
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed')==='true' ? 'false' : 'true'); draw(); }); });
  draw();
}

/* the gap sliders */
var sL = document.getElementById('sLife');
if(sL){
  var sN = document.getElementById('sNow'), vL = document.getElementById('vLife'),
      vN = document.getElementById('vNow'), vG = document.getElementById('vGap'),
      kG = document.getElementById('kGap'), nG = document.getElementById('nGap');
  var money = function(x){ return '$' + Math.round(x).toLocaleString('en-US'); };
  var drawGap = function(){
    var L = +sL.value, N = +sN.value, g = L - N;
    vL.textContent = money(L); vN.textContent = money(N);
    if(g>0){ kG.textContent='Your gap, a month'; vG.textContent=money(g);
      nG.textContent='About '+money(g/30)+' a day. The method is how you close it.'; }
    else if(g===0){ kG.textContent='Your gap, a month'; vG.textContent='$0';
      nG.textContent='You are exactly at your number. The work now is keeping it there on purpose.'; }
    else { kG.textContent='You are over, a month'; vG.textContent=money(-g);
      nG.textContent='You already earn more than the life costs. So the question is what the extra is for.'; }
  };
  sL.addEventListener('input', drawGap); sN.addEventListener('input', drawGap); drawGap();
}

/* the pinned four moves */
var moves = [].slice.call(document.querySelectorAll('[data-move]')),
    plates = [].slice.call(document.querySelectorAll('[data-plate]'));
if(moves.length && plates.length){
  var setMove = function(i){
    moves.forEach(function(el,k){ el.style.opacity = (k===i ? '1' : '.4'); });
    plates.forEach(function(el,k){ el.classList.toggle('on', k===i); el.style.opacity = (k===i ? '1' : '0'); });
  };
  setMove(0);
  if('IntersectionObserver' in window){
    var io2 = new IntersectionObserver(function(es){ es.forEach(function(e){
      if(e.isIntersecting) setMove(+e.target.dataset.move); }); },
      {threshold:.5, rootMargin:'-32% 0px -32% 0px'});
    moves.forEach(function(el){ io2.observe(el); });
  }
  moves.forEach(function(el){ el.addEventListener('mouseenter', function(){ setMove(+el.dataset.move); }); });
}
})();

/* the sticky price rail: appears once you are past the hero, hides over the investment block */
(function(){
  var rail = document.querySelector('.rail');
  if(!rail) return;
  document.body.classList.add('hasrail');
  var invest = document.getElementById('invest');
  var t = false;
  function run(){
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var past = y > window.innerHeight * 0.55;
    var atInvest = false;
    if(invest){
      var r = invest.getBoundingClientRect();
      atInvest = r.top < window.innerHeight && r.bottom > 0;
    }
    rail.classList.toggle('up', past && !atInvest);
    t = false;
  }
  window.addEventListener('scroll', function(){ if(!t){ t=true; requestAnimationFrame(run); } }, {passive:true});
  window.addEventListener('resize', run); run();
})();

/* the story reel arrows */
(function(){
  var row = document.getElementById('reelRow');
  if(!row) return;
  var RM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function step(){ var c = row.querySelector('.chapter'); return c ? c.getBoundingClientRect().width + 24 : 300; }
  var p = document.getElementById('reelPrev'), n = document.getElementById('reelNext');
  if(p) p.addEventListener('click', function(){ row.scrollBy({left:-step(), behavior: RM?'auto':'smooth'}); });
  if(n) n.addEventListener('click', function(){ row.scrollBy({left: step(), behavior: RM?'auto':'smooth'}); });
})();

/* the menu */
(function(){
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  if(!burger || !menu) return;
  function close(){ document.body.classList.remove('menuopen'); burger.setAttribute('aria-expanded','false'); }
  burger.addEventListener('click', function(){
    var open = document.body.classList.toggle('menuopen');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  Array.prototype.forEach.call(menu.querySelectorAll('a'), function(a){ a.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
})();
