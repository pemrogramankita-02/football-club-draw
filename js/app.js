/* FOOTBALL CLUB DRAW v2.0 — local-first tournament manager */
(() => {
'use strict';
const KEY='fcd_full_v2';
const NOTES_KEY='fcd_user_notes_v1';
let notes=loadNotes(),noteSearch='';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const blank=()=>({settings:{name:'Football Club Draw',theme:'charcoal-gold',waPrefix:'62'},tournaments:[],activeTournament:null,clubs:[],draws:[],matches:[]});
let db=load(),page='dashboard',deferredInstall=null,recording=null,mediaStream=null;
function loadNotes(){try{const x=JSON.parse(localStorage.getItem(NOTES_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function saveNotes(){localStorage.setItem(NOTES_KEY,JSON.stringify(notes));}
function load(){try{let data=JSON.parse(localStorage.getItem(KEY)||'{}');delete data.audit;
 if(Array.isArray(data.tournaments))data.tournaments.forEach(t=>{if(t.format==='groups')t.format='hybrid';});
 return {...blank(),...data}}catch{return blank()}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));$('#saveState').textContent='● Tersimpan';}
function log(){}
function toast(msg){let n=document.createElement('div');n.className='toast';n.textContent=msg;$('#toasts').append(n);setTimeout(()=>n.remove(),3200)}
function active(){return db.tournaments.find(t=>t.id===db.activeTournament)||null}
function clubs(){return db.clubs.filter(c=>!active()||!active().clubIds||active().clubIds.includes(c.id))}
function logo(c){return c?.logo||`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#d9b34b" d="M50 4 91 20 84 72 50 96 16 72 9 20Z"/><text x="50" y="59" text-anchor="middle" font-size="28" font-family="Arial" font-weight="bold" fill="#171717">${esc((c?.name||'FC').split(' ').map(x=>x[0]).slice(0,3).join('').toUpperCase())}</text></svg>`)}`}
function fmtDate(d){return d?new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}):'-'}
function renderNavigation(){
 const t=active(),navEl=$('#nav');if(!navEl)return;
 const item=(p,label,icon)=>`<button class="nav-item ${page===p?'active':''}" data-page="${p}">${icon} <span>${label}</span></button>`;
 let htmlNav='';
 if(t){
  htmlNav+=`<div class="side-label">TURNAMEN AKTIF</div><div class="active-tournament-label">${esc(t.name)}</div>`;
  htmlNav+=item('tournament','Ganti Turnamen','←');
  htmlNav+=`<div class="side-label">KELOLA KOMPETISI</div>`;
  htmlNav+=item('clubs','Data Klub','⚽');
  if(t.format==='hybrid')htmlNav+=item('draw','Sistem Pengundian','🎲');
  htmlNav+=item('schedule','Jadwal & Skor','📅');
  if(t.format!=='knockout')htmlNav+=item('groups','Hasil & Klasemen','▤');
  if(t.format==='knockout'||t.format==='hybrid')htmlNav+=item('knockout','Babak Knockout','🏆');
 }else{
  htmlNav+=`<div class="side-label">MENU UTAMA</div>`;
  htmlNav+=item('dashboard','Dashboard','▦')+item('tournament','Daftar Turnamen','🏆');
 }
 htmlNav+=`<div class="side-label">APLIKASI</div>`+item('notes','Catatan Saya','▤')+item('backup','Backup & Pengaturan','⇅');
 navEl.innerHTML=htmlNav;
}
function nav(p){
 if(p!=='dashboard'&&p!=='tournament'&&p!=='backup'&&p!=='notes'&&!active()){toast('Pilih turnamen terlebih dahulu.');page='tournament';}
 else page=p;
 const t=active(),titles={dashboard:'Dashboard',tournament:'Daftar Turnamen',clubs:'Data Klub',draw:'Sistem Pengundian',groups:'Hasil & Klasemen',knockout:'Babak Knockout',schedule:'Jadwal & Skor',backup:'Backup & Pengaturan',notes:'Catatan Saya'};
 $('#pageTitle').textContent=(t&&!['dashboard','tournament','backup','notes'].includes(page)?t.name+' — ':'')+(titles[page]||'FOOTBALL CLUB DRAW');
 renderNavigation();render();$('#sidebar').classList.remove('open')
}
function modal(title,body,onSubmit,label='Simpan'){ $('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modalSubmit').textContent=label;const d=$('#modal');d.showModal();$('#modalSubmit').onclick=e=>{e.preventDefault();if(onSubmit()!==false)d.close()}}
function field(label,name,value='',type='text',extra=''){return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`}
function selectField(label,name,opts,value){return `<div class="field"><label>${label}</label><select name="${name}">${opts.map(o=>`<option value="${esc(o[0])}" ${o[0]==value?'selected':''}>${esc(o[1])}</option>`).join('')}</select></div>`}
function formVal(name){return $(`#modal [name="${name}"]`)?.value??''}
function render(){renderNavigation();let v=$('#view');if(page==='dashboard')v.innerHTML=dashboard();if(page==='tournament')v.innerHTML=tournamentPage();if(page==='clubs')v.innerHTML=clubsPage();if(page==='draw')v.innerHTML=drawPage();if(page==='groups')v.innerHTML=groupsPage();if(page==='knockout')v.innerHTML=knockoutPage();if(page==='schedule')v.innerHTML=schedulePage();if(page==='backup')v.innerHTML=backupPage();if(page==='notes')v.innerHTML=notesPage();bindPage()}
function dashboard(){let t=active(),draw=db.draws.find(d=>d.tournamentId===t?.id),ms=db.matches.filter(m=>m.tournamentId===t?.id),done=ms.filter(m=>m.played).length;return `<div class="hero"><div><div class="eyebrow">SELAMAT DATANG DI RUANG KOMPETISI</div><h2>${esc(t?.name||'Bangun Turnamen Sepak Bola Anda')}</h2><p>${t?`${esc(t.format)} • ${t.groupCount} grup • ${clubs().length} klub terdaftar`:'Buat turnamen, daftarkan klub, lalu jalankan pengundian otomatis dalam satu proses.'}</p><div class="actions"><button class="btn btn-gold" data-go="${t?'draw':'tournament'}">${t?'Mulai Pengundian':'＋ Buat Turnamen'}</button><button class="btn btn-ghost" data-go="clubs">Kelola Klub</button></div></div><div class="hero-mark">🏆</div></div><div class="grid stats"><div class="stat"><small>TURNAMEN AKTIF</small><strong>${t?1:0}</strong><em>${t?'Sedang dikelola':'Belum dipilih'}</em></div><div class="stat"><small>TOTAL KLUB</small><strong>${clubs().length}</strong><em>Peserta kompetisi</em></div><div class="stat"><small>PERTANDINGAN</small><strong>${ms.length}</strong><em>${done} selesai</em></div></div><div class="grid two-col"><section class="panel"><div class="section-head"><div><h2>Ringkasan Kompetisi</h2><p>Status dan tahapan turnamen aktif</p></div></div>${t?`<div class="grid"><div class="rowline"><span class="muted tiny">Format</span><b>${esc(t.format)}</b></div><div class="rowline"><span class="muted tiny">Jumlah grup</span><b>${t.groupCount}</b></div><div class="rowline"><span class="muted tiny">Lolos per grup</span><b>${t.qualifiers}</b></div><div class="rowline"><span class="muted tiny">Status undian</span><b>${draw?'<span class="pill green">Sudah diundi</span>':'<span class="pill">Belum diundi</span>'}</b></div></div>`:`<div class="empty"><b>Belum ada turnamen aktif</b>Buat turnamen baru untuk memulai.</div>`}</section><section class="panel"><div class="section-head"><div><h2>Akses Cepat</h2><p>Kelola proses utama</p></div></div><div class="grid"><button class="btn btn-ghost" data-go="tournament">🏆 Pengaturan turnamen</button><button class="btn btn-ghost" data-go="draw">🎲 Pengundian otomatis</button><button class="btn btn-ghost" data-go="groups">📊 Klasemen grup</button><button class="btn btn-ghost" data-go="backup">⇅ Backup data</button></div></section></div>`}
function tournamentPage(){return `<div class="section-head"><div><h2>Daftar Turnamen</h2><p>Buat dan pilih kompetisi yang akan dikelola.</p></div><button class="btn btn-gold" data-action="newTournament">＋ Turnamen Baru</button></div><div class="grid">${db.tournaments.length?db.tournaments.map(t=>`<div class="panel"><div class="rowline"><div><b>${esc(t.name)}</b><div class="muted tiny">${({knockout:'Knock-out',hybrid:'Fase Grup + Knock-out',league:'Liga'})[t.format]||t.format} • ${t.clubIds.length} klub${t.format!=='league'&&t.format!=='knockout'?' • '+t.groupCount+' grup':''}</div></div><div class="actions"><span class="pill ${db.activeTournament===t.id?'green':''}">${db.activeTournament===t.id?'Aktif':'Tersimpan'}</span><button class="btn btn-whatsapp btn-sm" data-action="shareTournamentInfo" data-id="${t.id}">Bagikan Info WA</button><button class="btn btn-ghost btn-sm" data-action="selectTournament" data-id="${t.id}">Kelola</button><button class="btn btn-ghost btn-sm" data-action="editTournament" data-id="${t.id}">Edit</button><button class="btn btn-danger btn-sm" data-action="deleteTournament" data-id="${t.id}">Hapus</button></div></div></div>`).join(''):'<div class="empty"><b>Belum ada turnamen</b>Klik Turnamen Baru untuk membuat kompetisi.</div>'}</div>`}
function clubsPage(){return `<div class="section-head"><div><h2>Data Klub Turnamen</h2><p>Daftar klub ini khusus untuk turnamen <b>${esc(active()?.name||"")}</b>. Perubahan peserta tidak mencampur turnamen lain.</p></div><div class="actions"><button class="btn btn-ghost" data-action="bulkClubs">＋ Tambah Berdasarkan Jumlah</button><button class="btn btn-gold" data-action="newClub">＋ Tambah Klub</button></div></div><div class="panel"><div class="table-wrap"><table><thead><tr><th>Klub</th><th>Kota / Negara</th><th>Kontak WA</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${clubs().map(c=>`<tr><td><div class="club-cell"><img class="club-logo" src="${logo(c)}"><b>${esc(c.name)}</b></div></td><td>${esc(c.location||'-')}</td><td>${esc(c.phone||'-')}</td><td><span class="pill">${c.logoSource==='manual'?'Logo manual':c.logoSource==='wiki'?'Logo ditemukan':'Logo inisial'}</span></td><td><div class="actions"><button class="btn btn-ghost btn-sm" data-action="editClub" data-id="${c.id}">Edit</button><button class="btn btn-danger btn-sm" data-action="deleteClub" data-id="${c.id}">Hapus</button></div></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Belum ada klub terdaftar.</td></tr>'}</tbody></table></div></div>`}
function drawPage(){let t=active(),d=db.draws.find(x=>x.tournamentId===t?.id);if(t?.format==='league'||t?.format==='knockout')return `<div class="empty"><b>Mode ini tidak menggunakan pengundian grup</b>Semua klub akan saling bertemu sesuai jadwal liga. Buka menu Jadwal & Skor lalu tekan Buat Jadwal Liga.</div>`;return `<div class="notice">Pengundian menggunakan metode Free Draw: seluruh klub diacak tanpa pot unggulan. Animasi memperlihatkan proses pengungkapan hasil satu per satu; urutan hasil sudah ditentukan dan disimpan saat pengundian dimulai.</div><div class="section-head"><div><h2>Automatic Draw Room</h2><p>${t?esc(t.name):'Pilih atau buat turnamen terlebih dahulu.'}</p></div></div><div class="draw-stage draw-stage-live" id="drawStage"><div class="draw-machine"><div class="eyebrow">LIVE DRAW EXPERIENCE</div><div class="draw-ball" id="drawBall">⚽</div><div class="draw-status" id="drawStatus">${d?'HASIL PENGUNDIAN SIAP':'MENUNGGU PENGUNDIAN'}</div><div class="draw-club-name" id="drawClubName">${d?'Tekan PUTAR ANIMASI untuk melihat hasil':'Siapkan peserta turnamen Anda'}</div><div class="draw-group-name" id="drawGroupName">${d?`${d.snapshot?.length||d.groups.reduce((n,g)=>n+g.clubs.length,0)} KLUB • ${d.groups.length} GRUP`:'OFFICIAL CLUB DRAW'}</div><div class="draw-progress"><i id="drawProgress"></i></div><div class="draw-count" id="drawCount">${d?'0 / '+(d.snapshot?.length||d.groups.reduce((n,g)=>n+g.clubs.length,0)):'READY'}</div></div>${d?`<div class="draw-live-board" id="drawBoard"><div class="draw-board-heading">PAPAN PENEMPATAN GRUP <span>HASIL MUNCUL BERTAHAP</span></div><div class="draw-board-grid">${d.groups.map((g,gi)=>`<section class="draw-live-group"><header>${esc(g.name)}</header>${g.clubs.map((c,ci)=>`<div class="draw-live-slot" data-slot="${d.groups.slice(0,gi).reduce((n,x)=>n+x.clubs.length,0)+ci}"><span>${String(ci+1).padStart(2,'0')}</span><b>Menunggu klub...</b></div>`).join('')}</section>`).join('')}</div></div>`:''}</div><div class="actions draw-controls"><button class="btn btn-gold" data-action="${d?'replayDraw':'runDraw'}" ${!t?'disabled':''}>${d?'▶ PUTAR ANIMASI HASIL':'🎲 MULAI PENGUNDIAN'}</button>${d?'<button class="btn btn-ghost" data-action="shareDrawVideo">🎥 Video & WhatsApp</button><button class="btn btn-ghost" data-go="groups">Lihat Semua Hasil</button><button class="btn btn-danger" data-action="resetDraw">Reset & Undi Ulang</button>':''}</div>${d?`<div class="section-head"><div><h2>Rekap Hasil Pengundian</h2><p>Semua penempatan klub yang telah disimpan.</p></div></div><div class="grid group-grid">${d.groups.map(g=>`<div class="group-card"><div class="group-title">${esc(g.name)}</div>${g.clubs.map((c,i)=>`<div class="draw-result-row"><span class="draw-result-number">${String(i+1).padStart(2,'0')}</span><img class="club-logo" src="${logo(c)}"><b>${esc(c.name)}</b><span class="pill green">Terundi</span></div>`).join('')}</div>`).join('')}</div><div class="panel tiny muted" style="margin-top:15px">Hash komitmen: <code>${d.commitment}</code><br>Waktu pengundian: ${new Date(d.at).toLocaleString('id-ID')}</div>`:''}`}

let drawAnimationToken=0;
function animateDraw(d){
 if(!d)return;
 const token=++drawAnimationToken,stage=$('#drawStage');if(!stage)return;
 const flat=[];d.groups.forEach(g=>g.clubs.forEach(c=>flat.push({club:c,group:g.name})));
 const ball=$('#drawBall'),status=$('#drawStatus'),name=$('#drawClubName'),group=$('#drawGroupName'),progress=$('#drawProgress'),count=$('#drawCount');
 const slots=$$('#drawBoard [data-slot]');
 slots.forEach(s=>{s.classList.remove('revealed','current');s.querySelector('b').textContent='Menunggu klub...'});
 let i=0;
 if(ball)ball.classList.add('spinning');
 if(status)status.textContent='PENGUNDIAN BERLANGSUNG';
 if(name)name.textContent='Bola undian sedang bergerak...';
 if(group)group.textContent='MENYIAPKAN PENEMPATAN GRUP';
 if(progress)progress.style.width='0%';
 if(count)count.textContent=`0 / ${flat.length}`;
 const tick=()=>{
  if(token!==drawAnimationToken)return;
  if(i>=flat.length){
   if(ball){ball.classList.remove('spinning');ball.textContent='🏆'}
   if(status)status.textContent='PENGUNDIAN SELESAI';
   if(name)name.textContent='SEMUA KLUB TELAH DITEMPATKAN';
   if(group)group.textContent='HASIL AKHIR TERSIMPAN';
   if(progress)progress.style.width='100%';
   if(count)count.textContent=`${flat.length} / ${flat.length} SELESAI`;
   return;
  }
  const item=flat[i],slot=slots[i];
  if(ball){ball.classList.remove('spinning');ball.textContent='⚽';void ball.offsetWidth;ball.classList.add('spinning')}
  if(name)name.textContent=item.club.name;
  if(group)group.textContent=`MASUK KE ${item.group}`;
  if(status)status.textContent='KLUB TERPILIH • PENEMPATAN BERLANGSUNG';
  if(slot){
   slot.classList.add('current');
   const b=slot.querySelector('b');if(b)b.textContent=item.club.name;
   slot.classList.add('revealed');
  }
  if(progress)progress.style.width=`${Math.round((i+1)/flat.length*100)}%`;
  if(count)count.textContent=`${i+1} / ${flat.length}`;
  i++;
  setTimeout(()=>{if(slot)slot.classList.remove('current');tick()},2000);
 };
 setTimeout(tick,350);
}
function getDraw(){return db.draws.find(d=>d.tournamentId===active()?.id)}
function tableStandings(group){
 const teams=group.clubs.map(c=>({club:c,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,yellow:0,red:0}));
 const matches=db.matches.filter(m=>m.tournamentId===active()?.id&&m.group===group.name&&m.played);
 for(const m of matches){
  const a=teams.find(x=>x.club.id===m.home),b=teams.find(x=>x.club.id===m.away);
  if(!a||!b||!Number.isFinite(Number(m.hs))||!Number.isFinite(Number(m.as)))continue;
  const hs=Number(m.hs),as=Number(m.as);a.mp++;b.mp++;a.gf+=hs;a.ga+=as;b.gf+=as;b.ga+=hs;
  a.yellow+=Number(m.homeYellow||0);a.red+=Number(m.homeRed||0);b.yellow+=Number(m.awayYellow||0);b.red+=Number(m.awayRed||0);
  if(hs>as){a.w++;b.l++;a.pts+=3}else if(hs<as){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}
 }
 const h2h=(a,b)=>{const direct=matches.filter(m=>[m.home,m.away].includes(a.club.id)&&[m.home,m.away].includes(b.club.id));let ap=0,bp=0,agd=0,bgd=0,agf=0,bgf=0;direct.forEach(m=>{const hs=Number(m.hs),as=Number(m.as);let ah=m.home===a.club.id?hs:as,bh=m.home===a.club.id?as:hs;agf+=ah;bgf+=bh;agd+=ah-bh;bgd+=bh-ah;if(ah>bh)ap+=3;else if(ah===bh){ap++;bp++}else bp+=3});return bp-ap||bgd-agd||bgf-agf};
 return teams.map(x=>({...x,gd:x.gf-x.ga})).sort((a,b)=>b.pts-a.pts||b.gf-a.gf||b.gd-a.gd||a.ga-b.ga||a.club.name.localeCompare(b.club.name));
}

function clubGoalTotals(){const t=active();if(!t)return [];const rows=clubs().map(club=>({club,gf:0}));db.matches.filter(m=>m.tournamentId===t.id&&m.played&&m.home&&m.away&&Number.isFinite(Number(m.hs))&&Number.isFinite(Number(m.as))).forEach(m=>{const h=rows.find(x=>x.club.id===m.home),a=rows.find(x=>x.club.id===m.away);if(h)h.gf+=Number(m.hs);if(a)a.gf+=Number(m.as)});return rows.sort((a,b)=>b.gf-a.gf||a.club.name.localeCompare(b.club.name))}
function topScoringClubPanel(){const rows=clubGoalTotals();if(!rows.length)return '';const max=rows[0].gf;return `<section class=\"panel\" style=\"margin-top:16px\"><div class=\"section-head\"><div><h2>🏆 Penghargaan Klub Tersubur</h2><p>Total gol sepanjang turnamen; gol adu penalti tidak dihitung.</p></div></div><div class=\"grid\">${rows.filter(x=>x.gf===max).map(x=>`<div class=\"stat\"><small>KLUB TERSUBUR</small><strong>${esc(x.club.name)}</strong><em>${x.gf} gol</em></div>`).join('')}</div></section>`}
function groupsPage(){let d=getDraw(),t=active();if(t?.format==='league')return leagueStandingsPage();if(!d)return `<div class="empty"><b>Hasil pengundian belum tersedia</b>Selesaikan pengundian terlebih dahulu.</div>`;return `<div class="section-head"><div><h2>Hasil & Klasemen Grup</h2><p>Seluruh grup ditampilkan dengan statistik lengkap. Masukkan skor untuk memperbarui klasemen.</p></div><div class="actions"><button class="btn btn-gold" data-action="shareActualStandings">Bagikan Klasemen • SUPER HD+</button><button class="btn btn-ghost" onclick="window.print()">Cetak Klasemen</button></div></div><div class="grid group-grid">${d.groups.map(g=>{let s=tableStandings(g);return `<div class="group-card"><div class="group-title">${esc(g.name)}</div><div class="table-wrap"><table><thead><tr><th>#</th><th>Tim</th><th>T</th><th>M</th><th>S</th><th>K</th><th>GM</th><th>GK</th><th>SG</th><th>Poin</th></tr></thead><tbody>${s.map((x,i)=>`<tr><td>${i+1}</td><td><div class="club-cell"><img class="club-logo" src="${logo(x.club)}">${esc(x.club.name)}</div></td><td>${x.mp}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gf}</td><td>${x.ga}</td><td>${x.gd}</td><td><b>${x.pts}</b></td></tr>`).join('')}</tbody></table></div></div>`}).join('')}</div>${topScoringClubPanel()}`}
function generateLeague(){
 let t=active();if(!t||t.format!=='league')return;
 let teams=t.clubIds.map(id=>db.clubs.find(c=>c.id===id)).filter(Boolean);
 if(teams.length<2){toast('Liga membutuhkan minimal 2 klub.');return}
 if(!confirm(`Buat jadwal liga untuk ${teams.length} klub dengan sistem ${(t.legs||2)===2?'kandang dan tandang':'satu putaran'}? Jadwal liga lama akan diganti.`))return;
 let arr=[...teams];if(arr.length%2)arr.push(null);
 let n=arr.length,rounds=n-1,half=n/2,fixtures=[];
 for(let r=0;r<rounds;r++){
  for(let i=0;i<half;i++){
   let home=arr[i],away=arr[n-1-i];if(!home||!away)continue;
   if((r+i)%2)[home,away]=[away,home];
   fixtures.push({id:uid(),tournamentId:t.id,home:home.id,away:away.id,round:`Pekan ${r+1}`,roundIndex:r,matchNo:fixtures.length+1,group:'',played:false,hs:null,as:null,date:'',time:'',venue:''});
   if((t.legs||2)===2)fixtures.push({id:uid(),tournamentId:t.id,home:away.id,away:home.id,round:`Pekan ${r+rounds+1}`,roundIndex:r+rounds,matchNo:fixtures.length+1,group:'',played:false,hs:null,as:null,date:'',time:'',venue:''});
  }
  arr=[arr[0],arr[n-1],...arr.slice(1,n-1)];
 }
 db.matches=db.matches.filter(m=>m.tournamentId!==t.id);db.matches.push(...fixtures);
 save();log('Buat jadwal liga',{teams:teams.length,matches:fixtures.length,legs:t.legs||1});render();toast(`${fixtures.length} pertandingan liga berhasil dibuat.`);setTimeout(animateLeague,250);
}
function leagueStandingsPage(){
 let t=active();if(!t)return '';
 let teams=t.clubIds.map(id=>db.clubs.find(c=>c.id===id)).filter(Boolean).map(c=>({club:c,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
 let matches=db.matches.filter(m=>m.tournamentId===t.id&&m.round?.startsWith('Pekan')&&m.played);
 matches.forEach(m=>{let a=teams.find(x=>x.club.id===m.home),b=teams.find(x=>x.club.id===m.away);if(!a||!b)return;a.mp++;b.mp++;a.gf+=+m.hs;a.ga+=+m.as;b.gf+=+m.as;b.ga+=+m.hs;if(+m.hs>+m.as){a.w++;b.l++;a.pts+=3}else if(+m.hs<+m.as){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}});
 teams=teams.map(x=>({...x,gd:x.gf-x.ga})).sort((a,b)=>b.pts-a.pts||b.gf-a.gf||b.gd-a.gd||a.ga-b.ga||a.club.name.localeCompare(b.club.name));
 return `<div class="section-head"><div><h2>Klasemen Liga</h2><p>${esc(t.name)} • Menang 3 poin, seri 1 poin.</p></div><div class="actions"><button class="btn btn-gold" data-action="shareActualStandings">Bagikan Klasemen • SUPER HD+</button><button class="btn btn-ghost" data-go="schedule">Lihat Jadwal</button></div></div><div class="panel table-wrap"><table><thead><tr><th>#</th><th>Klub</th><th>MP</th><th>M</th><th>S</th><th>K</th><th>GM</th><th>GK</th><th>SG</th><th>PTS</th></tr></thead><tbody>${teams.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.club.name)}</b></td><td>${x.mp}</td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gf}</td><td>${x.ga}</td><td>${x.gd}</td><td><b>${x.pts}</b></td></tr>`).join('')}</tbody></table></div>${topScoringClubPanel()}`
}
function knockoutPage(){let t=active(),d=getDraw();if(t?.format==='league')return `<div class="empty"><b>Mode Liga tidak menggunakan babak knockout</b>Juara ditentukan dari klasemen akhir liga.</div>`;if(!d&&t?.format!=='knockout')return `<div class="empty"><b>Belum ada hasil undian</b>Undi klub terlebih dahulu.</div>`;let ko=db.matches.filter(m=>m.tournamentId===t.id&&!m.group&&m.round).sort((a,b)=>(a.roundIndex??0)-(b.roundIndex??0)||a.matchNo-b.matchNo);let rounds=[...new Set(ko.map(m=>m.round))].sort((a,b)=>{let x=ko.find(m=>m.round===a)?.roundIndex??0,y=ko.find(m=>m.round===b)?.roundIndex??0;return x-y});return `<div class="section-head"><div><h2>Knockout Stage</h2><p>Bagan bertingkat. Pemenang otomatis mengisi slot babak berikutnya; geser bagan ke samping pada layar HP.</p></div><div class="actions"><button class="btn btn-gold" data-action="generateKO">⚔ Buat Bagan Knockout</button></div></div>${rounds.length?`<div class="bracket-flow">${rounds.map(r=>`<section class="bracket-round"><h3>${esc(r)}</h3><div class="actions"><button class="btn btn-ghost btn-sm" data-action="shareKOSchedule" data-round="${ko.find(m=>m.round===r)?.roundIndex??0}">Bagikan Jadwal</button><button class="btn btn-gold btn-sm" data-action="shareKORound" data-round="${ko.find(m=>m.round===r)?.roundIndex??0}">Bagikan Hasil + Bracket</button></div>${ko.filter(m=>m.round===r).map(m=>matchCard(m)).join('')}</section>`).join('')}</div>`:`<div class="empty"><b>Bagan belum dibuat</b>Setelah pertandingan grup selesai, buat bagan untuk mengisi slot tim lolos.</div>`}`}
function matchCard(m){
 let a=db.clubs.find(c=>c.id===m.home),b=db.clubs.find(c=>c.id===m.away);
 let waiting=!m.home||!m.away;
 let status=m.played?'Selesai':waiting?(m.winnerId?'Bye • otomatis lolos':'Menunggu lawan'):'Belum dimainkan';
 return `<div class="match-card"><div class="muted tiny">${esc(m.round||'Pertandingan')} • #${m.matchNo||''}</div><div class="match-team">${esc(a?.name||'Menunggu pemenang')} <b>${m.played&&m.hs!=null?m.hs:'-'}</b></div><div class="match-team">${esc(b?.name||'Menunggu pemenang')} <b>${m.played&&m.as!=null?m.as:'-'}</b></div><div class="muted tiny">${status}${m.winnerId?' • Pemenang: '+esc(db.clubs.find(c=>c.id===m.winnerId)?.name||'') : ''}</div>${!waiting?`<button class="btn btn-ghost btn-sm" data-action="editScore" data-id="${m.id}">Input / Edit skor</button>`:'<span class="muted tiny">Menunggu pemenang pertandingan sebelumnya</span>'}</div>`
}
function schedulePage(){
 let t=active(),ms=db.matches.filter(m=>m.tournamentId===t?.id);
 if(t?.format==='league'){
  let rounds=[...new Set(ms.map(m=>m.roundIndex??0))].sort((a,b)=>a-b);
  let html=rounds.map((r,ri)=>{let games=ms.filter(m=>(m.roundIndex??0)===r).sort((a,b)=>(a.matchNo||0)-(b.matchNo||0));return `<section class="panel league-matchday" style="margin-bottom:14px"><div class="rowline"><div><h3>⚽ Matchday ${ri+1}</h3><div class="muted tiny">${games.length} pertandingan dalam satu pekan</div></div><div class="actions"><button class="btn btn-gold btn-sm" data-action="shareMatchday" data-round="${r}">Bagikan Jadwal MD ${ri+1}</button><button class="btn btn-ghost btn-sm" data-action="shareResultsMD" data-round="${r}">Hasil + Klasemen MD ${ri+1}</button></div></div><div class="league-fixtures" data-matchday="${r}">${games.map((m,i)=>{let a=db.clubs.find(c=>c.id===m.home),b=db.clubs.find(c=>c.id===m.away);return `<div class="league-fixture" data-fixture="${i}"><div class="muted tiny">PERTANDINGAN ${i+1}</div><div class="league-vs"><div class="league-side"><img class="club-logo" src="${logo(a||{})}"><b>${esc(a?.name||'TBD')}</b></div><strong>VS</strong><div class="league-side"><img class="club-logo" src="${logo(b||{})}"><b>${esc(b?.name||'TBD')}</b></div></div><div class="muted tiny">${m.played?`Skor ${m.hs} - ${m.as}`:'Belum dimainkan'} ${m.date?'• '+fmtDate(m.date):''} ${m.time?'• '+esc(m.time):''} ${m.venue?'• '+esc(m.venue):''}</div><div class="actions" style="justify-content:center;margin-top:8px"><button class="btn btn-ghost btn-sm" data-action="editScore" data-id="${m.id}">Input / Edit Skor</button></div></div>`}).join('')}</div></section>`}).join('');
  return `<div class="section-head"><div><h2>Jadwal Liga & Hasil Pertandingan</h2><p>Animasi memperkenalkan setiap pasangan klub A VS B per Matchday.</p></div><div class="actions"><button class="btn btn-ghost" data-action="animateLeague">▶ Putar Animasi Jadwal</button><button class="btn btn-ghost" data-action="generateLeague">⚽ Buat Ulang Jadwal</button></div></div>${ms.length?html:'<div class="empty"><b>Jadwal liga belum dibuat</b>Tekan Buat Jadwal Liga untuk membuat seluruh Matchday.</div>'}`;
 }
 if(t?.format==='hybrid'){
  // Kompatibilitas untuk hasil undian lama: pasangkan fixture lama ke ronde round-robin.
  const draw=getDraw();
  if(draw){
   draw.groups.forEach(g=>{
    const existing=ms.filter(m=>m.group===g.name);
    if(existing.length && existing.some(m=>m.roundIndex===undefined)){
     const rounds=buildGroupRounds(g.clubs),byPair=new Map();
     rounds.forEach((games,ri)=>games.forEach(pair=>byPair.set([pair[0].id,pair[1].id].sort().join('|'),ri)));
     existing.forEach(m=>{const key=[m.home,m.away].sort().join('|');m.roundIndex=byPair.get(key)??0;m.round=`Matchday ${(m.roundIndex??0)+1}`});
    }
   });save();
  }
  const roundIds=[...new Set(ms.filter(m=>m.group).map(m=>m.roundIndex??0))].sort((a,b)=>a-b);
  const html=roundIds.map((r,ri)=>{const games=ms.filter(m=>m.group&&(m.roundIndex??0)===r).sort((a,b)=>(a.matchNo||0)-(b.matchNo||0));return `<section class="panel league-matchday" style="margin-bottom:14px"><div class="rowline"><div><h3>⚽ Matchday ${ri+1}</h3><div class="muted tiny">${[...new Set(games.map(m=>m.group))].join(' • ')} · ${games.length} pertandingan lintas grup</div></div><div class="actions"><button class="btn btn-gold btn-sm" data-action="shareMatchday" data-round="${r}">Bagikan Jadwal MD ${ri+1}</button><button class="btn btn-ghost btn-sm" data-action="shareResultsMD" data-round="${r}">Hasil + Klasemen MD ${ri+1}</button></div></div><div class="league-fixtures" data-matchday="${r}">${games.map((m,i)=>{const a=db.clubs.find(c=>c.id===m.home),b=db.clubs.find(c=>c.id===m.away);return `<div class="league-fixture"><div class="muted tiny">${esc(m.group)} · PERTANDINGAN ${i+1}</div><div class="league-vs"><div class="league-side"><img class="club-logo" src="${logo(a||{})}"><b>${esc(a?.name||'TBD')}</b></div><strong>VS</strong><div class="league-side"><img class="club-logo" src="${logo(b||{})}"><b>${esc(b?.name||'TBD')}</b></div></div><div class="muted tiny">${m.played?`Skor ${m.hs} - ${m.as}`:'Belum dimainkan'} ${m.date?'• '+fmtDate(m.date):''} ${m.time?'• '+esc(m.time):''}</div><div class="actions" style="justify-content:center;margin-top:8px"><button class="btn btn-ghost btn-sm" data-action="editScore" data-id="${m.id}">Input / Edit Skor</button></div></div>`}).join('')}</div></section>`}).join('');
  return `<div class="section-head"><div><h2>Jadwal Fase Grup & Hasil</h2><p>Setiap Matchday berisi pertandingan Grup A, B, C, D secara bersamaan.</p></div><div class="actions"><button class="btn btn-ghost" data-action="animateLeague">▶ Putar Animasi Jadwal</button></div></div>${html||'<div class="empty"><b>Jadwal fase grup belum tersedia</b>Lakukan pengundian untuk membuat jadwal otomatis.</div>'}`;
 }
 return `<div class="section-head"><div><h2>Jadwal & Hasil Pertandingan</h2><p>Kelola tanggal, jam, venue, skor dan hasil pertandingan.</p></div><div class="actions"><button class="btn btn-gold" data-action="shareActualSchedule">Bagikan Jadwal • SUPER HD+</button><button class="btn btn-ghost" data-action="newMatch" ${!t?'disabled':''}>＋ Tambah Jadwal</button></div></div><div class="panel"><div class="table-wrap"><table><thead><tr><th>Pertandingan</th><th>Grup / Babak</th><th>Tanggal & Venue</th><th>Skor</th><th>Aksi</th></tr></thead><tbody>${ms.map(m=>{let a=db.clubs.find(c=>c.id===m.home),b=db.clubs.find(c=>c.id===m.away);return `<tr><td><b>${esc(a?.name||'TBD')} vs ${esc(b?.name||'TBD')}</b></td><td>${esc(m.group||m.round||'-')}</td><td>${m.date?fmtDate(m.date):'-'} ${m.time||''} ${esc(m.venue||'')}</td><td>${m.played?`${m.hs} - ${m.as}`:'-'}</td><td><button class="btn btn-ghost btn-sm" data-action="editScore" data-id="${m.id}">Input Skor</button></td></tr>`}).join('')}</tbody></table></div></div>`;
}
function backupPage(){return `<div class="grid two-col"><section class="panel"><h2>Backup & Restore</h2><p class="muted tiny">Simpan seluruh data aplikasi, termasuk turnamen, klub, hasil, jadwal, pengaturan, dan Catatan Saya ke satu file JSON. File dapat dipindahkan ke perangkat lain.</p><div class="actions"><button class="btn btn-gold" data-action="backup">⇩ Unduh Backup JSON</button><button class="btn btn-ghost" data-action="restore">⇧ Restore JSON</button></div><div class="notice" style="margin-top:15px">Data utama tersimpan di browser/perangkat ini. Menghapus data browser dapat menghilangkan data yang belum dibackup.</div></section><section class="panel"><h2>Pengaturan Aplikasi</h2><div class="field"><label>Nama aplikasi</label><input id="settingName" value="${esc(db.settings.name)}"></div><div class="field"><label>Kode negara WhatsApp (tanpa +)</label><input id="settingPrefix" value="${esc(db.settings.waPrefix)}"></div><button class="btn btn-gold" data-action="saveSettings">Simpan Pengaturan</button></section></div><div class="panel" style="margin-top:15px"><h2>Instalasi & Offline</h2><p class="muted tiny">Buka melalui localhost atau hosting HTTPS, lalu gunakan tombol Instal Aplikasi jika tersedia. Service worker menyimpan file inti agar aplikasi dapat dibuka offline setelah kunjungan pertama.</p><button class="btn btn-ghost" data-action="installHelp">Panduan instalasi</button></div>`}
function notesPage(){
 const q=noteSearch.trim().toLowerCase(),list=notes.filter(n=>!q||(n.title+' '+n.content).toLowerCase().includes(q)).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
 return `<div class="section-head notes-heading"><div><h2>📝 Catatan Saya</h2><p>Kelola aturan, informasi, dan pengumuman turnamen.</p></div><button class="btn btn-gold" data-action="newNote">＋ Buat Catatan Baru</button></div><div class="field notes-search"><input id="noteSearch" placeholder="⌕  Cari catatan..." value="${esc(noteSearch)}"></div><div class="notes-list">${list.length?list.map(n=>`<article class="panel note-card"><div class="note-icon">▤</div><div class="note-main"><h3>${esc(n.title)}</h3><p>${esc(n.content).replace(/\n/g,' ').slice(0,145)}${n.content.length>145?'…':''}</p><small>Diperbarui: ${new Date(n.updatedAt).toLocaleString('id-ID')}</small></div><div class="note-actions"><button class="btn btn-whatsapp btn-sm" data-action="shareNote" data-id="${n.id}" title="Bagikan ke WhatsApp">WhatsApp</button><button class="btn btn-ghost btn-sm" data-action="editNote" data-id="${n.id}">✎</button><button class="btn btn-danger btn-sm" data-action="deleteNote" data-id="${n.id}">Hapus</button></div></article>`).join(''):`<div class="empty"><b>${q?'Catatan tidak ditemukan':'Belum ada catatan'}</b>${q?'Coba kata kunci lain.':'Buat catatan pertama untuk menyimpan aturan atau informasi turnamen.'}</div>`}</div><div class="notice notes-storage">✓ Catatan tersimpan otomatis di perangkat ini. Tetap tersedia setelah web ditutup dan dibuka kembali.</div>`;
}
function editNoteForm(n){const editing=!!n;modal(editing?'Edit Catatan':'Buat Catatan Baru',`${field('Judul Catatan','noteTitle',n?.title||'') }<div class="field"><label>Isi Catatan</label><textarea name="noteContent" rows="8" placeholder="Tuliskan aturan, informasi, atau pengumuman...">${esc(n?.content||'')}</textarea></div>`,()=>{const title=formVal('noteTitle').trim(),content=formVal('noteContent').trim();if(!title||!content){toast('Judul dan isi catatan wajib diisi.');return false}const now=new Date().toISOString();if(editing){n.title=title;n.content=content;n.updatedAt=now}else notes.push({id:uid(),title,content,createdAt:now,updatedAt:now});saveNotes();render();toast(editing?'Catatan diperbarui.':'Catatan berhasil disimpan.');});}
function bindPage(){const input=$('#noteSearch');if(input)input.addEventListener('input',e=>{noteSearch=e.target.value;const pos=e.target.selectionStart;const v=$('#view');v.innerHTML=notesPage();const next=$('#noteSearch');next.focus();next.setSelectionRange(pos,pos);});}
async function fetchLogo(name){try{let q=encodeURIComponent(name+' football club');let r=await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=5&gsrnamespace=0&prop=pageimages&piprop=thumbnail&pithumbsize=180&format=json&origin=*`);let j=await r.json();let p=Object.values(j.query?.pages||{}).find(x=>x.thumbnail?.source);return p?.thumbnail?.source||''}catch{return ''}}
function tournamentFormatFields(format,t={}){
 let html='';
 if(format==='hybrid') html+=`<div class="form-grid">${field('Jumlah grup','groupCount',t.groupCount||2,'number','min="1" max="32"')}${field('Tim lolos per grup','qualifiers',t.qualifiers||2,'number','min="1" max="8"')}</div><div class="hint">Pengaturan ini digunakan untuk pembagian peserta dan penentuan klub yang lolos.</div>`;
 if(format==='league') html+=`<div class="form-grid">${selectField('Sistem pertandingan','legs',[['2','Kandang & tandang (setiap klub bertemu 2 kali)'],['1','Satu putaran (setiap klub bertemu 1 kali)']],String(t.legs||2))}${field('Jumlah klub degradasi','relegationCount',t.relegationCount??3,'number','min="0" max="20"')}</div><div class="notice">Juara ditentukan dari peringkat pertama pada akhir musim. Promosi/degradasi dikelola untuk musim/kasta berikutnya.</div>`;
 if(format==='knockout'||format==='hybrid') html+=`<div class="notice">Sistem gugur: pertandingan wajib memiliki pemenang. Jika imbang setelah 90 menit, catat extra time (2×15 menit); jika tetap imbang, tentukan pemenang melalui adu penalti (5 penendang awal lalu sudden death). Skor penalti dicatat terpisah dan tidak menambah gol klub. Aturan gol tandang tidak digunakan.</div>`;
 return html;
}
function newTournament(t){
 let edit=!!t,initialFormat=t?.format==='groups'?'hybrid':(t?.format||'hybrid');
 const existing=(t?.clubIds||[]).map(id=>db.clubs.find(c=>c.id===id)).filter(Boolean);
 const clubRows=(count,names=[])=>Array.from({length:count},(_,i)=>`<div class="form-grid club-entry"><div class="field"><label>Klub ${String(i+1).padStart(2,'0')}</label><input name="clubName_${i}" value="${esc(names[i]||`Klub ${String(i+1).padStart(2,'0')}`)}" placeholder="Masukkan nama klub ${i+1}" required></div></div>`).join('');
 const initialCount=Math.max(2,Math.min(128,existing.length||Number(t?.clubCount)||8));
 const initialNames=existing.map(c=>c.name);
 modal(edit?'Edit Turnamen':'Buat Turnamen',`${field('Nama turnamen','name',t?.name||'')}${selectField('Format kompetisi','format',[['league','Liga'],['hybrid','Fase Grup + Knock-out'],['knockout','Knock-out']],initialFormat)}<div class="form-grid">${field('Jumlah klub peserta','clubCount',initialCount,'number','min="2" max="128"')}</div><div id="formatSpecificFields">${tournamentFormatFields(initialFormat,t||{})}</div><div class="panel" style="margin-top:14px;padding:14px"><div class="section-head"><div><h3>Kelola Klub Peserta</h3><p id="clubCountHint">Daftar klub otomatis mengikuti jumlah peserta.</p></div><b id="clubCountBadge">${initialCount} Klub</b></div><div id="tournamentClubRows" class="club-form-list">${clubRows(initialCount,initialNames)}</div></div>`,()=>{
  const count=Number(formVal('clubCount')),format=formVal('format'),name=formVal('name').trim();
  if(!name||!Number.isInteger(count)||count<2||count>128){toast('Nama turnamen dan jumlah klub (2–128) wajib diisi dengan benar.');return false}
  if((format==='hybrid')&&(!Number.isInteger(+formVal('groupCount'))||+formVal('groupCount')<1||+formVal('groupCount')>32||!Number.isInteger(+formVal('qualifiers'))||+formVal('qualifiers')<1||+formVal('qualifiers')>8)){toast('Jumlah grup dan tim lolos harus diisi dengan benar.');return false}
  const names=Array.from({length:count},(_,i)=>$(`#modal [name="clubName_${i}"]`)?.value.trim()||'');
  if(names.some(n=>!n)){toast('Isi nama untuk seluruh klub peserta.');return false}
  let chosen=[];
  for(let i=0;i<count;i++){
   let club=existing[i];
   if(club){club.name=names[i];chosen.push(club.id)}
   else{let id=uid();db.clubs.push({id,name:names[i],location:'',phone:'',logo:'',logoSource:'initial'});chosen.push(id)}
  }
  let tdata={id:t?.id||uid(),name,format,legs:format==='league'?(+formVal('legs')||2):1,relegationCount:format==='league'?(+formVal('relegationCount')||3):0,groupCount:(format==='hybrid')?+formVal('groupCount'):0,qualifiers:(format==='hybrid')?+formVal('qualifiers'):0,clubIds:chosen,clubCount:count,createdAt:t?.createdAt||new Date().toISOString()};
  if(t){db.tournaments=db.tournaments.map(x=>x.id===t.id?tdata:x)}else{db.tournaments.push(tdata);db.activeTournament=tdata.id}
  save();log(edit?'Edit turnamen':'Buat turnamen',{name:tdata.name,format});render();return true
 },'Simpan Turnamen');
 const fmt=$('#modal [name=format]'),body=$('#modal #formatSpecificFields'),countInput=$('#modal [name=clubCount]'),rows=$('#modal #tournamentClubRows');
 fmt?.addEventListener('change',()=>{let prev={groupCount:formVal('groupCount')||t?.groupCount,qualifiers:formVal('qualifiers')||t?.qualifiers,legs:formVal('legs')||t?.legs};body.innerHTML=tournamentFormatFields(fmt.value,prev)});
 countInput?.addEventListener('input',()=>{
  let n=Math.max(2,Math.min(128,Number(countInput.value)||2));
  const current=Array.from(rows.querySelectorAll('input')).map(el=>el.value);
  rows.innerHTML=clubRows(n,current);
  $('#modal #clubCountBadge').textContent=n+' Klub';
  $('#modal #clubCountHint').textContent=`${n} kolom klub tersedia. Tambah atau kurangi jumlah untuk menyesuaikan daftar.`;
 });
}
function bulkClubs(){modal('Tambah Klub Berdasarkan Jumlah',`${field('Berapa klub yang ingin ditambahkan?','bulkCount','16','number','min="1" max="128"')}<div class="notice">Aplikasi akan membuat nama sementara seperti <b>Klub Baru 01</b>, <b>Klub Baru 02</b>, dan seterusnya. Setelah dibuat, tekan tombol <b>Edit</b> pada setiap klub untuk mengganti namanya.</div>`,()=>{let count=Number(formVal('bulkCount'));if(!Number.isInteger(count)||count<1||count>128){toast('Masukkan jumlah antara 1 sampai 128 klub.');return false}let created=[];for(let i=1;i<=count;i++){let id=uid();created.push({id,name:`Klub Baru ${String(i).padStart(2,'0')}`,location:'',phone:'',logo:'',logoSource:'initial'})}db.clubs.push(...created);let t=active();if(t){t.clubIds=[...new Set([...(t.clubIds||[]),...created.map(c=>c.id)])];t.clubCount=t.clubIds.length}save();log('Tambah klub massal',{jumlah:count,tournament:t?.name||null});render();toast(`${count} klub berhasil ditambahkan. Silakan edit nama klub.`);return true},'Buat Klub')}
function newClub(c){modal(c?'Edit Klub':'Tambah Klub',`${field('Nama klub','name',c?.name||'')}${field('Kota / Negara','location',c?.location||'')}${field('Nomor WhatsApp (opsional)','phone',c?.phone||'','tel')}${field('Unggah logo (opsional)','logoFile','','file','accept="image/*"')}<p class="hint">Jika logo tidak diunggah, aplikasi mencoba mencari thumbnail Wikipedia berdasarkan nama klub. Pastikan hasilnya benar; logo inisial akan digunakan bila tidak ditemukan.</p>`,()=>{let name=formVal('name').trim();if(!name){toast('Nama klub wajib diisi.');return false}let file=$('#modal [name=logoFile]').files[0];let done=logoData=>{let obj={id:c?.id||uid(),name,location:formVal('location'),phone:formVal('phone'),logo:logoData||c?.logo||'',logoSource:file?'manual':c?.logoSource||'initial'};if(c)db.clubs=db.clubs.map(x=>x.id===c.id?obj:x);else{db.clubs.push(obj);let current=active();if(current&&!current.clubIds.includes(obj.id)){current.clubIds.push(obj.id);current.clubCount=current.clubIds.length}}save();log(c?'Edit klub':'Tambah klub',{name});render()};if(file){if(file.size>1500000){toast('Ukuran logo maksimal 1,5 MB.');return false}let r=new FileReader();r.onload=()=>done(r.result);r.readAsDataURL(file)}else if(!c){fetchLogo(name).then(url=>done(url?url:''))}else done(c.logo);return true})}
function buildGroupRounds(clubList){
 let pool=[...clubList];if(pool.length%2)pool.push(null);
 const n=pool.length;if(n<2)return [];
 const rounds=[];
 for(let r=0;r<n-1;r++){
  const games=[];
  for(let i=0;i<n/2;i++){
   const a=pool[i],b=pool[n-1-i];if(a&&b)games.push(r%2?[b,a]:[a,b]);
  }
  rounds.push(games);
  pool=[pool[0],pool[n-1],...pool.slice(1,n-1)];
 }
 return rounds;
}
function runDraw(){
 let t=active();if(!t){toast('Pilih turnamen.');return}if(t.format==='league'||t.format==='knockout'){toast('Mode Liga/Knockout tidak menggunakan pengundian grup. Buat jadwal melalui menu Jadwal & Skor.');return}
 let participants=t.clubIds.map(id=>db.clubs.find(c=>c.id===id)).filter(Boolean);
 if(participants.length!==t.clubCount){toast(`Peserta belum lengkap. Dibutuhkan ${t.clubCount}, tersedia ${participants.length}.`);return}
 if(t.groupCount>participants.length){toast('Jumlah grup tidak boleh melebihi jumlah klub.');return}
 if(!confirm(`Mulai pengundian ${participants.length} klub ke ${t.groupCount} grup?`))return;
 let seed=crypto.getRandomValues(new Uint32Array(4)).join('-'),arr=[...participants];
 for(let i=arr.length-1;i>0;i--){let j=Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]/4294967296*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
 let groups=Array.from({length:t.groupCount},(_,i)=>({name:`GRUP ${String.fromCharCode(65+i)}`,clubs:[]}));
 arr.forEach((c,i)=>groups[i%groups.length].clubs.push(c));
 let snapshot=participants.map(c=>({id:c.id,name:c.name}));
 let payload=JSON.stringify({tournamentId:t.id,seed,snapshot,groups:groups.map(g=>({name:g.name,ids:g.clubs.map(c=>c.id)}))});
 const makeHash=async()=>{
   if(globalThis.crypto?.subtle?.digest){
     const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload));
     return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
   }
   // Fallback for browsers opened outside localhost/HTTPS; integrity is not cryptographic.
   let h=2166136261;for(let i=0;i<payload.length;i++){h^=payload.charCodeAt(i);h=Math.imul(h,16777619)}
   return 'local-fallback-'+(h>>>0).toString(16);
 };
 makeHash().then(commitment=>{
   db.draws=db.draws.filter(d=>d.tournamentId!==t.id);
   db.draws.push({id:uid(),tournamentId:t.id,at:new Date().toISOString(),seed,snapshot,commitment,groups});
   db.matches=db.matches.filter(m=>m.tournamentId!==t.id);
   // Susun fase grup dengan sistem round-robin per grup, lalu gabungkan
   // pertandingan dari semua grup ke Matchday yang sama.
   const groupRounds=groups.map(g=>({group:g.name,rounds:buildGroupRounds(g.clubs)}));
   const maxMatchdays=Math.max(0,...groupRounds.map(x=>x.rounds.length));
   let matchNo=1;
   for(let ri=0;ri<maxMatchdays;ri++){
    groupRounds.forEach(gr=>{
     (gr.rounds[ri]||[]).forEach(pair=>db.matches.push({id:uid(),tournamentId:t.id,home:pair[0].id,away:pair[1].id,group:gr.group,round:`Matchday ${ri+1}`,roundIndex:ri,matchNo:matchNo++,date:'',time:'',venue:'',played:false,hs:null,as:null}));
    });
   }
   save();log('Pengundian otomatis',{tournament:t.name,clubs:participants.length,groups:groups.length,commitment});
   nav('draw');
   toast('Pengundian dimulai. Perhatikan animasi klub satu per satu.');
   setTimeout(()=>animateDraw(getDraw()),120);
 }).catch(err=>{console.error(err);toast('Pengundian gagal. Jalankan aplikasi melalui Live Server atau HTTPS.')});
}
async function verifyDraw(){let d=getDraw();if(!d){toast('Belum ada hasil undian.');return}let payload=JSON.stringify({tournamentId:d.tournamentId,seed:d.seed,snapshot:d.snapshot,groups:d.groups.map(g=>({name:g.name,ids:g.clubs.map(c=>c.id)}))});let hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload));let value=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');toast(value===d.commitment?'Hash cocok: data undian sesuai snapshot tersimpan.':'PERINGATAN: hash tidak cocok!');log('Verifikasi hash',{valid:value===d.commitment})}
function newMatch(){let t=active(),d=getDraw();if(!t||!d)return;let opts=clubs().map(c=>[c.id,c.name]);modal('Tambah Jadwal',`${selectField('Tim kandang','home',opts,'')}${selectField('Tim tandang','away',opts,'')}${field('Tanggal','date','','date')}${field('Jam','time','','time')}${field('Venue','venue','')}${field('Grup / babak','stage','')}`,()=>{let home=formVal('home'),away=formVal('away');if(!home||!away||home===away){toast('Pilih dua klub yang berbeda.');return false}db.matches.push({id:uid(),tournamentId:t.id,home,away,date:formVal('date'),time:formVal('time'),venue:formVal('venue'),group:formVal('stage'),played:false});save();log('Tambah jadwal',{home,away});render()})}
function editScore(id){
 let m=db.matches.find(x=>x.id===id);if(!m)return;
 let a=db.clubs.find(c=>c.id===m.home),b=db.clubs.find(c=>c.id===m.away);
 const isKnockout=!!(m.round&&!m.group);
 let body=`${field(isKnockout?'Gol akhir kandang (termasuk extra time)':'Gol tim kandang','hs',m.hs??0,'number','min="0" step="1"')}${field(isKnockout?'Gol akhir tandang (termasuk extra time)':'Gol tim tandang','as',m.as??0,'number','min="0" step="1"')}`;
 if(m.group)body+=`<div class="form-grid">${field('Kartu kuning kandang','homeYellow',m.homeYellow??0,'number','min="0" step="1"')}${field('Kartu merah kandang','homeRed',m.homeRed??0,'number','min="0" step="1"')}${field('Kartu kuning tandang','awayYellow',m.awayYellow??0,'number','min="0" step="1"')}${field('Kartu merah tandang','awayRed',m.awayRed??0,'number','min="0" step="1"')}</div>`;
 if(isKnockout)body+=`${field('Gol penalti kandang (terpisah)','homePens',m.homePens??'','number','min="0" step="1"')}${field('Gol penalti tandang (terpisah)','awayPens',m.awayPens??'','number','min="0" step="1"')}`+selectField('Pemenang jika skor imbang (adu penalti)','winnerId',[['','Pilih pemenang adu penalti'],[m.home,a?.name||'Tim kandang'],[m.away,b?.name||'Tim tandang']],m.winnerId||'');
 modal('Input Hasil Pertandingan',body,()=>{
  const hsRaw=formVal('hs'),asRaw=formVal('as'),winnerId=formVal('winnerId');
  if(hsRaw===''||asRaw===''||!Number.isInteger(Number(hsRaw))||!Number.isInteger(Number(asRaw))||Number(hsRaw)<0||Number(asRaw)<0){toast('Masukkan skor berupa bilangan bulat 0 atau lebih.');return false}
  const hs=Number(hsRaw),as=Number(asRaw);
  if(isKnockout&&hs===as&&!winnerId){toast('Skor knockout imbang. Pilih pemenang adu penalti.');return false}
  if(isKnockout&&hs!==as&&winnerId){/* winner is determined by full-time score */}
  m.hs=hs;m.as=as;m.homeYellow=Number(formVal('homeYellow')||0);m.homeRed=Number(formVal('homeRed')||0);m.awayYellow=Number(formVal('awayYellow')||0);m.awayRed=Number(formVal('awayRed')||0);m.homePens=formVal('homePens')===''?null:Number(formVal('homePens'));m.awayPens=formVal('awayPens')===''?null:Number(formVal('awayPens'));m.played=true;
  m.winnerId=hs>as?m.home:hs<as?m.away:(isKnockout?winnerId:'');
  if(isKnockout)advanceKnockout(m.tournamentId);
  save();log('Input skor',{match:id,hs:m.hs,as:m.as,winnerId:m.winnerId});render();
  toast(isKnockout?'Hasil disimpan. Pemenang diteruskan ke babak berikutnya.':'Hasil pertandingan disimpan.');
 });
}
function roundLabel(size){
 if(size>=32)return 'Babak 32 Besar';if(size===16)return 'Babak 16 Besar';if(size===8)return 'Perempat Final';if(size===4)return 'Semifinal';if(size===2)return 'Final';return 'Knockout'
}
function advanceKnockout(tournamentId){
 const matches=db.matches.filter(m=>m.tournamentId===tournamentId&&!m.group&&m.round);
 const rounds=[...new Set(matches.map(m=>m.roundIndex??0))].sort((a,b)=>a-b);
 for(const ri of rounds){
  const current=matches.filter(m=>(m.roundIndex??0)===ri);
  for(const m of current){
   // A bye (only one participant) advances automatically without requiring a score.
   if(!m.home||!m.away){
    const byeWinner=m.home||m.away||'';
    if(byeWinner){
     m.winnerId=byeWinner;m.played=true;m.hs=null;m.as=null;
    }else{
     m.winnerId='';m.played=false;
    }
   }
   const winner=m.played?m.winnerId:'';
   const next=matches.find(x=>(x.roundIndex??0)===ri+1&&(x.homeFrom===m.id||x.awayFrom===m.id));
   if(!next)continue;
   const side=next.homeFrom===m.id?'home':'away';
   if(next[side]!==winner){
    next[side]=winner||'';
    // A changed/withdrawn participant invalidates every downstream score and winner.
    next.played=false;next.hs=null;next.as=null;next.winnerId='';
   }
  }
 }
}
function generateKO(){
 let t=active(),d=getDraw();if(!t||(t.format!=='knockout'&&!d))return;
 let qualified=[];
 if(t.format==='knockout'){qualified=t.clubIds.map(id=>db.clubs.find(c=>c.id===id)).filter(Boolean).map(club=>({club,rank:0,group:''}));}
 else d.groups.forEach(g=>tableStandings(g).slice(0,t.qualifiers).forEach((x,i)=>qualified.push({...x,rank:i+1,group:g.name})));
 if(qualified.length<2){toast('Belum cukup tim lolos.');return}
 if(!confirm(`Buat bagan knockout dari ${qualified.length} tim lolos? Bagan knockout lama untuk turnamen ini akan diganti.`))return;
 db.matches=db.matches.filter(m=>m.tournamentId!==t.id||m.group);
 let size=1;while(size<qualified.length)size*=2;
 let seeded=qualified.slice();
 // Undian ulang acak untuk menentukan pasangan dan penerima bye.
 for(let i=seeded.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[seeded[i],seeded[j]]=[seeded[j],seeded[i]];}
 while(seeded.length<size)seeded.push(null);
 let first=[],roundsCount=Math.log2(size);
 for(let i=0;i<size/2;i++){
  let a=seeded[i],b=seeded[size-1-i];
  first.push({id:uid(),tournamentId:t.id,home:a?.club.id||'',away:b?.club.id||'',round:roundLabel(size),roundIndex:0,matchNo:i+1,homeFrom:'',awayFrom:'',played:false,hs:null,as:null,winnerId:'',date:'',time:'',venue:''})
 }
 let previous=first;let currentSize=size/2;
 for(let ri=1;ri<roundsCount;ri++){
  let next=[];
  for(let i=0;i<previous.length/2;i++){
   next.push({id:uid(),tournamentId:t.id,home:'',away:'',round:roundLabel(currentSize),roundIndex:ri,matchNo:i+1,homeFrom:previous[i*2].id,awayFrom:previous[i*2+1].id,played:false,hs:null,as:null,winnerId:'',date:'',time:'',venue:''})
  }
  previous=next;currentSize/=2;db.matches.push(...next)
 }
 db.matches.push(...first);
 advanceKnockout(t.id);save();log('Buat bagan knockout',{qualified:qualified.length,slots:size,rounds:roundsCount});render();toast('Bagan lengkap dibuat. Tim bye otomatis maju ke babak berikutnya.')
}

// Capture langsung dari DOM halaman aktif agar gambar identik dengan tampilan web.
async function loadHtml2Canvas(){
 if(window.html2canvas)return window.html2canvas;
 if(!window.__fcdHtml2CanvasPromise){window.__fcdHtml2CanvasPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';script.onload=()=>resolve(window.html2canvas);script.onerror=()=>reject(new Error('Pustaka capture gambar gagal dimuat. Periksa koneksi internet lalu coba lagi.'));document.head.appendChild(script)})}
 return window.__fcdHtml2CanvasPromise;
}
async function shareActualPage(kind){
 const t=active(),target=$('#view');if(!t||!target){toast('Halaman turnamen belum siap.');return}
 if(kind==='schedule'&&!db.matches.some(m=>m.tournamentId===t.id)){toast('Jadwal pertandingan belum tersedia.');return}
 if(kind==='standings'&&t.format!=='league'&&!getDraw()){toast('Hasil pengundian grup belum tersedia.');return}
 const btn=document.querySelector(`[data-action="shareActual${kind==='schedule'?'Schedule':'Standings'}"]`);if(btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent='Menyiapkan gambar HD+…'}
 try{
  const html2canvas=await loadHtml2Canvas();
  // Tunggu logo/font pada halaman selesai dimuat sebelum mengambil gambar.
  if(document.fonts?.ready)await document.fonts.ready;
  await Promise.all([...target.querySelectorAll('img')].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=img.onerror=resolve;setTimeout(resolve,2500)})));
  const canvas=await html2canvas(target,{backgroundColor:'#111820',scale:3,useCORS:true,allowTaint:false,logging:false,windowWidth:Math.max(document.documentElement.clientWidth,target.scrollWidth),width:target.scrollWidth,height:target.scrollHeight,scrollX:0,scrollY:0,onclone:doc=>{
   const v=doc.querySelector('#view');if(v){v.style.overflow='visible';v.style.height='auto';v.style.maxHeight='none'}
   doc.querySelectorAll('#view button,#view .actions,#view [data-action]').forEach(el=>{el.style.setProperty('display','none','important')});
   doc.querySelectorAll('#view .fixture-current,#view .fixture-reveal').forEach(el=>{el.classList.remove('fixture-current','fixture-reveal')});
  }});
  const sliceHeight=2400,pages=Math.ceil(canvas.height/sliceHeight),files=[];
  for(let i=0;i<pages;i++){
   const y=i*sliceHeight,h=Math.min(sliceHeight,canvas.height-y),part=document.createElement('canvas');part.width=canvas.width;part.height=h;
   part.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
   const blob=await new Promise(resolve=>part.toBlob(resolve,'image/png'));
   if(!blob)throw new Error('Gagal mengubah hasil capture menjadi PNG.');
   files.push(new File([blob],`${kind==='schedule'?'Jadwal-Skor':'Hasil-Klasemen'}-${i+1}-dari-${pages}.png`,{type:'image/png'}));
  }
  const caption=kind==='schedule'?`⚽ ${t.name}\nJADWAL PERTANDINGAN\nSelamat bertanding! ⚽`:'';
  await shareImageSet(files,kind==='schedule'?'Jadwal Pertandingan':'Hasil & Klasemen',caption);
 }catch(err){console.error(err);toast(err.message||'Gagal mengambil gambar halaman.')}
 finally{if(btn){btn.disabled=false;btn.textContent=btn.dataset.oldText||'Bagikan SUPER HD+'}}
}

function shareCanvasBase(title,subtitle,rows){
 const W=1080,rowH=82,H=Math.max(1200,300+rows.length*rowH+100),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');drawShareBackground(x,W,H,title,subtitle);
 let y=245;rows.forEach((row,i)=>{x.fillStyle=i%2?'#172633':'#22394a';x.strokeStyle='#32b8e5';x.lineWidth=1;roundRect(x,54,y,W-108,68,12,true,true);x.fillStyle='#f2f6f8';x.textAlign='left';x.font='700 23px Roboto,Arial';wrapCanvasText(x,row,82,y+42,W-165,28,2);y+=rowH});
 x.textAlign='center';x.fillStyle='#f3d45d';x.font='600 17px Roboto,Arial';x.fillText('FOOTBALL CLUB DRAW',W/2,H-38);return c;
}
async function canvasFile(canvas,name){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.96));if(!blob)throw Error('Gagal membuat gambar.');return new File([blob],name,{type:'image/jpeg'})}
async function splitPosterFiles(canvas,baseName,maxHeight=2600){const total=Math.ceil(canvas.height/maxHeight),out=[];for(let i=0;i<total;i++){const y=i*maxHeight,h=Math.min(maxHeight,canvas.height-y),part=document.createElement('canvas');part.width=canvas.width;part.height=h;part.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);out.push(await canvasFile(part,`${baseName}-${i+1}-dari-${total}.jpg`))}return out;}
async function shareImageSet(files,title,message){
 try{if(navigator.share&&navigator.canShare&&navigator.canShare({files})){await navigator.share({title,text:message,files});toast('Pilih WhatsApp untuk membagikan seluruh gambar dan satu pesan.');return}}
 catch(e){if(e.name==='AbortError')return}
 files.forEach(f=>download(f,f.name));window.open(`https://wa.me/?text=${encodeURIComponent(message+'\n\nLampirkan seluruh gambar yang telah diunduh secara berurutan.')}`,'_blank','noopener');toast(`${files.length} gambar diunduh. Pesan WhatsApp dibuka satu kali.`);
}
function currentLeagueTable(){
 const t=active();if(!t)return [];let teams=t.clubIds.map(id=>db.clubs.find(c=>c.id===id)).filter(Boolean).map(club=>({club,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
 db.matches.filter(m=>m.tournamentId===t.id&&m.round?.startsWith('Pekan')&&m.played).forEach(m=>{const a=teams.find(x=>x.club.id===m.home),b=teams.find(x=>x.club.id===m.away);if(!a||!b)return;a.mp++;b.mp++;a.gf+=+m.hs;a.ga+=+m.as;b.gf+=+m.as;b.ga+=+m.hs;if(+m.hs>+m.as){a.w++;b.l++;a.pts+=3}else if(+m.hs<+m.as){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}});
 return teams.map(x=>({...x,gd:x.gf-x.ga})).sort((a,b)=>b.pts-a.pts||b.gf-a.gf||b.gd-a.gd||a.ga-b.ga||a.club.name.localeCompare(b.club.name));
}
function buildStandingsAtRound(clubs,matches,round,groupName=''){
 const rows=clubs.map(club=>({club,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
 matches.filter(m=>m.played&&(m.roundIndex??0)<=round&&(!groupName||m.group===groupName)).forEach(m=>{
  const a=rows.find(x=>x.club.id===m.home),b=rows.find(x=>x.club.id===m.away);if(!a||!b)return;
  const hs=Number(m.hs),as=Number(m.as);if(!Number.isFinite(hs)||!Number.isFinite(as))return;
  a.mp++;b.mp++;a.gf+=hs;a.ga+=as;b.gf+=as;b.ga+=hs;
  if(hs>as){a.w++;b.l++;a.pts+=3}else if(hs<as){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}
 });
 return rows.map(x=>({...x,gd:x.gf-x.ga})).sort((a,b)=>b.pts-a.pts||b.gf-a.gf||b.gd-a.gd||a.ga-b.ga||a.club.name.localeCompare(b.club.name));
}
const posterLogoCache=new Map();
async function preloadPosterLogos(clubs){
 const unique=[...new Map(clubs.filter(Boolean).map(c=>[c.id,c])).values()];
 await Promise.all(unique.map(club=>new Promise(resolve=>{
  const src=logo(club);if(posterLogoCache.has(src)){resolve();return}
  const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{posterLogoCache.set(src,im);resolve()};im.onerror=()=>{posterLogoCache.set(src,null);resolve()};im.src=src;
 })));
}
function paintClubLogo(ctx,club,x,y,size){const im=posterLogoCache.get(logo(club||{}));if(im){ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(im,x,y,size,size);ctx.restore()}else{ctx.fillStyle='#18384b';ctx.strokeStyle='#42bce9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f5d45e';ctx.font='700 16px Roboto,Arial';ctx.textAlign='center';ctx.fillText(String(club?.name||'FC').split(/\s+/).map(z=>z[0]).slice(0,3).join('').toUpperCase(),x+size/2,y+size/2+6)}}
function posterBase(ctx,w,h,title,subtitle,pageLabel=''){
 const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#101820');g.addColorStop(.5,'#1c2b38');g.addColorStop(1,'#0b1219');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 const glow=ctx.createRadialGradient(w*.5,0,10,w*.5,h*.25,h*.9);glow.addColorStop(0,'rgba(42,166,220,.28)');glow.addColorStop(1,'rgba(8,15,22,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#36bde9';ctx.fillRect(0,0,w,14);ctx.fillStyle='#f4d34e';ctx.fillRect(0,14,w,7);
 ctx.textAlign='center';ctx.fillStyle='#eef7fc';ctx.font='800 48px Roboto,Arial';ctx.fillText('FOOTBALL CLUB DRAW',w/2,86);
 ctx.fillStyle='#f5d45e';ctx.font='800 38px Roboto,Arial';ctx.fillText(String(title).toUpperCase(),w/2,148);
 ctx.fillStyle='#c8dce8';ctx.font='500 24px Roboto,Arial';ctx.fillText(String(subtitle||''),w/2,194);
 if(pageLabel){ctx.fillStyle='#62c9ed';ctx.font='600 18px Roboto,Arial';ctx.fillText(pageLabel,w/2,230)}
}
function drawResultSection(ctx,rows,y,label){
 const W=1080;ctx.fillStyle='#f4d34e';roundRect(ctx,48,y,W-96,54,14,true,false);ctx.fillStyle='#101820';ctx.textAlign='left';ctx.font='800 25px Roboto,Arial';ctx.fillText(label,72,y+36);y+=68;
 rows.forEach((m,i)=>{const a=db.clubs.find(c=>c.id===m.home),b=db.clubs.find(c=>c.id===m.away);ctx.fillStyle='#1c2e3d';ctx.strokeStyle='#35bce8';ctx.lineWidth=2;roundRect(ctx,48,y,W-96,86,15,true,true);paintClubLogo(ctx,a,105,y+18,50);paintClubLogo(ctx,b,925,y+18,50);ctx.textAlign='center';ctx.fillStyle='#f1f7fb';ctx.font='700 23px Roboto,Arial';ctx.fillText(a?.name||'Menunggu klub',W*.30,y+52);ctx.fillText(b?.name||'Menunggu klub',W*.70,y+52);ctx.fillStyle='#f5d34e';roundRect(ctx,W/2-72,y+18,144,50,12,true,false);ctx.fillStyle='#101820';ctx.font='900 25px Roboto,Arial';ctx.fillText(m.played?`${m.hs} - ${m.as}`:'VS',W/2,y+51);y+=98;});return y+24;
}
function drawStandingsSection(ctx,rows,y,label){
 const W=1080,left=48,width=W-96;ctx.fillStyle='#f4d34e';roundRect(ctx,left,y,width,54,14,true,false);ctx.fillStyle='#101820';ctx.textAlign='left';ctx.font='800 25px Roboto,Arial';ctx.fillText(label,left+24,y+36);y+=65;
 const cols=[['#',48,50],['KLUB',100,360],['MP',460,65],['M',525,60],['S',585,60],['K',645,60],['GM',705,70],['GK',775,70],['SG',845,75],['POIN',920,110]];
 ctx.fillStyle='#168fc7';ctx.fillRect(left,y,width,48);ctx.fillStyle='#fff';ctx.font='800 17px Roboto,Arial';cols.forEach(([t,x,w])=>{ctx.textAlign=t==='KLUB'?'left':'center';ctx.fillText(t,t==='KLUB'?x+8:x+w/2,y+31)});y+=48;
 rows.forEach((r,i)=>{ctx.fillStyle=i%2?'#1a2a37':'#243847';ctx.fillRect(left,y,width,58);ctx.fillStyle='#f2f7fa';ctx.font='600 18px Roboto,Arial';paintClubLogo(ctx,r.club,108,y+7,44);const vals=[i+1,r.club.name,r.mp,r.w,r.d,r.l,r.gf,r.ga,r.gd>0?'+'+r.gd:r.gd,r.pts];cols.forEach((c,j)=>{ctx.textAlign=j===1?'left':'center';const val=String(vals[j]);ctx.fillText(val.length>24?val.slice(0,22)+'…':val,j===1?c[1]+62:c[1]+c[2]/2,y+37)});ctx.fillStyle='#f4d34e';ctx.fillRect(left+width-105,y,105,58);ctx.fillStyle='#101820';ctx.textAlign='center';ctx.font='900 21px Roboto,Arial';ctx.fillText(String(r.pts),left+width-52,y+37);y+=58;});return y+30;
}
async function shareResultsMD(round){
 const t=active();if(!t)return;
 const all=db.matches.filter(m=>m.tournamentId===t.id);
 let sections=[];
 if(t.format==='league'){
  const games=all.filter(m=>m.round?.startsWith('Pekan')&&(m.roundIndex??0)===round&&m.played);
  if(!games.length){toast('Belum ada hasil selesai pada MD yang dipilih.');return}
  const teams=buildStandingsAtRound(t.clubIds.map(id=>db.clubs.find(c=>c.id===id)).filter(Boolean),all,round);
  sections=[{type:'results',title:`HASIL PERTANDINGAN • MD ${round+1}`,rows:games},{type:'table',title:`KLASEMEN KUMULATIF • SELESAI MD ${round+1}`,rows:teams}];
 }else if(t.format==='hybrid'){
  const draw=getDraw();if(!draw){toast('Hasil pengundian grup belum tersedia.');return}
  for(const group of draw.groups){const games=all.filter(m=>m.group===group.name&&(m.roundIndex??0)===round&&m.played);if(!games.length)continue;
   const teams=buildStandingsAtRound(group.clubs,all,round,group.name);
   sections.push({type:'results',title:`HASIL ${group.name} • MD ${round+1}`,rows:games});sections.push({type:'table',title:`KLASEMEN ${group.name} • SAMPAI MD ${round+1}`,rows:teams});
  }
  if(!sections.length){toast('Belum ada hasil grup selesai pada MD yang dipilih.');return}
 }else{toast('Knock-out menggunakan berbagi per babak.');return}
 await preloadPosterLogos(t.clubIds.map(id=>db.clubs.find(c=>c.id===id)));
 const W=1080,estimated=300+sections.reduce((n,s)=>n+(s.type==='results'?s.rows.length*98+100:s.rows.length*58+130),0),H=Math.max(1200,estimated),c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');posterBase(ctx,W,H,`HASIL & KLASEMEN • ${t.name}`,t.format==='league'?'KOMPETISI LIGA': 'FASE GRUP',`MATCHDAY ${round+1}`);
 let y=275;sections.forEach(sec=>{y=sec.type==='results'?drawResultSection(ctx,sec.rows,y,sec.title):drawStandingsSection(ctx,sec.rows,y,sec.title)});
 ctx.textAlign='center';ctx.fillStyle='#9bb4c5';ctx.font='16px Roboto,Arial';ctx.fillText('OFFICIAL TOURNAMENT • FOOTBALL CLUB DRAW',W/2,H-28);
 const files=await splitPosterFiles(c,`Hasil-Klasemen-MD-${round+1}`);await shareImageSet(files,`Hasil & Klasemen MD ${round+1}`,'');
}
async function shareLeagueTable(){
 const t=active();if(!t||t.format!=='league')return;
 const rows=currentLeagueTable();if(!rows.some(r=>r.mp>0)){toast('Belum ada hasil pertandingan liga.');return}
 await shareStandingsOnly([{title:'KLASEMEN LIGA',rows}],`KLASEMEN LIGA • ${t.name}`,'KOMPETISI LIGA');
}
async function shareGroupChart(){
 const t=active(),d=getDraw();if(!t||!d){toast('Hasil pengundian grup belum tersedia.');return}
 const sections=d.groups.map(g=>({title:`KLASEMEN ${g.name}`,rows:tableStandings(g)}));
 if(!sections.some(sec=>sec.rows.some(r=>r.mp>0))){toast('Belum ada hasil fase grup.');return}
 await shareStandingsOnly(sections,`KLASEMEN FASE GRUP • ${t.name}`,'FASE GRUP');
}
async function shareStandingsOnly(sections,title,subtitle){
 const t=active();if(!t)return;await preloadPosterLogos(sections.flatMap(sec=>sec.rows.map(r=>r.club)));
 const W=1080,head=270,rowH=66,gap=34,H=head+sections.reduce((n,sec)=>n+112+sec.rows.length*rowH+gap,0)+75;
 const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');posterBase(x,W,H,title,subtitle,'KLASEMEN TERKINI');let y=270;
 for(const sec of sections){x.fillStyle='#f4d34e';roundRect(x,48,y,W-96,54,13,true,false);x.fillStyle='#101820';x.textAlign='left';x.font='800 25px Roboto,Arial';x.fillText(sec.title,72,y+36);y+=64;
  const left=48,width=W-96,cols=[['#',48,50],['KLUB',100,360],['MP',460,65],['M',525,60],['S',585,60],['K',645,60],['GM',705,70],['GK',775,70],['SG',845,75],['POIN',920,110]];
  x.fillStyle='#168fc7';x.fillRect(left,y,width,48);x.fillStyle='#fff';x.font='800 17px Roboto,Arial';cols.forEach(([v,cx,cw])=>{x.textAlign=v==='KLUB'?'left':'center';x.fillText(v,v==='KLUB'?cx+8:cx+cw/2,y+31)});y+=48;
  sec.rows.forEach((r,i)=>{x.fillStyle=i%2?'#1a2a37':'#243847';x.fillRect(left,y,width,rowH-2);x.fillStyle='#f2f7fa';x.font='600 18px Roboto,Arial';const vals=[i+1,r.club.name,r.mp,r.w,r.d,r.l,r.gf,r.ga,r.gd>0?'+'+r.gd:r.gd,r.pts];
   vals.forEach((v,j)=>{x.textAlign=j===1?'left':'center';const tx=String(v);x.fillText(tx.length>25?tx.slice(0,23)+'…':tx,j===1?cols[j][1]+62:cols[j][1]+cols[j][2]/2,y+40)});paintClubLogo(x,r.club,108,y+8,42);
   x.fillStyle='#f4d34e';x.fillRect(left+width-105,y,105,rowH-2);x.fillStyle='#101820';x.textAlign='center';x.font='900 21px Roboto,Arial';x.fillText(String(r.pts),left+width-52,y+40);y+=rowH;
  });y+=gap;
 }
 x.textAlign='center';x.fillStyle='#9bb4c5';x.font='16px Roboto,Arial';x.fillText('OFFICIAL TOURNAMENT • FOOTBALL CLUB DRAW',W/2,H-28);
 await shareImageSet(await splitPosterFiles(c,'Klasemen-Saja'),'Klasemen','');
}
async function shareKORound(roundIndex){
 const t=active();if(!t)return;const games=db.matches.filter(m=>m.tournamentId===t.id&&!m.group&&m.round&&(m.roundIndex??0)===Number(roundIndex)).sort((a,b)=>(a.matchNo||0)-(b.matchNo||0));if(!games.length){toast('Babak yang dipilih tidak ditemukan.');return}
 const round=games[0].round;await preloadPosterLogos(games.flatMap(m=>[db.clubs.find(c=>c.id===m.home),db.clubs.find(c=>c.id===m.away)]));const W=1080,H=Math.max(900,300+games.length*130),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');posterBase(x,W,H,`HASIL & BRACKET • ${t.name}`,String(round).toUpperCase(),'HASIL BABAK TERPILIH');let y=280;
 games.forEach(m=>{const a=db.clubs.find(v=>v.id===m.home),b=db.clubs.find(v=>v.id===m.away);x.fillStyle='#1c2e3d';x.strokeStyle='#35bce8';x.lineWidth=2;roundRect(x,48,y,W-96,100,15,true,true);paintClubLogo(x,a,105,y+24,48);paintClubLogo(x,b,925,y+24,48);x.textAlign='center';x.fillStyle='#f1f7fb';x.font='700 22px Roboto,Arial';x.fillText(a?.name||'Menunggu pemenang',W*.30,y+42);x.fillText(b?.name||'Menunggu pemenang',W*.70,y+42);x.fillStyle='#f5d34e';roundRect(x,W/2-65,y+12,130,48,11,true,false);x.fillStyle='#101820';x.font='900 23px Roboto,Arial';x.fillText(m.played?`${m.hs} - ${m.as}`:'VS',W/2,y+43);x.fillStyle='#85d7f4';x.font='16px Roboto,Arial';x.fillText(m.winnerId?`LOLOS: ${db.clubs.find(v=>v.id===m.winnerId)?.name||''}`:(m.played?'SELESAI':'BELUM DIMAINKAN'),W/2,y+80);y+=120;});await shareImageSet(await splitPosterFiles(c,`Hasil-Knockout-${roundIndex+1}`),`Hasil Knock-out ${round}`,'');
}
async function shareKOChart(){
 const t=active();if(!t)return;const matches=db.matches.filter(m=>m.tournamentId===t.id&&!m.group&&m.round).sort((a,b)=>(a.roundIndex??0)-(b.roundIndex??0)||(a.matchNo||0)-(b.matchNo||0));if(!matches.length){toast('Bagan knockout belum dibuat.');return}
 const rounds=[...new Set(matches.map(m=>m.round))],files=[];
 for(let ri=0;ri<rounds.length;ri++){
  const games=matches.filter(m=>m.round===rounds[ri]);await preloadPosterLogos(games.flatMap(m=>[db.clubs.find(c=>c.id===m.home),db.clubs.find(c=>c.id===m.away)]));const W=1080,H=Math.max(900,300+games.length*130),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');posterBase(x,W,H,`HASIL & BRACKET • ${t.name}`,String(rounds[ri]).toUpperCase(),`BABAK ${ri+1}/${rounds.length}`);let y=280;
  games.forEach((m,i)=>{const a=db.clubs.find(v=>v.id===m.home),b=db.clubs.find(v=>v.id===m.away);x.fillStyle='#1c2e3d';x.strokeStyle='#35bce8';x.lineWidth=2;roundRect(x,48,y,W-96,100,15,true,true);paintClubLogo(x,a,105,y+24,48);paintClubLogo(x,b,925,y+24,48);x.textAlign='center';x.fillStyle='#f1f7fb';x.font='700 22px Roboto,Arial';x.fillText(a?.name||'Menunggu pemenang',W*.30,y+42);x.fillText(b?.name||'Menunggu pemenang',W*.70,y+42);x.fillStyle='#f5d34e';roundRect(x,W/2-65,y+12,130,48,11,true,false);x.fillStyle='#101820';x.font='900 23px Roboto,Arial';x.fillText(m.played?`${m.hs} - ${m.as}`:'VS',W/2,y+43);x.fillStyle='#85d7f4';x.font='16px Roboto,Arial';x.fillText(m.winnerId?`LOLOS: ${db.clubs.find(v=>v.id===m.winnerId)?.name||''}`:(m.played?'SELESAI':'BELUM DIMAINKAN'),W/2,y+80);y+=120;});
  files.push(...await splitPosterFiles(c,`Knockout-${ri+1}-${rounds.length}`));
 }
 await shareImageSet(files,'Hasil & Bracket Knock-out','');
}
function waPhone(club){let raw=String(club?.phone||'').replace(/\D/g,'');if(raw.length%2===0&&raw.slice(0,raw.length/2)===raw.slice(raw.length/2))raw=raw.slice(0,raw.length/2);const prefix=String(db.settings.waPrefix||'62').replace(/\D/g,'');if(raw.startsWith('0'))raw=prefix+raw.slice(1);else if(raw&&!raw.startsWith(prefix)&&raw.length>=9)raw=prefix+raw;return raw}
function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight,maxLines=2){const words=String(text||'').split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);lines=lines.slice(0,maxLines);lines.forEach((v,i)=>ctx.fillText(v,x,y+i*lineHeight));return lines.length*lineHeight}
function drawShareBackground(ctx,w,h,title,subtitle,pageLabel=''){
 ctx.fillStyle='#111820';ctx.fillRect(0,0,w,h);
 // Subtle stadium atmosphere, intentionally restrained to match the approved reference.
 const g=ctx.createRadialGradient(w*.5,0,10,w*.5,h*.35,h*.8);g.addColorStop(0,'#26394a');g.addColorStop(.55,'#17232e');g.addColorStop(1,'#10171e');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#42bce9';ctx.fillRect(0,0,w,12);ctx.fillStyle='#f4d35e';ctx.fillRect(0,12,w,4);
 ctx.textAlign='center';ctx.fillStyle='#9dcce0';ctx.font='600 22px Roboto,Arial';ctx.fillText('FOOTBALL CLUB DRAW',w/2,66);
 ctx.fillStyle='#f5d45e';ctx.font='800 42px Roboto,Arial';ctx.fillText(String(title).toUpperCase(),w/2,126);
 ctx.fillStyle='#e3edf4';ctx.font='500 23px Roboto,Arial';ctx.fillText(String(subtitle||''),w/2,168);
 if(pageLabel){ctx.fillStyle='#6fc8ec';ctx.font='600 18px Roboto,Arial';ctx.fillText(pageLabel,w/2,204)}
}
function drawMatchPoster(matches,t,heading,pageNo,totalPages){
 const W=1080,cardH=250,gap=22,top=245,H=top+matches.length*(cardH+gap)+110,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');drawShareBackground(x,W,H,heading,t.name,`HALAMAN ${pageNo}/${totalPages}`);
 matches.forEach((m,i)=>{const y=top+i*(cardH+gap);x.fillStyle='#202f3d';x.strokeStyle='#279bc9';x.lineWidth=2;roundRect(x,48,y,W-96,cardH,20,true,true);x.fillStyle='#f4d35e';x.font='700 19px Roboto,Arial';x.textAlign='left';x.fillText(`${m.group||m.round||'PERTANDINGAN'}  •  ${String(i+1).padStart(2,'0')}`,78,y+38);
 const a=db.clubs.find(v=>v.id===m.home),b=db.clubs.find(v=>v.id===m.away);x.textAlign='center';x.fillStyle='#f3f7fa';x.font='700 30px Roboto,Arial';paintClubLogo(x,a,170,y+115,64);paintClubLogo(x,b,846,y+115,64);x.fillText(a?.name||'Menunggu klub',W*.28,y+100);x.fillText(b?.name||'Menunggu klub',W*.72,y+100);
 x.fillStyle='#42bce9';x.font='800 34px Roboto,Arial';x.fillText('VS',W/2,y+100);
 x.fillStyle='#f5d45e';x.font='700 21px Roboto,Arial';x.fillText(m.date?fmtDate(m.date):'JADWAL PERTANDINGAN',W/2,y+145);
 x.fillStyle='#9fb6c8';x.font='500 18px Roboto,Arial';x.fillText(m.venue||'FOOTBALL CLUB DRAW',W/2,y+184);
 });x.textAlign='center';x.fillStyle='#8faabd';x.font='16px Roboto,Arial';x.fillText('OFFICIAL TOURNAMENT • FOOTBALL CLUB DRAW',W/2,H-35);return c;
}
function roundRect(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();if(stroke)ctx.stroke()}
async function shareMatchday(round){
 const t=active();if(!t)return;let games=db.matches.filter(m=>m.tournamentId===t.id&&(t.format==='league'?(m.roundIndex??0)===Number(round):t.format==='knockout'?(!m.group&&(m.roundIndex??0)===Number(round)):m.group&&(m.roundIndex??0)===Number(round))).sort((a,b)=>(a.matchNo||0)-(b.matchNo||0));
 if(!games.length){toast('Tidak ada pertandingan pada MD yang dipilih.');return}
 const btn=document.querySelector(`[data-action="shareMatchday"][data-round="${CSS.escape(String(round))}"]`);if(btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent='Membuat poster HD+…'}
 try{await preloadPosterLogos(games.flatMap(m=>[db.clubs.find(c=>c.id===m.home),db.clubs.find(c=>c.id===m.away)]));const per=5,pages=Math.ceil(games.length/per),files=[];for(let pg=0;pg<pages;pg++){const chunk=games.slice(pg*per,(pg+1)*per),canvas=drawMatchPoster(chunk,t,`JADWAL MATCHDAY ${Number(round)+1}`,pg+1,pages);files.push(await canvasFile(canvas,`Jadwal-MD-${Number(round)+1}-${pg+1}-dari-${pages}.jpg`))}
  const caption=games.map((m,i)=>{const a=db.clubs.find(c=>c.id===m.home),b=db.clubs.find(c=>c.id===m.away);return [`\\\\\\ PERTANDINGAN ${i+1}///`,`${a?.name||'Klub A'} VS ${b?.name||'Klub B'}`,'',`• ${a?.name||'Klub A'} : ${waPhone(a)}`,`• ${b?.name||'Klub B'} : ${waPhone(b)}`].join('\n')}).join('\n\n────────────────────\n\n');
  await shareImageSet(files,`Jadwal MD ${Number(round)+1}`,caption);
 }catch(err){console.error(err);toast(err.message||'Gagal membuat poster jadwal.')}finally{if(btn){btn.disabled=false;btn.textContent=btn.dataset.oldText||'Bagikan MD'}}
}

let leagueAnimationToken=0;
function animateLeague(){
 const cards=$$('.league-fixture');if(!cards.length){toast('Buat jadwal liga terlebih dahulu.');return}
 const token=++leagueAnimationToken;cards.forEach(c=>c.classList.remove('fixture-reveal','fixture-current'));
 let i=0;
 const next=()=>{
  if(token!==leagueAnimationToken||i>=cards.length)return;
  cards.forEach(c=>c.classList.remove('fixture-current'));
  cards[i].classList.add('fixture-reveal','fixture-current');
  i++;
  setTimeout(next,2000);
 };
 next();
}
function shareMatch(id){let m=db.matches.find(x=>x.id===id),a=db.clubs.find(c=>c.id===m.home),b=db.clubs.find(c=>c.id===m.away),t=active();let msg=`⚽ ${t?.name||'Jadwal Pertandingan'}\n${a?.name||'TBD'} vs ${b?.name||'TBD'}\nTanggal: ${fmtDate(m.date)}\nJam: ${m.time||'-'}\nVenue: ${m.venue||'-'}\n${m.group||m.round||''}\n\nInformasi dari FOOTBALL CLUB DRAW`;let phone=(a?.phone||'').replace(/\D/g,'');let prefix=db.settings.waPrefix||'62';if(phone.startsWith('0'))phone=prefix+phone.slice(1);let url=phone?`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`;window.open(url,'_blank','noopener')}

async function encodeCanvasVideo(canvas, paintFrames, filename, secondsPerFrame=1.5){
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const nativeMp4=['video/mp4;codecs=avc1.42E01E','video/mp4'].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
 const mime=nativeMp4||['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
 if(!mime||!canvas.captureStream)throw new Error('Browser tidak mendukung perekaman video.');
 const stream=canvas.captureStream(30),chunks=[];
 const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000});
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 const done=new Promise((resolve,reject)=>{recorder.onstop=()=>resolve(new Blob(chunks,{type:mime}));recorder.onerror=()=>reject(new Error('Perekaman video gagal.'))});
 recorder.start();
 for(let i=0;i<paintFrames.length;i++){paintFrames[i]();await wait(secondsPerFrame*1000)}
 recorder.stop();let blob=await done;stream.getTracks().forEach(tr=>tr.stop());
 if(blob.type.includes('mp4'))return new File([blob],filename+'.mp4',{type:'video/mp4'});
 // Browser produced WebM: transcode to H.264 MP4 using FFmpeg.wasm.
 if(!window.FFmpeg||!window.FFmpeg.createFFmpeg)throw new Error('Konversi MP4 belum tersedia. Sambungkan internet lalu muat ulang aplikasi agar mesin konversi MP4 dapat dimuat.');
 toast('Mengonversi video ke MP4…');
 const {createFFmpeg}=window.FFmpeg;
 window.__fcdFFmpeg=window.__fcdFFmpeg||createFFmpeg({log:false,corePath:'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'});
 const ff=window.__fcdFFmpeg;if(!ff.isLoaded())await ff.load();
 ff.FS('writeFile','input.webm',new Uint8Array(await blob.arrayBuffer()));
 await ff.run('-i','input.webm','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p','-movflags','+faststart','output.mp4');
 const data=ff.FS('readFile','output.mp4');const mp4=new Blob([data.buffer],{type:'video/mp4'});
 try{ff.FS('unlink','input.webm');ff.FS('unlink','output.mp4')}catch(e){}
 return new File([mp4],filename+'.mp4',{type:'video/mp4'});
}
async function shareMediaFiles(videoFile,photoBlob,message,title){
 const photoFile=new File([photoBlob],videoFile.name.replace(/\.mp4$/i,'-poster.jpg'),{type:'image/jpeg'});
 try{
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[videoFile,photoFile]})){
   await navigator.share({title,text:message,files:[videoFile,photoFile]});
   toast('Pilih WhatsApp untuk mengirim video MP4 dan foto sekaligus.');return;
  }
 }catch(e){if(e.name==='AbortError')return}
 download(videoFile,videoFile.name);download(photoFile,photoFile.name);
 window.open(`https://wa.me/?text=${encodeURIComponent(message+'\\n\\nVideo MP4 dan foto sudah diunduh. Lampirkan kedua file tersebut di WhatsApp.')}`,'_blank','noopener');
 toast('Video MP4 dan foto diunduh. Lampirkan keduanya pada WhatsApp.');
}

async function shareDrawVideo(){
 const d=getDraw(),t=active();if(!d||!t){toast('Belum ada hasil undian untuk dibuat video.');return}
 const items=[];d.groups.forEach((g,gi)=>g.clubs.forEach((club,si)=>items.push({club,group:g.name,groupIndex:gi,slot:si})));
 if(!items.length){toast('Belum ada klub yang ditempatkan dalam grup.');return}
 const W=720,H=1280,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 const cardW=310,cardH=174,gapX=14,gapY=10,left=43;
 const rr=(xx,yy,ww,hh,r,fill,stroke)=>{x.beginPath();x.roundRect(xx,yy,ww,hh,r);x.fillStyle=fill;x.fill();if(stroke){x.lineWidth=1.5;x.strokeStyle=stroke;x.stroke()}};
 function paint(currentIndex){
  const grad=x.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#f3f9ff');grad.addColorStop(1,'#dcecf9');x.fillStyle=grad;x.fillRect(0,0,W,H);
  rr(14,14,W-28,H-28,30,'rgba(255,255,255,.42)','#cbdfee');
  x.textAlign='center';x.fillStyle='#8aa0b2';x.font='bold 10px Arial';x.fillText('LIVE DRAW EXPERIENCE',W/2,55);
  rr(285,80,150,150,75,'#f8fcff','#dceaf5');x.font='76px Arial';x.fillStyle='#273e53';x.fillText('⚽',W/2,184);
  const current=items[currentIndex];
  x.fillStyle='#4389c3';x.font='bold 13px Arial';x.fillText('KLUB TERPILIH • PENEMPATAN BERLANGSUNG',W/2,280);
  x.fillStyle='#29455f';x.font='bold 34px Arial';x.fillText(String(current.club.name).slice(0,25),W/2,335);
  x.fillStyle='#397fb8';x.font='bold 16px Arial';x.fillText(`MASUK KE ${String(current.group).toUpperCase()}`,W/2,375);
  rr(65,410,590,13,7,'#d5e6f4');rr(65,410,590*(currentIndex+1)/items.length,7,7,'#4195d3');
  x.fillStyle='#7b91a5';x.font='14px Arial';x.fillText(`${currentIndex+1} / ${items.length}`,W/2,452);
  rr(32,478,656,770,25,'rgba(255,255,255,.62)','#d4e4f0');
  x.textAlign='left';x.fillStyle='#47677f';x.font='bold 13px Arial';x.fillText('PAPAN PENEMPATAN GRUP',48,507);
  x.textAlign='right';x.fillStyle='#8aa0b2';x.font='bold 9px Arial';x.fillText('HASIL MUNCUL BERTAHAP',672,507);
  d.groups.forEach((g,gi)=>{
   const col=gi%2,row=Math.floor(gi/2),gx=left+col*(cardW+gapX),gy=520+row*(cardH+gapY);if(gy+cardH>1248)return;
   rr(gx,gy,cardW,cardH,17,'#ffffff','#d9e7f1');rr(gx,gy,cardW,36,14,'#dceefd');
   x.fillStyle='#386486';x.font='bold 13px Arial';x.textAlign='center';x.fillText(String(g.name).toUpperCase(),gx+cardW/2,gy+23);
   for(let si=0;si<4;si++){
    const yy=gy+39+si*32,placed=g.clubs[si],itemIndex=items.findIndex(it=>it.groupIndex===gi&&it.slot===si),visible=itemIndex>=0&&itemIndex<=currentIndex,isCurrent=itemIndex===currentIndex;
    if(isCurrent)rr(gx+4,yy,cardW-8,29,8,'#fff2c9','#edcf70');else if(si>0){x.strokeStyle='#e8eff5';x.beginPath();x.moveTo(gx+8,yy);x.lineTo(gx+cardW-8,yy);x.stroke()}
    rr(gx+9,yy+2,32,25,7,visible?'#dceefd':'#eef3f7');
    x.fillStyle=visible?'#47789b':'#9aabb8';x.font='bold 11px Arial';x.textAlign='center';x.fillText(String(si+1).padStart(2,'0'),gx+25,yy+19);
    x.textAlign='left';x.fillStyle=visible?'#405b70':'#a7b4be';x.font=visible?'bold 11px Arial':'11px Arial';x.fillText(visible?String(placed?.name||'Klub').slice(0,27):'Menunggu klub...',gx+49,yy+19);
   }
  });
  x.textAlign='center';x.fillStyle='#8399aa';x.font='10px Arial';x.fillText('FOOTBALL CLUB DRAW  •  LIVE DRAW RESULT',W/2,1265);
 }
 const frames=items.map((_,i)=>()=>paint(i));toast('Membuat video Live Draw MP4…');
 try{paint(items.length-1);const poster=await new Promise(r=>c.toBlob(r,'image/jpeg',.96));const video=await encodeCanvasVideo(c,frames,`Football-Club-Draw-${Date.now()}`,2);await shareMediaFiles(video,poster,`🏆 Hasil pengundian ${t.name}\n${items.length} klub telah ditempatkan ke grup.`,'Hasil Pengundian Football Club Draw')}
 catch(e){toast(e.message||'Gagal membuat video MP4.')}
}
async function shareLeagueVideo(){
 const t=active(),ms=db.matches.filter(m=>m.tournamentId===t?.id).sort((a,b)=>(a.roundIndex??0)-(b.roundIndex??0)||(a.matchNo||0)-(b.matchNo||0));
 if(!t||!ms.length){toast('Buat jadwal liga terlebih dahulu.');return}
 const c=document.createElement('canvas');c.width=720;c.height=1280;const x=c.getContext('2d');
 const paint=(m,i)=>{
  const a=db.clubs.find(z=>z.id===m.home),b=db.clubs.find(z=>z.id===m.away);
  const g=x.createLinearGradient(0,0,720,1280);g.addColorStop(0,'#eaf4ff');g.addColorStop(1,'#b8d8f5');x.fillStyle=g;x.fillRect(0,0,720,1280);
  x.textAlign='center';x.fillStyle='#244d75';x.font='bold 34px Arial';x.fillText('FOOTBALL CLUB DRAW',360,100);
  x.fillStyle='#426789';x.font='27px Arial';x.fillText(t.name.slice(0,34),360,160);
  x.fillStyle='#2f80c5';x.font='bold 34px Arial';x.fillText(`MATCHDAY ${(m.roundIndex??0)+1}`,360,330);
  x.fillStyle='#fff';x.fillRect(45,430,630,420);
  x.fillStyle='#1c3550';x.font='bold 38px Arial';x.fillText(`PERTANDINGAN ${i+1} / ${ms.length}`,360,500);
  x.font='bold 44px Arial';x.fillText((a?.name||'TBD').slice(0,22),360,625);
  x.fillStyle='#2f80c5';x.font='bold 54px Arial';x.fillText('VS',360,710);
  x.fillStyle='#1c3550';x.font='bold 44px Arial';x.fillText((b?.name||'TBD').slice(0,22),360,790);
  x.fillStyle='#52718c';x.font='26px Arial';x.fillText(m.date?fmtDate(m.date):'JADWAL PERTANDINGAN',360,970);
  x.fillText(m.time||'FOOTBALL LEAGUE',360,1030);
  x.fillStyle='#2478bd';x.fillRect(80,1180,560,10);x.fillRect(80,1180,560*(i+1)/ms.length,10);
 };
 const frames=ms.map((m,i)=>()=>paint(m,i));
 toast('Membuat animasi A VS B menjadi MP4…');
 try{
  paint(ms[0],0);const poster=await new Promise(r=>c.toBlob(r,'image/jpeg',.94));
  const video=await encodeCanvasVideo(c,frames,`Football-League-A-VS-B-${Date.now()}`,1.6);
  await shareMediaFiles(video,poster,`⚽ Animasi jadwal ${t.name}\\n${ms.length} pertandingan dalam ${(Math.max(...ms.map(m=>m.roundIndex??0))+1)} Matchday.`,'Animasi Jadwal Liga A VS B');
 }catch(e){toast(e.message||'Gagal membuat video MP4.')}
}

function download(blob,name){let a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
function exportCanvas(kind){let d=getDraw();if(!d){toast('Belum ada hasil undian.');return}let c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=1400;c.height=Math.max(900,220+d.groups.reduce((n,g)=>n+g.clubs.length*100+100,0));ctx.fillStyle='#111416';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#e9bd4b';ctx.font='bold 48px Arial';ctx.fillText(active().name,70,85);ctx.fillStyle='#f4f4ee';ctx.font='24px Arial';ctx.fillText('HASIL PENGUNDIAN RESMI',70,130);let y=210;d.groups.forEach(g=>{ctx.fillStyle='#e9bd4b';ctx.font='bold 30px Arial';ctx.fillText(g.name,70,y);y+=50;g.clubs.forEach((cl,i)=>{ctx.fillStyle='#202629';ctx.fillRect(70,y-30,1260,75);ctx.fillStyle='#f4f4ee';ctx.font='bold 25px Arial';ctx.fillText(`${i+1}.  ${cl.name}`,100,y+15);y+=90});y+=25});c.toBlob(b=>download(b,`football-club-draw.${kind==='jpg'?'jpg':'png'}`),kind==='jpg'?'image/jpeg':'image/png',.94)}
function mediaDraw(){let c=$('#mediaCanvas');if(!c)return;let portrait=$('#mediaOrientation')?.value!=='landscape';c.width=portrait?720:1280;c.height=portrait?1280:720;let x=c.getContext('2d'),d=getDraw();x.fillStyle='#111416';x.fillRect(0,0,c.width,c.height);x.fillStyle='#e9bd4b';x.textAlign='center';x.font=`bold ${portrait?42:54}px Arial`;x.fillText('FOOTBALL CLUB DRAW',c.width/2,portrait?100:90);x.fillStyle='#fff';x.font='bold 30px Arial';x.fillText(active()?.name||'TOURNAMENT DRAW',c.width/2,portrait?155:145);if(!d){x.font='24px Arial';x.fillText('Belum ada hasil pengundian',c.width/2,c.height/2);return}let cols=portrait?1:2,cardW=(c.width-100-(cols-1)*30)/cols,top=portrait?220:210;d.groups.forEach((g,i)=>{let col=i%cols,row=Math.floor(i/cols),xx=50+col*(cardW+30),yy=top+row*(portrait?g.clubs.length*70+100:260);x.fillStyle='#28291f';x.fillRect(xx,yy,cardW,portrait?g.clubs.length*70+70:230);x.fillStyle='#e9bd4b';x.textAlign='left';x.font='bold 28px Arial';x.fillText(g.name,xx+22,yy+45);g.clubs.forEach((cl,j)=>{x.fillStyle='#f1f1ec';x.font='bold 21px Arial';x.fillText(`${j+1}. ${cl.name.slice(0,25)}`,xx+25,yy+95+j*48)})})}
function startRecording(){let c=$('#mediaCanvas');if(!c.captureStream||!window.MediaRecorder){toast('Browser ini belum mendukung rekaman canvas.');return}mediaDraw();let stream=c.captureStream(30),mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));if(!mime){toast('Codec WebM tidak didukung.');return}recording={rec:new MediaRecorder(stream,{mimeType:mime}),chunks:[]};recording.rec.ondataavailable=e=>{if(e.data.size)recording.chunks.push(e.data)};recording.rec.onstop=()=>{download(new Blob(recording.chunks,{type:mime}),'football-club-draw.webm');stream.getTracks().forEach(t=>t.stop());recording=null;toast('Video WebM selesai dibuat.')};recording.rec.start();$$('[data-action=recordMedia]')[0].disabled=true;$$('[data-action=stopMedia]')[0].disabled=false;let start=Date.now();recording.timer=setInterval(()=>{mediaDraw();if(Date.now()-start>15000)stopRecording()},500)}
function stopRecording(){if(!recording)return;clearInterval(recording.timer);recording.rec.stop();$$('[data-action=recordMedia]')[0].disabled=false;$$('[data-action=stopMedia]')[0].disabled=true}
function shareTournamentInfo(id){
 const t=db.tournaments.find(x=>x.id===id);
 if(!t){toast('Turnamen tidak ditemukan.');return}
 const participants=(t.clubIds||[]).map(cid=>db.clubs.find(c=>c.id===cid)).filter(Boolean);
 const n=participants.length;
 const lines=['━━━━━━━━━━━━━━━━━━',`🏆 NAMA TURNAMEN : ${t.name}`,`⚽ JUMLAH PESERTA : ${n} KLUB`];
 if(t.format==='league'){
  const legs=Math.max(1,Number(t.legs)||1);
  const isDouble=legs===2;
  const matchDays=(n<=1)?0:(n%2===0?(n-1)*legs:n*legs);
  const matchesPerDay=Math.floor(n/2);
  const perClubMatches=Math.max(0,(n-1)*legs);
  const totalMatches=n*(n-1)/2*legs;
  lines.push(`♻️ Sistem kompetisi : ${isDouble?'DOUBLE ROUND ROBIN (2 LEG)':'SINGLE ROUND ROBIN (1 LEG)'}`);
  lines.push(`🏟️ Setiap klub ${isDouble?'bertemu seluruh lawan sebanyak 2 kali':'bertemu seluruh lawan sebanyak 1 kali'}:`);
  if(isDouble)lines.push('• Pertemuan 1 : HOME','• Pertemuan 2 : AWAY');
  else lines.push('• Setiap pasangan bertemu 1 kali.');
  lines.push(`📅 TOTAL MATCH DAY : ${matchDays}`,'📊 RINCIAN KOMPETISI',`• Total pertandingan setiap klub : ${perClubMatches} MATCH.`,`• Pertandingan setiap Match Day : ${matchesPerDay} MATCH.`);
  if(n%2===1)lines.push('• Setiap Match Day terdapat 1 klub yang mendapatkan giliran istirahat (BYE).');
  lines.push(`• Total keseluruhan pertandingan liga : ${totalMatches} MATCH.`,'━━━━━━━━━━━━━━━━━━',`🏆 ${matchDays} MATCH DAY – ${totalMatches} MATCH`,'⚽ Selamat bertanding dan junjung tinggi sportivitas!');
 }else if(t.format==='hybrid'){
  lines.push('♻️ Sistem kompetisi : FASE GRUP + KNOCK-OUT',`📊 JUMLAH GRUP : ${Number(t.groupCount)||0} GRUP`,`🏅 TIM LOLOS PER GRUP : ${Number(t.qualifiers)||0} KLUB`,'🏟️ Peserta dibagi ke dalam grup dan klub yang lolos melanjutkan ke babak Knock-out.','━━━━━━━━━━━━━━━━━━','⚽ Selamat bertanding dan junjung tinggi sportivitas!');
 }else if(t.format==='knockout'){
  lines.push('♻️ Sistem kompetisi : KNOCK-OUT / SISTEM GUGUR','🏟️ Pertandingan menggunakan sistem gugur. Pemenang melaju ke babak berikutnya.','━━━━━━━━━━━━━━━━━━','⚽ Selamat bertanding dan junjung tinggi sportivitas!');
 }else{
  lines.push(`♻️ Sistem kompetisi : ${String(t.format||'').toUpperCase()}`,'━━━━━━━━━━━━━━━━━━','⚽ Selamat bertanding dan junjung tinggi sportivitas!');
 }
 window.open('https://wa.me/?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener,noreferrer');
}
function action(a,id){let c=db.clubs.find(x=>x.id===id),t=db.tournaments.find(x=>x.id===id);switch(a){case'shareTournamentInfo':shareTournamentInfo(id);break;case'newTournament':newTournament();break;case'editTournament':newTournament(t);break;case'selectTournament':db.activeTournament=id;page='clubs';save();nav('clubs');break;case'deleteTournament':if(confirm('Hapus turnamen ini beserta hasil dan jadwalnya?')){db.tournaments=db.tournaments.filter(x=>x.id!==id);db.draws=db.draws.filter(x=>x.tournamentId!==id);db.matches=db.matches.filter(x=>x.tournamentId!==id);if(db.activeTournament===id)db.activeTournament=db.tournaments[0]?.id||null;save();log('Hapus turnamen',{id});render()}break;case'newClub':newClub();break;case'bulkClubs':bulkClubs();break;case'editClub':newClub(c);break;case'deleteClub':if(confirm(`Hapus klub ${c.name}?`)){db.clubs=db.clubs.filter(x=>x.id!==id);db.tournaments.forEach(x=>x.clubIds=x.clubIds.filter(y=>y!==id));save();log('Hapus klub',{name:c.name});render()}break;case'runDraw':runDraw();break;case'replayDraw':{const d=getDraw();if(!d){toast('Hasil undian belum ada.');break}animateDraw(d);break;}case'resetDraw':if(confirm('Hapus hasil undian dan jadwal turnamen ini?')){db.draws=db.draws.filter(x=>x.tournamentId!==active().id);db.matches=db.matches.filter(x=>x.tournamentId!==active().id);save();log('Reset undian');render()}break;case'newMatch':newMatch();break;case'editScore':editScore(id);break;case'deleteMatch':if(confirm('Hapus jadwal ini?')){db.matches=db.matches.filter(x=>x.id!==id);save();render()}break;case'shareMatch':shareMatch(id);break;case'shareMatchday':shareMatchday(id);break;case'shareResultsMD':shareResultsMD(Number(id));break;case'shareKOSchedule':shareMatchday(id);break;case'shareKORound':shareKORound(Number(id));break;case'shareActualSchedule':shareActualPage('schedule');break;case'shareActualStandings':active()?.format==='league'?shareLeagueTable():shareGroupChart();break;case'animateLeague':animateLeague();break;case'shareLeagueTable':shareLeagueTable();break;case'shareGroupChart':shareGroupChart();break;case'shareKOChart':shareKOChart();break;case'generateKO':generateKO();break;case'generateLeague':generateLeague();break;case'shareDrawVideo':shareDrawVideo();break;case'verifyDraw':verifyDraw();break;case'backup':{
 const payload={
  app:'FOOTBALL CLUB DRAW',
  backupFormat:'FCD_FULL_BACKUP',
  backupVersion:2,
  createdAt:new Date().toISOString(),
  appData:db,
  notes:notes
 };
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 download(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),`football-club-draw-full-backup-${stamp}.json`);
 toast(`Backup lengkap berhasil dibuat. ${db.tournaments.length} turnamen, ${db.clubs.length} klub, ${db.draws.length} hasil undian, ${db.matches.length} pertandingan, dan ${notes.length} catatan.`);
 break;
}case'restore':$('#restoreFile').click();break;case'saveSettings':db.settings.name=$('#settingName').value;db.settings.waPrefix=$('#settingPrefix').value.replace(/\D/g,'')||'62';save();log('Ubah pengaturan');toast('Pengaturan disimpan.');break;case'previewMedia':mediaDraw();break;case'recordMedia':startRecording();break;case'stopMedia':stopRecording();break;case'exportPNG':exportCanvas('png');break;case'exportJPG':exportCanvas('jpg');break;case'installHelp':toast('Gunakan Chrome → menu ⋮ → Instal aplikasi / Tambahkan ke layar utama.');break;case'newNote':editNoteForm();break;case'editNote':editNoteForm(notes.find(n=>n.id===id));break;case'deleteNote':{const n=notes.find(x=>x.id===id);if(n&&confirm(`Hapus catatan \"${n.title}\"?`)){notes=notes.filter(x=>x.id!==id);saveNotes();render();toast('Catatan dihapus.')}break}case'shareNote':{const n=notes.find(x=>x.id===id);if(n){const text=n.content;window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener');}break}}}
document.addEventListener('click',e=>{let n=e.target.closest('[data-page]');if(n){nav(n.dataset.page);return}let g=e.target.closest('[data-go]');if(g){nav(g.dataset.go);return}let a=e.target.closest('[data-action]');if(a){action(a.dataset.action,['shareMatchday','shareResultsMD','shareKOSchedule','shareKORound'].includes(a.dataset.action)?a.dataset.round:a.dataset.id)}});
$('#menuToggle').onclick=()=>$('#sidebar').classList.toggle('open');
$('#restoreFile').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
  const parsed=JSON.parse(await f.text());
  let restoredData,restoredNotes=null;
  // Format backup lengkap versi 2.
  if(parsed?.backupFormat==='FCD_FULL_BACKUP'&&parsed.appData){
   restoredData=parsed.appData;
   if(!Array.isArray(parsed.notes))throw Error('Bagian catatan pada backup tidak valid.');
   restoredNotes=parsed.notes;
  }else{
   // Kompatibilitas dengan file backup versi lama yang hanya berisi data utama.
   restoredData=parsed;
  }
  if(!restoredData||!Array.isArray(restoredData.clubs)||!Array.isArray(restoredData.tournaments)||
     !Array.isArray(restoredData.draws)||!Array.isArray(restoredData.matches)){
   throw Error('Format backup tidak dikenali atau data tidak lengkap.');
  }
  if(restoredNotes!==null&&!Array.isArray(restoredNotes))throw Error('Format catatan tidak valid.');
  if(confirm('Restore akan mengganti data aplikasi saat ini. Lanjutkan?')){
   delete restoredData.audit;
   db={...blank(),...restoredData,settings:{...blank().settings,...(restoredData.settings||{})}};
   if(restoredNotes!==null){
    notes=restoredNotes;
    saveNotes();
   }
   save();
   log('Restore backup lengkap',{notes:notes.length});
   render();
   toast(`Restore berhasil. ${db.tournaments.length} turnamen, ${db.clubs.length} klub, ${db.draws.length} hasil undian, ${db.matches.length} pertandingan, dan ${notes.length} catatan tersedia.`);
  }
 }catch(err){
  toast('Gagal restore: '+err.message);
 }finally{
  e.target.value='';
 }
};
$('#mediaOrientation')?.addEventListener('change',mediaDraw);
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
nav('dashboard');
})();
