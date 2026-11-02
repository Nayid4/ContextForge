/**
 * SpaceView3D: Visualizador 3D interactivo en Three.js (Vista Espacial / Constelación de Tareas).
 * Diseñado con ciclo de vida explícito (mount/unmount) para liberar memoria y GPU.
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
    this.raycaster = null;
    this.mouse = null;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.rotation = { x: 0.2, y: 0.4 };
  }

  mount(containerEl, { features, onSelect }) {
    this.container = containerEl;
    this.features = features || [];
    this.onSelect = onSelect;

    if (!window.THREE) {
      this.container.innerHTML = `
        <div class="h-[600px] flex items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-400">
          <p>Librería Three.js no disponible en el entorno.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="relative w-full h-[650px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <!-- Overlay HUD -->
        <div class="absolute top-4 left-4 z-10 pointer-events-none text-xs">
          <span class="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 backdrop-blur-md">
            🌌 Constelación 3D de Tareas | Arrastra para orbitar | Clic para inspeccionar
          </span>
        </div>
        
        <div class="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-3 text-[11px] bg-slate-900/80 border border-slate-700/80 px-3 py-1.5 rounded-lg backdrop-blur-md">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Completado</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> En Progreso</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Bugfix</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Pendiente</span>
        </div>

        <div id="three-canvas-root" class="w-full h-full cursor-move"></div>
      </div>
    `;

    const root = this.container.querySelector('#three-canvas-root');
    this.initThree(root);
  }

  initThree(rootEl) {
    const THREE = window.THREE;
    const width = rootEl.clientWidth || 800;
    const height = rootEl.clientHeight || 650;

    // Escena y Cámara
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.0018);

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
    this.camera.position.set(0, 50, 450);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rootEl.appendChild(this.renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2, 800);
    pointLight.position.set(100, 200, 150);
    this.scene.add(pointLight);

    // Fondo estelar (partículas cósmicas)
    this.createStarfield();

    // Nodos 3D
    this.createNodes();

    // Raycaster para interactividad
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.bindEvents(rootEl);
    this.animate();
  }

  createStarfield() {
    const THREE = window.THREE;
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const posArray = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 1600;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.6
    });

    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  createNodes() {
    const THREE = window.THREE;
    const count = this.features.length;
    this.nodes = [];

    const radius = 160;
    this.features.forEach((f, idx) => {
      // Posición en esfera / espiral
      const phi = Math.acos(-1 + (2 * idx) / Math.max(count, 1));
      const theta = Math.sqrt(count * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Color según status/tipo
      let color = 0x64748b; // pendiente
      if (f.status === 'done') color = 0x10b981;
      else if (f.status === 'in_progress') color = 0x6366f1;
      else if (f.status === 'spec_ready') color = 0x06b6d4;
      else if (f.type === 'bugfix') color = 0xf43f5e;

      const geometry = new THREE.SphereGeometry(7, 24, 24);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.2,
        emissive: color,
        emissiveIntensity: 0.4
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { feature: f };

      this.scene.add(mesh);
      this.nodes.push(mesh);
    });

    // Conexiones de dependencias en 3D
    this.features.forEach(f => {
      if (!f.depends_on) return;
      const targetMesh = this.nodes.find(n => n.userData.feature.id === f.id);
      if (!targetMesh) return;

      f.depends_on.forEach(depId => {
        const sourceMesh = this.nodes.find(n => n.userData.feature.id === depId);
        if (!sourceMesh) return;

        const points = [sourceMesh.position, targetMesh.position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x4f46e5,
          transparent: true,
          opacity: 0.4
        });
        const line = new THREE.Line(lineGeo, lineMat);
        this.scene.add(line);
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
        this.rotation.y += deltaX * 0.005;
        this.rotation.x += deltaY * 0.005;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }

      // Raycast hover
      const rect = rootEl.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    const onClick = (e) => {
      const rect = rootEl.getBoundingClientRect();
      const clickMouse = new window.THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      this.raycaster.setFromCamera(clickMouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.nodes);

      if (intersects.length > 0) {
        const clickedFeature = intersects[0].object.userData.feature;
        if (clickedFeature && this.onSelect) {
          this.onSelect(clickedFeature);
        }
      }
    };

    rootEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    rootEl.addEventListener('click', onClick);

    this._cleanupEvents = () => {
      rootEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      rootEl.removeEventListener('click', onClick);
    };
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (!this.isDragging) {
      this.rotation.y += 0.0015; // Rotación automática suave
    }

    if (this.scene) {
      this.scene.rotation.y = this.rotation.y;
      this.scene.rotation.x = this.rotation.x;
    }

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
  }
}
