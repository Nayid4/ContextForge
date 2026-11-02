/**
 * SpaceView3D: Visualizador 3D cósmico interactivo en Three.js.
 * Heurísticas UI/UX:
 * - Tamaños proporcionales por prioridad/complejidad (P0/P1/P2/P3).
 * - Colores vibrantes de alto contraste con halos orbitales.
 * - Conexiones luminosas con partículas de flujo direccional.
 * - HUD interactivo flotante con detalles en tiempo real en hover.
 * - Enfoque de cámara (focus to node) al interactuar.
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
    this.flowParticles = [];
    this.raycaster = null;
    this.mouse = null;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.rotation = { x: 0.25, y: 0.5 };
    this.targetRotation = { x: 0.25, y: 0.5 };
    this.hoveredMesh = null;
    this.hudElement = null;
  }

  mount(containerEl, { features, onSelect }) {
    this.container = containerEl;
    this.features = features || [];
    this.onSelect = onSelect;

    if (!window.THREE) {
      this.container.innerHTML = `
        <div class="h-[600px] flex items-center justify-center bg-slate-900 text-slate-400 rounded-2xl border border-slate-800">
          <p>Librería Three.js no disponible.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="relative w-full h-[680px] bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl select-none">
        
        <!-- HUD Superior -->
        <div class="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-200 text-xs backdrop-blur-md shadow-lg flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Constelación 3D de Tareas | Arrastra para orbitar | Clic para inspeccionar
          </span>
        </div>

        <!-- Leyenda de Estados y Tamaños -->
        <div class="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex flex-wrap items-center gap-3 text-[11px] bg-slate-900/85 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-lg text-slate-300">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400"></span> Resuelto</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-indigo-500 shadow-xs shadow-indigo-500"></span> En Progreso</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400"></span> Spec Listo</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-rose-500 shadow-xs shadow-rose-500"></span> Bloqueado</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-400 shadow-xs shadow-amber-400"></span> Bugfix</span>
          <span class="text-slate-600">|</span>
          <span class="text-slate-400">Tamaño del planeta = Prioridad (P0 grande, P2 estándar)</span>
        </div>

        <!-- Panel Lateral de Selección Rápida 3D -->
        <div class="absolute top-4 right-4 z-20 w-52 max-h-[620px] bg-slate-900/85 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md shadow-xl overflow-y-auto hidden md:block">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Nodos en Orbita (${this.features.length})</div>
          <div class="space-y-1" id="three-node-list">
            ${this.features.map(f => {
              const dotColor = f.status === 'done' ? 'bg-emerald-400' : f.status === 'in_progress' ? 'bg-indigo-400' : f.type === 'bugfix' ? 'bg-amber-400' : 'bg-slate-500';
              return `
                <button type="button" 
                        data-focus-node="${f.id}" 
                        class="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                    <span class="font-mono text-[11px] text-slate-300 group-hover:text-indigo-300">INT-${String(f.id).padStart(3, '0')}</span>
                    <span class="truncate text-[11px] text-slate-400">${f.name}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- HUD Tooltip Flotante 3D -->
        <div id="three-tooltip-hud" class="absolute z-30 pointer-events-none hidden transition-opacity duration-150 transform -translate-x-1/2 -translate-y-full mb-3">
          <div class="bg-slate-900/95 border border-indigo-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs text-slate-200 min-w-[220px] max-w-xs">
            <div id="hud-content"></div>
          </div>
        </div>

        <!-- Canvas 3D Root -->
        <div id="three-canvas-root" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
      </div>
    `;

    const root = this.container.querySelector('#three-canvas-root');
    this.hudElement = this.container.querySelector('#three-tooltip-hud');
    this.initThree(root);
  }

  initThree(rootEl) {
    const THREE = window.THREE;
    const width = rootEl.clientWidth || 800;
    const height = rootEl.clientHeight || 680;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.0015);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 3500);
    this.camera.position.set(0, 40, 520);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rootEl.appendChild(this.renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2.5, 1200);
    pointLight.position.set(150, 250, 200);
    this.scene.add(pointLight);

    const secondLight = new THREE.PointLight(0x06b6d4, 1.8, 1000);
    secondLight.position.set(-200, -150, 100);
    this.scene.add(secondLight);

    this.createStarfield();
    this.createNodes();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.bindEvents(rootEl);
    this.animate();
  }

  createStarfield() {
    const THREE = window.THREE;
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const posArray = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 2200;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.65
    });

    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  createNodes() {
    const THREE = window.THREE;
    const count = this.features.length;
    this.nodes = [];
    this.orbitRings = [];
    this.flowParticles = [];

    const radius = 190;
    const featureMap = new Map();
    this.features.forEach(f => featureMap.set(f.id, f));

    this.features.forEach((f, idx) => {
      // Posicionamiento en esfera armónica
      const phi = Math.acos(-1 + (2 * idx) / Math.max(count, 1));
      const theta = Math.sqrt(count * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Tamaño según prioridad (P0 grande, P2 estándar)
      let sphereRadius = 8;
      if (f.priority === 'P0' || f.priority === 'alta') sphereRadius = 14;
      else if (f.priority === 'P1' || f.priority === 'media') sphereRadius = 10;
      else if (f.priority === 'P3' || f.priority === 'baja') sphereRadius = 6;

      // Color vibrante
      let color = 0x64748b;
      let emissive = 0x334155;
      
      const rawDeps = f.depends_on || f.dependencies || [];
      const pendingDeps = rawDeps.filter(dId => {
        const dep = featureMap.get(dId);
        return dep && dep.status !== 'done';
      });
      const isBlocked = f.status !== 'done' && pendingDeps.length > 0;

      if (f.status === 'done') {
        color = 0x10b981;
        emissive = 0x059669;
      } else if (f.status === 'in_progress') {
        color = 0x6366f1;
        emissive = 0x4f46e5;
      } else if (f.status === 'spec_ready') {
        color = 0x06b6d4;
        emissive = 0x0891b2;
      } else if (isBlocked) {
        color = 0xf43f5e;
        emissive = 0xe11d48;
      } else if (f.type === 'bugfix') {
        color = 0xf59e0b;
        emissive = 0xd97706;
      }

      const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.25,
        metalness: 0.35,
        emissive,
        emissiveIntensity: 0.5
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { feature: f, baseRadius: sphereRadius, baseColor: color, baseEmissive: emissive };

      this.scene.add(mesh);
      this.nodes.push(mesh);

      // Anillo orbital luminoso para nodos de alta prioridad P0/P1
      if (f.priority === 'P0' || f.priority === 'alta') {
        const ringGeo = new THREE.RingGeometry(sphereRadius + 4, sphereRadius + 6, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(x, y, z);
        ring.rotation.x = Math.PI / 2.5;
        this.scene.add(ring);
        this.orbitRings.push(ring);
      }
    });

    // 2. Conexiones 3D y partículas de energía
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

        // Línea de conexión con gradiente de color
        const points = [sourceMesh.position, targetMesh.position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: isResolved ? 0x10b981 : 0xf43f5e,
          transparent: true,
          opacity: isResolved ? 0.6 : 0.4
        });
        const line = new THREE.Line(lineGeo, lineMat);
        this.scene.add(line);

        // Partícula de energía que viaja por la conexión
        const pGeo = new THREE.SphereGeometry(2, 12, 12);
        const pMat = new THREE.MeshBasicMaterial({
          color: isResolved ? 0x34d399 : 0xfb7185
        });
        const particle = new THREE.Mesh(pGeo, pMat);
        particle.userData = {
          start: sourceMesh.position,
          end: targetMesh.position,
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
      if (this.isDragging) {
        const deltaX = e.clientX - this.prevMousePos.x;
        const deltaY = e.clientY - this.prevMousePos.y;
        this.targetRotation.y += deltaX * 0.005;
        this.targetRotation.x += deltaY * 0.005;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }

      const rect = rootEl.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast hover con HUD flotante
      this.checkRaycast(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    const onClick = (e) => {
      if (!this.hoveredMesh) return;
      const clickedFeature = this.hoveredMesh.userData.feature;
      if (clickedFeature && this.onSelect) {
        this.onSelect(clickedFeature);
      }
    };

    rootEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    rootEl.addEventListener('click', onClick);

    // Zoom con rueda
    rootEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      this.camera.position.z = Math.min(Math.max(200, this.camera.position.z * zoomFactor), 1200);
    }, { passive: false });

    // Panel lateral de enfoque
    this.container.querySelectorAll('[data-focus-node]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-focus-node'), 10);
        const nodeMesh = this.nodes.find(n => n.userData.feature.id === id);
        if (nodeMesh) {
          this.focusOnNode(nodeMesh);
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
      const hudContent = this.container.querySelector('#hud-content');
      if (hudContent && f) {
        const branchName = f.branch || `${f.type || 'feature'}/INT-${String(f.id).padStart(3, '0')}/${f.name}`;
        const rawDeps = f.depends_on || f.dependencies || [];
        hudContent.innerHTML = `
          <div class="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-800 pb-1.5">
            <span class="font-mono font-bold text-indigo-400">INT-${String(f.id).padStart(3, '0')}</span>
            <span class="font-semibold px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">${f.status}</span>
          </div>
          <div class="font-bold text-slate-100 text-xs mb-1">${f.title || f.name}</div>
          <div class="font-mono text-[10px] text-slate-400 truncate mb-1">🌿 ${branchName}</div>
          <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Prioridad: <strong class="text-indigo-300">${f.priority || 'P2'}</strong></span>
            <span>${rawDeps.length ? `${rawDeps.length} deps` : 'Raíz'}</span>
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
      this.targetRotation.y += 0.001; // Giro continuo lento
    }

    if (this.scene) {
      this.scene.rotation.y = this.rotation.y;
      this.scene.rotation.x = this.rotation.x;
    }

    // Animar anillos orbitales
    this.orbitRings.forEach(ring => {
      ring.rotation.z += 0.015;
    });

    // Animar partículas de flujo
    this.flowParticles.forEach(p => {
      p.userData.progress = (p.userData.progress + 0.008) % 1;
      const { start, end, progress } = p.userData;
      p.position.lerpVectors(start, end, progress);
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

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.nodes = [];
    this.orbitRings = [];
    this.flowParticles = [];
  }
}
