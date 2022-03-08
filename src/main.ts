// import { World } from './classes/World';
import { WorldVR } from './classes/World-vr';

import WebGL from 'three/examples/jsm/capabilities/WebGL';

window.addEventListener('DOMContentLoaded', () => {
  if (WebGL.isWebGLAvailable()) {
    // new World();
    new WorldVR();
  } else {
    const warning = WebGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
  }
});
