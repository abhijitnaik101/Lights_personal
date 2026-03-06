import { ambientLight } from "./Core/Lights";
import { scene } from "./Core/Scene";
import { setProject } from "./main";
import { createGeometries } from "./Project-1/Geometries";
import { createRoom } from "./Project-1/Ground";
import { createAxesHelper } from "./Project-2/Extruded1";
import { createExtrude } from "./Project-3/Cutting1";

const tutorial = document.getElementById("tutorial");
const info = document.getElementById("info");

const project1Container = document.getElementById("Project-1-Container");
const project2Container = document.getElementById("Project-2-Container");
const project3Container = document.getElementById("Project-3-Container");
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

    resetScene();

    if (project === 1) {
        createRoom();
        createGeometries();
        setProject(1);

        tutorial.hidden = false;
        info.hidden = false;
    }

    if (project === 2) {
        createAxesHelper();
        tutorial.hidden = true;
        info.hidden = true;
    }

    if (project === 3){
        createAxesHelper();
        tutorial.hidden = true;
        info.hidden = true;
        createExtrude();
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