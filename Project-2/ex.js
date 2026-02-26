import * as THREE from 'three'
import { getOutline } from './utils';
import { Vector2, Vector3 } from 'three/webgpu';


const t = 4;
const shape = new THREE.Shape();

shape.moveTo(0, 0);
shape.lineTo(2, 0);
shape.lineTo(2, 2);
shape.lineTo(0, 2);
shape.lineTo(0, 0);

const extrudeSettings = {
  depth: t,         
  steps: 5,          
  curveSegments: 4,  
  bevelEnabled: false
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshStandardMaterial({color: 'red'});
const mesh = new THREE.Mesh(geometry, material);

const outline = getOutline(geometry);
mesh.add(outline);

const pos = geometry.attributes.position;
const vertex = new Vector3();

for (let i = 0; i < pos.count; i++) {
    vertex.fromBufferAttribute(pos, i);
    if (vertex.z > t / 2) {
        if (vertex.y > 1) {
            pos.setX(i, 0.5);
        }
    }
}

pos.needsUpdate = true;

export function getMesh(){
    return mesh;
}


// if (vertex.x > width/2) {
        //     if (vertex.y !== height1) positionAttribute.setX(i, width - width1);
        //     //if(vertex.y === height1) positionAttribute.setX(i, width1);
        // }
        // // console.log(vertex);
        // if (vertex.z < thickness / 2) {
        //     if (vertex.y !== height2) positionAttribute.setZ(i, width2);
        // }
