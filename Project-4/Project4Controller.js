import { disposeHandle } from "./Hardware.js";
import { createWindow, disposeWindow } from "./Visualization";
const sectioning = document.getElementById('Test1');
const visualization = document.getElementById('Test2');
const hardware =  document.getElementById('Test3');


const panels = {
    sectioning,
    visualization,
    hardware,
}

function hideAllPanels() {
    Object.values(panels).forEach(panel => panel.hidden = true);
}

function resetScene() {
    disposeWindow();
    disposeHandle();
}

const actions = {

    T1 : () => {
        panels.sectioning.hidden = false;
        //createWindow(60, 60, 0,0,0,0,0,0);
    }, 
    T2 : () => {
        panels.visualization.hidden = false;
        createWindow(60, 60, 0,0,0,0,0,0);
    },
    T3 : () => {
        panels.hardware.hidden = false;
    }
};

Object.keys(actions).forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        resetScene();
        hideAllPanels();
        actions[id]();
    });
});