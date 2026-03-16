import { createAxesHelper, removeAxesHelper } from "../Project-2/Extruded1";
import { createC1Extrude, deleteC1Shape } from "./Cutting1";
import { createC2Extrude, deleteC2Shape } from "./Cutting2";


const cuttingC1 = document.getElementById('CuttingC1')
const cuttingC2 = document.getElementById('CuttingC2')
const test2 = document.getElementById('Test2')

const panels = {
    cuttingC1,
    cuttingC2,
}

function hideAllPanels() {
    Object.values(panels).forEach(panel => panel.hidden = true);
}

function resetScene() {
    removeAxesHelper();
    deleteC1Shape();
    deleteC2Shape();
}

const actions = {
    C1: () => {
        createAxesHelper();
        panels.cuttingC1.hidden = false;
        createC1Extrude();
    },

    
    C2: () => {
        createAxesHelper();
        panels.cuttingC2.hidden = false;
        createC2Extrude(2, 15, 30, 5, 1.5, 1, 1);
    },

};

Object.keys(actions).forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        resetScene();
        hideAllPanels();
        actions[id]();
    });
});