import { createAxesHelper, removeAxesHelper } from "../Project-2/Extruded1";
import { createC1Extrude, deleteC1Shape } from "./Cutting1";
import { createC2Extrude, deleteC2Shape } from "./Cutting2";
import { createWindow, disposeWindow } from "./Test_2";

const visualization = document.getElementById('Test2')

const panels = {
    visualization,
}

function hideAllPanels() {
    Object.values(panels).forEach(panel => panel.hidden = true);
}

function resetScene() {
    removeAxesHelper();
    disposeWindow();
}

const actions = {
    T2 : () => {
        panels.visualization.hidden = false;
        createWindow(60, 60, 0,0,0,0,0,0);

        
    }
};

Object.keys(actions).forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        resetScene();
        hideAllPanels();
        actions[id]();
    });
});