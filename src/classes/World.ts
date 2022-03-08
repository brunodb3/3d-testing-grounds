import * as Three from 'three';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class World {
  scene!: Three.Scene;
  threejs!: Three.WebGLRenderer;
  camera!: Three.PerspectiveCamera;

  mixers: Three.AnimationMixer[] = [];
  clock: Three.Clock = new Three.Clock();

  lastAnimationTime?: number;

  constructor() {
    this.initialize();
  }

  initialize() {
    this.threejs = new Three.WebGLRenderer();

    this.threejs.shadowMap.enabled = true;
    this.threejs.shadowMap.type = Three.PCFSoftShadowMap;
    this.threejs.setPixelRatio(window.devicePixelRatio);
    this.threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.threejs.domElement);

    window.addEventListener(
      'resize',
      () => {
        this.onWindowResize();
      },
      false
    );

    this.camera = new Three.PerspectiveCamera(60, 1920 / 1080, 1.0, 1000.0);
    this.camera.position.set(0, 30, 50);

    this.scene = new Three.Scene();

    const directionalLight = new Three.DirectionalLight(0xffffff);
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

    const ambientLight = new Three.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const controls = new OrbitControls(this.camera, this.threejs.domElement);
    controls.target.set(0, 10, 0);
    controls.update();

    const loader = new Three.CubeTextureLoader();
    const skybox = loader.load([
      '/skybox/sh_ft.png',
      '/skybox/sh_bk.png',
      '/skybox/sh_up.png',
      '/skybox/sh_dn.png',
      '/skybox/sh_rt.png',
      '/skybox/sh_lf.png',
    ]);
    this.scene.background = skybox;

    const plane = new Three.Mesh(
      new Three.PlaneGeometry(100, 100, 10, 10),
      new Three.MeshStandardMaterial({
        color: 0xffffff,
      })
    );
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    this.loadModel();
    this.loadAnimatedModel();
    this.animate();
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load('/models/x12 mech/scene.gltf', (x12mech) => {
      x12mech.scene.traverse((object3d) => {
        object3d.castShadow = true;
      });

      this.scene.add(x12mech.scene);
    });
  }

  loadAnimatedModel() {
    const loader = new FBXLoader();
    loader.setPath('/models/ybot/');
    loader.load('ybot.fbx', (ybot) => {
      ybot.scale.setScalar(0.1);
      ybot.traverse((object3d) => {
        object3d.castShadow = true;
      });

      const animation = new FBXLoader();
      animation.setPath('/models/animations/');
      animation.load('Twist Dance.fbx', (dance) => {
        const mixer = new Three.AnimationMixer(ybot);
        this.mixers.push(mixer);

        const idle = mixer.clipAction(dance.animations[0]);
        idle.play();
      });

      this.scene.add(ybot);
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate();
    });

    if (this.mixers) {
      this.mixers.map((mixer) => mixer.update(this.clock.getDelta()));
    }

    this.threejs.render(this.scene, this.camera);
  }
}
