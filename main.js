import { scene } from "./Core/Scene"
import { camera, changeCamera } from './Core/Camera';
import { renderer } from './Core/Renderer';
import { controls } from './Controls/OrbitControls';
import { ambientLight } from './Core/Lights';
import { changeMaterial, changeMesh, getMesh } from './Project-1/Geometries';

import './Project-1/ButtonsLogic'
import './Project-2/Extruded1';
import './Project-2/Extruded2';
import './Project-2/ExtrudedController';
import './Project-3/CuttingController';
import './Project-4/Project4Controller'
import './ProjectController';

scene.add(ambientLight);

let project = 2;

const keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

export function setProject(num) {
    project = num;
}

let mesh = getMesh();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {

    if (project === 1) {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        changeMesh(keys);
        changeMaterial(keys);
    }

    changeCamera(keys);
    controls.object = camera;
    controls.update();

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);