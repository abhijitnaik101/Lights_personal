import { createAxesHelper, createExtrudeShape, deleteExtrudeShape, removeAxesHelper } from "./Extruded1";
import { createCutExtrudeShape, deleteCutExtrudeShape } from "./Extruded2";
import { createCutExtrudeShapeE3, deleteCutExtrudeShapeE3 } from "./Extruded3";
import { createExtrudeE4, deleteShapeE4 , deleteLines, createLight} from "./Extruded4";

const extrudeE1 = document.getElementById('ExtrudeE1');
const extrudeE2 = document.getElementById('ExtrudeE2');
const extrudeE3 = document.getElementById('ExtrudeE3');
const extrudeE4 = document.getElementById('ExtrudeE4');

const panels = {
    extrudeE1,
    extrudeE2,
    extrudeE3,
    extrudeE4
};

function hideAllPanels() {
    Object.values(panels).forEach(panel => panel.hidden = true);
}

function resetScene() {
    removeAxesHelper();
    deleteLines();
    deleteExtrudeShape();
    deleteCutExtrudeShape();
    deleteCutExtrudeShapeE3();
    deleteShapeE4();
}

const actions = {
    E1: () => {
        createAxesHelper();
        panels.extrudeE1.hidden = false;
        createExtrudeShape(10, 5, 1, 0.5);
    },

    E2: () => {
        createAxesHelper();
        panels.extrudeE2.hidden = false;
        createCutExtrudeShape(5,5,15,45,135);
    },

    E3: () => {
        createAxesHelper();
        panels.extrudeE3.hidden = false;
        createCutExtrudeShapeE3(8,4,20,2,2,2,2,45,135);
    },

    E4: () => {
        createLight();
        panels.extrudeE4.hidden = false;
        createExtrudeE4(32,32,4,4,8);
    },

    E5: () => {
        createLight();
        panels.extrudeE4.hidden = false;
        createExtrudeE4(32,32,4,4,8);
    }
};

Object.keys(actions).forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        resetScene();
        hideAllPanels();
        actions[id]();
    });
});