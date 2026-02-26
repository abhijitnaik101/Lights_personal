import { createAxesHelper, createExtrudeShape, deleteExtrudeShape, removeAxesHelper } from "./Extruded1";
import { createCutExtrudeShape, deleteCutExtrudeShape } from "./Extruded2";
import { createCutExtrudeShapeE3, deleteCutExtrudeShapeE3 } from "./Extruded3";

const dimensions = document.getElementById('dimensions');
const dimensionsCut = document.getElementById('dimensionsCut');
const dimensionsCutE3 = document.getElementById('dimensionsCutE3');

document.getElementById('E1').addEventListener('click', () => {
    removeAxesHelper();
    createAxesHelper();
    dimensions.hidden = false;
    dimensionsCut.hidden = true;
    dimensionsCutE3.hidden = true;
    deleteCutExtrudeShape();
    deleteCutExtrudeShapeE3();
    createExtrudeShape(10, 5, 1, 0.5)
});

document.getElementById('E2').addEventListener('click', () => {
    removeAxesHelper();
    createAxesHelper();
    dimensions.hidden = true;
    dimensionsCut.hidden = false;
    dimensionsCutE3.hidden = true;
    deleteExtrudeShape();
    deleteCutExtrudeShapeE3();
    createCutExtrudeShape(5,5,15,45,135)
});

document.getElementById('E3').addEventListener('click', () => {
    removeAxesHelper();
    createAxesHelper();
    dimensions.hidden = true;
    dimensionsCut.hidden = true;
    dimensionsCutE3.hidden = false;
    deleteExtrudeShape();
    deleteCutExtrudeShape();
    createCutExtrudeShapeE3(8,4,20,2,2,2,2, 45, 135)
});

