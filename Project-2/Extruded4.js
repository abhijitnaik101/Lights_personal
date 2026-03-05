import * as THREE from 'three'
import { scene } from '../Core/Scene';
import { clearcoat, clearcoatRoughness, emissive, metalness, shininess } from 'three/tsl';
import { camera } from '../Core/Camera';
import { renderer } from '../Core/Renderer';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

let height = 5;
let width = 20;
let thickness = 5;
let segments = 50;
let diameter = 1;
let width1 = 2;
let mesh = null;
const originX  = 0, originY = 0;


export function createExtrudeE4(newWidth, newHeight, newThickness, newDiameter, newW1) {

    //updateCamera();
    if (!checkConstraintE4(newWidth, newHeight, newThickness, newDiameter, newW1)) return;
    deleteShapeE4();

    height = newHeight;
    width = newWidth;
    thickness = newThickness;
    diameter = newDiameter;
    width1 = newW1;


    const extrudeSettings = {
        depth: thickness,
        steps: 5,
        bevelEnabled: true,
        bevelSegments: 2,
    };
    const materialSettings = {
        color: '#3052e7',
        side: THREE.DoubleSide,
        emissive: '#000000',
        specular: '#ffffff',
        shininess : 100,
        transparent: false,
        wireframe: false,
    }

    const shape = createShapeE4(width, height);
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhongMaterial(materialSettings);
    //cutShape(geometry);


    mesh = new THREE.Mesh(geometry, material);
    const outline = getOutline(geometry);
    createLines();

    mesh.add(outline);


    
    scene.add(mesh);
}

export function deleteShapeE4() {
    if (scene.children.includes(mesh)) scene.remove(mesh);
}

function createShapeE4(width, height) {
    const shape = new THREE.Shape();
    shape.moveTo(width1 / 2, width1 / 2);
    shape.absarc(
        width1, width1 / 2,
        width1 / 2,
        Math.PI,
        0,
        false);
    shape.lineTo(width - width1 - width1 / 4, width1 / 2);
    shape.absarc(width - width1 - width1 / 4, width1 / 4,
        width1 / 4,
        Math.PI / 2, 0,
        true,
    )
    shape.lineTo(width - width1, -(height - width1 / 2 - 2 * width1));
    shape.absarc(width - width1 / 2, -(height - width1 / 2 - 2 * width1),
        width1 / 2,
        Math.PI, 0,
        false,
    )
    shape.lineTo(width, width1);
    shape.absarc(width - width1 / 2, width1,
        width1 / 2,
        0,
        Math.PI / 2,
        false,
    )
    shape.absarc(
        width1, width1 * 3 / 2,
        width1 / 2,
        0,
        Math.PI,
        false);

    shape.absarc(
        width1 / 2, width1,
        width1 / 2,
        Math.PI / 2,
        Math.PI * 3 / 2,
        false);

    shape.lineTo(width1 / 2, width1 / 2);

    const hole = new THREE.Path();
    hole.absarc(width1, width1, diameter / 2, 0, Math.PI * 2, false);
    shape.holes.push(hole);

    return shape;
}

let w_line = null;
let h_line = null;
let w1_line = null;
let d_line = null;
function createLines() {
    deleteLines();
    const textSize = 1;
    const materialSettings = {color : 'black'};

    const w_points = [new THREE.Vector3(0, -(height - width1 * 2 + 3), thickness), new THREE.Vector3(width, -(height - width1 * 2 + 3), thickness)];
    const w_geometry = new THREE.BufferGeometry().setFromPoints(w_points);

    const h_points = [new THREE.Vector3(-1, -(height - width1 * 2), thickness), new THREE.Vector3(-1, width1*2, thickness)];
    const h_geometry = new THREE.BufferGeometry().setFromPoints(h_points);

    const w1_points = [new THREE.Vector3(width - width1, -(height - width1 * 2 + 0.5), thickness), new THREE.Vector3(width, -(height - width1 * 2 + 0.5), thickness)];
    const w1_geometry = new THREE.BufferGeometry().setFromPoints(w1_points);

    const d_points = [new THREE.Vector3(width1 - diameter/2 + 0.5, width1, thickness), new THREE.Vector3(width1 + diameter/2 - 0.5, width1, thickness)];
    const d_geometry = new THREE.BufferGeometry().setFromPoints(d_points);

    const material = new THREE.LineBasicMaterial(materialSettings);
     w_line = new THREE.Line(w_geometry, material);
     h_line = new THREE.Line(h_geometry, material);
     w1_line = new THREE.Line(w1_geometry, material);
     d_line = new THREE.Line(d_geometry, material);

    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const widthText = new TextGeometry(width.toString(), {
            font: font,
            size: textSize,
            depth: 0.01,
            curveSegments: 12,
        });

        const heigthText = new TextGeometry(height.toString(), {
            font: font,
            size: textSize,
            depth: 0.01,
            curveSegments: 12,
        });

        const w1Text = new TextGeometry(width1.toString(), {
            font: font,
            size: textSize,
            depth:0.01,
            curveSegments: 12,
        });

        const dText = new TextGeometry(diameter.toString(), {
            font: font,
            size: textSize,
            depth:0.01,
            curveSegments: 12,
        });

        const w_text = new THREE.Mesh(widthText, new THREE.MeshBasicMaterial(materialSettings));
        w_text.position.set(width / 2, -(height - width1 * 2) - (textSize + 3), thickness);
        w_line.add(w_text)

        const h_text = new THREE.Mesh(heigthText, new THREE.MeshBasicMaterial(materialSettings));
        h_text.position.set(-2 - textSize, (4*width1 - height)/2, thickness);
        h_line.add(h_text)

        const w1_text = new THREE.Mesh(w1Text, new THREE.MeshBasicMaterial(materialSettings));
        w1_text.position.set(width - width1/2, -(height - width1 * 2) - 1 - textSize, thickness);
        w1_line.add(w1_text)

        const d_text = new THREE.Mesh(dText, new THREE.MeshBasicMaterial(materialSettings));
        d_text.position.set(width1 - textSize/2, width1, thickness);
        d_line.add(d_text)
        
        scene.add(w_line);
        scene.add(h_line);
        scene.add(w1_line);
        scene.add(d_line);
    });

}

export function deleteLines(){
    if (scene.children.includes(w_line)) scene.remove(w_line);
    if (scene.children.includes(h_line)) scene.remove(h_line);
    if (scene.children.includes(w1_line)) scene.remove(w1_line);
    if (scene.children.includes(d_line)) scene.remove(d_line);
}


function checkConstraintE4(newWidth, newHeight, newThickness, newDiameter, newW1) {
    if (newWidth < 3 * newW1) {
        alert("Width is too short, must be >= " + 3 * newW1);
        return false;
    }
    if (newHeight < 9 * newW1 / 4) {
        alert("Height is too short, must be >= " + 9 * newW1 / 4);
        return false;
    }
    if (newDiameter > newW1) {
        alert("diameter must be less than " + newW1);
        return false;
    }
    return true;
}


function getOutline(geometry) {
    const edge = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineBasicMaterial({ color: '#3d60fc' })
    const outline = new THREE.LineSegments(edge, line);
    return outline;
}

function updateCamera() {
    camera.position.x = width1;
    camera.position.y = width1;
    camera.lookAt(width1, width1, 0);
    camera.rotation.set(0, 0, 0);
}

let dirLight = null;
export function createLight(on) {
    if(on){
        dirLight = new THREE.DirectionalLight('white', 1);
        scene.add(dirLight);
        dirLight.position.set(5, 5, 5);
        dirLight.lookAt(0, 0, 0);
    }
    else if (scene.children.includes(dirLight)) {
        scene.remove(dirLight);
    }
    
    
}


const widthInput = document.querySelector('.widthInputE4');
const heightInput = document.querySelector('.heightInputE4');
const thicknessInput = document.querySelector('.thicknessInputE4');
const diameterInput = document.querySelector('.diameterInputE4');
const w1Input = document.querySelector('.w1InputE4');

const updateBtnE4 = document.getElementById('updateBtnE4');

updateBtnE4.addEventListener('click', () => {
    const width = Number(widthInput.value);
    const height = Number(heightInput.value);
    const thickness = Number(thicknessInput.value);
    const diameter = Number(diameterInput.value);
    const w1 = Number(w1Input.value);

    if (width === 0 || height === 0 || thickness === 0 || diameter === 0 || w1 === 0) {
        alert("Please enter all numbers!");
        return;
    }

    createExtrudeE4(width, height, thickness, diameter, w1);
});
