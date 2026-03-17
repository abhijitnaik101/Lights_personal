import * as THREE from 'three'
import { scene } from '../Core/Scene'
import { FontLoader, TextGeometry, ThreeMFLoader } from 'three/examples/jsm/Addons.js'
import { camera } from '../Core/Camera';
import { getCAD } from './Hardware';


let depth = 0

let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()

let editableMeshes = []
let activeCell = null
let currentFont = null

// let frameWidth = 20
// let frameHeight = 20

let sectionGroup = null;
export function createLine(fw = 20, fh = 20) {

    disposeLine();
    sectionGroup = new THREE.Group();
    const frameWidth = fw
    const frameHeight = fh

    camera.position.z = (frameWidth > frameHeight) ? frameWidth : frameHeight;

    const sash = new Frame(2)
    const bead = new Bead(1, 2)

    const windowPolygon = new THREE.Group();
    const outerFrame = createPolygon(frameWidth, frameHeight, sash);
    const innerBead = createPolygon(frameWidth, frameHeight, bead);
    const dashedLine = createDashedLine(frameWidth, frameHeight);

    windowPolygon.add(outerFrame);
    windowPolygon.add(innerBead);
    windowPolygon.add(dashedLine);

    const devCardHeight = 50/5
    const devCardWidth = devCardHeight * 2;
    const bottomBoxHeight = 10;
    const borderHeight = (frameHeight < 20) ? 50 : frameHeight + devCardHeight + bottomBoxHeight + 20;
    let tableHeight = borderHeight;
    let tableWidth = 4 * tableHeight/10;
    
    const borderWidth = (frameWidth < 30) ? 50 + tableWidth : tableWidth + frameWidth + 15;
    const bottomBoxWidth = borderWidth - tableWidth - 2;

    const borderOriginX = -((borderWidth - tableWidth) / 2);
    const borderOriginY = -borderHeight / 2
    const borderLine = createBorder(borderOriginX, borderOriginY, borderWidth, borderHeight);


    const loader = new FontLoader()
    loader.load(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
        (font) => {

            currentFont = font
            tableHeight = borderHeight;
            tableWidth = 4 * tableHeight/10 ;
            const tabelTextSize = (tableWidth > tableHeight) ? tableWidth * 0.012 : tableHeight * 0.012;
            const table = createTable(font, tableWidth, tableHeight, tabelTextSize);
            table.position.set((borderWidth - tableWidth) / 2, borderHeight / 2, 0);
            //scene.add(table)
            sectionGroup.add(table);

            const cardTextSize = devCardHeight * 0.08;
            const developerCard = createDeveloperCard(devCardWidth, devCardHeight, font, cardTextSize)
            developerCard.position.set(borderOriginX + 2, -borderOriginY - devCardHeight - 2, 0)
            //scene.add(developerCard)
            sectionGroup.add(developerCard);

            const widthDim = createDimensions(frameWidth, frameHeight, 2, font);
            windowPolygon.add(widthDim);

            textEditing()
        })


    //const borderWidth = (frameWidth< 35)


    const posX = borderOriginX + 1, posY = borderOriginY + 1
    const bottomBox = createBottomBox(posX, posY, bottomBoxWidth, bottomBoxHeight, 4);

    //scene.add(windowPolygon, borderLine, bottomBox);
    const line = getCAD();
    line.position.x = frameWidth/2 - 2/2;

    sectionGroup.add(line);
    
    sectionGroup.add(windowPolygon, borderLine, bottomBox);
    scene.add(sectionGroup);

}

export function disposeLine(){
    if(scene.children.includes(sectionGroup)) scene.remove(sectionGroup);
}

// BORDER
function createBorder(originX, originY, width, height) {

    const points = [

        new THREE.Vector3(originX, originY, depth),
        new THREE.Vector3(originX + width, originY, depth),
        new THREE.Vector3(originX + width, originY + height, depth),
        new THREE.Vector3(originX, originY + height, depth),
        new THREE.Vector3(originX, originY, depth)

    ]

    const material = new THREE.LineBasicMaterial({ color: '#000000' })
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    const line = new THREE.Line(geometry, material)

    return line;

}


// Boxes
class TextCell {

    constructor(width, height, heading, content, textSize = 0.8, materialSettings = { color: '#000000' }) {

        this.width = width
        this.height = height
        this.heading = heading
        this.content = content
        this.textSize = textSize
        this.materialSettings = materialSettings
        this.contentMesh = null
    }

    create(font) {
        const group = new THREE.Group()
        const material = new THREE.LineBasicMaterial(this.materialSettings);
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(this.width, 0, 0),
            new THREE.Vector3(this.width, this.height, 0),
            new THREE.Vector3(0, this.height, 0),
            new THREE.Vector3(0, 0, 0)
        ]

        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const box = new THREE.Line(geometry, material)
        group.add(box)

        if (this.heading) {
            const headingGeometry = new TextGeometry(this.heading, {
                font: font,
                size: this.textSize,
                depth: 0
            })
            const headingMesh = new THREE.Mesh(headingGeometry, textMaterial)
            headingMesh.position.set(0.2, this.height - this.textSize - 0.2, 0)
            group.add(headingMesh)
        }

        if (this.content) {
            const contentGeometry = new TextGeometry(this.content, {
                font: font,
                size: this.textSize,
                depth: 0
            })

            this.contentMesh = new THREE.Mesh(contentGeometry, textMaterial)
            this.contentMesh.position.set(0.2, this.height - this.textSize * 2 - 0.4, 0)
            this.contentMesh.cell = this
            editableMeshes.push(this.contentMesh)
            group.add(this.contentMesh)
        }

        return group
    }

    updateText(newText) {
        this.content = newText
        this.contentMesh.geometry.dispose()
        this.contentMesh.geometry = new TextGeometry(newText, {
            font: currentFont,
            size: this.textSize,
            depth: 0
        })
    }



}

function createTable(font, tableWidth = 30, tableHeight = 50, textSize = 0.8) {
    const height = tableHeight / 10;
    const width = tableWidth;

    const table = new THREE.Group()
    const cell1 = new TextCell(width, height, "Design Name:", "D1", textSize)
    const cell2 = new TextCell(width / 2, height, "Org name:", "Noctis", textSize)
    const cell3 = new TextCell(width / 2, height, "Project Id:", "P-001", textSize)
    const cell4 = new TextCell(width, height, " ", "Lorem ipsum ....", textSize)
    const cell5 = new TextCell(width, height, "Design Details :", "Fixed Design", textSize)
    const cell6 = new TextCell(width, height * 2, " ", " ")
    const cell7 = new TextCell(width / 2, height, "Date:", "10/03/2026", textSize)
    const cell8 = new TextCell(width / 2, height, "Hardware details:", " NaN", textSize)
    const cell9 = new TextCell(width / 4, height, "Developer :", " Abhijit", textSize)
    const cell10 = new TextCell(width / 2, height, "Design dimensions", "1500 x 1500", textSize)
    const cell11 = new TextCell(width / 4, height * 2, " ", " ", textSize)
    const cell12 = new TextCell(width / 2, height, "Scale factor:", "1 ", textSize)
    const cell13 = new TextCell(width / 4, height, " ", " ")
    const cell14 = new TextCell(width / 2, height, "Signature:", "Abh ", textSize)
    const cell15 = new TextCell(width / 2, height, " ", " ")


    const mesh1 = cell1.create(font)
    const mesh2 = cell2.create(font)
    const mesh3 = cell3.create(font)
    const mesh4 = cell4.create(font)
    const mesh5 = cell5.create(font)
    const mesh6 = cell6.create(font)
    const mesh7 = cell7.create(font)
    const mesh8 = cell8.create(font)
    const mesh9 = cell9.create(font)
    const mesh10 = cell10.create(font)
    const mesh11 = cell11.create(font)
    const mesh12 = cell12.create(font)
    const mesh13 = cell13.create(font)
    const mesh14 = cell14.create(font)
    const mesh15 = cell15.create(font);

    mesh1.position.set(0, -height, 0)
    mesh2.position.set(0, -height * 2, 0)
    mesh3.position.set(width / 2, -height * 2, 0)
    mesh4.position.set(0, -height * 3, 0)
    mesh5.position.set(0, -height * 4, 0)
    mesh6.position.set(0, -height * 6, 0)
    mesh7.position.set(0, -height * 6, 0)
    mesh8.position.set(0, -height * 7, 0)
    mesh9.position.set(3 * width / 4, -height * 7, 0)
    mesh10.position.set(0, -height * 8, 0)
    mesh11.position.set(3 * width / 4, -height * 9, 0)
    mesh12.position.set(0, -height * 9, 0)
    mesh13.position.set(3 * width / 4, -height * 9, 0)
    mesh14.position.set(0, -height * 10, 0)
    mesh15.position.set(width / 2, -height * 10, 0);

    table.add(mesh1, mesh2, mesh3, mesh4, mesh5, mesh6, mesh7, mesh8, mesh9, mesh10, mesh11, mesh12, mesh14, mesh15);
    return table
}

function createRoundedBox(x, y, width, height, radius = 1, {
    topLeft = true,
    topRight = true,
    bottomRight = true,
    bottomLeft = true
} = {}) {

    const shape = new THREE.Shape()

    shape.moveTo(x + (bottomLeft ? radius : 0), y)
    shape.lineTo(x + width - (bottomRight ? radius : 0), y)

    if (bottomRight) {
        shape.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0)
    } else {
        shape.lineTo(x + width, y)
    }

    shape.lineTo(x + width, y + height - (topRight ? radius : 0))

    if (topRight) {
        shape.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2)
    } else {
        shape.lineTo(x + width, y + height)
    }

    shape.lineTo(x + (topLeft ? radius : 0), y + height)

    if (topLeft) {
        shape.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI)
    } else {
        shape.lineTo(x, y + height)
    }

    shape.lineTo(x, y + (bottomLeft ? radius : 0))

    if (bottomLeft) {
        shape.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5)
    } else {
        shape.lineTo(x, y)
    }

    const geometry = new THREE.ShapeGeometry(shape)
    const material = new THREE.LineBasicMaterial({ color: 0x000000 })
    const edges = new THREE.EdgesGeometry(geometry)

    return new THREE.LineSegments(edges, material)
}

function createDeveloperCard(width = 20, height = 10, font, textSize) {

    const card = new THREE.Group()
    const outer = createRoundedBox(0, 0, width, height, 1.2, {
        topLeft: true,
        topRight: true,
        bottomLeft: true,
        bottomRight: true
    })
    card.add(outer)

    const material = new THREE.LineBasicMaterial({ color: 0x000000 })
    function line(x1, y1, x2, y2) {
        const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y1, 0),
            new THREE.Vector3(x2, y2, 0)
        ])
        return new THREE.Line(geo, material)
    }

    card.add(line(0, 3 * height / 4, width, 3 * height / 4))
    card.add(line(0, height / 2, width, height / 2))
    card.add(line(0, height / 4, width, height / 4))
    card.add(line(width / 4, 3 * height / 4, width / 4, height / 2))
    card.add(line(3 * width / 4, 3 * height / 4, 3 * width / 4, height / 2))
    card.add(line(width / 2, height / 4, width / 2, 0))

    const name = new TextCell(width, height / 4, "", "Abhijit Naik", textSize, { color: 'white', transparent: true, opacity: 0 });
    const nameMesh = name.create(font)
    nameMesh.position.set(0, 3 * height / 4, 0)

    const empId = new TextCell(width / 2, height / 4, "", "Employee Id: 300", textSize)
    const empMesh = empId.create(font)
    empMesh.position.set(width / 4, height / 2, 0)

    const designation = new TextCell(width, height / 4, "", "Designation: SE Configurator Design", textSize)
    const desMesh = designation.create(font)
    desMesh.position.set(0, height / 4, 0)

    card.add(nameMesh, empMesh, desMesh);
    return card
}

function textEditing() {
    window.addEventListener("pointerdown", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(editableMeshes, true)

        if (intersects.length === 0) return
        const mesh = intersects[0].object
        if (!mesh.cell) return
        activeCell = mesh.cell
        openEditor(activeCell, event.clientX, event.clientY)
    })
}

function openEditor(cell, x, y) {
    let input = document.getElementById("TextEditor")
    if (!input) {
        input = document.createElement("input")
        input.id = "TextEditor"

        input.style.position = "absolute"
        input.style.zIndex = 100
        input.style.fontSize = "16px"
        input.style.padding = "4px"

        document.body.appendChild(input)
        input.addEventListener("keydown", (e) => {

            if (e.key === "Enter") {
                activeCell.updateText(input.value)
                input.style.display = "none"
            }
            if (e.key === "Escape") {
                input.style.display = "none"
            }

        })
    }

    input.value = cell.content

    input.style.left = x + "px"
    input.style.top = y + "px"
    input.style.display = "block"
    input.focus()
}



// WINDOW DIAGRAM
class Frame {
    constructor(h1, offset, color = '#000000') {
        this.thickness = h1
        this.cavityOffset = 0
        this.color = color
    }

}

class Bead {
    constructor(thickness, offset, color = '#000000') {
        this.thickness = thickness
        this.cavityOffset = offset
        this.color = color
    }

}

function createSegment(segmentLength, profileThickness, lineColor) {
    const halfLength = segmentLength / 2
    const halfThickness = profileThickness / 2

    const points = [
        new THREE.Vector3(-halfLength, -halfThickness, 0),
        new THREE.Vector3(halfLength, -halfThickness, 0),
        new THREE.Vector3(halfLength - profileThickness, halfThickness, 0),
        new THREE.Vector3(-halfLength + profileThickness, halfThickness, 0),
        new THREE.Vector3(-halfLength, -halfThickness, 0)
    ]

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color: lineColor })
    return new THREE.Line(geometry, material)

}

function createPolygon(frameWidth, frameHeight, profile) {

    const frameGroup = new THREE.Group()
    const profileThickness = profile.thickness
    const cavityOffset = profile.cavityOffset
    const innerWidth = frameWidth - 2 * cavityOffset
    const innerHeight = frameHeight - 2 * cavityOffset

    const bottom = createSegment(innerWidth, profileThickness, profile.color)
    bottom.position.y = -innerHeight / 2 + profileThickness / 2

    const top = createSegment(innerWidth, profileThickness, profile.color)
    top.rotation.z = Math.PI
    top.position.y = innerHeight / 2 - profileThickness / 2

    const left = createSegment(innerHeight, profileThickness, profile.color)
    left.rotation.z = -Math.PI / 2
    left.position.x = -innerWidth / 2 + profileThickness / 2

    const right = createSegment(innerHeight, profileThickness, profile.color)
    right.rotation.z = Math.PI / 2
    right.position.x = innerWidth / 2 - profileThickness / 2

    frameGroup.add(bottom, top, left, right)
    return frameGroup
}

function createDashedLine(frameWidth, frameHeight) {
    const halfWidth = frameWidth / 2;
    const halfHeight = frameHeight / 2;

    const pointsH = [new THREE.Vector3(-halfWidth, 0, 0), new THREE.Vector3(halfWidth, 0, 0)];
    const pointsV = [new THREE.Vector3(0, halfHeight, 0), new THREE.Vector3(0, -halfHeight, 0)];

    const geometryH = new THREE.BufferGeometry().setFromPoints(pointsH);
    const geometryV = new THREE.BufferGeometry().setFromPoints(pointsV);

    const material = new THREE.LineDashedMaterial({
        color: 'black',
        dashSize: 0.5,
        gapSize: 0.1,
        scale: 1
    });

    const lineH = new THREE.Line(geometryH, material);
    const lineV = new THREE.Line(geometryV, material);

    lineH.computeLineDistances();
    lineV.computeLineDistances();

    const line = new THREE.Group();
    line.add(lineH, lineV);
    return line;
}

function createDimensions(frameWidth, frameHeight, offset, font) {
    const halfWidth = frameWidth / 2;
    const halfHeight = frameHeight / 2;

    const pointsH = [
        new THREE.Vector3(-halfWidth, -halfHeight - offset, 0),
        new THREE.Vector3(halfWidth, -halfHeight - offset, 0)
    ];

    const pointsV = [
        new THREE.Vector3(halfWidth + offset, halfHeight, 0),
        new THREE.Vector3(halfWidth + offset, -halfHeight, 0)
    ];

    const geometryH = new THREE.BufferGeometry().setFromPoints(pointsH);
    const geometryV = new THREE.BufferGeometry().setFromPoints(pointsV);

    const material = new THREE.LineBasicMaterial({ color: 'black' });

    const lineH = new THREE.Line(geometryH, material);
    const lineV = new THREE.Line(geometryV, material);

    lineH.computeLineDistances();
    lineV.computeLineDistances();

    const group = new THREE.Group();
    group.add(lineH, lineV);

    // const textMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
    // const widthTextGeometry = new TextGeometry(frameWidth.toString(), {
    //     font: font,
    //     size: 0.5,
    //     depth: 0
    // });
    // const widthText = new THREE.Mesh(widthTextGeometry, textMaterial);
    // widthText.position.set(0, -halfHeight - offset - 0.7, 0);
    // group.add(widthText);

    const widthT = new TextCell(5, 5, "", frameWidth.toString(), 0.8, { color: 'white', transparent: true, opacity: 0 });
    const widthMesh = widthT.create(font)
    widthMesh.position.set(0, -halfHeight - offset - 2.5, 0);
    group.add(widthMesh);

    const heightT = new TextCell(5, 5, "", frameHeight.toString(), 0.8, { color: 'white', transparent: true, opacity: 0 });
    const heightMesh = heightT.create(font)
    heightMesh.position.set(halfWidth + offset + 0.2, -2.5, 0);
    group.add(heightMesh);

    return group;
}


//BOTTOM 5 SHAPES
class ShapeBox {
    constructor(width, height, size) {
        this.size = size;
        this.width = width;
        this.height = height;
    }

    setShape(shape) {
        const size = this.size;
        const halfHeight = this.height/2;
        const halfWidth = this.width/2;
        const points = [
            new THREE.Vector3(-halfWidth, -halfHeight, 0),
            new THREE.Vector3(halfWidth, -halfHeight, 0),
            new THREE.Vector3(halfWidth, halfHeight, 0),
            new THREE.Vector3(-halfWidth, halfHeight, 0),
            new THREE.Vector3(-halfWidth, -halfHeight, 0),
        ]
        const material = new THREE.LineBasicMaterial({ color: 0x000000 })
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const box = new THREE.Line(geometry, material);
        box.add(shape);
        return box;
    }
}
function createBottomBox(x, y, width, height, size) {
    const group = new THREE.Group();

    const hexagon = createHexagon(size / 2);
    const star = createStar(size / 2, size / 4);
    const upArrow = createUpArrow(size / 2);
    const leftArrow = createLeftArrow(size / 2);
    const rightArrow = createRightArrow(size / 2);

    const cellWidth = width/5, cellHeight = height;
    const box1 = new ShapeBox(cellWidth, cellHeight, size).setShape(hexagon);
    box1.position.set(cellWidth/2, cellHeight/2, 0);
    const box2 = new ShapeBox(cellWidth, cellHeight, size).setShape(star);
    box2.position.set(3 * cellWidth/2, cellHeight/2, 0);
    const box3 = new ShapeBox(cellWidth, cellHeight, size).setShape(upArrow);
    box3.position.set(5 * cellWidth/2, cellHeight/2, 0);
    const box4 = new ShapeBox(cellWidth, cellHeight, size).setShape(leftArrow);
    box4.position.set(7 * cellWidth/2, cellHeight/2, 0);
    const box5 = new ShapeBox(cellWidth, cellHeight, size).setShape(rightArrow);
    box5.position.set(9 * cellWidth/2, cellHeight/2, 0);

    group.add(box1, box2, box3, box4, box5);
    group.position.set(x, y, 0);

    return group;
}

function createHexagon(size = 1) {

    const points = [];
    const sides = 6;

    for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        points.push(
            new THREE.Vector3(
                Math.cos(angle) * size,
                Math.sin(angle) * size,
                0
            )
        );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const line = new THREE.Line(geometry, material);
    return line;
}

function createStar(outer = 1, inner = 0.5) {

    const points = [];
    const spikes = 6;

    for (let i = 0; i <= spikes * 2; i++) {

        const radius = (i % 2 === 0) ? outer : inner;
        const angle = (i / (spikes * 2)) * Math.PI * 2;

        points.push(
            new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            )
        );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });

    return new THREE.Line(geometry, material);
}

function createUpArrow(size = 1) {

    const points = [

        new THREE.Vector3(0, size, 0),
        new THREE.Vector3(0, -size, 0),

        new THREE.Vector3(0, size, 0),
        new THREE.Vector3(-size * 0.5, size * 0.5, 0),

        new THREE.Vector3(0, size, 0),
        new THREE.Vector3(size * 0.5, size * 0.5, 0)

    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });

    return new THREE.LineSegments(geometry, material);
}

function createLeftArrow(size = 1) {

    const shaftLength = size * 1.2;
    const shaftHeight = size * 0.4;
    const headLength = size * 0.8;
    const halfHeight = shaftHeight / 2;

    const points = [

        new THREE.Vector3(shaftLength, -halfHeight, 0),
        new THREE.Vector3(0, -halfHeight, 0),

        new THREE.Vector3(0, -size, 0),
        new THREE.Vector3(-headLength, 0, 0),
        new THREE.Vector3(0, size, 0),

        new THREE.Vector3(0, halfHeight, 0),
        new THREE.Vector3(shaftLength, halfHeight, 0),

        new THREE.Vector3(shaftLength, -halfHeight, 0)

    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });

    return new THREE.Line(geometry, material);
}

function createRightArrow(size = 1) {

    const shaftLength = size * 1.2;
    const shaftHeight = size * 0.4;
    const headLength = size * 0.8;
    const halfHeight = shaftHeight / 2;

    const points = [

        new THREE.Vector3(-shaftLength, -halfHeight, 0),
        new THREE.Vector3(0, -halfHeight, 0),

        new THREE.Vector3(0, -size, 0),
        new THREE.Vector3(headLength, 0, 0),
        new THREE.Vector3(0, size, 0),

        new THREE.Vector3(0, halfHeight, 0),
        new THREE.Vector3(-shaftLength, halfHeight, 0),

        new THREE.Vector3(-shaftLength, -halfHeight, 0)

    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });

    return new THREE.Line(geometry, material);
}

// TEST3 FRONTEND

const T1Width = document.getElementById("T1WindowW");
const T1Height = document.getElementById("T1WindowH");

const updateBtnT1 = document.getElementById("updateBtnT1");

updateBtnT1.addEventListener("click", () => {
    const scaleDiv = 1;
    const width = Number(T1Width.value) / scaleDiv;
    const height = Number(T1Height.value) / scaleDiv;

    if (
        width === 0 &&
        height === 0
    ) {
        alert("Please enter valid numbers!");
        return;
    }

    createLine(width, height);
});
