import * as THREE from 'three';
import { camera } from '../Core/Camera';
import { scene } from '../Core/Scene';

const COLORS = {
    frame: {
        default: '#ffffff',
        category: '#0004ff',
        segment: '#0059ff'
    },
    bead: {
        default: '#ffffff',
        category: '#0004ff',
        segment: '#0059ff'
    }
}

const selectableMeshes = []
let group = null;
let dirLight = null;



export function createWindow(width, height, frameW, frameH, frameW1, frameH1, beadW, beadH) {

    disposeWindow();

    if (!dirLight) {
        dirLight = new THREE.DirectionalLight(0xffffff, 1)
        dirLight.position.set(100, 100, 100)
        dirLight.lookAt(0, 0, 0);
        scene.add(dirLight)
    }

    camera.rotation.set(0, 0, 0);
    camera.position.z = Math.max(width, height)

    //Invalid Inputs handling
    const frameLW = 1;
    if (width === 0) width = 50;
    if (height === 0) height = 50;
    if (frameW === 0) frameW = 6.0;
    if (frameH === 0) frameH = 6.0;
    if (frameW1 === 0) frameW1 = frameW - frameLW;
    if (frameH1 === 0) frameH1 = frameH - 2.0;
    if (beadW === 0) beadW = 2.0
    if (beadH === 0) beadH = frameH - frameH1;

    const path = new PolygonPath()

    path.moveTo(0, 0)
    path.lineTo(width, 0)
    //path.absarc(width, height/2, height/2, 3*Math.PI/2, Math.PI/2, false);
    path.lineTo(width, height);
    path.lineTo(0, height)
    path.closePath()

    const segments = path.getSegments()


    const frame = new Frame(frameW, frameH, frameW1, frameH1);
    const bead = new Bead(beadW, beadH)

    const loader = new THREE.TextureLoader();
    const woodTexture = loader.load("Images/Textures/Wood049/Wood049_1K-JPG_Color.jpg");
    woodTexture.colorSpace = THREE.SRGBColorSpace;
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(1, 1);

    const woodMaterial = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map: woodTexture,
    });

    const framePolygon = new Polygon(frame, segments, 0, COLORS.frame.default, "frame", 45, 135, woodMaterial)
    const beadPolygon = new Polygon(bead, segments, frame.h1, COLORS.bead.default, "bead", 90, 90, woodMaterial)

    const GVA = 0.1, GHA = 0.1;
    const glass = new Glass(width - 2 * frame.h1 - GVA, height - 2 * frame.h1 - GHA).getMesh()
    glass.position.set(width / 2, height / 2, -frame.width / 2);

    const frameMeshes = framePolygon.create()
    const beadMeshes = beadPolygon.create()

    group = new THREE.Group()
    group.add(glass);

    frameMeshes.forEach(mesh => group.add(mesh))
    beadMeshes.forEach(mesh => group.add(mesh))

    new RaySystem(camera)

    group.position.set(-width / 2, -height / 2);
    scene.add(group);
}

export function disposeWindow() {
    if (scene.children.includes(group)) scene.remove(group);
    selectableMeshes.length = 0;
}


class Point {

    constructor(x, y, z = 0) {
        this.x = x
        this.y = y
        this.z = z
    }

    clone() {
        return new Point(this.x, this.y, this.z)
    }

    add(p) {
        return new Point(this.x + p.x, this.y + p.y, this.z + p.z)
    }

    subtract(p) {
        return new Point(this.x - p.x, this.y - p.y, this.z - p.z)
    }

    distanceTo(p) {
        const dx = this.x - p.x
        const dy = this.y - p.y
        const dz = this.z - p.z
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

}

class Line {

    constructor(p1, p2) {
        this.p1 = p1
        this.p2 = p2
    }

    length2() {
        const dx = this.p2.x - this.p1.x
        const dy = this.p2.y - this.p1.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    length() {
        const dx = this.p2.x - this.p1.x
        const dy = this.p2.y - this.p1.y
        const dz = this.p2.z - this.p1.z
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    dir() {
        const dx = this.p2.x - this.p1.x
        const dy = this.p2.y - this.p1.y
        const len = Math.sqrt(dx * dx + dy * dy)

        return new THREE.Vector2(dx / len, dy / len)
    }

    normal() {
        const d = this.dir()
        return new THREE.Vector2(-d.y, d.x)
    }

    angle() {
        const dx = this.p2.x - this.p1.x
        const dy = this.p2.y - this.p1.y
        return Math.atan2(dy, dx)
    }

    mid() {
        return new Point(
            (this.p1.x + this.p2.x) / 2,
            (this.p1.y + this.p2.y) / 2
        )
    }
    path() {

        return new THREE.LineCurve3(
            new THREE.Vector3(this.p1.x, this.p1.y, this.p1.z),
            new THREE.Vector3(this.p2.x, this.p2.y, this.p2.z)
        )

    }


}

class Arc {

    constructor(center, radius, startAngle, endAngle, clockwise = false) {

        this.center = center
        this.radius = radius
        this.startAngle = startAngle
        this.endAngle = endAngle
        this.clockwise = clockwise

    }

    startPoint() {
        return new Point(
            this.center.x + this.radius * Math.cos(this.startAngle),
            this.center.y + this.radius * Math.sin(this.startAngle)
        )
    }

    endPoint() {
        return new Point(
            this.center.x + this.radius * Math.cos(this.endAngle),
            this.center.y + this.radius * Math.sin(this.endAngle)
        )
    }

    length() {
        return Math.abs(this.endAngle - this.startAngle) * this.radius
    }

    // angle of tangent at parameter t
    angleAt(t) {
        const a = this.startAngle + (this.endAngle - this.startAngle) * t
        return a + (this.clockwise ? -Math.PI / 2 : Math.PI / 2)
    }

    // direction vector at tangent t
    dirAt(t) {
        const a = this.startAngle + (this.endAngle - this.startAngle) * t
        const sign = this.clockwise ? -1 : 1
        return new THREE.Vector2(
            -Math.sin(a) * sign,
            Math.cos(a) * sign
        )

    }

    // normal vector pointing to center
    normalAt(t) {
        const a = this.startAngle + (this.endAngle - this.startAngle) * t
        return new THREE.Vector2(
            -Math.cos(a),
            -Math.sin(a)
        )

    }

    // tangent angle at start
    angleStart() {
        return this.angleAt(0)
    }

    // tangent angle at end
    angleEnd() {
        return this.angleAt(1)
    }

    getPoints(divisions = 20) {
        const pts = []

        for (let i = 0; i <= divisions; i++) {
            const t = i / divisions
            const a = this.startAngle + (this.endAngle - this.startAngle) * t
            const x = this.center.x + this.radius * Math.cos(a)
            const y = this.center.y + this.radius * Math.sin(a)
            pts.push(new Point(x, y))
        }
        return pts
    }

    path() {
        const pts = this.getPoints(30)
        const vectors = pts.map(p =>
            new THREE.Vector3(p.x, p.y, p.z)
        )
        return new THREE.CatmullRomCurve3(vectors)
    }

}

class PolygonPath {

    constructor() {
        this.segments = []
        this.currentPoint = null
        this.startPoint = null
    }

    moveTo(x, y) {
        const p = new Point(x, y)
        this.currentPoint = p
        this.startPoint = p

    }

    lineTo(x, y) {
        const next = new Point(x, y)
        const line = new Line(this.currentPoint, next)
        this.segments.push(line)
        this.currentPoint = next
    }

    absarc(cx, cy, r, start, end, cw = false) {
        const arc = new Arc(
            new Point(cx, cy),
            r,
            start,
            end,
            cw
        )

        this.segments.push(arc)
        const x = cx + r * Math.cos(end)
        const y = cy + r * Math.sin(end)
        this.currentPoint = new Point(x, y)
    }

    closePath() {
        if (this.currentPoint !== this.startPoint) {
            this.segments.push(
                new Line(this.currentPoint, this.startPoint)
            )
        }

    }

    getSegments() {
        return this.segments
    }

    segmentCount() {
        return this.segments.length
    }

    getSegment(i) {
        return this.segments[i]
    }

    pathLength() {
        let len = 0
        this.segments.forEach(seg => {
            len += seg.length()
        })
        return len
    }

}


class Glass {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    getMesh() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, 0.05);
        const texture = new THREE.TextureLoader().load("Images/sky1.jpg")
        texture.mapping = THREE.EquirectangularReflectionMapping
        
        scene.environment = texture
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.02,
            reflectivity: 1,
            transmission: 1,
            thickness: 1.5,
            ior: 1.5,
            clearcoat: 1,
            clearcoatRoughness: 0,
        })
        return new THREE.Mesh(geometry, glassMaterial);
    }
}

class Frame {
    constructor(width, height, w1, h1) {
        this.width = width
        this.height = height
        this.w1 = w1
        this.h1 = h1
    }

    getShape() {
        const shape = new THREE.Shape()
        shape.moveTo(0, 0)
        shape.lineTo(this.width, 0)
        shape.lineTo(this.width, this.height)
        shape.lineTo(this.w1, this.height)
        shape.lineTo(this.w1, this.h1)
        shape.lineTo(0, this.h1)
        shape.lineTo(0, 0);
        return shape;
    }

    texture() {

    }
}

class Bead {

    constructor(width, height) {

        this.width = width
        this.height = height

    }

    getShape() {
        const shape = new THREE.Shape()
        const w1 = this.width / 2
        const h1 = this.height - (this.width - w1) - w1
        shape.moveTo(0, 0)
        shape.lineTo(this.width - w1, 0)
        shape.lineTo(this.width - w1, h1)
        shape.absarc(this.width, h1, w1, Math.PI, Math.PI / 2, true)
        shape.lineTo(this.width, this.height)
        shape.absarc(this.width, h1, this.width, Math.PI / 2, Math.PI, false)
        shape.lineTo(0, 0);
        return shape
    }

}




class Polygon {
    constructor(profile, segments, offset, color, category, c1, c2, material) {
        this.material = material;
        this.profile = profile,
            this.shape = profile.getShape();
        this.segments = segments
        this.offset = offset
        this.color = color
        this.category = category
        this.c1 = c1
        this.c2 = c2
    }

    create() {

        const meshes = []
        const count = this.segments.length;

        this.segments.forEach((segment, i) => {

            const prev = this.segments[(i - 1 + count) % count]
            const next = this.segments[(i + 1) % count]

            const dir = segment.dir()
            const prevDir = prev.dir()
            const nextDir = next.dir()

            const dot1 = dir.x * prevDir.x + dir.y * prevDir.y
            const dot2 = dir.x * nextDir.x + dir.y * nextDir.y

            const angle1 = Math.acos(dot1)
            const angle2 = Math.acos(dot2)

            const a1 = (angle1 / 2) * 180/Math.PI;
            const a2 = 180 - (angle2 / 2) * 180/Math.PI;

            
            const normal = segment.normal()
            let length = segment.length() - this.offset * 2

            const horizontal = Math.abs(dir.x) > Math.abs(dir.y)

            if (this.category === "bead" && horizontal) {
                //length -= this.profile.height/2
            }

            const mesh = Geometry.extrude(
                this.shape,
                length,
                this.color,
                // this.c1,
                // this.c2,
                a1, a2,
                this.material
            )

            mesh.position.set(segment.p1.x, segment.p1.y, segment.p1.z)


            if (this.category === "bead" && horizontal) {
                // mesh.position.x += dir.x * this.profile.height/2
                // mesh.position.y += dir.y * this.profile.height/2
            }


            mesh.position.x += dir.x * this.offset
            mesh.position.y += dir.y * this.offset


            mesh.position.x += normal.x * this.offset
            mesh.position.y += normal.y * this.offset


            mesh.rotation.z = segment.angle()


            mesh.metaData = {
                category: this.category,
                segmentIndex: i
            }


            mesh.add(Geometry.outline(mesh.geometry))


            selectableMeshes.push(mesh)


            meshes.push(mesh)

        })

        return meshes
    }
}

class Geometry {
    static extrude(shape, length, color, c1, c2, material) {
        const path = new THREE.LineCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(length, 0, 0)
        )

        const geometry = new THREE.ExtrudeGeometry(shape, {
            steps: 1,
            extrudePath: path
        })

        Geometry.miterCut(geometry, length, c1, c2)

        //const Material = new THREE.MeshBasicMaterial({ color })
        const mat = material.clone();
        return new THREE.Mesh(geometry, mat);
    }

    static miterCut(geometry, length, a1, a2) {
        const pos = geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i)
            const y = pos.getY(i)
            if (x > length / 2) pos.setX(i, length - y / Math.tan(a1 * Math.PI / 180))
            if (x < length / 2) pos.setX(i, y / Math.tan(Math.abs(180 - a2) * Math.PI / 180))

        }
        pos.needsUpdate = true
    }

    static outline(geometry) {
        const edges = new THREE.EdgesGeometry(geometry, 15)
        const material = new THREE.LineBasicMaterial({ color: "#000000" })
        const outline = new THREE.LineSegments(edges, material);
        return outline;
    }

}

class RaySystem {

    constructor(camera) {
        this.camera = camera
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        window.addEventListener("dblclick", (e) => this.click(e))
    }

    click(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.camera)

        const hit = this.raycaster.intersectObjects(selectableMeshes, true)

        if (!hit.length) {
            this.resetColors()
            return
        }

        // always get the main mesh, not the child outline
        let selected = hit[0].object
        while (selected && !selectableMeshes.includes(selected)) {
            selected = selected.parent
        }
        if (!selected) return
        this.highlightSelection(selected)

    }
    highlightSelection(mesh) {

        selectableMeshes.forEach(obj => {

            if (obj.material.emissive) {

                obj.material.emissive.set('black')
                obj.material.emissiveIntensity = 0

            }

        })

        selectableMeshes.forEach(obj => {

            if (obj.metaData.category === mesh.metaData.category) {

                obj.material.emissive.set(COLORS[mesh.metaData.category].category)
                obj.material.emissiveIntensity = 100

            }

        })

        mesh.material.emissive.set(COLORS[mesh.metaData.category].segment)
        mesh.material.emissiveIntensity = 100
    }

    resetColors() {

        selectableMeshes.forEach(obj => {

            if (obj.material.emissive) {

                obj.material.emissive.set('black')
                obj.material.emissiveIntensity = 0

            }

        })

    }

}


//FRONTEND
const T2WindowW = document.getElementById('T2WindowW');
const T2WindowH = document.getElementById('T2WindowH');
const T2FrameW = document.getElementById('T2FrameW');
const T2FrameH = document.getElementById('T2FrameH');
const T2FrameW1 = document.getElementById('T2FrameW1');
const T2FrameH1 = document.getElementById('T2FrameH1');
const T2BeadW = document.getElementById('T2BeadW');
const T2BeadH = document.getElementById('T2BeadH');

const updateBtnT2 = document.getElementById('updateBtnT2');

updateBtnT2.addEventListener('click', () => {

    const scale = 10;
    const windowW = Number(T2WindowW.value) / scale;
    const windowH = Number(T2WindowH.value) / scale;
    const frameW = Number(T2FrameW.value) / scale;
    const frameH = Number(T2FrameH.value) / scale;
    const frameW1 = Number(T2FrameW1.value) / scale;
    const frameH1 = Number(T2FrameH1.value) / scale;
    const beadW = Number(T2BeadW.value) / scale;
    const beadH = Number(T2BeadH.value) / scale;

    if (
        windowW === 0 &&
        windowH === 0 &&
        frameW === 0 &&
        frameH === 0 &&
        frameW1 === 0 &&
        frameH1 === 0 &&
        beadW === 0 &&
        beadH === 0

    ) {
        alert("Please enter all numbers!");
        return;
    }

    // if(windowW === 0) windowW = 50;
    // if(windowH === 0) windowW = 50;
    // if(frameW === 0) frameW = 6.0;
    // if(frameH === 0) frameH = 6.0;
    // if(frameW1 === 0) frameW1 = 5.0;
    // if(frameH1 === 0) frameH1 = frameH - 3.0
    // if(beadW === 0) beadW = 2.0
    // if(beadH === 0) beadH = 3.0

    createWindow(windowW, windowH, frameW, frameH, frameW1, frameH1, beadW, beadH);
});