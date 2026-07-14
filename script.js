// ===== CONFIGURACIÓN PRINCIPAL =====
// Reemplaza este número por el WhatsApp real, con código de país y sin + ni espacios.
const WHATSAPP_NUMBER = '56900000000';

// Edita, agrega o elimina productos en esta lista.
const products = [
  {id:1,name:'Audífonos Bluetooth Pro',category:'Tecnología',price:12990,oldPrice:16990,emoji:'🎧',stock:12,featured:10},
  {id:2,name:'Smartwatch deportivo',category:'Tecnología',price:18990,oldPrice:24990,emoji:'⌚',stock:8,featured:9},
  {id:3,name:'Cafetera eléctrica compacta',category:'Hogar',price:21990,oldPrice:27990,emoji:'☕',stock:7,featured:8},
  {id:4,name:'Termo térmico 1 litro',category:'Hogar',price:9990,oldPrice:12990,emoji:'🧉',stock:15,featured:7},
  {id:5,name:'Zapatillas urbanas',category:'Moda',price:24990,oldPrice:32990,emoji:'👟',stock:9,featured:9},
  {id:6,name:'Mochila casual impermeable',category:'Moda',price:14990,oldPrice:19990,emoji:'🎒',stock:11,featured:6},
  {id:7,name:'Set de bandas elásticas',category:'Deportes',price:7990,oldPrice:10990,emoji:'🏋️',stock:18,featured:8},
  {id:8,name:'Botella deportiva 750 ml',category:'Deportes',price:5990,oldPrice:null,emoji:'🥤',stock:20,featured:5},
  {id:9,name:'Oso de peluche premium',category:'Juguetes',price:11990,oldPrice:15990,emoji:'🧸',stock:6,featured:7},
  {id:10,name:'Juego creativo infantil',category:'Juguetes',price:8990,oldPrice:null,emoji:'🧩',stock:10,featured:5},
  {id:11,name:'Cama acolchada para mascota',category:'Mascotas',price:16990,oldPrice:21990,emoji:'🐶',stock:5,featured:8},
  {id:12,name:'Juguete interactivo mascota',category:'Mascotas',price:4990,oldPrice:null,emoji:'🐾',stock:14,featured:4},
  {id:13,name:'Perfume elegante 100 ml',category:'Belleza',price:19990,oldPrice:24990,emoji:'🧴',stock:8,featured:9},
  {id:14,name:'Set cuidado personal',category:'Belleza',price:10990,oldPrice:13990,emoji:'✨',stock:13,featured:6},
  {id:15,name:'Lámpara LED decorativa',category:'Decoración',price:8990,oldPrice:11990,emoji:'💡',stock:12,featured:8},
  {id:16,name:'Macetero moderno de interior',category:'Decoración',price:6990,oldPrice:null,emoji:'🪴',stock:9,featured:5}
];

const money = value => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value);
let currentCategory = 'Todos';
let cart = JSON.parse(localStorage.getItem('ye_cart') || '{}');
let favorites = JSON.parse(localStorage.getItem('ye_favorites') || '[]');

const grid = document.getElementById('productGrid');
const categoriesEl = document.getElementById('categories');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const emptyState = document.getElementById('emptyState');
const resultsText = document.getElementById('resultsText');
const drawer = document.getElementById('cartDrawer');
const backdrop = document.getElementById('backdrop');

function discountPercent(p){return p.oldPrice ? Math.round((1-p.price/p.oldPrice)*100) : 0}
function renderCategories(){
  const cats=['Todos',...new Set(products.map(p=>p.category))];
  categoriesEl.innerHTML=cats.map(c=>`<button class="category-btn ${c===currentCategory?'active':''}" data-category="${c}">${c==='Todos'?'✨ ':''}${c}</button>`).join('');
  categoriesEl.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{currentCategory=btn.dataset.category;renderCategories();renderProducts();});
}
function getFiltered(){
  const q=searchInput.value.trim().toLowerCase();
  let list=products.filter(p=>(currentCategory==='Todos'||p.category===currentCategory)&&p.name.toLowerCase().includes(q));
  const sort=sortSelect.value;
  if(sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  if(sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='featured') list.sort((a,b)=>b.featured-a.featured);
  return list;
}
function renderProducts(){
  const list=getFiltered();
  resultsText.textContent=`${list.length} producto${list.length===1?'':'s'} encontrado${list.length===1?'':'s'}`;
  emptyState.hidden=list.length>0;grid.hidden=list.length===0;
  grid.innerHTML=list.map(p=>`<article class="product-card">
    <div class="product-visual">
      ${p.oldPrice?`<span class="discount">-${discountPercent(p)}%</span>`:''}
      <button class="favorite ${favorites.includes(p.id)?'active':''}" data-fav="${p.id}" aria-label="Favorito">♥</button>
      <span>${p.emoji}</span>
    </div>
    <div class="product-info">
      <span class="product-category">${p.category}</span>
      <h3 class="product-title">${p.name}</h3>
      <p class="stock">● Disponible · ${p.stock} unidades</p>
      <div class="price-row"><span class="price">${money(p.price)}</span>${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span>`:''}</div>
      <button class="add-btn" data-add="${p.id}">＋ Agregar al pedido</button>
    </div>
  </article>`).join('');
  grid.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.add)));
  grid.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>toggleFavorite(Number(b.dataset.fav)));
}
function toggleFavorite(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];localStorage.setItem('ye_favorites',JSON.stringify(favorites));renderProducts();}
function addToCart(id){cart[id]=(cart[id]||0)+1;saveCart();showToast('Producto agregado al pedido ✓');}
function changeQty(id,delta){cart[id]=(cart[id]||0)+delta;if(cart[id]<=0)delete cart[id];saveCart();}
function removeItem(id){delete cart[id];saveCart();}
function saveCart(){localStorage.setItem('ye_cart',JSON.stringify(cart));renderCart();}
function renderCart(){
  const entries=Object.entries(cart).map(([id,qty])=>({p:products.find(x=>x.id===Number(id)),qty})).filter(x=>x.p);
  const count=entries.reduce((s,x)=>s+x.qty,0);const subtotal=entries.reduce((s,x)=>s+x.p.price*x.qty,0);
  document.getElementById('cartCount').textContent=count;document.getElementById('cartSubtotal').textContent=money(subtotal);
  document.getElementById('cartEmpty').style.display=entries.length?'none':'block';document.getElementById('cartItems').style.display=entries.length?'block':'none';
  document.getElementById('whatsappOrder').disabled=!entries.length;
  document.getElementById('cartItems').innerHTML=entries.map(({p,qty})=>`<div class="cart-item"><div class="cart-item-icon">${p.emoji}</div><div><h4>${p.name}</h4><p>${money(p.price*qty)}</p><div class="qty-controls"><button data-minus="${p.id}">−</button><b>${qty}</b><button data-plus="${p.id}">＋</button></div></div><button class="remove-item" data-remove="${p.id}">✕</button></div>`).join('');
  document.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.minus),-1));
  document.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>changeQty(Number(b.dataset.plus),1));
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>removeItem(Number(b.dataset.remove)));
}
function openCart(){drawer.classList.add('open');backdrop.classList.add('open');drawer.setAttribute('aria-hidden','false')}
function closeCart(){drawer.classList.remove('open');backdrop.classList.remove('open');drawer.setAttribute('aria-hidden','true')}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function sendOrder(){
  const entries=Object.entries(cart).map(([id,qty])=>({p:products.find(x=>x.id===Number(id)),qty})).filter(x=>x.p);if(!entries.length)return;
  const subtotal=entries.reduce((s,x)=>s+x.p.price*x.qty,0);
  const lines=entries.map(x=>`• ${x.qty} x ${x.p.name} — ${money(x.p.price*x.qty)}`);
  const message=`Hola Y&E Store 👋%0AQuiero realizar el siguiente pedido:%0A%0A${lines.map(encodeURIComponent).join('%0A')}%0A%0A*Subtotal: ${encodeURIComponent(money(subtotal))}*%0A%0AMi nombre es: %0AMi comuna/dirección es: `;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,'_blank');
}
searchInput.addEventListener('input',renderProducts);sortSelect.addEventListener('change',renderProducts);
document.getElementById('clearSearch').onclick=()=>{searchInput.value='';renderProducts();searchInput.focus()};
document.getElementById('cartButton').onclick=openCart;document.getElementById('closeCart').onclick=closeCart;backdrop.onclick=closeCart;
document.getElementById('whatsappOrder').onclick=sendOrder;
document.getElementById('floatingWhatsapp').onclick=e=>{e.preventDefault();window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20Y%26E%20Store%2C%20quiero%20hacer%20una%20consulta.`,'_blank')};
renderCategories();renderProducts();renderCart();
