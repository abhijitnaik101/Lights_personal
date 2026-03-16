import * as THREE from "three";
import { scene } from "../Core/Scene";


let cockspurHandle = null;
let positions = {}
export function createHandle(ghh = 0, width = 30, height = 150, depth = 10, position, orientation, scale = 1, pos) {
    disposeHandle()
    const cockspur = new Cockspur(width, height, depth, scale)
    cockspurHandle = cockspur.createCockspur(position);
    cockspur.position(position, orientation);
    cockspur.view('real');
    cockspur.set(pos);
    scene.add(cockspurHandle);
}
export function disposeHandle(){
    console.log(cockspurHandle);
    if(scene.children.includes(cockspurHandle)) {
        // console.log("in dispose");
        scene.remove(cockspurHandle);
    }
}

export function getCAD(){
    const cockspur = new Cockspur(30, 150, 10, 1);
    const line = cockspur.createSection();
    scene.add(line);
    
}

class Cockspur {
    constructor(width, height, depth, scale) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.scale = scale;
        this.mesh = null;
    }
    createCockspur(orientation) {
        const group = new THREE.Group()
        
        //let handle, backset;
        this.handle = new CockspurHandle(this.width, this.height, this.depth, this.scale).create(orientation);
        this.backset =  new CockspurBackset(this.width, this.height, this.depth, this.scale).create(orientation);
        this.backset.position.set(0,0,0);
        group.add(this.handle);
        this.backset.position.z = -(this.depth * this.scale);
        group.add(this.backset);
        this.mesh = group;
        return this.mesh;
    }
    
    createSection(){
        const handleLine = this.handle.autocad();
        return handleLine;
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
        // this.mesh.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material = material;
        //     }
        // });
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

    set(pos){
        if(!this.mesh) return;
        this.mesh.position.copy(pos);
    }
}

class CockspurHandle {
    constructor(width, height, depth, scale, material) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.scale = scale;
        //this.material = material.clone();
    }

    create(orientation) {

        const handleGroup = new THREE.Group();
        let lr = 1;
        if (orientation === 'left') lr = 1;
        else if (orientation == 'right') lr = -1 ;

        // SCALE FACTORS
        const scaleX = lr * 1 * this.scale * this.width / 50;
        const scaleY = 1 * this.scale * this.height  / 200;
        const scaleZ = 1 * this.scale;

        const mainMaterial = new THREE.MeshStandardMaterial({
            color: "#2d65ff",
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
            depth: this.depth * scaleZ,
            bevelEnabled: false
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
            depth: this.depth * scaleZ + 1 *scaleZ,
            bevelEnabled: false
        });

        const pivotMaterial = new THREE.MeshBasicMaterial({
            color: "#0044ff"
        });

        const pivotMesh = new THREE.Mesh(pivotGeometry, pivotMaterial);
        pivotMesh.position.z = 0;

        // HANDLE STEM (SWEEP EXTRUSION)
        const stemPath = new THREE.CurvePath();
        stemPath.add(
            new THREE.CubicBezierCurve3(
                new THREE.Vector3(0 * scaleX, -10 * scaleY, 0),
                new THREE.Vector3(0 * scaleX, -15 * scaleY, 0),
                new THREE.Vector3(0 * scaleX, -10 * scaleY, this.depth * scaleZ),
                new THREE.Vector3(0 * scaleX, -35 * scaleY, this.depth * scaleZ)
            )
        );

        const stemProfile = new THREE.Shape();

        stemProfile.moveTo(0, 0);
        stemProfile.lineTo(15 * scaleX, 0);
        stemProfile.lineTo(15 * scaleX, this.depth * scaleZ);
        stemProfile.lineTo(0, this.depth * scaleZ);
        stemProfile.lineTo(0, 0);

        const stemGeometry = new THREE.ExtrudeGeometry(stemProfile, {
            steps: 50,
            extrudePath: stemPath,
            bevelEnabled: true
        });
        const stemMesh = new THREE.Mesh(stemGeometry, mainMaterial);
        stemMesh.position.set(15 * scaleX, 0, this.depth * scaleZ);

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
        const lowerStemGeometry = new THREE.ExtrudeGeometry(lowerStemShape, {
            depth: this.depth * scaleZ,
            bevelEnabled: false
        });

        const lowerStemMesh = new THREE.Mesh(lowerStemGeometry, mainMaterial);
        lowerStemMesh.position.set(0, -30*scaleY, this.depth * scaleZ);


        pivotMesh.add(outline(pivotGeometry));

        handleGroup.add(beakMesh);
        handleGroup.add(pivotMesh);
        handleGroup.add(stemMesh);
        handleGroup.add(lowerStemMesh);

        return handleGroup;
    }

    autocad(){
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

        const geometry = new THREE.BufferGeometry().setFromPoints(beakCurves);
        const material =  new THREE.LineBasicMaterial({ color: '#000000' });
        const line = new THREE.Line(geometry, material);
        return line;
    }
}

class CockspurBackset {
    constructor(width, height, depth, scale, material) {
        this.width = width;
        this.height = height;
        this.depth = 2;
        this.scale = scale;
        //this.material = material.clone()
    }
    create(orientation) {
        let lr = 1;
        if (orientation === 'left') lr = 1;
        else if (orientation == 'right') lr = -1;

        const scaleX = lr * 2.25 * this.scale * this.width / 50;
        const scaleY = 2 * this.scale * this.height  / 200;
        const scaleZ = 2 * this.scale;

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

        const hole1 = new THREE.Path().absarc(3 * scaleX,3 * scaleY,1 * scaleZ, 0, Math.PI*2, false);
        const hole2 = new THREE.Path().absarc(3 * scaleX,15 * scaleY,1 * scaleZ, 0, Math.PI*2, false);

        


        const points = path.getPoints(100);
        const backsetShape = new THREE.Shape(points);
        backsetShape.holes.push(hole1, hole2);

        const geometry = new THREE.ExtrudeGeometry(backsetShape, { depth : this.depth * scaleZ});
        geometry.translate(-5 * scaleX, -9 * scaleY, 0);

        const material = new THREE.MeshBasicMaterial({color : '#ff1884'});

        const mesh = new THREE.Mesh(geometry, material);
        mesh.add(outline(geometry));
        return mesh;
    }
}


function outline(geometry) {
        const edges = new THREE.EdgesGeometry(geometry, 15)
        const material = new THREE.LineBasicMaterial({ color: "#000000" })
        const outline = new THREE.LineSegments(edges, material);
        return outline;
    }

// TEST3 FRONTEND
// const ghhInput = document.getElementById("ghh");
// const T3Width = document.getElementById("T3Width");
// const T3Height = document.getElementById("T3Height");

// const positionSelect = document.getElementById("T3Position");
// const orientationSelect = document.getElementById("T3Orientation");

// const updateBtnT3 = document.getElementById("updateBtnT3");

// updateBtnT3.addEventListener("click", () => {
//     const scaleDiv = 10;
//     const ghh = Number(ghhInput.value) / scaleDiv;
//     const width = Number(T3Width.value) / scaleDiv;
//     const height = Number(T3Height.value) / scaleDiv;

//     const position = positionSelect.value;
//     const orientation = orientationSelect.value;

//     if (
//         ghh === 0 &&
//         width === 0 &&
//         height === 0
//     ) {
//         alert("Please enter valid numbers!");
//         return;
//     }
//     let depth = 10, scale = 1, pos = new THREE.Vector3(0,0,0);
//     createHandle(
//         ghh,
//         width,
//         height,
//         depth,
//         position,
//         orientation,
//         scale,
//         pos
//     );

// });