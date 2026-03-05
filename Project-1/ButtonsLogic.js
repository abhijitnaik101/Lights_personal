import { changeCameraBtn } from "../Core/Camera";
import { changeLightsBtn } from "../Core/Lights";
import { changeGeometryBtn, changeMaterialBtn } from "./Geometries";

//#region Geometries
document.getElementById('boxButton').addEventListener('click', () => changeGeometryBtn('box'));
document.getElementById('sphereButton').addEventListener('click', () => changeGeometryBtn('sphere'));
document.getElementById('coneButton').addEventListener('click', () => changeGeometryBtn('cone'));
document.getElementById('cylinderButton').addEventListener('click', () => changeGeometryBtn('cylinder'));
document.getElementById('capsuleButton').addEventListener('click', () => changeGeometryBtn('capsule'));
document.getElementById('tetraButton').addEventListener('click', () => changeGeometryBtn('tetrahedron'));
document.getElementById('octaButton').addEventListener('click', () => changeGeometryBtn('octahedron'));
document.getElementById('dodecaButton').addEventListener('click', () => changeGeometryBtn('dodecahedron'));
document.getElementById('torusknotButton').addEventListener('click', () => changeGeometryBtn('torusknot'));
document.getElementById('geometryRemoveButton').addEventListener('click', () => changeGeometryBtn('removeGeometry'));
//#endregion

//#region Lights
document.getElementById('ambientButton').addEventListener('click', () => changeLightsBtn('ambient'));
document.getElementById('directionalButton').addEventListener('click', () => changeLightsBtn('directional'));
document.getElementById('spotButton').addEventListener('click', () => changeLightsBtn('spot'));
document.getElementById('pointButton').addEventListener('click', () => changeLightsBtn('point'));
document.getElementById('rectButton').addEventListener('click', () => changeLightsBtn('rect'));
document.getElementById('removeLightButton').addEventListener('click', () => changeLightsBtn('removeLights'));
//#endregion

const perspectiveButtons = document.getElementsByClassName('perspectiveButton');
const orthographicButtons = document.getElementsByClassName('orthographicButton');
Array.from(perspectiveButtons).forEach(btn => {
    btn.addEventListener('click', () => changeCameraBtn('perspective'));
});
Array.from(orthographicButtons).forEach(btn => {
    btn.addEventListener('click', () => changeCameraBtn('orthographic'));
});

//#region Materials
document.getElementById('basicMaterialButton').addEventListener('click', () => changeMaterialBtn('basic'));
document.getElementById('standardMaterialButton').addEventListener('click', () => changeMaterialBtn('standard'));
document.getElementById('physicalMaterialButton').addEventListener('click', () => changeMaterialBtn('physical'));
document.getElementById('phongMaterialButton').addEventListener('click', () => changeMaterialBtn('phong'));
document.getElementById('toonMaterialButton').addEventListener('click', () => changeMaterialBtn('toon'));
document.getElementById('lineMaterialButton').addEventListener('click', () => changeMaterialBtn('line'));
document.getElementById('normalMaterialButton').addEventListener('click', () => changeMaterialBtn('normal'));
document.getElementById('lambertMaterialButton').addEventListener('click', () => changeMaterialBtn('lambert'));
document.getElementById('shadowMaterialButton').addEventListener('click', () => changeMaterialBtn('shadow'));
//#endregion