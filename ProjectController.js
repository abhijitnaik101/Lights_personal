import { ambientLight } from "./Core/Lights";
import { scene } from "./Core/Scene";
import { setProject } from "./main";
import { createGeometries } from "./Project-1/Geometries";
import { createRoom } from "./Project-1/Ground";
import { createAxesHelper } from "./Project-2/Extruded1";
import { createC1Extrude } from "./Project-3/Cutting1";
import { createC2Extrude } from "./Project-3/Cutting2";
import { createWindow } from "./Project-4/Visualization";


const tutorial = document.getElementById("tutorial");
const info = document.getElementById("info");

const project1Container = document.getElementById("Project-1-Container");
const project2Container = document.getElementById("Project-2-Container");
const project3Container = document.getElementById("Project-3-Container");
const project4Container = document.getElementById("Project-4-Container");
const dashboard = document.getElementById("dashboard");

tutorial.hidden = true;
info.hidden = true;

function resetScene() {
    scene.clear();
    scene.add(ambientLight);
}

function showProject(project) {
    dashboard.hidden = true;

    project1Container.hidden = project !== 1;
    project2Container.hidden = project !== 2;
    project3Container.hidden = project !== 3;
    project4Container.hidden = project !== 4;

    resetScene();

    if (project === 1) {
        createRoom();
        createGeometries();
        setProject(1);
        ambientLight.intensity = 2

        tutorial.hidden = false;
        info.hidden = false;
    }

    if (project === 2) {
        createAxesHelper();
        ambientLight.intensity = 8
        tutorial.hidden = true;
        info.hidden = true;
    }

    if (project === 3){
        createAxesHelper();
        tutorial.hidden = true;
        info.hidden = true;
        createC2Extrude(2, 15, 30, 5, 1.5, 1, 1);
    }

    if (project === 4){
        //createAxesHelper();
        tutorial.hidden = true;
        info.hidden = true;
        createWindow(60, 60, 0,0,0,0,0,0);
    }
}

document.querySelectorAll(".project1").forEach(btn =>
    btn.addEventListener("click", () => showProject(1))
);

document.querySelectorAll(".project2").forEach(btn =>
    btn.addEventListener("click", () => showProject(2))
);

document.querySelectorAll(".project3").forEach(btn =>
    btn.addEventListener("click", () => showProject(3))
);

document.querySelectorAll(".project4").forEach(btn =>
    btn.addEventListener("click", () => showProject(4))
);