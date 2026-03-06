import * as THREE from 'three'
import { scene } from '../Core/Scene';


let mesh = null;
let width = 2, height = 2, segments = 1000;
let width1 = 2, width2 = 2, height1 = 2, height2 = 2;
let originX = 0, originY = 0;

class Point {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Line {
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    getSlope() {
        const rise = this.endPoint.y - this.startPoint.y;
        const run = this.endPoint.x - this.startPoint.x;
        this.slope = rise / run;
        return this.slope;
    }

    getIntercept() {
        this.c = this.startPoint.y - (this.slope * this.startPoint.x);
        return this.c;
    }

}

export function createExtrude() {
    const materialSetting = {
        color: '#6769ff',
        wireframe: false,
    }

    const extrudeSettings = {
        bevelEnabled: false,
        depth: 5,
    }


    const lines1 = [
        new Line(new Point(-2, 1), new Point(-1,2)),
        new Line(new Point(-1, 0), new Point(-2, 1))
    ]
    const lines2 = [
        new Line(new Point(3, 0), new Point(4, 1)),
        new Line(new Point(4, 1), new Point(3, 2))
    ]
    const shape = createShape();

    const material = new THREE.MeshBasicMaterial(materialSetting);
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const extrudeData = {
        edge1: lines1,
        edge2: lines2,
    }

    cutShape(geometry, extrudeData);
    mesh = new THREE.Mesh(geometry, material);
    const outline = getOutline(geometry);
    mesh.add(outline);

    scene.add(mesh);
}

function createShape() {
    
    const shape = new THREE.Shape();
    shape.moveTo(originX, originY);
    for (let i = 1; i <= segments; i++) {
        shape.lineTo((i / segments) * width, originY);
    }
    for (let i = 1; i <= segments; i++) {
        shape.lineTo(width, (i / segments) * height);
    }
    for (let i = segments - 1; i >= 0; i--) {
        shape.lineTo((i / segments) * width, height);
    }
    for (let i = segments - 1; i >= 0; i--) {
        shape.lineTo(originX, (i / segments) * height);
    }
    return shape;

}



function cutShape(geometry, extrudeData) {
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        let x = vertex.x;
        let y = vertex.y;
        let z = vertex.z;

        if (x === 0) {
            for (let line of extrudeData.edge1) {
                const m = line.getSlope();
                const c = line.getIntercept();

                const lowerLimit = line.startPoint.y;
                const upperLimit = line.endPoint.y;
                if (y >= lowerLimit && y <= upperLimit) {
                    const newX = (y - c) / m;
                    positionAttribute.setX(i, newX);
                }
            }
        }


        if(x === width){
            for (let line of extrudeData.edge2) {
                const m = line.getSlope();
                const c = line.getIntercept();

                const lowerLimit = line.startPoint.y;
                const upperLimit = line.endPoint.y;
                if (y >= lowerLimit && y <= upperLimit) {
                    const newX = (y - c) / m;
                    positionAttribute.setX(i, newX);
                }
            }
        }

    }
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
}

function getOutline(geometry) {
    const edge = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineBasicMaterial({ color: 'black' })
    const outline = new THREE.LineSegments(edge, line);
    return outline;
}