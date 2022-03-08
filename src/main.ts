import { World } from './classes/World';

import WebGL from 'three/examples/jsm/capabilities/WebGL';

window.addEventListener('DOMContentLoaded', () => {
  if (WebGL.isWebGLAvailable()) {
    new World({ vr: true });
  } else {
    const warning = WebGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
  }
});
