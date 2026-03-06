import * as THREE from 'three';
import { scene } from '../Core/Scene';

//#region Geometries
const geometryBox = new THREE.BoxGeometry(2,2,2);
const geometrySphere = new THREE.SphereGeometry();
const geometryCone = new THREE.ConeGeometry();
const geometryCylinder = new THREE.CylinderGeometry();
const geometryCapsule = new THREE.CapsuleGeometry();
const geometryTetra = new THREE.TetrahedronGeometry();
const geometryOcta = new THREE.OctahedronGeometry();
const geometryDodeca = new THREE.DodecahedronGeometry();
const geometryTorusKnot = new THREE.TorusKnotGeometry();
const geometryEdge = new THREE.EdgesGeometry()
//#endregion

//#region Materials
const basicMaterial = new THREE.MeshBasicMaterial({ color : '#355872'})
const standardMaterial = new THREE.MeshStandardMaterial({ color : '#22399e', roughness: 0, metalness: 0.7})
const physicalMaterial = new THREE.MeshPhysicalMaterial({ color : '#A82323', iridescence: 1, clearcoat: 0.9})
const phongMaterial = new THREE.MeshPhongMaterial({ color : '#3258ff', shininess: 100, emissive: '#000000' , specular : '#ffffff'})
const toonMaterial = new THREE.MeshToonMaterial({ color : '#049ef4'})
const lineDashedMaterial = new THREE.LineDashedMaterial({color: 0xffffff, scale: 1, dashSize: 3, gapSize: 1,})
const normalMaterial = new THREE.MeshNormalMaterial()
const lambertMaterial = new THREE.MeshLambertMaterial({color: '#f64004', emissive: '#5b408c'})
const shadowMaterial = new THREE.ShadowMaterial();
//#endregion


const mesh = new THREE.Mesh();
mesh.material = basicMaterial;
mesh.position.y = 4;
mesh.castShadow = true;

const geometryText = document.getElementById('geometryInfo');
const materialText = document.getElementById('materialInfo');

updateGeometryText();
updateMaterialText();

export function changeMesh(keys){
    if(keys['0']) mesh.geometry = new THREE.BufferGeometry();
    if(keys['1']) mesh.geometry = geometryBox;
    if(keys['2']) mesh.geometry = geometrySphere;
    if(keys['3']) mesh.geometry = geometryCone;
    if(keys['4']) mesh.geometry = geometryCylinder;
    if(keys['5']) mesh.geometry = geometryCapsule;
    if(keys['6']) mesh.geometry = geometryTetra;
    if(keys['7']) mesh.geometry = geometryOcta;
    if(keys['8']) mesh.geometry = geometryDodeca;
    if(keys['9']) mesh.geometry = geometryTorusKnot;
    if(keys['e']) {

    }
    updateGeometryText();
}

export function changeMaterial(keys){
    if(keys['[']) mesh.material = basicMaterial;
    if(keys[']']) mesh.material = standardMaterial;
    if(keys[';']) mesh.material = physicalMaterial;
    if(keys[':']) mesh.material = phongMaterial;
    if(keys['.']) mesh.material = toonMaterial;
    if(keys[',']) mesh.material = lineDashedMaterial;
    if(keys['?']) mesh.material = normalMaterial;
    if(keys['/']) mesh.material = lambertMaterial;
    if(keys['+']) mesh.material = shadowMaterial;
    updateMaterialText();
}

export function changeGeometryBtn(type){
    switch(type) {
    case 'box': mesh.geometry = geometryBox; break;
    case 'sphere': mesh.geometry = geometrySphere; break;
    case 'cone': mesh.geometry = geometryCone; break;
    case 'cylinder': mesh.geometry = geometryCylinder; break;
    case 'capsule': mesh.geometry = geometryCapsule; break;
    case 'tetrahedron': mesh.geometry = geometryTetra; break;
    case 'octahedron': mesh.geometry = geometryOcta; break;
    case 'dodecahedron': mesh.geometry = geometryDodeca; break;
    case 'torusknot': mesh.geometry = geometryTorusKnot; break;
    case 'removeGeometry': mesh.geometry = new THREE.BufferGeometry(); break;

}
    updateGeometryText();
}

export function changeMaterialBtn(type){
    switch(type){
    case 'basic': mesh.material = basicMaterial; break;
    case 'standard': mesh.material = standardMaterial; break;
    case 'physical': mesh.material = physicalMaterial; break;
    case 'phong': mesh.material = phongMaterial; break;
    case 'toon': mesh.material = toonMaterial; break;
    case 'line': mesh.material = lineDashedMaterial; break;
    case 'normal': mesh.material = normalMaterial; break;
    case 'lambert': mesh.material = lambertMaterial; break;
    case 'shadow': mesh.material = shadowMaterial; break;

}
    updateMaterialText();
}

function updateGeometryText(){
geometryText.textContent = mesh.geometry.type;
}

function updateMaterialText(){
materialText.textContent = mesh.material.type;
}

export function createGeometries(){
    scene.add(mesh);
}

export function getMesh(){
    return mesh;
}