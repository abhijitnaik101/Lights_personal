import * as THREE from 'three'
import { scene } from '../Core/Scene';
import { SUBTRACTION, Brush, Evaluator, INTERSECTION } from 'three-bvh-csg';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { BufferAttribute } from 'three/webgpu';

let height = 5;
let width = 20;
let thickness = 5;
let segments = 200;
let width1 = 2;
let width2 = 2;
let height1 = 2.5;
let height2 = 2.5;
let cutAngle1 = 45;
let cutAngle2 = 135;
let mesh = null;

//#region Cut Extruded
export function createCutExtrudeShapeE3(newWidth, newHeight, newThickness, newH1, newH2, newW1, newW2, cut1, cut2) {

    if (!checkRulesAngleExE3(newWidth, newHeight, newThickness, newH1, newH2, newW1, newW2)) return;
    deleteCutExtrudeShapeE3();

    height = newHeight;
    width = newWidth;
    thickness = newThickness;
    width1 = newW1;
    width2 = newW2;
    height1 = newH1;
    height2 = newH2;
    cutAngle1 = cut1;
    cutAngle2 = cut2;


    const extrudeSettings = {
        depth: thickness,
        steps: 5,
        bevelEnabled: false,
    };
    const materialSettings = {
        color: '#514fdf',
        side: THREE.DoubleSide,
        transparent: false,
        wireframe: false,
    }

    const shape = createBoxShape(width, height, segments);
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial(materialSettings);
    cutShape(geometry);

    mesh = new THREE.Mesh(geometry, material);
    const outline = getOutline(geometry);

    mesh.add(outline);
    scene.add(mesh);
}

function createBoxShape(width, height, segments) {
    const shape = new THREE.Shape();
    //if (segments % 2 !== 0) segments += 1;
    shape.moveTo(0, 0);
    for (let i = 1; i <= segments; i++) {
        shape.lineTo((i / segments) * width, 0);
    }
    for (let i = 1; i <= segments; i++) {
        shape.lineTo(width, (i / segments) * height);
    }
    for (let i = segments - 1; i >= 0; i--) {
        shape.lineTo((i / segments) * width, height);
    }
    for (let i = segments - 1; i >= 0; i--) {
        shape.lineTo(0, (i / segments) * height);
    }
    return shape;
}

function cutShape(geometry) {
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        let x = vertex.x;
        let y = vertex.y;
        let z = vertex.z;
        if (x < width/2) {
            if (y < height1) {
                positionAttribute.setX(i, width1 - y*(width1/height1));
            }
            if (y > height1) {
                positionAttribute.setX(i, ((y - height1) * width1)/(height - height1));
            }
        }
        if (x > width / 2) {
            if (y < height2) {
                positionAttribute.setX(i, width - width2 + (y * width2)/height2);
            }
            if (y > height2) {
                positionAttribute.setX(i,  width - (width2*(y - height2)/(height-height2)));
            }
        }
        if(z > thickness/2) positionAttribute.setZ(i,thickness-y/Math.tan(cutAngle1 * Math.PI/180))
        if(z < thickness/2) positionAttribute.setZ(i, y/Math.tan(Math.abs(180 - cutAngle2) * Math.PI/180))
    }
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
}


export function deleteCutExtrudeShapeE3() {
    if (scene.children.includes(mesh)) scene.remove(mesh);
}

function checkRulesAngleExE3(newWidth, newHeight, newThickness, newH1, newH2, newW1, newW2) {
    let minLength = newW1 + newW2;
    minLength = Math.floor(minLength);
    if (newWidth < minLength) {
        alert("Length cannot be less than " + minLength);
        return false;
    }
    if (newH1 > newHeight || newH2 > newHeight) {
        alert("H1 and H2 cannot be greater than " + newHeight);
        return false;
    }
    return true;
}
//#endregion

function createAxesHelper() {
    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.position.set(-1, 0, -(thickness / 2 + 1))
    axesHelper.setColors('red', 'blue', 'green');
    scene.add(axesHelper)
}

function getOutline(geometry) {
    const edge = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineBasicMaterial({ color: 'black' })
    const outline = new THREE.LineSegments(edge, line);
    return outline;
}

const widthInput = document.querySelector('.widthInputE3');
const heightInput = document.querySelector('.heightInputE3');
const thicknessInput = document.querySelector('.thicknessInputE3');
const h1Input = document.querySelector('.H1');
const h2Input = document.querySelector('.H2');
const w1Input = document.querySelector('.W1');
const w2Input = document.querySelector('.W2');
const c1Input = document.querySelector('.cutInput1E3');
const c2Input = document.querySelector('.cutInput2E3');

const updateBtnE3 = document.getElementById('updateBtnE3');

updateBtnE3.addEventListener('click', () => {
    const width = Number(widthInput.value);
    const height = Number(heightInput.value);
    const thickness = Number(thicknessInput.value);
    const h1 = Number(h1Input.value);
    const h2 = Number(h2Input.value);
    const w1 = Number(w1Input.value);
    const w2 = Number(w2Input.value);
    const c1 = Number(c1Input.value);
    const c2 = Number(c2Input.value);

    if (width === 0 || height === 0 || thickness === 0 || h1 === 0 || h2 === 0 || w1 === 0 || w2 === 0) {
        alert("Please enter all numbers!");
        return;
    }

    createCutExtrudeShapeE3(width, height, thickness, h1, h2, w1, w2, c1, c2);
});
