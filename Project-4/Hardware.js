import * as THREE from "three";
import { CubicBezier } from "three/src/extras/core/Interpolations.js";

export function createSpur(length = 150, width = 30, depth = 10) {

    const mesh = new Cockspur(width, length, depth)
    const group = mesh.createCockspur('right');
    mesh.position('right', 'inside');
    mesh.view('real');
    

    return group;
}


class Cockspur {
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.mesh = null;
    }
    createCockspur(orientation) {
        const group = new THREE.Group()
        let handle, backset;
        handle = new CockspurHandle(this.width, this.height, this.depth).create(orientation);
        backset =  new CockspurBackset(this.width, this.height, this.depth).create(orientation);
        backset.position.set(0,0,0);
        group.add(handle);
        group.add(backset);
        this.mesh = group;
        return this.mesh;
    }

    view(viewType) {

        if (!this.mesh) return;
        let material;
        switch (viewType) {
            case 'normal':
                material = new THREE.MeshBasicMaterial({
                    color: 'blue'
                });
                break;
            case 'real':
                material = new THREE.MeshPhysicalMaterial({
                    color: 'red',
                    roughness: 0.4,
                    metalness: 0.2
                });
                break;
            default:
                return;
        }
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                child.material = material;
            }
        });
    }
    position(pos, placement = 'inside') {
        let rotation = 0;
        let rotationY = 0;
        if(!this.mesh) return;
        switch (pos) {
            case 'top': rotation = 3 * Math.PI / 2;
                break;
            case 'bottom': rotation = Math.PI / 2;
                break;
            case 'left': rotation = 0;
                break;
            case 'right': rotation = 0;
                break;
        }
        switch (placement){
            case 'inside' : rotationY = 0; break;
            case 'outside' : rotationY = Math.PI; break;
        }
        this.mesh.rotation.z = rotation;
        this.mesh.rotation.y = rotationY;


    }
}

class CockspurHandle {
    constructor(width, height, depth, material) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        //this.material = material.clone();
    }

    create(orientation) {

        const spurGroup = new THREE.Group();
        let lr = 1;
        if (orientation === 'left') lr = 1;
        else if (orientation == 'right') lr = -1;

        // SCALE FACTORS
        const scaleX = lr * 1 //width / 50;
        const scaleY = 1; // length / 200;

        const mainMaterial = new THREE.MeshStandardMaterial({
            color: "blue",
            roughness: 0.3,
            metalness: 0.2,
            wireframe: false,
            side: THREE.DoubleSide
        });

        // TOP BEAK PROFILE
        const beakCurves = [

            new THREE.CubicBezierCurve(
                new THREE.Vector2(15 * scaleX, -10 * scaleY),
                new THREE.Vector2(15 * scaleX, 15 * scaleY),
                new THREE.Vector2(-5 * scaleX, 15 * scaleY),
                new THREE.Vector2(-10 * scaleX, 5 * scaleY)
            ),

            new THREE.CubicBezierCurve(
                new THREE.Vector2(-10 * scaleX, 5 * scaleY),
                new THREE.Vector2(-25 * scaleX, 0 * scaleY),
                new THREE.Vector2(-25 * scaleX, 0 * scaleY),
                new THREE.Vector2(0 * scaleX, -10 * scaleY)
            )

        ];

        const beakPath = new THREE.CurvePath();
        beakPath.add(beakCurves[0]);
        beakPath.add(beakCurves[1]);

        const beakOutlinePoints = beakPath.getPoints(100);
        const beakShape = new THREE.Shape(beakOutlinePoints);

        const beakGeometry = new THREE.ExtrudeGeometry(beakShape, {
            depth: this.depth,
            bevelEnabled: true
        });

        const beakMesh = new THREE.Mesh(beakGeometry, mainMaterial);

        // PIVOT CYLINDER (BEZIER APPROXIMATED CIRCLE)
        const pivotRadius = 5;
        const circleCurves = [
            new THREE.CubicBezierCurve(
                new THREE.Vector2(0, pivotRadius * scaleY),
                new THREE.Vector2(pivotRadius * 1.5 * scaleX, pivotRadius * scaleY),
                new THREE.Vector2(pivotRadius * 1.5 * scaleX, -pivotRadius * scaleY),
                new THREE.Vector2(0, -pivotRadius * scaleY)
            ),

            new THREE.CubicBezierCurve(
                new THREE.Vector2(0, -pivotRadius * scaleY),
                new THREE.Vector2(-pivotRadius * 1.5 * scaleX, -pivotRadius * scaleY),
                new THREE.Vector2(-pivotRadius * 1.5 * scaleX, pivotRadius * scaleY),
                new THREE.Vector2(0, pivotRadius * scaleY)
            )

        ];

        const circlePath = new THREE.CurvePath();
        circlePath.add(circleCurves[0]);
        circlePath.add(circleCurves[1]);

        const circlePoints = circlePath.getPoints(100);
        const circleShape = new THREE.Shape(circlePoints);

        const pivotGeometry = new THREE.ExtrudeGeometry(circleShape, {
            depth: 11,
            bevelEnabled: false
        });

        const pivotMaterial = new THREE.MeshBasicMaterial({
            color: "rgb(252, 23, 126)"
        });

        const pivotMesh = new THREE.Mesh(pivotGeometry, pivotMaterial);

        pivotMesh.position.z = 0;



        // HANDLE STEM (SWEEP EXTRUSION)

        const stemPath = new THREE.CurvePath();

        stemPath.add(
            new THREE.CubicBezierCurve3(
                new THREE.Vector3(0 * scaleX, -10 * scaleY, 0),
                new THREE.Vector3(0 * scaleX, -15 * scaleY, 0),
                new THREE.Vector3(0 * scaleX, -10 * scaleY, this.depth),
                new THREE.Vector3(0 * scaleX, -25 * scaleY, this.depth)
            )
        );

        const stemProfile = new THREE.Shape();

        stemProfile.moveTo(0, 0);
        stemProfile.lineTo(15 * scaleX, 0);
        stemProfile.lineTo(15 * scaleX, this.depth);
        stemProfile.lineTo(0, this.depth);
        stemProfile.lineTo(0, 0);

        const stemGeometry = new THREE.ExtrudeGeometry(stemProfile, {
            steps: 50,
            extrudePath: stemPath,
            bevelEnabled: true
        });

        const stemMesh = new THREE.Mesh(stemGeometry, mainMaterial);

        stemMesh.position.set(15 * scaleX, 0, this.depth);

        // LOWER STEM BLOCK
       
        const lowerPath = new THREE.CurvePath();
        const lowerPoints = [
            new THREE.CubicBezierCurve(
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0, -60 * scaleY),
                new THREE.Vector2(15 * scaleX, -60 * scaleY),
                new THREE.Vector2(15 * scaleX, 0)
            )
        ]
        lowerPath.add(lowerPoints[0]);

        const lowerStemShape = new THREE.Shape(lowerPath.getPoints(100));
        // lowerStemShape.moveTo(0, 0);
        // lowerStemShape.lineTo(15 * scaleX, 0);
        // lowerStemShape.lineTo(15 * scaleX, -50 * scaleY);
        // lowerStemShape.absarc((15 / 2) * scaleX, -50 * scaleY, (15 / 2), (scaleX > 0) ? 0 : Math.PI, (scaleX > 0) ? Math.PI : 0, (scaleX > 0) ? true : false);
        // lowerStemShape.lineTo(0, 0);
        const lowerStemGeometry = new THREE.ExtrudeGeometry(lowerStemShape, {
            depth: this.depth,
            bevelEnabled: true
        });

        const lowerStemMesh = new THREE.Mesh(lowerStemGeometry, mainMaterial);
        lowerStemMesh.position.set(0, -25, this.depth);

        spurGroup.add(beakMesh);
        spurGroup.add(pivotMesh);
        spurGroup.add(stemMesh);
        spurGroup.add(lowerStemMesh);

        return spurGroup;
    }
}

class CockspurBackset {
    constructor(width, height, material) {
        this.width = width;
        this.height = height;
        //this.material = material.clone()
    }
    create(orientation) {
        let lr = 1;
        if (orientation === 'left') lr = 1;
        else if (orientation == 'right') lr = -1;

        const scaleX = lr * 2;
        const scaleY = 2;

        const pathPoints = [
            new THREE.LineCurve(
                new THREE.Vector3(0 * scaleX,0* scaleY),
                new THREE.Vector3(5 * scaleX, 0* scaleY)
            ),
            new THREE.CubicBezierCurve(
                new THREE.Vector3(5* scaleX, 0),
                new THREE.Vector3(5* scaleX, 4* scaleY),
                new THREE.Vector3(10* scaleX, 6* scaleY),
                new THREE.Vector3(10* scaleX, 9* scaleY)
            ),
            new THREE.CubicBezierCurve(
                new THREE.Vector3(10* scaleX, 9* scaleY),
                new THREE.Vector3(10* scaleX, 14* scaleY),
                new THREE.Vector3(5* scaleX, 13* scaleY),
                new THREE.Vector3(5* scaleX, 18* scaleY)
            ),
            new THREE.LineCurve(
                new THREE.Vector3(5* scaleX, 18* scaleY),
                new THREE.Vector3(0* scaleX, 18* scaleY)
            ),
        ]

        const path = new THREE.CurvePath()
        path.add(pathPoints[0]);
        path.add(pathPoints[1]);
        path.add(pathPoints[2]);
        path.add(pathPoints[3]);

        const hole1 = new THREE.Path().absarc(3 * scaleX,3 * scaleY,1, 0, Math.PI*2, false);
        const hole2 = new THREE.Path().absarc(3 * scaleX,15 * scaleY,1, 0, Math.PI*2, false);


        const points = path.getPoints(100);
        const backsetShape = new THREE.Shape(points);
        backsetShape.holes.push(hole1, hole2);

        const geometry = new THREE.ExtrudeGeometry(backsetShape, { depth : 2});
        geometry.translate(-5 * scaleX, -9 * scaleY, 0);

        const material = new THREE.MeshBasicMaterial({color : 'red'});

        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }
}

// TEST3 FRONTEND

const ghhInput = document.getElementById("ghh");
const T3Width = document.getElementById("T3Width");
const T3Height = document.getElementById("T3Height");

const positionSelect = document.getElementById("T3Position");
const orientationSelect = document.getElementById("T3Orientation");

const updateBtnT3 = document.getElementById("updateBtnT3");

updateBtnT3.addEventListener("click", () => {

    const scale = 10;

    const ghh = Number(ghhInput.value) / scale;
    const width = Number(T3Width.value) / scale;
    const height = Number(T3Height.value) / scale;

    const position = positionSelect.value;
    const orientation = orientationSelect.value;

    if (
        ghh === 0 &&
        width === 0 &&
        height === 0
    ) {
        alert("Please enter valid numbers!");
        return;
    }

    createHandle({
        ghh,
        width,
        height,
        position,
        orientation
    });

});