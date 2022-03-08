import * as THREE from 'three';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class World {
  options: { vr?: boolean };

  // by default, a 3DOF headset has a height offset of 1.6 (average human height)
  heightOffset: number = 1.6;

  scene!: THREE.Scene;
  animationFrames!: Function;
  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;

  mixers: THREE.AnimationMixer[] = [];
  clock: THREE.Clock = new THREE.Clock();

  constructor(options: { vr?: boolean }) {
    this.options = options;
    this.initialize();
  }

  initialize() {
    this.loadRenderer();

    this.animationFrames = this.options.vr
      ? this.renderer.setAnimationLoop
      : requestAnimationFrame;

    this.scene = new THREE.Scene();

    this.loadCamera();
    this.loadLights();
    this.loadSkyBox();
    this.loadPlane();
    this.loadX12MechModel();

    window.addEventListener(
      'resize',
      () => {
        this.onWindowResize();
      },
      false
    );

    this.animate();
  }

  loadRenderer() {
    this.renderer = new THREE.WebGLRenderer();

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    if (this.options.vr) {
      this.renderer.xr.enabled = true;
      document.body.appendChild(VRButton.createButton(this.renderer));
    }
  }

  loadCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.camera.position.set(0, this.heightOffset, 0);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, this.heightOffset, 0);
    controls.update();
  }

  loadLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff);

    directionalLight.position.set(100, 100, 100);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.001;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500.0;
    directionalLight.shadow.camera.left = 100;
    directionalLight.shadow.camera.right = -100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;

    this.scene.add(directionalLight);
    this.scene.add(ambientLight);
  }

  loadSkyBox() {
    const loader = new THREE.CubeTextureLoader();
    const skybox = loader.load([
      '/skybox/sh_ft.png',
      '/skybox/sh_bk.png',
      '/skybox/sh_up.png',
      '/skybox/sh_dn.png',
      '/skybox/sh_rt.png',
      '/skybox/sh_lf.png',
    ]);

    this.scene.background = skybox;
  }

  loadPlane() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
      })
    );

    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, -this.heightOffset, 0);

    this.scene.add(plane);
  }

  loadX12MechModel() {
    const loader = new GLTFLoader();

    loader.load('/models/x12 mech/scene.gltf', (x12mech) => {
      x12mech.scene.traverse((object3d) => {
        object3d.castShadow = true;
      });

      x12mech.scene.position.set(-28, -this.heightOffset, 0);

      this.scene.add(x12mech.scene);
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.animationFrames(() => {
      this.animate();
    });

    this.mixers.map((mixer) => mixer.update(this.clock.getDelta()));

    this.renderer.render(this.scene, this.camera);
  }
}
