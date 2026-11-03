import { Icons } from '../../shared/Icons.js';

/**
 * SpaceView3D: Visualizador 3D interactivo en Three.js con Jerarquía Piramidal Arquitectónica.
 * 
 * Arquitectura Espacial:
 * - Nivel 1 (Ápice / Cúspide, Y = +180): Canales de Entrada, Clientes externos, API Gateway & Auth.
 * - Nivel 2 (Core de Dominio, Y = +60): Servicios nucleares de negocio (Catálogo, Carrito, Core).
 * - Nivel 3 (Features & Handlers, Y = -60): Casos de uso específicos, Facturación (Billing) y Procesamiento de Órdenes.
 * - Nivel 4 (Base / Suelo, Y = -180): Persistencia (Bases de datos), Infraestructura, Brokers de eventos y Analítica.
 *
 * Características UI/UX:
 * - Planos y anillos guía piramidales con identificación de nivel arquitectónico.
 * - Bolitas con radio proporcional al Peso entero (20-100) y prioridad.
 * - Distribución radial armónica para evitar solapamiento de etiquetas.
 * - Etiquetas 3D nítidas (Sprites) con "INT-numero" y "Peso: xx".
 * - Conexiones luminosas con flujo de partículas direccionales de arriba hacia abajo.
 * - HUD interactivo flotante con barra de progreso de peso e identificación de nivel piramidal.
 */
export class SpaceView3D {
  constructor() {
    this.container = null;
    this.features = [];
    this.onSelect = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationId = null;
    this.nodes = [];
    this.orbitRings = [];
    this.pyramidGuides = [];
    this.flowParticles = [];
    this.labelSprites = [];
    this.raycaster = null;
    this.mouse = null;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.rotation = { x: 0.22, y: 0.45 };
    this.targetRotation = { x: 0.22, y: 0.45 };
    this.hoveredMesh = null;
    this.hudElement = null;
  }

  mount(containerEl, { features, onSelect }) {
    this.container = containerEl;
    this.features = features || [];
    this.onSelect = onSelect;

    if (!window.THREE) {
      this.container.innerHTML = `
        <div class="h-[650px] flex items-center justify-center bg-slate-900 text-slate-400 rounded-3xl border border-slate-800">
          <p class="font-mono text-sm">Librería Three.js no disponible.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="relative w-full h-[720px] bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl select-none">
        
        <!-- HUD Superior: Indicador Piramidal -->
        <div class="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
          <span class="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-200 text-xs backdrop-blur-md shadow-xl flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <strong>Jerarquía Piramidal 3D</strong> • Ápice (Entrada) → Base (Persistencia)
          </span>
          <span class="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            Arrastra para orbitar la pirámide • Clic en nodo para enfocar
          </span>
        </div>

        <!-- Leyenda de Niveles Piramidales y Estados -->
        <div class="absolute bottom-4 left-4 z-20 pointer-events-none hidden lg:flex flex-col gap-2 text-[11px] bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md shadow-2xl text-slate-300">
          <div class="font-mono font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
            Niveles de la Pirámide Arquitectónica
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-sky-400"></span> Nivel 1: Ápice (Clientes & Auth)</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-400"></span> Nivel 2: Core de Dominio</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-400"></span> Nivel 3: Features & Casos de Uso</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Nivel 4: Base (Infra & BD)</span>
          </div>
          <div class="flex items-center gap-3 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
            <span class="text-emerald-400 font-semibold">● Resuelto</span>
            <span class="text-indigo-400 font-semibold">● En Progreso</span>
            <span class="text-cyan-400 font-semibold">● Spec Listo</span>
            <span class="text-rose-400 font-semibold">● Bloqueado</span>
            <span class="text-amber-400 font-semibold">● Bugfix</span>
          </div>
        </div>

        <!-- Panel Lateral de Nodos Clasificados -->
        <div class="absolute top-4 right-4 z-20 w-60 max-h-[660px] bg-slate-900/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-md shadow-2xl overflow-y-auto hidden md:block">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1 flex items-center justify-between">
            <span>Nodos Piramidales (${this.features.length})</span>
            <span class="text-[10px] text-indigo-400 font-mono">Nivel</span>
          </div>
          <div class="space-y-1" id="three-node-list">
            ${this.features.map(f => {
              const tier = this.getNodeTier(f);
              const tierColors = { 1: 'text-sky-400', 2: 'text-indigo-400', 3: 'text-purple-400', 4: 'text-emerald-400' };
              const dotColor = f.status === 'done' ? 'bg-emerald-400' : f.status === 'in_progress' ? 'bg-indigo-400' : f.type === 'bugfix' ? 'bg-amber-400' : 'bg-slate-500';
              return `
                <button type="button" 
                        data-focus-node="${f.id}" 
                        class="w-full text-left px-2 py-1.5 rounded-xl text-xs hover:bg-slate-800/90 transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-700/60">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span>
                    <span class="font-mono text-[11px] font-bold text-slate-200 group-hover:text-indigo-300">INT-${String(f.id).padStart(3, '0')}</span>
                    <span class="truncate text-[10px] text-slate-400">${f.name}</span>
                  </div>
                  <span class="font-mono text-[10px] font-bold ${tierColors[tier]} bg-slate-950 px-1 py-0.2 rounded border border-slate-800">
                    L${tier}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- HUD Tooltip Flotante 3D -->
        <div id="three-tooltip-hud" class="absolute z-30 pointer-events-none hidden transition-opacity duration-150 transform -translate-x-1/2 -translate-y-full mb-4">
          <div class="bg-slate-900/95 border border-indigo-500/70 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs text-slate-200 min-w-[260px] max-w-xs space-y-2">
            <div id="hud-content"></div>
          </div>
        </div>

        <div id="three-canvas-root" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
      </div>
    `;

    const canvasRoot = this.container.querySelector('#three-canvas-root');
    this.hudElement = this.container.querySelector('#three-tooltip-hud');
    this.initThree(canvasRoot);
  }

  getNodeTier(feature) {
    const mod = (feature.module || '').toLowerCase();
    const title = (feature.title || feature.name || '').toLowerCase();

    // Nivel 4 (Base / Suelo): Persistencia, Infraestructura, Brokers, Analítica
    if (mod.includes('infra') || mod.includes('analytics') || mod.includes('notification') || title.includes('database') || title.includes('worker') || title.includes('dlq')) {
      return 4;
    }
    // Nivel 1 (Ápice / Cúspide): Perímetro, Clientes, Gateway, Auth
    if (mod.includes('auth') || mod.includes('gateway') || mod.includes('ui') || mod.includes('client') || (feature.priority === 'P0' && (!feature.depends_on || !feature.depends_on.length))) {
      return 1;
    }
    // Nivel 2 (Core de Dominio): Catálogo, Carrito, Entidades Maestras
    if (mod.includes('catalog') || mod.includes('cart') || mod.includes('core') || mod.includes('domain')) {
      return 2;
    }
    // Nivel 3 (Features & Handlers): Casos de uso, Billing, Pagos, Órdenes
    return 3;
  }

  getTierName(tier) {
    switch (tier) {
      case 1: return 'Nivel 1: Ápice (Perímetro & Auth)';
      case 2: return 'Nivel 2: Core de Dominio';
      case 3: return 'Nivel 3: Features & Casos de Uso';
      case 4: return 'Nivel 4: Base (Persistencia & Infra)';
      default: return `Nivel ${tier}`;
    }
  }

  initThree(rootEl) {
    const THREE = window.THREE;
    const width = rootEl.clientWidth || 800;
    const height = rootEl.clientHeight || 700;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.0011);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    this.camera.position.set(0, 70, 560);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rootEl.appendChild(this.renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 1.2);
    dirLight1.position.set(200, 400, 200);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-200, -300, -200);
    this.scene.add(dirLight2);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.createStarfield();
    this.createPyramidalGuides();
    this.createNodes();
    this.bindEvents(rootEl);
    this.animate();
  }

  createStarfield() {
    const THREE = window.THREE;
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1400;
    const posArray = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 2600;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.6,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.6
    });

    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  /**
   * Crea los anillos guía y planos traslúcidos que dibujan la silueta de la pirámide
   */
  createPyramidalGuides() {
    const THREE = window.THREE;
    this.pyramidGuides = [];

    const tierLevels = [
      { tier: 1, y: 165, radius: 70, color: 0x38bdf8 },
      { tier: 2, y: 55, radius: 150, color: 0x818cf8 },
      { tier: 3, y: -55, radius: 230, color: 0xa855f7 },
      { tier: 4, y: -165, radius: 310, color: 0x10b981 }
    ];

    tierLevels.forEach(tl => {
      // Anillo orbital guía
      const ringGeo = new THREE.RingGeometry(tl.radius - 1, tl.radius + 1, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: tl.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = tl.y;
      this.scene.add(ringMesh);
      this.pyramidGuides.push(ringMesh);
    });

    // 4 Aristas piramidales en las esquinas que conectan el ápice con la base
    const apexRadius = 70;
    const baseRadius = 310;
    const apexY = 165;
    const baseY = -165;

    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i + Math.PI / 4;
      const topPt = new THREE.Vector3(apexRadius * Math.cos(angle), apexY, apexRadius * Math.sin(angle));
      const btmPt = new THREE.Vector3(baseRadius * Math.cos(angle), baseY, baseRadius * Math.sin(angle));

      const lineGeo = new THREE.BufferGeometry().setFromPoints([topPt, btmPt]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x6366f1,
        dashSize: 10,
        gapSize: 6,
        transparent: true,
        opacity: 0.25
      });
      const edgeLine = new THREE.Line(lineGeo, lineMat);
      edgeLine.computeLineDistances();
      this.scene.add(edgeLine);
      this.pyramidGuides.push(edgeLine);
    }
  }

  createLabelSprite(taskId, weight, tier, colorHex) {
    const THREE = window.THREE;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Fondo redondeado estilo badge
    ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    ctx.strokeStyle = colorHex || '#6366f1';
    ctx.lineWidth = 5;

    const r = 24;
    ctx.beginPath();
    ctx.moveTo(r, 6);
    ctx.lineTo(256 - r, 6);
    ctx.quadraticCurveTo(256 - 6, 6, 256 - 6, r);
    ctx.lineTo(256 - 6, 128 - r);
    ctx.quadraticCurveTo(256 - 6, 128 - 6, 256 - r, 128 - 6);
    ctx.lineTo(r, 128 - 6);
    ctx.quadraticCurveTo(6, 128 - 6, 6, 128 - r);
    ctx.lineTo(6, r);
    ctx.quadraticCurveTo(6, 6, r, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Texto 1: INT-numero
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(taskId, 128, 44);

    // Texto 2: Peso & Nivel
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`P:${weight} | L${tier}`, 128, 92);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(38, 19, 1);
    return sprite;
  }

  createNodes() {
    const THREE = window.THREE;
    this.nodes = [];
    this.orbitRings = [];
    this.flowParticles = [];
    this.labelSprites = [];

    const featureMap = new Map();
    this.features.forEach(f => featureMap.set(f.id, f));

    // Agrupar features por su nivel piramidal (1 al 4)
    const tierGroups = { 1: [], 2: [], 3: [], 4: [] };
    this.features.forEach(f => {
      const tier = this.getNodeTier(f);
      tierGroups[tier].push(f);
    });

    const tierSettings = {
      1: { y: 165, radius: 70, offsetAngle: 0 },
      2: { y: 55, radius: 150, offsetAngle: Math.PI / 6 },
      3: { y: -55, radius: 230, offsetAngle: Math.PI / 4 },
      4: { y: -165, radius: 310, offsetAngle: Math.PI / 3 }
    };

    // Posicionar nodos de cada nivel armónicamente en su círculo piramidal
    Object.keys(tierGroups).forEach(tierStr => {
      const tier = parseInt(tierStr, 10);
      const items = tierGroups[tier];
      const count = items.length;
      const cfg = tierSettings[tier];

      items.forEach((f, idx) => {
        const angle = cfg.offsetAngle + (count > 1 ? (Math.PI * 2 * idx) / count : 0);
        // Sutil ondulación orgánica en Y
        const yOffset = Math.sin(idx * 1.5) * 6;
        const x = cfg.radius * Math.cos(angle);
        const y = cfg.y + yOffset;
        const z = cfg.radius * Math.sin(angle);

        // Peso entero determinante del tamaño
        const weightVal = f.weight || (f.priority === 'P0' ? 95 : f.priority === 'P1' ? 75 : 50);
        const sphereRadius = 7 + (weightVal / 100) * 15;

        // Color según estado y tipo
        let color = 0x64748b;
        let emissive = 0x334155;
        let colorHex = '#6366f1';

        const rawDeps = f.depends_on || f.dependencies || [];
        const pendingDeps = rawDeps.filter(dId => {
          const dep = featureMap.get(dId);
          return dep && dep.status !== 'done';
        });
        const isBlocked = f.status !== 'done' && pendingDeps.length > 0;

        if (f.status === 'done') {
          color = 0x10b981;
          emissive = 0x059669;
          colorHex = '#10b981';
        } else if (f.status === 'in_progress') {
          color = 0x6366f1;
          emissive = 0x4f46e5;
          colorHex = '#6366f1';
        } else if (f.status === 'spec_ready') {
          color = 0x06b6d4;
          emissive = 0x0891b2;
          colorHex = '#06b6d4';
        } else if (isBlocked) {
          color = 0xf43f5e;
          emissive = 0xe11d48;
          colorHex = '#f43f5e';
        } else if (f.type === 'bugfix') {
          color = 0xf59e0b;
          emissive = 0xd97706;
          colorHex = '#f59e0b';
        }

        const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.2,
          metalness: 0.35,
          emissive,
          emissiveIntensity: 0.6
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = {
          feature: f,
          tier,
          weight: weightVal,
          baseRadius: sphereRadius,
          baseColor: color,
          baseEmissive: emissive
        };

        this.scene.add(mesh);
        this.nodes.push(mesh);

        // Etiqueta 3D (Sprite) con "INT-numero" y "Peso"
        const taskId = `INT-${String(f.id).padStart(3, '0')}`;
        const sprite = this.createLabelSprite(taskId, weightVal, tier, colorHex);
        sprite.position.set(x, y + sphereRadius + 14, z);
        this.scene.add(sprite);
        this.labelSprites.push(sprite);

        // Anillo orbital luminoso para nodos de alto peso (>= 75)
        if (weightVal >= 75) {
          const ringGeo = new THREE.RingGeometry(sphereRadius + 3.5, sphereRadius + 5.5, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.set(x, y, z);
          ring.rotation.x = Math.PI / 2.3;
          this.scene.add(ring);
          this.orbitRings.push(ring);
        }
      });
    });

    // 2. Conexiones 3D con flujo direccional piramidal (dependencias a dependientes)
    this.features.forEach(f => {
      const rawDeps = f.depends_on || f.dependencies || [];
      if (!rawDeps.length) return;

      const targetMesh = this.nodes.find(n => n.userData.feature.id === f.id);
      if (!targetMesh) return;

      rawDeps.forEach(depId => {
        const sourceMesh = this.nodes.find(n => n.userData.feature.id === depId);
        if (!sourceMesh) return;

        const sourceFeature = featureMap.get(depId);
        const isResolved = sourceFeature && sourceFeature.status === 'done';

        // Curva cuadrática hacia abajo para flujo estético
        const midPoint = new THREE.Vector3().lerpVectors(sourceMesh.position, targetMesh.position, 0.5);
        midPoint.y += 12; // Arco sutil

        const curve = new THREE.QuadraticBezierCurve3(sourceMesh.position, midPoint, targetMesh.position);
        const curvePoints = curve.getPoints(24);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const lineMat = new THREE.LineBasicMaterial({
          color: isResolved ? 0x10b981 : 0xf43f5e,
          transparent: true,
          opacity: isResolved ? 0.7 : 0.45,
          linewidth: 2
        });
        const line = new THREE.Line(lineGeo, lineMat);
        this.scene.add(line);

        // Partícula de energía viajera direccional
        const pGeo = new THREE.SphereGeometry(2.5, 12, 12);
        const pMat = new THREE.MeshBasicMaterial({
          color: isResolved ? 0x34d399 : 0xfb7185
        });
        const particle = new THREE.Mesh(pGeo, pMat);
        particle.userData = {
          curve,
          progress: Math.random()
        };
        this.scene.add(particle);
        this.flowParticles.push(particle);
      });
    });
  }

  bindEvents(rootEl) {
    const onMouseDown = (e) => {
      this.isDragging = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = rootEl.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      this.mouse.x = (screenX / rootEl.clientWidth) * 2 - 1;
      this.mouse.y = -(screenY / rootEl.clientHeight) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.prevMousePos.x;
        const deltaY = e.clientY - this.prevMousePos.y;

        this.targetRotation.y += deltaX * 0.005;
        this.targetRotation.x += deltaY * 0.005;

        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }

      this.checkRaycast(screenX, screenY);
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    const onClick = () => {
      if (this.hoveredMesh) {
        this.focusOnNode(this.hoveredMesh);
      }
    };

    rootEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    rootEl.addEventListener('click', onClick);

    // Selección desde panel lateral
    this.container.querySelectorAll('[data-focus-node]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-focus-node'), 10);
        const targetNode = this.nodes.find(n => n.userData.feature.id === id);
        if (targetNode) {
          this.focusOnNode(targetNode);
        }
      });
    });

    this._cleanupEvents = () => {
      rootEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      rootEl.removeEventListener('click', onClick);
    };
  }

  checkRaycast(screenX, screenY) {
    if (!this.raycaster || !this.camera || !this.hudElement) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.nodes);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      if (this.hoveredMesh !== mesh) {
        if (this.hoveredMesh) {
          this.hoveredMesh.scale.set(1, 1, 1);
        }
        this.hoveredMesh = mesh;
        mesh.scale.set(1.25, 1.25, 1.25);
      }

      const f = mesh.userData.feature;
      const weightVal = mesh.userData.weight;
      const tierVal = mesh.userData.tier;
      const tierName = this.getTierName(tierVal);
      const hudContent = this.container.querySelector('#hud-content');
      
      if (hudContent && f) {
        const branchName = f.branch || `${f.type || 'feature'}/INT-${String(f.id).padStart(3, '0')}/${f.name}`;
        const rawDeps = f.depends_on || f.dependencies || [];
        hudContent.innerHTML = `
          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span class="font-mono font-bold text-indigo-400 text-sm">INT-${String(f.id).padStart(3, '0')}</span>
            <span class="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">${f.status}</span>
          </div>
          <div class="font-bold text-slate-100 text-xs leading-snug">${f.title || f.name}</div>
          <div class="font-mono text-[10px] text-slate-400 truncate flex items-center gap-1">${Icons.gitBranch('w-3 h-3')} <span>${branchName}</span></div>
          
          <!-- Nivel Piramidal -->
          <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
            <div class="text-[10px] uppercase font-bold text-indigo-400">Jerarquía Arquitectónica:</div>
            <div class="font-bold text-slate-200 mt-0.5">${tierName}</div>
          </div>

          <!-- Barra de Peso -->
          <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <div class="flex items-center justify-between text-[10px] mb-1">
              <span class="text-amber-400 font-bold font-mono">Peso de Importancia:</span>
              <span class="font-mono font-bold text-amber-300">${weightVal} / 100</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" style="width: ${weightVal}%"></div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Prioridad: <strong class="text-indigo-300">${f.priority || 'P2'}</strong></span>
            <span>${rawDeps.length ? `${rawDeps.length} dependencias` : 'Raíz sin bloqueos'}</span>
          </div>
        `;
      }

      this.hudElement.style.left = `${screenX}px`;
      this.hudElement.style.top = `${screenY}px`;
      this.hudElement.classList.remove('hidden');
    } else {
      if (this.hoveredMesh) {
        this.hoveredMesh.scale.set(1, 1, 1);
        this.hoveredMesh = null;
      }
      this.hudElement.classList.add('hidden');
    }
  }

  focusOnNode(nodeMesh) {
    if (!nodeMesh) return;
    const pos = nodeMesh.position;
    this.targetRotation.x = -pos.y * 0.003;
    this.targetRotation.y = Math.atan2(pos.x, pos.z);
    if (this.onSelect) {
      this.onSelect(nodeMesh.userData.feature);
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Interpolación suave de rotación
    this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.08;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.08;

    if (!this.isDragging) {
      this.targetRotation.y += 0.001; // Giro continuo cósmico
    }

    if (this.scene) {
      this.scene.rotation.y = this.rotation.y;
      this.scene.rotation.x = this.rotation.x;
    }

    // Animar anillos orbitales
    this.orbitRings.forEach(ring => {
      ring.rotation.z += 0.012;
    });

    // Animar partículas de flujo que viajan sobre curvas bezier
    this.flowParticles.forEach(p => {
      p.userData.progress = (p.userData.progress + 0.008) % 1;
      const pt = p.userData.curve.getPoint(p.userData.progress);
      p.position.copy(pt);
    });

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  unmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this._cleanupEvents) {
      this._cleanupEvents();
      this._cleanupEvents = null;
    }
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.nodes = [];
    this.orbitRings = [];
    this.pyramidGuides = [];
    this.flowParticles = [];
    this.labelSprites = [];
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}
