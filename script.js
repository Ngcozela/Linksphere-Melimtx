// -----------------------------
// Utilities
// -----------------------------
function $(sel, ctx=document) { return ctx.querySelector(sel); }
function $all(sel, ctx=document) { return Array.from(ctx.querySelectorAll(sel)); }

// ---------- Loader ----------
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  // quick fade-out after content is ready
  setTimeout(() => {
    loader.style.transition = 'opacity .4s ease';
    loader.style.opacity = '0';
    setTimeout(()=> loader.remove(), 450);
  }, 400);
});

// -----------------------------
// THEME TOGGLE (dark default)
// -----------------------------
(function themeSetup(){
  const themeToggle = $('#themeToggle');
  const body = document.body;
  const stored = localStorage.getItem('siteTheme');
  if (stored === 'light') body.classList.add('light-mode');
  // toggle
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    localStorage.setItem('siteTheme', body.classList.contains('light-mode') ? 'light' : 'dark');
  });
})();

// -----------------------------
// Sponsored banners (rotate from array)
// -----------------------------
const sponsors = [
  { title: "Sponsor A", html: "<strong>Sponsor A</strong> — Check it out!" },
  { title: "Sponsor B", html: "<strong>Sponsor B</strong> — New drops!" },
  { title: "Sponsor C", html: "<strong>Sponsor C</strong> — Featured" }
];
(function rotateSponsor(){
  const box = $('#sponsorBox');
  if (!box) return;
  const i = Math.floor(Math.random() * sponsors.length);
  box.innerHTML = sponsors[i].html;
})();

// -----------------------------
// Scroll arrows logic
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  const container = $('.collections-container');
  const left = $('.left-arrow');
  const right = $('.right-arrow');
  let iv;
  function start(direction){
    stop();
    iv = setInterval(()=> container.scrollLeft += direction * 8, 12);
  }
  function stop(){ clearInterval(iv); }
  left.addEventListener('mouseenter', ()=> start(-1));
  left.addEventListener('mouseleave', stop);
  right.addEventListener('mouseenter', ()=> start(1));
  right.addEventListener('mouseleave', stop);
});

// -----------------------------
// Favorites, Recently Viewed, Analytics, Bonus unlock
// -----------------------------
const FAVORITES_KEY = 'mtx_favs';
const RECENT_KEY = 'mtx_recent';
const COUNTS_KEY = 'mtx_counts';
function readJSON(key){ try { return JSON.parse(localStorage.getItem(key)) || {}; } catch(e){ return {}; } }
function writeJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function initCollectionsFeatures(){
  const tabs = $all('.collection-tab');
  const favs = readJSON(FAVORITES_KEY);
  const counts = readJSON(COUNTS_KEY);
  const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');

  // Apply favorited look:
  tabs.forEach(tab=>{
    const id = tab.dataset.id;
    if (favs[id]) tab.classList.add('favorited');
  });

  // Favoriting handler
  $all('.fav-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const id = btn.dataset.id;
      const favs = readJSON(FAVORITES_KEY);
      if (favs[id]) { delete favs[id]; btn.closest('.collection-tab').classList.remove('favorited'); }
      else { favs[id] = true; btn.closest('.collection-tab').classList.add('favorited'); }
      writeJSON(FAVORITES_KEY, favs);
    });
  });

  // Recently list render
  function renderRecent(){
    const list = $('#recentList');
    list.innerHTML = '';
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    stored.slice(0,8).forEach(item=>{
      const el = document.createElement('div');
      el.className = 'recent-item';
      el.innerHTML = `<div style="height:64px;background:#333;border-radius:6px;margin-bottom:8px;"></div><div style="font-size:.9rem">${item.title || item.id}</div>`;
      list.appendChild(el);
    });
  }
  renderRecent();

  // After a successful proceed (open), we will update counts and recent in the gate logic.
}
initCollectionsFeatures();

// -----------------------------
// Gate + Video Progress + Skip button + Analytics + RecentlyViewed + Easter egg
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  const gateModal = $('#gateModal');
  const adBtns = $all('.ad-btn');
  const video = $('#ad-video');
  const proceedBtn = $('#proceed-btn');
  const skipBtn = $('#skipBtn');
  const skipWrapper = $('#skipWrapper');
  const tabs = $all('.collection-tab');
  const bonus = $('#bonusCollection');

  let currentLink = null;
  let currentId = null;
  let adsWatched = 0;
  let videoWatched = false;
  let proceedEnabled = false;
  const VIDEO_MIN_SKIP = 30; // seconds before skip available

  // helper: save/resume video progress keyed by collection id
  function videoKey(id){ return `mtx_video_progress_${id}`; }

  // intercept clicks on tabs
  tabs.forEach(tab=>{
    tab.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      currentLink = tab.dataset.link;
      currentId = tab.dataset.id;
      openGateFor(currentId, currentLink);
    });
  });

  function openGateFor(id, link){
    // reset
    adsWatched = 0; videoWatched = false; proceedEnabled = false;
    adBtns.forEach(b => { b.classList.remove('watched'); b.disabled = false; b.textContent = b.id.replace('ad','Ad '); });
    proceedBtn.disabled = true; proceedBtn.classList.remove('active'); proceedBtn.style.cursor = 'not-allowed';
    // load saved progress for this collection
    const saved = parseFloat(localStorage.getItem(videoKey(id)) || '0');
    if (!isNaN(saved)) {
      try { video.currentTime = Math.min(saved, video.duration || saved); } catch(e){}
    } else {
      try { video.currentTime = 0; } catch(e){}
    }
    // show modal
    gateModal.classList.add('active');
    gateModal.setAttribute('aria-hidden', 'false');

    // If video length already > VIDEO_MIN_SKIP and currentTime >= VIDEO_MIN_SKIP show skip
    checkSkipVisibility();
  }

  // ad buttons
  adBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if (btn.classList.contains('watched')) return;
      btn.classList.add('watched');
      btn.textContent = 'Viewed';
      adsWatched++;
      if (adsWatched >= 3) enableProceed();
    });
  });

  // video timeupdate saves progress and checks skip
  let saveTimer;
  video.addEventListener('timeupdate', ()=>{
    // save every 1s
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(()=> {
      if (currentId) localStorage.setItem(videoKey(currentId), String(video.currentTime));
    }, 500);

    // if watched >=30s -> mark watched
    if (video.currentTime >= VIDEO_MIN_SKIP && !videoWatched) {
      videoWatched = true;
      enableProceed();
    }
    checkSkipVisibility();
  });

  // when video ends
  video.addEventListener('ended', ()=>{
    videoWatched = true; enableProceed();
    if (currentId) localStorage.removeItem(videoKey(currentId)); // reset saved progress
  });

  // skip button logic (only shown if video duration > min and time >= min)
  function checkSkipVisibility(){
    // make sure video metadata loaded
    if (!video.duration || isNaN(video.duration)) return;
    if (video.duration > VIDEO_MIN_SKIP && video.currentTime >= VIDEO_MIN_SKIP) {
      skipWrapper.hidden = false;
    } else {
      skipWrapper.hidden = true;
    }
  }
  // Skip button click
  skipBtn?.addEventListener('click', ()=>{
    // treat as watched
    videoWatched = true; enableProceed();
  });

  function enableProceed(){
    proceedEnabled = true;
    proceedBtn.disabled = false;
    proceedBtn.classList.add('active');
    proceedBtn.style.cursor = 'pointer';
  }

  // proceed action: record analytics, recently viewed, maybe unlock bonus, then open link
  proceedBtn.addEventListener('click', ()=>{
    if (!proceedEnabled || !currentLink) return;
    // record analytics
    const counts = readJSON('mtx_counts');
    counts[currentId] = (counts[currentId] || 0) + 1;
    writeJSON('mtx_counts', counts);

    // record recent
    const recent = JSON.parse(localStorage.getItem('mtx_recent') || '[]');
    const title = `Collection ${currentId}`;
    // add to front, unique
    const filtered = recent.filter(r => r.id !== currentId);
    filtered.unshift({ id: currentId, link: currentLink, title });
    localStorage.setItem('mtx_recent', JSON.stringify(filtered.slice(0,10)));

    // mark viewed for easter egg
    const viewed = JSON.parse(localStorage.getItem('mtx_viewed') || '[]');
    if (!viewed.includes(currentId)) viewed.push(currentId);
    localStorage.setItem('mtx_viewed', JSON.stringify(viewed));
    checkBonusUnlock();

    // cleanup and open link in new tab
    gateModal.classList.remove('active'); gateModal.setAttribute('aria-hidden','true');
    // open in new tab
    window.open(currentLink, '_blank');

    // reset UI
    proceedBtn.disabled = true; proceedBtn.classList.remove('active'); proceedBtn.style.cursor='not-allowed';
    adBtns.forEach(b => b.classList.remove('watched'));
    try { video.pause(); video.currentTime = 0; } catch(e){}
  });

  // clicking outside gate content closes and resets
  gateModal.addEventListener('click', (ev)=>{
    if (ev.target === gateModal){
      gateModal.classList.remove('active');
      gateModal.setAttribute('aria-hidden','true');
      // leave progress saved
    }
  });

  // load recent UI
  function renderRecent(){
    const listEl = $('#recentList');
    listEl.innerHTML = '';
    const items = JSON.parse(localStorage.getItem('mtx_recent') || '[]');
    items.slice(0,8).forEach(it=>{
      const div = document.createElement('div');
      div.className = 'recent-item';
      div.innerHTML = `<div style="height:64px;background:#222;border-radius:6px;margin-bottom:8px;"></div><div style="font-size:.9rem">${it.title}</div>`;
      listEl.appendChild(div);
    });
  }
  renderRecent();

  // Easter egg / Bonus unlock: when all 10 unique ids viewed
  function checkBonusUnlock(){
    const viewed = JSON.parse(localStorage.getItem('mtx_viewed') || '[]');
    const required = ['1','2','3','4','5','6','7','8','9','10'];
    const gotAll = required.every(r => viewed.includes(r));
    if (gotAll){
      bonus.classList.remove('hidden');
      // smooth scroll into view slightly
      setTimeout(()=> bonus.scrollIntoView({ behavior:'smooth', inline:'center' }), 300);
    }
  }
  // run on load too
  checkBonusUnlock();
});

// -----------------------------
// Adult warning & Age modal (24h) — run early after DOM
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Adult warning
  const adultModal = $('#adultWarningModal');
  const adultContinue = $('#adult-warning-continue');

  function shouldShowAdult(){
    const data = JSON.parse(localStorage.getItem('adultWarningShown') || 'null');
    if (!data) return true;
    const hours = (Date.now() - data.timestamp) / (1000*60*60);
    return hours >= 24;
  }
  if (adultModal && adultContinue && shouldShowAdult()){
    adultModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    adultContinue.addEventListener('click', ()=>{
      localStorage.setItem('adultWarningShown', JSON.stringify({ shown:true, timestamp: Date.now() }));
      adultModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  // Age verification (24h)
  const ageModal = $('#ageModal');
  const ageYes = $('#age-yes');
  const ageNo = $('#age-no');

  function shouldShowAgeModal(){
    const data = JSON.parse(localStorage.getItem('ageVerified') || 'null');
    if (!data) return true;
    const hours = (Date.now() - data.timestamp) / (1000*60*60);
    return hours >= 24;
  }
  if (ageModal && ageYes && ageNo && shouldShowAgeModal()){
    ageModal.classList.add('active'); document.body.style.overflow = 'hidden';
    ageYes.addEventListener('click', ()=>{
      localStorage.setItem('ageVerified', JSON.stringify({ verified:true, timestamp:Date.now() }));
      ageModal.classList.remove('active'); document.body.style.overflow='auto';
    });
    ageNo.addEventListener('click', ()=> {
      alert('You must be 18 or older to use this site. Redirecting.');
      window.location.href = 'https://www.google.com';
    });
  }
});

// -----------------------------
// Initialize small helpers on load: favorites UI + recent rendering
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  // apply favorites look
  const favs = readJSON(FAVORITES_KEY);
  $all('.collection-tab').forEach(tab=>{
    if (favs[tab.dataset.id]) tab.classList.add('favorited');
  });
  // render recent once more
  const renderRecentAgain = ()=> {
    const listEl = $('#recentList');
    if (!listEl) return;
    listEl.innerHTML = '';
    const items = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    items.slice(0,8).forEach(it=>{
      const div = document.createElement('div');
      div.className = 'recent-item';
      div.innerHTML = `<div style="height:64px;background:#222;border-radius:6px;margin-bottom:8px;"></div><div style="font-size:.9rem">${it.title}</div>`;
      listEl.appendChild(div);
    });
  };
  renderRecentAgain();
});

