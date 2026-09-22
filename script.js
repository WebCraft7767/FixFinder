const fixers = [
  { name:'Maya Tech Care', category:'Tech & Laptops', specialty:'Laptop & Screen Repair', rating:4.9, rate:299, response:'~12 min', badges:['Student Focus','Popular Example'], discount:15, initials:'MT', icon:'💻', lat:25.3176, lng:82.9739 },
  { name:'Ravi Bike Works', category:'Bikes & Scooters', specialty:'Bike Tune-ups & Scooters', rating:4.8, rate:199, response:'~20 min', badges:['Popular Example'], discount:10, initials:'RB', icon:'🚲', lat:25.3220, lng:82.9850 },
  { name:'QuickFix Furniture', category:'Furniture Assembly', specialty:'Furniture Assembly', rating:4.9, rate:249, response:'~25 min', badges:['Student Focus'], discount:12, initials:'QF', icon:'🪑', lat:25.3105, lng:82.9680 },
  { name:'Apex Appliance Care', category:'Small Appliances', specialty:'Fans, mixers & small appliances', rating:4.7, rate:349, response:'~35 min', badges:['Demo Listing'], discount:8, initials:'AA', icon:'⚡', lat:25.3290, lng:82.9790 },
  { name:'Campus Laptop Lab', category:'Tech & Laptops', specialty:'Laptop diagnostics & upgrades', rating:5.0, rate:399, response:'~10 min', badges:['Student Focus','Example Rating'], discount:15, initials:'CL', icon:'🛠️', lat:25.3150, lng:82.9920 },
  { name:'Neighborhood HandyPro', category:'Furniture Assembly', specialty:'Furniture, shelves & minor home fixes', rating:4.8, rate:299, response:'~30 min', badges:['Popular Example'], discount:5, initials:'NH', icon:'🔧', lat:25.3050, lng:82.9800 }
];

let currentCategory = 'All';
let studentView = true;

let map;
const markerLayer = L.layerGroup();
const markerRefs = new Map();
let userMarker = null;

function initMap() {
  map = L.map('fixerMap', { scrollWheelZoom: true }).setView([25.3176, 82.9739], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  markerLayer.addTo(map);
  updateMapMarkers();
}

function popupHtml(f) {
  return `
    <div style="min-width:220px;font-family:Inter,Roboto,Arial,sans-serif">
      <div style="font-size:16px;font-weight:800;color:#0f172a">${f.icon} ${f.name}</div>
      <div style="margin-top:4px;color:#64748b;font-size:13px">${f.specialty}</div>
      <div style="margin-top:8px;font-weight:800;color:#b45309">★ ${f.rating}</div>
      <div style="margin-top:4px;color:#334155;font-size:13px">From ₹${f.rate}/hr · ${f.response}</div>
      ${studentView ? `<div style="margin-top:7px;color:#0f766e;font-weight:700;font-size:12px">🎓 ${f.discount}% student discount</div>` : ''}
      <button onclick="book('${f.name.replace(/'/g, "\\'")}')" style="margin-top:10px;width:100%;border:0;border-radius:9px;padding:8px 10px;background:#0f172a;color:white;font-weight:700;cursor:pointer">Start Demo Request</button>
    </div>`;
}

function updateMapMarkers() {
  if (!map) return;
  markerLayer.clearLayers();
  markerRefs.clear();

  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const visible = fixers.filter(f => {
    const categoryMatch =
      currentCategory === 'All' ||
      f.category === currentCategory ||
      (currentCategory === 'Student Specials' && f.discount > 0);
    const searchMatch =
      !q || [f.name, f.category, f.specialty].join(' ').toLowerCase().includes(q);
    return categoryMatch && searchMatch && (!studentView || f.discount > 0);
  });

  visible.forEach(f => {
    const marker = L.marker([f.lat, f.lng]).addTo(markerLayer);
    marker.bindPopup(popupHtml(f));
    markerRefs.set(f.name, marker);
  });

  if (visible.length) {
    const bounds = L.latLngBounds(visible.map(f => [f.lat, f.lng]));
    if (visible.length > 1) map.fitBounds(bounds.pad(0.25), { animate: true });
    else map.setView([visible[0].lat, visible[0].lng], 15, { animate: true });
  }
}

function focusFixer(name) {
  const marker = markerRefs.get(name);
  if (!marker || !map) return;
  map.setView(marker.getLatLng(), 16, { animate: true });
  marker.openPopup();
}

function renderCards() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  let filtered = fixers.filter(f => {
    const categoryMatch = currentCategory === 'All' || f.category === currentCategory || (currentCategory === 'Student Specials' && f.discount > 0);
    const searchMatch = !q || [f.name,f.category,f.specialty].join(' ').toLowerCase().includes(q);
    return categoryMatch && searchMatch;
  });
  if (studentView) filtered = filtered.filter(f => f.discount > 0);

  const cards = document.getElementById('cards');
  cards.innerHTML = filtered.length ? filtered.map(f => `
    <article class="card fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl">${f.icon}</div>
          <div>
            <h3 class="font-extrabold">${f.name}</h3>
            <p class="mt-0.5 text-sm text-slate-500">${f.specialty}</p>
          </div>
        </div>
        <div class="rounded-xl bg-amber-50 px-2.5 py-1 text-sm font-black text-amber-700">★ ${f.rating}</div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        ${f.badges.map(b => `<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">${b}</span>`).join('')}
        ${studentView ? `<span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">🎓 ${f.discount}% off</span>` : ''}
      </div>
      <div class="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
        <div><div class="text-slate-400">Starting at</div><div class="mt-1 font-black">₹${f.rate}/hr</div></div>
        <div><div class="text-slate-400">Response</div><div class="mt-1 font-black">${f.response}</div></div>
      </div>
      <div class="mt-4 flex gap-2">
        <button onclick="book('${f.name}')" class="focus-ring flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">Start Demo Request</button>
        <button onclick="focusFixer('${f.name}')" class="focus-ring rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50">View Demo</button>
      </div>
    </article>
  `).join('') : `<div class="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><div class="text-3xl">🔎</div><h3 class="mt-3 font-black">No matching fixers</h3><p class="mt-1 text-slate-500">Try another service or switch to Resident View.</p></div>`;

  document.getElementById('resultsText').textContent = `${filtered.length} fixer${filtered.length === 1 ? '' : 's'} match your filters`;
  updateMapMarkers();
}

function book(name) {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal').classList.add('flex');
  document.querySelector('[name="service"]').value = name + ' - ';
  document.querySelector('[name="service"]').focus();
}

document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
  currentCategory = btn.dataset.category;
  document.querySelectorAll('.filter').forEach(b => b.classList.remove('bg-teal-500','text-slate-950'));
  btn.classList.add('bg-teal-500','text-slate-950');
  renderCards();
  document.getElementById('fixers').scrollIntoView({behavior:'smooth'});
}));

document.getElementById('searchBtn').addEventListener('click', () => {
  const location = document.getElementById('zipInput').value.trim();
  if (location) {
    document.getElementById('locationText').textContent = 'Near ' + location;
    document.getElementById('mapStatus').textContent = 'Demo listings are being explored for ' + location + '. Fixer locations remain demonstration data.';
  }
  renderCards();
});
document.getElementById('searchInput').addEventListener('keydown', e => { if(e.key === 'Enter') document.getElementById('searchBtn').click(); });
document.getElementById('zipInput').addEventListener('keydown', e => { if(e.key === 'Enter') document.getElementById('searchBtn').click(); });

document.getElementById('studentToggle').addEventListener('click', () => {
  studentView = true;
  document.getElementById('studentToggle').className = 'focus-ring rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white';
  document.getElementById('residentToggle').className = 'focus-ring rounded-full px-4 py-2 text-sm font-bold text-slate-600';
  renderCards();
});
document.getElementById('residentToggle').addEventListener('click', () => {
  studentView = false;
  document.getElementById('residentToggle').className = 'focus-ring rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white';
  document.getElementById('studentToggle').className = 'focus-ring rounded-full px-4 py-2 text-sm font-bold text-slate-600';
  renderCards();
});

document.getElementById('postBtn').addEventListener('click', () => {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal').classList.add('flex');
});
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').classList.remove('flex');
});
document.getElementById('modal').addEventListener('click', e => {
  if(e.target.id === 'modal') document.getElementById('closeModal').click();
});
document.getElementById('jobForm').addEventListener('submit', e => {
  e.preventDefault();
  const msg = document.getElementById('formMessage');
  msg.textContent = 'Request saved locally for this demo. A production version would send it to nearby matched fixers.';
  msg.classList.remove('hidden');
  e.target.reset();
});

document.getElementById('locateMeBtn').addEventListener('click', () => {
  const status = document.getElementById('mapStatus');
  if (!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by this browser.';
    return;
  }
  status.textContent = 'Requesting your location…';
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    if (userMarker) userMarker.remove();
    userMarker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup('<b>You are here</b>')
      .openPopup();
    map.setView([latitude, longitude], 14, { animate: true });
    status.textContent = 'Showing the map around your current location. Fixer markers are demo locations.';
  }, () => {
    status.textContent = 'Location permission was not granted. You can still explore the demo map.';
  }, { enableHighAccuracy: true, timeout: 10000 });
});

document.getElementById('mobileMenuBtn').addEventListener('click', () => document.getElementById('mobileMenu').classList.toggle('hidden'));
document.getElementById('locationBtn').addEventListener('click', () => {
  const next = prompt('Enter your campus, neighborhood, or ZIP:', document.getElementById('locationText').textContent);
  if(next) document.getElementById('locationText').textContent = 'Near ' + next;
});
document.getElementById('becomeBtn').addEventListener('click', () => alert('Fixer onboarding would start here in the full app.'));

initMap();
renderCards();
