import * as THREE from 'three';
import { scene } from '../Core/Scene';

const geometry = new THREE.PlaneGeometry(25, 25);
const wallGeometry = new THREE.PlaneGeometry(25, 15);
const material = new THREE.MeshStandardMaterial({color: '#2b2828', side: THREE.DoubleSide, metalness: 0.9 });
const wallMaterial = new THREE.MeshStandardMaterial({color: '#1f1f1f', side: THREE.DoubleSide, metalness: 0.9 });
const room = new THREE.Object3D();
const plane = new THREE.Mesh(geometry, material);


const wallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
wallLeft.position.x = -12.5;
wallLeft.position.y = 7.5;
wallLeft.rotation.y = Math.PI/2;

const wallRight = new THREE.Mesh(wallGeometry, wallMaterial);
wallRight.position.x = 12.5;
wallRight.position.y = 7.5;
wallRight.rotation.y = Math.PI/2;

const wallBack = new THREE.Mesh(wallGeometry, wallMaterial);
wallBack.position.z = -12.5;
wallBack.position.y = 7.5;

room.add(plane);
room.add(wallLeft);
room.add(wallRight);
room.add(wallBack);

plane.rotation.x = Math.PI/2;
plane.receiveShadow = true;


export function createRoom(){
    scene.add(room);
}