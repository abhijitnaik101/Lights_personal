import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/Addons.js';
import { scene } from './Scene';

export const ambientLight = new THREE.AmbientLight('white', 10);

const directionalLight = new THREE.DirectionalLight('white', 5);
directionalLight.position.set(10, 20, 10)
directionalLight.castShadow = true;
directionalLight.lookAt(0, 0, 0);
const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2, 'white');

const pointLight = new THREE.PointLight('white', 200, 10);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 5, 'yellow');
pointLight.position.set(2.5, 5, 0);
pointLight.castShadow = true;


const spotLight = new THREE.SpotLight('white', 100, 20, Math.PI / 4, 0.2, 1);
const spotLighthelper = new THREE.SpotLightHelper(spotLight, 'red');
spotLight.position.set(0, 10, 0); 
spotLight.target.position.set(0,0,0);
spotLight.castShadow = true;


const hemisphereLight = new THREE.HemisphereLight('white', 'blue', 35);
hemisphereLight.position.set(0, 10, 0);

RectAreaLightUniformsLib.init();
const rectAreaLight = new THREE.RectAreaLight('white', 40, 10, 5);
rectAreaLight.castShadow = true
rectAreaLight.position.set(10.5, 10, 0);
rectAreaLight.rotation.set(0, Math.PI/2, 0);
rectAreaLight.lookAt(0, 0, 0);


const lightText = document.getElementById('lightInfo')

export function changeLights(keys) {
    if (keys["x"]) {
        removeLights();
    }
    if (keys["a"]) {
        scene.add(ambientLight);
    }
    if (keys["d"]) {
        scene.add(directionalLight);
        scene.add(dirLightHelper);
    }
    if (keys["r"]) {
        scene.add(rectAreaLight);
    }
    if (keys["p"]) {
        scene.add(pointLight);
        scene.add(pointLightHelper);
    }
    if (keys["s"]) {
        scene.add(spotLight);
        scene.add(spotLighthelper);
    }
    if (keys["h"]) {
        scene.add(hemisphereLight);
    }
updateLightText();
}

function removeLights() {
    //#region Lights
    scene.remove(directionalLight);
    scene.remove(ambientLight);
    scene.remove(pointLight);
    scene.remove(spotLight);
    scene.remove(rectAreaLight);
    scene.remove(hemisphereLight);
    //#endregion 

    //#region Light Helpers
    scene.remove(dirLightHelper);
    scene.remove(pointLightHelper);
    scene.remove(spotLighthelper);
    //#endregion
}

export function changeLightsBtn(type){
    switch(type){
    case 'ambient': 
        scene.add(ambientLight); 
    break;
    case 'directional': 
        scene.add(directionalLight); 
        scene.add(dirLightHelper);
    break;
    case 'spot': 
        scene.add(spotLight); 
        scene.add(spotLighthelper);
    break;
    case 'point': 
        scene.add(pointLight); 
        scene.add(pointLightHelper);
    break;
    case 'rect': 
        scene.add(rectAreaLight);
    break;
    case 'removeLights': removeLights(); 
    break;
}
updateLightText();
}

function updateLightText(){
    const activeLights = [];
    if (scene.children.includes(ambientLight)) activeLights.push('Ambient');
    if (scene.children.includes(directionalLight)) activeLights.push('Directional');
    if (scene.children.includes(spotLight)) activeLights.push('Spot');
    if (scene.children.includes(pointLight)) activeLights.push('Point');
    if (scene.children.includes(rectAreaLight)) activeLights.push('RectArea');

    lightText.textContent = (activeLights.length ? activeLights.join(', ') : 'None')
}