import * as THREE from 'three'
import { scene } from '../Core/Scene';
import { SUBTRACTION, Brush, Evaluator, INTERSECTION } from 'three-bvh-csg';


let height;
let width;
let thickness = 5;
let cutAngle1;
let cutAngle2;
let radius = 5;
let result = null;

function createAxesHelper() {
    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.position.set(-1, 0, -(thickness / 2 + 1))
    axesHelper.setColors('red', 'blue', 'green');
    scene.add(axesHelper)
}


//#region Cut Extruded
export function createCutExtrudeShape(newWidth, newHeight, newThickness, newCutAngle1, newCutAngle2) {
    if (!checkRulesAngleEx(newWidth, newHeight, newThickness, newCutAngle1, newCutAngle2)) return;
    deleteCutExtrudeShape();

    height = newHeight;
    width = newWidth;
    thickness = newThickness;
    cutAngle1 = newCutAngle1;
    cutAngle2 = newCutAngle2;

    //const shape = createCircleShape()
    const shape = createBoxShape();

    let geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    let material = new THREE.MeshStandardMaterial({ color: '#514fdf', side: THREE.DoubleSide, wireframe: false })

     // createTrapezoidGeometry(geometry);
      createCylinderGeometry(geometry);

    result = new THREE.Mesh(geometry, material);
    const outline = getOutline(result.geometry);
    result.material = material;
    result.add(outline);
    scene.add(result);

}

function createBoxShape(){
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);
    return shape;
}

function createTrapezoidGeometry(geometry){
    
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    let width1 = height/Math.tan(cutAngle1 * Math.PI/180);
    let width2 = height/Math.tan((180-cutAngle2) * Math.PI/180);
    for( let i = 0; i<positionAttribute.count; i++){
        vertex.fromBufferAttribute(positionAttribute, i);
        if(vertex.y === height) {
            if(vertex.z < thickness/2) positionAttribute.setZ(i,width1);
            if(vertex.z > thickness/2) positionAttribute.setZ(i,thickness-width2);
        }
    }
    positionAttribute.needsUpdate = true;
}

function createCircleShape(){
const shape = new THREE.Shape();
shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
return shape;
}

function createCylinderGeometry(geometry){
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    for( let i = 0; i<positionAttribute.count; i++){
        vertex.fromBufferAttribute(positionAttribute, i);
        if(vertex.z > thickness/2) positionAttribute.setZ(i,thickness-vertex.y/Math.tan(cutAngle1 * Math.PI/180))
        if(vertex.z < thickness/2) positionAttribute.setZ(i, vertex.y/Math.tan(Math.abs(180 - cutAngle2) * Math.PI/180))
    }
    positionAttribute.needsUpdate = true;
}


function getOutline(geometry) {
    const edge = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineBasicMaterial({ color: 'black' })
    const outline = new THREE.LineSegments(edge, line);
    return outline;
}
export function deleteCutExtrudeShape() {
    if (scene.children.includes(result)) scene.remove(result);
}

function checkRulesAngleEx(newWidth, newHeight, newThickness, newCutAngle1, newCutAngle2) {
    let minLength = newHeight / Math.tan(newCutAngle1 * Math.PI / 180) + newHeight / Math.tan((180 - newCutAngle2) * Math.PI / 180);
    minLength = Math.floor(minLength);
    if (newThickness < minLength) {
        alert("Length cannot be less than " + minLength);
        return false;
    }
    let minAngle = Math.atan(newHeight / (newWidth / 2))
    if (minAngle * 2 > (newCutAngle1 + newCutAngle2)) {
        alert("Sum of angles must be <= " + minLength * 2);
        return false;
    }  
    if(newCutAngle2 < 90){
        alert("Cut angle 2 must be greater than 90");
        return false;
    }

    

    return true;
}
//#endregion


const widthInput = document.querySelector('.widthInput');
const heightInput = document.querySelector('.heightInput');
const thicknessInput = document.querySelector('.thicknessInput');
const cut1Input = document.querySelector('.cutInput1');
const cut2Input = document.querySelector('.cutInput2');

const updateBtnE2 = document.getElementById('updateBtnE2');

updateBtnE2.addEventListener('click', () => {
    const width = Number(widthInput.value);
    const height = Number(heightInput.value);
    const thickness = Number(thicknessInput.value);
    const cut1 = Number(cut1Input.value)
    const cut2 = Number(cut2Input.value)

    if (width === 0 || height === 0 || thickness === 0 || cut1 === 0 || cut2 === 0) {
        alert("Please enter all numbers!");
        return;
    }

    createCutExtrudeShape(width, height, thickness, cut1, cut2);
});
