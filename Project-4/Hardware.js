import * as THREE from "three";
import { scene } from "../Core/Scene";
import { actions, hideAllPanels, resetScene } from "./Project4Controller";

let cockspur = null;
let cockspurHandle = null;
let cadPosition, cadOrientation;
export function createHandle(ghh = 0, width = 30, height = 150, depth = 10, position, orientation, view, scale = 1, pos) {
    disposeHandle()
    cockspur = new Cockspur(width, height, depth, scale)
    cockspurHandle = cockspur.createCockspur(position);
    cockspur.position(position, orientation);

    cockspur.set(pos);

    cadPosition = position, cadOrientation = position;

    scene.add(cockspurHandle);
    cockspur.view(view);
}
export function disposeHandle() {
    if (scene.children.includes(cockspurHandle)) {
        scene.remove(cockspurHandle);
    }
}

export function getCAD(scale = 0.5) {
    if (!cockspurHandle) return;
    // const cockspur = new Cockspur(30, 150, 5, 0.2);
    // cockspur.createCockspur("right");
    // const line = cockspur.createSection(scale);
    const line = cockspur.createSection(scale);
    line.scale.x *= -1;
    return line;
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
        this.backset = new CockspurBackset(this.width, this.height, this.depth, this.scale).create(orientation);
        this.backset.position.set(0, 0, 0);
        group.add(this.handle);
        this.backset.position.z = -(this.depth * this.scale);
        group.add(this.backset);
        this.mesh = group;
        return this.mesh;
    }

    createSection(scale) {
        const handle = new CockspurHandle(this.width, this.height, this.depth, this.scale);
        const backset = new CockspurBackset(this.width, this.height, this.depth, this.scale);
        const handleLine = handle.autocad();
        const backsetLine = backset.autocad();
        backsetLine.position.x = -7.8 * this.scale;
        backsetLine.position.y = -14 * this.scale;
        const group = new THREE.Group();
        group.add(handleLine);
        group.add(backsetLine);
        group.scale.set(scale, scale, scale);
        return group;
    }



    view(viewType) {

        if (!this.mesh) return;
        let material;
        switch (viewType) {
            case 'normal':
                material = new THREE.MeshBasicMaterial({
                    color: '#d2d2fa'
                });
                break;
            case 'real':
                material = new THREE.MeshPhysicalMaterial({
                    color: "#dfe1e3",
                    metalness: 1,
                    roughness: 0.35,
                    clearcoat: 0.2,
                    envMapIntensity: 1.5
                });
                break;

            case 'cad': openCADView(); return;
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
        if (!this.mesh) return;
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
        switch (placement) {
            case 'inside': rotationY = 0; break;
            case 'outside': rotationY = Math.PI; break;
        }
        this.mesh.rotation.z = rotation;
        this.mesh.rotation.y = rotationY;


    }

    set(pos) {
        if (!this.mesh) return;
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
        else if (orientation == 'right') lr = -1;

        // SCALE FACTORS
        const scaleX = lr * 1 * this.scale * this.width / 50;
        const scaleY = 1 * this.scale * this.height / 200;
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
            depth: this.depth * scaleZ + 1 * scaleZ,
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
        lowerStemMesh.position.set(0, -30 * scaleY, this.depth * scaleZ);


        pivotMesh.add(outline(pivotGeometry));

        handleGroup.add(beakMesh);
        handleGroup.add(pivotMesh);
        handleGroup.add(stemMesh);
        handleGroup.add(lowerStemMesh);

        return handleGroup;
    }

    autocad() {
        const scaleX = this.scale * this.width / 50;
        const scaleY = this.scale * this.height / 220;
        const scaleZ = this.scale * 1;

        // ---------- BEAK CURVES ----------
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

        // ---------- STEM ----------
        const lowerStem = new THREE.CubicBezierCurve(
            new THREE.Vector2(0 * scaleX, -10 * scaleY),
            new THREE.Vector2(0, -60 * scaleY),
            new THREE.Vector2(15 * scaleX, -60 * scaleY),
            new THREE.Vector2(15 * scaleX, -10 * scaleY)
        );

        // ---------- CIRCLE ----------
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


        // ------------------ PATH 1 (BEAK + STEM) ------------------
        const mainPath = new THREE.CurvePath();

        beakCurves.forEach(c => mainPath.add(c));
        mainPath.add(lowerStem);

        const mainPoints = mainPath.getPoints(200);
        const mainGeometry = new THREE.BufferGeometry().setFromPoints(mainPoints);
        const mainLine = new THREE.Line(
            mainGeometry,
            new THREE.LineBasicMaterial({ color: "#000000" })
        );


        // ------------------ PATH 2 (CIRCLE) ------------------
        const circlePath = new THREE.CurvePath();

        circleCurves.forEach(c => circlePath.add(c));

        const circlePoints = circlePath.getPoints(150);
        const circleGeometry = new THREE.BufferGeometry().setFromPoints(circlePoints);
        const circleLine = new THREE.Line(
            circleGeometry,
            new THREE.LineBasicMaterial({ color: "#000000" })
        );


        // ------------------ GROUP THEM ------------------
        const group = new THREE.Group();
        group.add(mainLine);
        group.add(circleLine);

        return group;

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
        const scaleY = 2 * this.scale * this.height / 200;
        const scaleZ = 2 * this.scale;

        const pathPoints = [
            new THREE.LineCurve(
                new THREE.Vector3(0 * scaleX, 0 * scaleY),
                new THREE.Vector3(5 * scaleX, 0 * scaleY)
            ),
            new THREE.CubicBezierCurve(
                new THREE.Vector3(5 * scaleX, 0),
                new THREE.Vector3(5 * scaleX, 4 * scaleY),
                new THREE.Vector3(10 * scaleX, 6 * scaleY),
                new THREE.Vector3(10 * scaleX, 9 * scaleY)
            ),
            new THREE.CubicBezierCurve(
                new THREE.Vector3(10 * scaleX, 9 * scaleY),
                new THREE.Vector3(10 * scaleX, 14 * scaleY),
                new THREE.Vector3(5 * scaleX, 13 * scaleY),
                new THREE.Vector3(5 * scaleX, 18 * scaleY)
            ),
            new THREE.LineCurve(
                new THREE.Vector3(5 * scaleX, 18 * scaleY),
                new THREE.Vector3(0 * scaleX, 18 * scaleY)
            ),

        ]

        const path = new THREE.CurvePath()
        path.add(pathPoints[0]);
        path.add(pathPoints[1]);
        path.add(pathPoints[2]);
        path.add(pathPoints[3]);


        const hole1 = new THREE.Path().absarc(3 * scaleX, 3 * scaleY, 1 * scaleZ, 0, Math.PI * 2, false);
        const hole2 = new THREE.Path().absarc(3 * scaleX, 15 * scaleY, 1 * scaleZ, 0, Math.PI * 2, false);


        const points = path.getPoints(100);
        const backsetShape = new THREE.Shape(points);
        backsetShape.holes.push(hole1, hole2);

        const geometry = new THREE.ExtrudeGeometry(backsetShape, { depth: this.depth * scaleZ });
        geometry.translate(-5 * scaleX, -9 * scaleY, 0);

        const material = new THREE.MeshBasicMaterial({ color: '#ff1884' });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.add(outline(geometry));
        return mesh;
    }

    autocad() {
        const scaleX = this.scale * 2 * this.width / 50;
        const scaleY = this.scale * 2 * this.height / 200;
        const scaleZ = this.scale * 1;

        const pathPoints = [
            new THREE.LineCurve(
                new THREE.Vector3(0 * scaleX, 0 * scaleY),
                new THREE.Vector3(5 * scaleX, 0 * scaleY)
            ),

            // new THREE.CubicBezierCurve(
            //     new THREE.Vector3(5 * scaleX, 0),
            //     new THREE.Vector3(5 * scaleX, 4 * scaleY),
            //     new THREE.Vector3(10 * scaleX, 6 * scaleY),
            //     new THREE.Vector3(10 * scaleX, 9 * scaleY)
            // ),

            new THREE.CubicBezierCurve(
                new THREE.Vector3(11.9 * scaleX, 9 * scaleY),
                new THREE.Vector3(12 * scaleX, 13 * scaleY),
                new THREE.Vector3(5 * scaleX, 14 * scaleY),
                new THREE.Vector3(5 * scaleX, 18 * scaleY)
            ),

            new THREE.LineCurve(
                new THREE.Vector3(5 * scaleX, 18 * scaleY),
                new THREE.Vector3(0 * scaleX, 18 * scaleY)
            ),

            new THREE.LineCurve(
                new THREE.Vector3(0 * scaleX, 18 * scaleY),
                new THREE.Vector3(0 * scaleX, 11.9 * scaleY)
            ),
            new THREE.LineCurve(
                new THREE.Vector3(0 * scaleX, 6.5 * scaleY),
                new THREE.Vector3(0 * scaleX, 0 * scaleY)
            )
        ];

        // ---------- MATERIAL ----------
        const material = new THREE.LineBasicMaterial({ color: "#000000" });

        // ---------- GROUP ----------
        const group = new THREE.Group();

        // ---------- DISJOINT OUTLINE SEGMENTS ----------
        pathPoints.forEach(curve => {
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);

            group.add(line);
        });

        // ---------- HOLES ----------
        const hole1 = new THREE.Path().absarc(3 * scaleX, 3 * scaleY, 1 * scaleZ, 0, Math.PI * 2, false);
        const hole2 = new THREE.Path().absarc(3 * scaleX, 15 * scaleY, 1 * scaleZ, 0, Math.PI * 2, false);

        const hole1Points = hole1.getPoints(60);
        const hole1Geometry = new THREE.BufferGeometry().setFromPoints(hole1Points);
        const hole1Line = new THREE.Line(hole1Geometry, material);

        const hole2Points = hole2.getPoints(60);
        const hole2Geometry = new THREE.BufferGeometry().setFromPoints(hole2Points);
        const hole2Line = new THREE.Line(hole2Geometry, material);

        group.add(hole1Line);
        group.add(hole2Line);

        return group;

    }
}


function outline(geometry) {
    const edges = new THREE.EdgesGeometry(geometry, 15)
    const material = new THREE.LineBasicMaterial({ color: "#000000" })
    const outline = new THREE.LineSegments(edges, material);
    return outline;
}


function openCADView() {
    resetScene();
    hideAllPanels();
    actions['T1']();
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
