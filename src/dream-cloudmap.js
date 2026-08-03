const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function normalizeDreams(input) {
  if (!Array.isArray(input)) return [];
  return input.map((dream, index) => {
    const rawLucidity = dream?.lucidity;
    const numericLucidity = rawLucidity == null ? null : Number(rawLucidity);
    return {
      id: String(dream?.id || `dream-${index}`),
      createdAt: Number.isFinite(Date.parse(dream?.createdAt || '')) ? new Date(dream.createdAt).toISOString() : null,
      title: String(dream?.title || dream?.summary || dream?.awareness || '一段没有标题的梦').slice(0, 160),
      dream: String(dream?.dream || '').slice(0, 4000),
      residue: String(dream?.residue || '').slice(0, 1200),
      lucidity: Number.isFinite(numericLucidity) ? clamp(numericLucidity, 0, 1) : null,
    };
  }).sort((left, right) => Date.parse(left.createdAt || '') - Date.parse(right.createdAt || ''));
}

export function dreamPosition(index, count) {
  const safeCount = Math.max(1, count);
  const age = safeCount === 1 ? 0 : 1 - index / (safeCount - 1);
  const theta = (index / safeCount) * Math.PI * 2 - Math.PI * .32;
  const radius = 380 + age * 430;
  return {
    age,
    x: Math.sin(theta) * radius,
    y: -60 - age * 290 + Math.sin(index * 1.73) * 52,
    z: Math.cos(theta) * radius - 560,
    size: 116 + (1 - age) * 52 + (index % 3) * 13,
  };
}

const styles = `
  :host{--sky-top:#91c9ee;--sky-mid:#d8e5f5;--sky-bottom:#f3d8d7;--ink:#504b68;display:block;min-height:420px;font-family:ui-sans-serif,system-ui,sans-serif;color:var(--ink)}
  *{box-sizing:border-box}.viewport{height:100%;min-height:420px;position:relative;overflow:hidden;border-radius:32px;perspective:1150px;cursor:grab;touch-action:none;outline:none;background:linear-gradient(180deg,var(--sky-top),var(--sky-mid) 52%,var(--sky-bottom));box-shadow:inset 0 1px 0 #ffffffd9,inset 0 -90px 140px #8b72ad24,0 30px 60px -42px #394b7180}
  .viewport:active{cursor:grabbing}.viewport:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 74% 14%,#fff 0 2%,#fff5cf8f 10%,transparent 29%),linear-gradient(125deg,#ffffff26,transparent 36%)}
  .horizon{position:absolute;left:-10%;right:-10%;bottom:-85px;height:210px;border-radius:50% 50% 0 0;background:#ffffff52;filter:blur(18px);box-shadow:140px -45px 60px #ffffff38,-160px -15px 50px #ffffff42}.world{position:absolute;left:50%;top:52%;width:1px;height:1px;transform-style:preserve-3d;transform:translateZ(var(--zoom)) rotateX(var(--pitch)) rotateY(var(--yaw));transition:transform .08s linear}
  .cloud{position:absolute;left:calc(var(--size)/-2);top:calc(var(--size)*-.32);width:var(--size);height:calc(var(--size)*.58);padding:0;border:0;background:transparent;color:inherit;transform-style:preserve-3d;transform:translate3d(var(--x),var(--y),var(--z)) rotateY(var(--counter-yaw)) rotateX(var(--counter-pitch)) scale(calc(.72 + (1 - var(--age))*.28));opacity:calc(.2 + (1 - var(--age))*.8);cursor:pointer;animation:float calc(8s + var(--age)*5s) ease-in-out infinite;animation-delay:var(--delay)}
  .cloud:hover,.cloud.active{opacity:1;filter:brightness(1.08) drop-shadow(0 18px 18px #655b8e30);z-index:5}.volume{position:absolute;inset:0;transform-style:preserve-3d;filter:drop-shadow(0 0 calc(3px + var(--clarity)*8px) #ffffffeb)}
  .volume:before,.volume:after,.volume i{content:"";position:absolute;border:calc(1px + var(--clarity)*1px) solid rgba(255,255,255,calc(.22 + var(--clarity)*.65));background:radial-gradient(circle at 37% 26%,#fff,#fffaf5db 42%,#dbd6f69e 74%,#beb5e13d);box-shadow:inset 10px 12px 18px #ffffff8c,inset -12px -10px 18px #847eb524}.volume:before{left:9%;right:9%;bottom:5%;height:45%;border-radius:50%;transform:translateZ(22px)}.volume:after{width:45%;height:68%;left:27%;bottom:16%;border-radius:50%;transform:translateZ(38px)}
  .volume i:nth-child(1){width:38%;height:53%;left:5%;bottom:15%;border-radius:50%;transform:translateZ(12px)}.volume i:nth-child(2){width:36%;height:59%;right:5%;bottom:13%;border-radius:50%;transform:translateZ(18px)}.volume i:nth-child(3){width:28%;height:46%;left:19%;bottom:30%;border-radius:50%;transform:translateZ(50px)}.volume i:nth-child(4){width:26%;height:42%;right:20%;bottom:28%;border-radius:50%;transform:translateZ(44px)}
  .shadow{position:absolute;left:18%;right:18%;bottom:-17%;height:22%;border-radius:50%;background:#57538338;filter:blur(12px);transform:translateZ(-36px) rotateX(68deg)}.label{position:absolute;left:50%;top:104%;width:170px;transform:translateX(-50%) translateZ(56px);text-align:center;text-shadow:0 1px 10px #ffffffe6;pointer-events:none}.label b,.label small{display:block}.label b{font:500 12px/1.35 ui-serif,serif}.label small{margin-top:4px;font:8px ui-monospace,monospace;color:#484664a6}
  .hint{position:absolute;z-index:8;left:16px;bottom:15px;padding:9px 13px;border:1px solid #ffffffb8;border-radius:20px;background:#ffffff73;backdrop-filter:blur(16px);font-size:10px}.reset{position:absolute;z-index:8;right:16px;bottom:13px;border:1px solid #ffffffc4;border-radius:19px;padding:9px 12px;background:#ffffff8f;color:inherit;cursor:pointer}
  @keyframes float{0%,100%{margin-top:0}50%{margin-top:-13px}}@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

function formatDate(value) {
  if (!value) return '时间未记录';
  return new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const HTMLElementBase = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class XinchaoDreamCloudmap extends HTMLElementBase {
  #dreams = [];
  #yaw = -18;
  #pitch = 9;
  #zoom = 260;
  #drag = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  set dreams(value) { this.#dreams = normalizeDreams(value); this.render(); }
  get dreams() { return [...this.#dreams]; }
  resetView() { this.#yaw = -18; this.#pitch = 9; this.#zoom = 260; this.updateView(); }

  render() {
    if (!this.shadowRoot) return;
    const nodes = this.#dreams.map((dream, index) => {
      const position = dreamPosition(index, this.#dreams.length);
      const clarity = dream.lucidity == null ? .42 : dream.lucidity;
      return `<button class="cloud" data-id="${escapeHtml(dream.id)}" style="--x:${position.x}px;--y:${position.y}px;--z:${position.z}px;--size:${position.size}px;--age:${position.age};--clarity:${clarity};--delay:${-index * .73}s"><span class="volume"><i></i><i></i><i></i><i></i></span><span class="shadow"></span><span class="label"><b>${escapeHtml(dream.title)}</b><small>${escapeHtml(formatDate(dream.createdAt))}</small></span></button>`;
    }).join('');
    this.shadowRoot.innerHTML = `<style>${styles}</style><div class="viewport" tabindex="0" role="application" aria-label="360度梦境云图"><div class="horizon"></div><div class="world">${nodes}</div><div class="hint">拖动环视 · 滚轮缩放</div><button class="reset" type="button">回到此刻</button></div>`;
    const viewport = this.shadowRoot.querySelector('.viewport');
    viewport.addEventListener('pointerdown', event => this.pointerDown(event));
    viewport.addEventListener('pointermove', event => this.pointerMove(event));
    viewport.addEventListener('pointerup', event => this.pointerUp(event));
    viewport.addEventListener('pointercancel', event => this.pointerUp(event));
    viewport.addEventListener('wheel', event => { event.preventDefault(); this.#zoom = clamp(this.#zoom - event.deltaY * .45, 80, 720); this.updateView(); }, { passive: false });
    viewport.addEventListener('keydown', event => this.keyControl(event));
    this.shadowRoot.querySelector('.reset').addEventListener('click', () => this.resetView());
    this.shadowRoot.querySelectorAll('.cloud').forEach(button => button.addEventListener('click', event => {
      if (this.#drag?.moved) return;
      this.shadowRoot.querySelectorAll('.cloud').forEach(item => item.classList.remove('active'));
      event.currentTarget.classList.add('active');
      const dream = this.#dreams.find(item => item.id === event.currentTarget.dataset.id);
      if (dream) this.dispatchEvent(new CustomEvent('dream-select', { detail: dream, bubbles: true, composed: true }));
    }));
    this.updateView();
  }

  updateView() {
    const world = this.shadowRoot?.querySelector('.world');
    if (!world) return;
    world.style.setProperty('--yaw', `${this.#yaw}deg`);
    world.style.setProperty('--pitch', `${this.#pitch}deg`);
    world.style.setProperty('--zoom', `${this.#zoom}px`);
    world.querySelectorAll('.cloud').forEach(node => {
      node.style.setProperty('--counter-yaw', `${-this.#yaw}deg`);
      node.style.setProperty('--counter-pitch', `${-this.#pitch}deg`);
    });
  }

  pointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    this.#drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: this.#yaw, pitch: this.#pitch, moved: false };
  }
  pointerMove(event) {
    if (!this.#drag || this.#drag.id !== event.pointerId) return;
    const dx = event.clientX - this.#drag.x, dy = event.clientY - this.#drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) this.#drag.moved = true;
    this.#yaw = this.#drag.yaw + dx * .34;
    this.#pitch = clamp(this.#drag.pitch - dy * .2, -34, 34);
    this.updateView();
  }
  pointerUp(event) {
    if (!this.#drag || this.#drag.id !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    queueMicrotask(() => { this.#drag = null; });
  }
  keyControl(event) {
    if (event.key === 'ArrowLeft') this.#yaw -= 12;
    if (event.key === 'ArrowRight') this.#yaw += 12;
    if (event.key === 'ArrowUp') this.#pitch = clamp(this.#pitch + 8, -34, 34);
    if (event.key === 'ArrowDown') this.#pitch = clamp(this.#pitch - 8, -34, 34);
    if (event.key === '+' || event.key === '=') this.#zoom = clamp(this.#zoom + 50, 80, 720);
    if (event.key === '-') this.#zoom = clamp(this.#zoom - 50, 80, 720);
    this.updateView();
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

if (typeof customElements !== 'undefined' && !customElements.get('xinchao-dream-cloudmap')) {
  customElements.define('xinchao-dream-cloudmap', XinchaoDreamCloudmap);
}
