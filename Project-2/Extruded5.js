import * as THREE from 'three'
import { scene } from '../Core/Scene';
import { clearcoat, clearcoatRoughness, emissive, metalness, shininess } from 'three/tsl';
import { camera } from '../Core/Camera';
import { renderer } from '../Core/Renderer';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

let offset = 0;
let height = 10;
let width1 = 8;
let width2 = 6;
let radius = 1;
let originX = 0;
let originY = 0;
let mesh = null;



export function createExtrudeE5(newWidth1, newWidth2, newHeight, newDiameter) {

    //updateCamera();
    // if (!checkConstraintE5(newWidth, newHeight, newThickness, newDiameter, newW1)) return;
    deleteShapeE5();
    createLight();

    height = newHeight;
    width1 = newWidth1;
    width2 = newWidth2;
    radius = newDiameter / 2;

    const materialSettings = {
        color: '#0051ff',
        side: THREE.DoubleSide,
        emissive: '#000000',
        specular: '#ffffff',
        shininess: 50,
        transparent: false,
        wireframe: false,
    }

    originX = (width1 > width2) ? (width1 + offset) : (width2 + offset);
    originY = 0;

    // const path = createPath();
    // const geometry = new THREE.TubeGeometry(path, 100, radius, 8, false);
    // const material = new THREE.MeshPhongMaterial(materialSettings);
    // mesh = new THREE.Mesh(geometry, material);
    // const outline = getOutline(geometry);
    // mesh.add(outline);
    // scene.add(mesh);
    createTube();
    createLines();
}

export function deleteShapeE5() {
    if (scene.children.includes(mesh)) scene.remove(mesh);
}

function createPath() {

    const points = [
        new THREE.Vector3(originX - width2, originY, 0),
        new THREE.Vector3(originX - radius, originY, 0),
        new THREE.Vector3(originX, originY + radius, 0),
        new THREE.Vector3(originX, originY + height - radius, 0),
        new THREE.Vector3(originX - radius, originY + height, 0),
        new THREE.Vector3(originX - width1, originY + height, 0),
    ]

    const curves = [
        new THREE.LineCurve3(points[0], points[1]),
        new THREE.CubicBezierCurve3(points[1], new THREE.Vector3(originX - radius * 0.5, originY, 0), new THREE.Vector3(originX, originY + radius * 0.5, 0), points[2]),
        new THREE.LineCurve3(points[2], points[3]),
        new THREE.CubicBezierCurve3(points[3], new THREE.Vector3(originX, originY + height - radius * 0.5, 0), new THREE.Vector3(originX - radius * 0.5, originY + height, 0), points[4]),
        new THREE.LineCurve3(points[4], points[5]),
    ]
    const path = new THREE.CurvePath();
    path.curves = curves;

    return path;
}

function createTube() {
    const points = [
        new THREE.Vector3(originX - width2, originY, 0),
        new THREE.Vector3(originX - radius, originY, 0),
        new THREE.Vector3(originX, originY + radius, 0),
        new THREE.Vector3(originX, originY + height - radius, 0),
        new THREE.Vector3(originX - radius, originY + height, 0),
        new THREE.Vector3(originX - width1, originY + height, 0),
    ]
    const curve = new THREE.CatmullRomCurve3(points);
    const shape = new THREE.Shape();
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false); 

    const extrudeSettings = {
        steps: 50,           
        bevelEnabled: false,
        extrudePath: curve
    };

    const materialSettings = {
        color: '#0051ff',
        side: THREE.DoubleSide,
        emissive: '#000000',
        specular: '#ffffff',
        shininess: 50,
        transparent: false,
        wireframe: false,
    }

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhongMaterial(materialSettings);
    mesh = new THREE.Mesh(geometry, material);
    const outline = getOutline(geometry);
    mesh.add(outline);
    scene.add(mesh);

}

let w_line = null;
let h_line = null;
let w1_line = null;
let d_line = null;
function createLines() {
    deleteLines();

    const points = [
        new THREE.Vector3(originX - width2, originY, 0),
        new THREE.Vector3(originX - radius, originY, 0),
        new THREE.Vector3(originX, originY + radius, 0),
        new THREE.Vector3(originX, originY + height - radius, 0),
        new THREE.Vector3(originX - radius, originY + height, 0),
        new THREE.Vector3(originX - width1, originY + height, 0),
    ]

    const textSize = 1;
    const materialSettings = { color: 'black' };

    const w_points = [points[0], points[1].setX(originX)];
    const w_geometry = new THREE.BufferGeometry().setFromPoints(w_points);

    const h_points = [new THREE.Vector3(-1, -(height - width1 * 2), thickness), new THREE.Vector3(-1, width1 * 2, thickness)];
    const h_geometry = new THREE.BufferGeometry().setFromPoints(h_points);

    const w1_points = [new THREE.Vector3(width - width1, -(height - width1 * 2 + 0.5), thickness), new THREE.Vector3(width, -(height - width1 * 2 + 0.5), thickness)];
    const w1_geometry = new THREE.BufferGeometry().setFromPoints(w1_points);

    const d_points = [new THREE.Vector3(width1 - diameter / 2 + 0.5, width1, thickness), new THREE.Vector3(width1 + diameter / 2 - 0.5, width1, thickness)];
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

        // const heigthText = new TextGeometry(height.toString(), {
        //     font: font,
        //     size: textSize,
        //     depth: 0.01,
        //     curveSegments: 12,
        // });

        // const w1Text = new TextGeometry(width1.toString(), {
        //     font: font,
        //     size: textSize,
        //     depth: 0.01,
        //     curveSegments: 12,
        // });

        // const dText = new TextGeometry(diameter.toString(), {
        //     font: font,
        //     size: textSize,
        //     depth: 0.01,
        //     curveSegments: 12,
        // });

        const w_text = new THREE.Mesh(widthText, new THREE.MeshBasicMaterial(materialSettings));
        w_text.position.set(width / 2, -(height - width1 * 2) - (textSize + 3), thickness);
        w_line.add(w_text)

        // const h_text = new THREE.Mesh(heigthText, new THREE.MeshBasicMaterial(materialSettings));
        // h_text.position.set(-2 - textSize, (4 * width1 - height) / 2, thickness);
        // h_line.add(h_text)

        // const w1_text = new THREE.Mesh(w1Text, new THREE.MeshBasicMaterial(materialSettings));
        // w1_text.position.set(width - width1 / 2, -(height - width1 * 2) - 1 - textSize, thickness);
        // w1_line.add(w1_text)

        // const d_text = new THREE.Mesh(dText, new THREE.MeshBasicMaterial(materialSettings));
        // d_text.position.set(width1 - textSize / 2, width1, thickness);
        // d_line.add(d_text)

        scene.add(w_line);
        // scene.add(h_line);
        // scene.add(w1_line);
        // scene.add(d_line);
    });


}

export function deleteLines() {
    if (scene.children.includes(w_line)) scene.remove(w_line);
    if (scene.children.includes(h_line)) scene.remove(h_line);
    if (scene.children.includes(w1_line)) scene.remove(w1_line);
    if (scene.children.includes(d_line)) scene.remove(d_line);
}


function checkConstraintE5(newWidth, newHeight, newThickness, newDiameter, newW1) {
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
    const line = new THREE.LineBasicMaterial({ color: '#0071f1' })
    const outline = new THREE.LineSegments(edge, line);
    return outline;
}

function updateCamera() {
    camera.position.x = width1;
    camera.position.y = width1;
    camera.lookAt(width1, width1, 0);
    camera.rotation.set(0, 0, 0);
}

export function createLight() {
    const dirLight = new THREE.DirectionalLight('white', 1);
    dirLight.position.set(5, 5, 5);
    dirLight.lookAt(0, 0, 0);
    scene.add(dirLight);

}


const width1Input = document.getElementById('width1InputE5');
const width2Input = document.getElementById('width2InputE5');
const heightInput = document.getElementById('heightInputE5');
const diameterInput = document.getElementById('diameterInputE5');
const updateBtnE5 = document.getElementById('updateBtnE5');

updateBtnE5.addEventListener('click', () => {
    const width1 = Number(width1Input.value);
    const width2 = Number(width2Input.value);
    const height = Number(heightInput.value);
    const diameter = Number(diameterInput.value);
    if (width1 === 0 || width2 === 0 || height === 0 || diameter === 0) {
        alert("Please enter all numbers!");
        return;
    }

    createExtrudeE5(width1, width2, height, diameter);
});
