import { createHandle, disposeHandle } from "./Hardware.js";
import { createLine, disposeLine } from "./Section.js";
import { createWindow, disposeWindow } from "./Visualization";
import * as THREE from 'three';

const sectioning = document.getElementById('Test1');
const visualization = document.getElementById('Test2');
const hardware =  document.getElementById('Test3');


const panels = {
    sectioning,
    visualization,
    hardware,
}

export function hideAllPanels() {
    Object.values(panels).forEach(panel => panel.hidden = true);
}

export function resetScene() {
    disposeWindow();
    disposeHandle();
    disposeLine();
}

export const actions = {

    T1 : () => {
        panels.sectioning.hidden = false;
        //createWindow(60, 60, 0,0,0,0,0,0);
        createLine();
    }, 
    T2 : () => {
        panels.visualization.hidden = false;
        panels.hardware.hidden = false;
        createWindow(60, 60, 0,0,0,0,0,0);
    },
    T3 : () => {
        panels.hardware.hidden = false;
        createHandle(0, 30, 150, 10, 'left', 'inside', 'normal', 1, new THREE.Vector3(0,0,0));
    }
};

Object.keys(actions).forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        resetScene();
        hideAllPanels();
        actions[id]();
    });
});