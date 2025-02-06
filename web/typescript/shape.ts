class Point2D {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toSVG() {
        return `${this.x} ${this.y}`;
    }
}

let documentj = $(document);

let Point3D = class {
    x: number;
    y: number;
    z: number;
    initial_x: number;
    initial_y: number;
    initial_z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.initial_x = x;
        this.initial_y = y;
        this.initial_z = z;
    }

    flatProject2D() {
        return new Point2D(this.x, this.y);
    }

    toSVG() {
        return `${Math.trunc(this.x)} ${Math.trunc(this.y)}`;
    }

    difference(other: InstanceType<typeof Point3D>) {
        return new Point3D(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z
        )
    }

    // Rotate about the y axis by theta amount
    // Alternatively supply sine and cosine of theta
        // This is for improved performance
    rotateAboutY3D(amount: number | number[]) {
        let sine: number;
        let cosine: number;
        if (typeof amount === "number") {
            sine = Math.sin(amount);
            cosine = Math.cos(amount);
        } else {
            sine = amount[0];
            cosine = amount[1];
        }
        this.x = this.x * cosine + this.z * sine;
        this.z = this.x * -1 * sine + this.z * cosine;
    }

    // Rotate about the y axis by theta amount
        // FROM INITIAL POSITION
    // Alternatively supply sine and cosine of theta
        // This is for improved performance
    setRotationAboutY3D(amount: number | [number, number]) {
        let sine: number;
        let cosine: number;
        if (typeof amount === "number") {
            sine = Math.sin(amount);
            cosine = Math.cos(amount);
        } else {
            sine = amount[0];
            cosine = amount[1];
        }
        this.x = this.initial_x * cosine + this.initial_z * sine;
        this.z = this.initial_x * -1 * sine + this.initial_z * cosine;
    }

    move(x: number, y: number, z: number) {
        this.x += x;
        this.y += y;
        this.z += z;
        this.initial_x += x;
        this.initial_y += y;
        this.initial_z += z;
    }
        
    clone() {
        return new Point3D(this.x, this.y, this.z);
    }
}

let Line2D = class {
    a: InstanceType<typeof Point2D>;
    b: InstanceType<typeof Point2D>;

    constructor(a: InstanceType<typeof Point2D>, b: InstanceType<typeof Point2D>) {
        this.a = a;
        this.b = b;
    }

    toSVG() {
        const a_SVG = this.a.toSVG();
        const b_SVG = this.b.toSVG();
        return `M${a_SVG} L${b_SVG}`
    }
}

let Line3D = class {
    a: InstanceType<typeof Point3D>;
    b: InstanceType<typeof Point3D>;

    constructor(a: InstanceType<typeof Point3D>, b: InstanceType<typeof Point3D>) {
        this.a = a;
        this.b = b;
    }

    flatProject2D() {
        return new Line2D(this.a.flatProject2D(), this.b.flatProject2D());
    }

    toSVG() {
        const a_SVG = this.a.toSVG();
        const b_SVG = this.b.toSVG();
        return `M${a_SVG} L${b_SVG}`
    }

    rotateAboutY3D(amount: number | [number, number]) {
        let computedAmount: [number, number] = [0, 0];
        if (typeof amount === "number") {
            computedAmount[0] = Math.sin(amount);
            computedAmount[1] = Math.cos(amount);
        } else {
            computedAmount = amount;
        }
        this.a.rotateAboutY3D(computedAmount);
        this.b.rotateAboutY3D(computedAmount);
    }

    setRotationAboutY3D(amount: number | [number, number]) {
        let computedAmount: [number, number] = [0, 0];
        if (typeof amount === "number") {
            computedAmount[0] = Math.sin(amount);
            computedAmount[1] = Math.cos(amount);
        } else {
            computedAmount = amount;
        }
        this.a.setRotationAboutY3D(computedAmount);
        this.b.setRotationAboutY3D(computedAmount);
    }

    move(x: number, y: number, z: number) {
        this.a.move(x, y, z);
        this.b.move(x, y, z);
    }
}

let ConnectedLines2D = class {
    pointArray: InstanceType<typeof Point2D>[];

    constructor(pointArray: InstanceType<typeof Point2D>[]) {
        this.pointArray = pointArray;
    }

    toSVG(first_in_path?: boolean) {
        if (typeof first_in_path === "undefined") {
            first_in_path = true;
        }
        const pointStrArrays = this.pointArray.map(function(value){
            return value.toSVG();
        });
        if (first_in_path) {
            return 'M' + pointStrArrays.join('L');
        } else {
            return pointStrArrays.join('L');
        }
    }
}

let ConnectedLines3D = class {
    pointArray: InstanceType<typeof Point3D>[];

    constructor(pointArray: InstanceType<typeof Point3D>[]) {
        this.pointArray = pointArray;
    }

    flatProject2D() {
        return new ConnectedLines2D(this.pointArray.map(function(value){
            return value.flatProject2D();
        }));
    }

    toSVG(first_in_path?: boolean) {
        if (typeof first_in_path === "undefined") {
            first_in_path = true;
        }
        const pointStrArrays = this.pointArray.map(function(value){
            return value.toSVG();
        });
        if (first_in_path) {
            return 'M' + pointStrArrays.join('L');
        } else {
            return pointStrArrays.join('L');
        }
    }

    setRotationAboutY3D(amount: number | [number, number]) {
        let computedAmount: [number, number] = [0, 0];
        if (typeof amount === "number") {
            computedAmount[0] = Math.sin(amount);
            computedAmount[1] = Math.cos(amount);
        } else {
            computedAmount = amount;
        }
        this.pointArray.forEach(element => {
            element.setRotationAboutY3D(computedAmount);
        });
    }

    move(x: number, y: number, z: number) {
        this.pointArray.forEach(element => {
            element.move(x, y, z);
        })
    }

    clone() {
        return new ConnectedLines3D(this.pointArray.map(function(value) {
            return value.clone();
        }));
    }
}

let Shape2D = class {
    elements: InstanceType<typeof ConnectedLines2D>[];

    constructor(elements: InstanceType<typeof ConnectedLines2D>[]) {
        this.elements = elements;
    }

    toSVG() {
        const elementPathArray = this.elements.map(function(value){
            return value.toSVG(false);
        });
        return 'M' + elementPathArray.join('M');
    }
}

let Shape3D = class {
    elements: InstanceType<typeof ConnectedLines3D>[];

    constructor(elements: InstanceType<typeof ConnectedLines3D>[]) {
        this.elements = elements;
    }

    setRotationAboutY3D(amount: number | [number, number]) {
        let computedAmount: [number, number] = [0, 0];
        if (typeof amount === "number") {
            computedAmount[0] = Math.sin(amount);
            computedAmount[1] = Math.cos(amount);
        } else {
            computedAmount = amount;
        }
        this.elements.forEach(element => {
            element.setRotationAboutY3D(computedAmount);
        });
    }

    flatProject2D() {
        return new Shape2D(this.elements.map(function(element) {
            return element.flatProject2D();
        }));
    }

    toSVG() {
        const elementPathArray = this.elements.map(function(value){
            return value.toSVG(false);
        });
        return 'M' + elementPathArray.join('M');
    }

    move(x: number, y: number, z: number) {
        this.elements.forEach(element => {
            element.move(x, y, z);
        });
    }

    moved(x: number, y: number, z: number) {
        let clone = this.clone();
        clone.move(x, y, z);
        return clone;
    }

    push(element: InstanceType<typeof ConnectedLines3D> | InstanceType<typeof ConnectedLines3D>[]) {
        if (Array.isArray(element)) {
            element.forEach((value) => {
                this.elements.push(value);
            });
        } else {
            this.elements.push(element);
        }
    }

    clone() {
        return new Shape3D(this.elements.map(function(value) {
            return value.clone();
        }));
    }
}

let PerspectiveShape3D = class {
    left: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>;
    right: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>;
    front: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>;
    back: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>;
    top: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>;
    bottom: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>;

    constructor(left: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>,
        right: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>,
        front: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>,
        back: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>,
        top: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>,
        bottom: InstanceType<typeof Shape3D> | InstanceType<typeof ConnectedLines3D>) {
            this.left = left;
            this.right = right;
            this.front = front;
            this.back = back;
            this.top = top;
            this.bottom = bottom;
        }
    
    setRotationAboutY3D(amount: number | [number, number],
        left = false, right = false, front = false, back = false, top = false, bottom = false) {
        let computedAmount: [number, number] = [0, 0];
        if (typeof amount === "number") {
            computedAmount[0] = Math.sin(amount);
            computedAmount[1] = Math.cos(amount);
        } else {
            computedAmount = amount;
        }
        // if (left) {
        //     this.left.setRotationAboutY3D(computedAmount);
        // }
        // if (right) {
        //     this.right.setRotationAboutY3D(computedAmount);
        // }
        // if (front) {
        //     this.front.setRotationAboutY3D(computedAmount);
        // }
        // if (back) {
        //     this.back.setRotationAboutY3D(computedAmount);
        // }
        // if (top) {
        //     this.top.setRotationAboutY3D(computedAmount);
        // }
        // if (bottom) {
        //     this.bottom.setRotationAboutY3D(computedAmount);
        // }
        this.left.setRotationAboutY3D(computedAmount);
        this.right.setRotationAboutY3D(computedAmount);
        this.front.setRotationAboutY3D(computedAmount);
        this.back.setRotationAboutY3D(computedAmount);
        this.top.setRotationAboutY3D(computedAmount);
        this.bottom.setRotationAboutY3D(computedAmount);
    }

    toSVG(left = false, right = false, front = false, back = false, top = false, bottom = false) {
        let paths = [];
        if (left) {
            paths.push(this.left.toSVG());
        }
        if (right) {
            paths.push(this.right.toSVG());
        }
        if (front) {
            paths.push(this.front.toSVG());
        }
        if (back) {
            paths.push(this.back.toSVG());
        }
        if (top) {
            paths.push(this.top.toSVG());
        }
        if (bottom) {
            paths.push(this.bottom.toSVG());
        }

        return paths.join();
    }

    move(x: number, y: number, z: number) {
        this.left.move(x, y, z);
        this.right.move(x, y, z);
        this.front.move(x, y, z);
        this.back.move(x, y, z);
        this.top.move(x, y, z);
        this.bottom.move(x, y, z);
    }

    moved(x: number, y: number, z: number) {
        let clone = this.clone();
        clone.move(x, y, z);
        return clone;
    }

    clone() {
        return new PerspectiveShape3D(
            this.left.clone(),
            this.right.clone(),
            this.front.clone(),
            this.back.clone(),
            this.top.clone(),
            this.bottom.clone()
        );
    }
}

let ComposedShape3D = class {
    components: InstanceType<typeof PerspectiveShape3D>[];

    constructor (components: InstanceType<typeof PerspectiveShape3D>[]) {
        this.components = components;
    }

    setRotationAboutY3D(amount: number | [number, number]) {
        let computedAmount: [number, number] = [0, 0];
        if (typeof amount === "number") {
            computedAmount[0] = Math.sin(amount);
            computedAmount[1] = Math.cos(amount);
        } else {
            computedAmount = amount;
        }
        this.components.forEach(component => {
            component.setRotationAboutY3D(computedAmount);
        });
    }

    toSVG(left = false, right = false, front = false, back = false, top = false, bottom = false, order: number[]) {
        // return this.components.map(function(element) {
        //     return element.toSVG(left, right, front, back, top, bottom);
        // })
        let paths = [];
        for (let i = 0; i < order.length; i++) {
            paths.push(this.components[order[i]].toSVG(left, right, front, back, top, bottom));
        }
        return paths;
    }

    move(x: number, y: number, z: number) {
        this.components.forEach(component => {
            component.move(x, y, z);
        });
    }

    moved(x: number, y: number, z: number) {
        let clone = this.clone();
        clone.move(x, y, z);
        return clone;
    }

    clone() {
        return new ComposedShape3D(this.components.map(function(value) {
            return value.clone();
        }));
    }
}

// var test_shape = new Shape3D([
//     new ConnectedLines3D([
//         new Point3D(0,0,100), //top right
//         new Point3D(-200,0,100), //top left
//         new Point3D(-200,200,100), //bottom left
//         new Point3D(0,200,100), //bottom right
//         new Point3D(0,0,100),
//     ]),
//     new ConnectedLines3D([
//         new Point3D(0,0,-100), //bottom left
//         new Point3D(200,0,-100), //bottom right
//         new Point3D(200,-200,-100), //top right
//         new Point3D(0,-200,-100), //top left
//         new Point3D(0,0,-100),
//     ]),
//     new ConnectedLines3D([ //bottom left
//         new Point3D(-200,200,100),
//         new Point3D(0,0,-100)
//     ]),
//     new ConnectedLines3D([ //bottom right
//         new Point3D(0,200,100),
//         new Point3D(200,0,-100)
//     ]),
//     new ConnectedLines3D([ //top left
//         new Point3D(-200,0,100),
//         new Point3D(0,-200,-100)
//     ]),
//     new ConnectedLines3D([ //top right
//         new Point3D(0,0,100),
//         new Point3D(200,-200,-100)
//     ])
// ]);

const shape_brush = new Shape3D([
    new ConnectedLines3D([
        new Point3D(0,0,50), //top right
        new Point3D(-100,0,50), //top left
        new Point3D(-100,100,50), //bottom left
        new Point3D(0,100,50), //bottom right
        new Point3D(0,0,50),
    ]),
    new ConnectedLines3D([
        new Point3D(0,0,-50), //bottom left
        new Point3D(100,0,-50), //bottom right
        new Point3D(100,-100,-50), //top right
        new Point3D(0,-100,-50), //top left
        new Point3D(0,0,-50),
    ]),
    new ConnectedLines3D([ //bottom left
        new Point3D(-100,100,50),
        new Point3D(0,0,-50)
    ]),
    new ConnectedLines3D([ //bottom right
        new Point3D(0,100,50),
        new Point3D(100,0,-50)
    ]),
    new ConnectedLines3D([ //top left
        new Point3D(-100,0,50),
        new Point3D(0,-100,-50)
    ]),
    new ConnectedLines3D([ //top right
        new Point3D(0,0,50),
        new Point3D(100,-100,-50)
    ])
]);




var shapes: InstanceType<typeof Shape3D>[] = [];


//First shape
var shape = shape_brush.clone();
shape.push(shape_brush.moved(100,0,0).elements);
shape.push(shape_brush.moved(-100,0,0).elements);
shape.push(shape_brush.moved(0,100,0).elements);
shape.push(shape_brush.moved(0,-100,0).elements);
shapes.push(shape);

//Second shape
shape = shape_brush.clone();
shape.push(shape_brush.moved(100,0,0).elements);
shape.push(shape_brush.moved(-100,0,0).elements);
shape.push(shape_brush.moved(0,100,100).elements);
shape.push(shape_brush.moved(0,-100,-100).elements);
shapes.push(shape);

//Third shape
shape = shape_brush.moved(0,100,0)
shape.push(shape_brush.moved(-100,0,0).elements);
shape.push(shape_brush.moved(0,-100,-100).elements);
shape.push(shape_brush.moved(100,0,-100).elements);
shapes.push(shape);

//Fourth shape
shape = shape_brush.clone();
shape.push(shape_brush.moved(100,0,0).elements);
shape.push(shape_brush.moved(-100,0,0).elements);
shape.push(shape_brush.moved(0,100,0).elements);
shape.push(shape_brush.moved(0,-100,-100).elements);
shapes.push(shape);

//Fifth shape
shape = shape_brush.clone();
shape.push(shape_brush.moved(0,100,0).elements);
shape.push(shape_brush.moved(-100,0,0).elements);
shape.push(shape_brush.moved(0,-100,-100).elements);
shape.push(shape_brush.moved(100,0,-100).elements);
shapes.push(shape);

//Sixth shape
shape = shape_brush.clone();
shape.push(shape_brush.moved(100,0,-100).elements);
shape.push(shape_brush.moved(-100,0,0).elements);
shape.push(shape_brush.moved(0,100,0).elements);
shape.push(shape_brush.moved(0,-100,0).elements);
shapes.push(shape);


let shape_left = new ConnectedLines3D([
    new Point3D(-100,100,50),
    new Point3D(0,0,-50),
    new Point3D(0,-100,-50),
    new Point3D(-100,0,50),
    new Point3D(-100,100,50)
]);

let shape_right = new ConnectedLines3D([
    new Point3D(0,100,50),
    new Point3D(100,0,-50),
    new Point3D(100,-100,-50),
    new Point3D(0,0,50),
    new Point3D(0, 100, 50)
]);

let shape_front = new ConnectedLines3D([
    new Point3D(0,0,50), //top right
    new Point3D(-100,0,50), //top left
    new Point3D(-100,100,50), //bottom left
    new Point3D(0,100,50), //bottom right
    new Point3D(0,0,50),
]);

let shape_back = new ConnectedLines3D([
    new Point3D(0,0,-50), //bottom left
    new Point3D(100,0,-50), //bottom right
    new Point3D(100,-100,-50), //top right
    new Point3D(0,-100,-50), //top left
    new Point3D(0,0,-50),
]);

let shape_top = new ConnectedLines3D([
    new Point3D(0,0,50), //top right
    new Point3D(-100,0,50), //top left
    new Point3D(0,-100,-50), //top left
    new Point3D(100,-100,-50), //top right
    new Point3D(0,0,50), //top right
]);

let shape_bottom = new ConnectedLines3D([
    new Point3D(-100,100,50), //bottom left
    new Point3D(0,100,50), //bottom right
    new Point3D(100,0,-50), //bottom right
    new Point3D(0,0,-50), //bottom left
    new Point3D(-100,100,50), //bottom left
]);

let perspective_shape = new PerspectiveShape3D(
    shape_left,
    shape_right,
    shape_front,
    shape_back,
    shape_top,
    shape_bottom
);

var composed_shapes: InstanceType<typeof ComposedShape3D>[] = [];

var orderings: number[][][] = [];

composed_shapes.push(new ComposedShape3D([
    perspective_shape.clone(),
    perspective_shape.moved(100, 0, 0),
    perspective_shape.moved(-100, 0, 0),
    perspective_shape.moved(0, 100, 0),
    perspective_shape.moved(0, -100, 0)
]));

orderings.push([
    [2, 3, 0, 1, 4],
    [3, 1, 0, 2, 4],
    [1, 4, 0, 2, 3],
    [2, 4, 0, 3, 1]  
]);

composed_shapes.push(new ComposedShape3D([
    perspective_shape.clone(),
    perspective_shape.moved(100, 0, 0),
    perspective_shape.moved(-100, 0, 0),
    perspective_shape.moved(0, 100, 100),
    perspective_shape.moved(0, -100, -100)
]));

orderings.push([
    [4, 2, 0, 1, 3],
    [1, 3, 0, 4, 2],
    [3, 1, 0, 2, 4],
    [2, 4, 0, 3, 1]
]);

composed_shapes.push(new ComposedShape3D([
    perspective_shape.moved(-100, 0, 0),
    perspective_shape.moved(0, 100, 0),
    perspective_shape.moved(0, -100, -100),
    perspective_shape.moved(100, 0, -100)
]));

orderings.push([
    [2, 3, 0, 0, 1],
    [3, 2, 1, 0, 0],
    [0, 0, 1, 2, 3],
    [0, 0, 1, 2, 3]
]);

composed_shapes.push(new ComposedShape3D([
    perspective_shape.clone(),
    perspective_shape.moved(100, 0, 0),
    perspective_shape.moved(-100, 0, 0),
    perspective_shape.moved(0, 100, 0),
    perspective_shape.moved(0, -100, -100)
]));

orderings.push([
    [4, 2, 3, 0, 1],
    [1, 3, 0, 4, 2],
    [1, 0, 2, 4, 3],
    [2, 4, 0, 3, 1]
]);

composed_shapes.push(new ComposedShape3D([
    perspective_shape.clone(),
    perspective_shape.moved(0, 100, 0),
    perspective_shape.moved(-100, 0, 0),
    perspective_shape.moved(0, -100, -100),
    perspective_shape.moved(100, 0, -100)
]));

orderings.push([
    [3, 4, 1, 2, 0],
    [4, 1, 0, 3, 2],
    [0, 1, 2, 3, 4],
    [2, 0, 1, 3, 4]
]);

composed_shapes.push(new ComposedShape3D([
    perspective_shape.clone(),
    perspective_shape.moved(100, 0, -100),
    perspective_shape.moved(-100, 0, 0),
    perspective_shape.moved(0, 100, 0),
    perspective_shape.moved(0, -100, 0)
]));

orderings.push([
    [1, 2, 3, 0, 4],
    [1, 3, 0, 4, 2],
    [4, 0, 2, 3, 1],
    [4, 2, 0, 3, 1]
]);



let end_outer = $('#end-outer');
let end_inner = $('#end-inner');
let start_inner = $('#start-inner');
let start_outer = $('#start-outer');
let shape_wireframe = $('#shape-wireframe');
let path_elements = $('#shape-path-group > path');
//note that the old space size is 1, everything is relative to this
const effectSize = 0.4;
const transitionSize = 0.2;
const deadzoneSize = 0.05;
const slideSpace = 1 + effectSize + 4*transitionSize + 2*deadzoneSize
const virtualStart = effectSize + 2*transitionSize + deadzoneSize;
const virtualEnd = virtualStart + 1;
let scrollTotal = 1;
function projectIntoInterval(value: number) {
    return Math.round((Math.min(Math.max(value, virtualStart), virtualEnd) - virtualStart)*1000)/1000;
}
function setShapeRotation() {
    // const scrollTotal = $('#content').height()! *5/6 - $('#content').offset()!['top'];
    // TODO get some of these constant values on page load and resize, not every time
    // const scrollTotal = Math.floor($('#content').height()! * 6/7);
    const scrollTop = documentj.scrollTop()!;
    // scrollTop -= $('#content').offset()!['top'];
    // if (scrollTop < 0) {
        // scrollTop = 0;
    // }
    // let scrollPercentage = scrollTop / scrollTotal;
    if (scrollTop < 0) {
        return;
    }
    let scrollPercentage = Math.round(scrollTop/scrollTotal*10000)/10000
    if (scrollPercentage > 1) {
        scrollPercentage = 1
    }
    let theta = 6*2*Math.PI*scrollPercentage;
    let shape_index = Math.floor(scrollPercentage * 6);
    if (shape_index > 5) {
        shape_index = 5;
    }

    // let display_shape = shapes[shape_index];
    // let display_shape = perspective_shape;
    let display_shape = composed_shapes[shape_index];
    let display_wireframe = shapes[shape_index];
    // let display_shape = new Shape3D([
    //     shape_right,
    //     shape_top,
    //     shape_front
    // ]);
    display_shape.setRotationAboutY3D(theta);
    display_wireframe.setRotationAboutY3D(theta);
    // TODO cut out flatProject2D for increased performance and just go straight to svg (flatProjectToSVG())
    // let shape_svg = display_shape.flatProject2D().toSVG();
    // let scrollQuadrant = Math.floor(scrollPercentage * 6 * 4 * 2 + 2);
    let scrollRegionUnits = (scrollPercentage*6*4*2+2) % 8;
    let shape_svg: string[];
    if (scrollRegionUnits <= 3) {
        shape_svg = display_shape.toSVG(false, true, true, false, true, false, orderings[shape_index][0]);
    } else if (scrollRegionUnits <= 4) {
        shape_svg = display_shape.toSVG(true, false, true, false, true, false, orderings[shape_index][1]);
    } else if (scrollRegionUnits <= 7) {
        shape_svg = display_shape.toSVG(true, false, false, true, false, true, orderings[shape_index][2]);
    } else {
        shape_svg = display_shape.toSVG(false, true, false, true, false, true, orderings[shape_index][3]);
    }
    // let shape_svg = display_shape.toSVG(false, true, true, false, true, false);
    // $('#shape-path').attr('d', shape_svg);
    // path_elements.eq(0).attr('d', shape_svg);
    for (let i = 0; i < 5; i++) {
        path_elements.eq(i).attr('d', shape_svg[i]);
    }
    shape_wireframe.attr('d', display_wireframe.toSVG());
    // $('#shape-wireframe').attr('stroke-opacity', Math.pow((Math.cos(theta) + 1)/2*.9, 0.5));

    const singleShapeScrollPercentage = (Math.round(6*scrollPercentage*1000)/1000)%1;

    // const virtual_end_outer = singleShapeScrollPercentage*newSpaceSize;
    const virtual_end_outer = singleShapeScrollPercentage * slideSpace;
    const virtual_end_inner = virtual_end_outer + transitionSize;
    const virtual_start_inner = virtual_end_inner + effectSize;
    const virtual_start_outer = virtual_start_inner + transitionSize;

    end_outer.attr('offset', `${projectIntoInterval(virtual_end_outer)*100}%`);
    end_inner.attr('offset', `${projectIntoInterval(virtual_end_inner)*100}%`);
    start_inner.attr('offset', `${projectIntoInterval(virtual_start_inner)*100}%`);
    start_outer.attr('offset', `${projectIntoInterval(virtual_start_outer)*100}%`);

    // end_outer.attr('offset', `${(bounded(singleShapeScrollPercentage*newSpaceSize, virtualStart, virtualEnd)-virtualStart)*100}%`);
    // end_inner.attr('offset', `${(bounded(singleShapeScrollPercentage*newSpaceSize + transitionSize, virtualStart, virtualEnd)-virtualStart)*100}%`);
    // start_inner.attr('offset', `${(bounded(,singleShapeScrollPercentage*newSpaceSize + transitionSize +  virtualStart, virtualEnd)-virtualStart)*100}%`);
    // start_outer.attr('offset', `${(bounded(, virtualStart, virtualEnd)-virtualStart)*100}%`);

//     if (between(singleShapeScrollPercentage, gradient_phases[0], gradient_phases[1])) {
//         phasePercentage = (singleShapeScrollPercentage - gradient_phases[0]) / (gradient_phases[1] - gradient_phases[0])
//         end_outer.attr('offset', '0%');
//         end_inner.attr('offset', '0%');
//         start_inner.attr('offset', '0%');
//         start_outer.attr('offset', `${phasePercentage}%`);
//     } else if (between(singleShapeScrollPercentage, gradient_phases[1], gradient_phases[2])) {
//         end_outer.attr('offset', '0%');
//         end_inner.attr('offset', '0%');
//         start_inner.attr('offset', `${singleShapeScrollPercentage/gradient_phases[2]-2*gradient_phases[1]}%`);
//         start_outer.attr('offset', `${singleShapeScrollPercentage/gradient_phases[2]}%`);
//     } else if (between(singleShapeScrollPercentage, gradient_phases[2], gradient_phases[3])) {
//         end_outer.attr('offset', '0%');
//         end_inner.attr('offset', '0%');
//         start_inner.attr('offset', `${singleShapeScrollPercentage}%`);
//         start_outer.attr('offset', '100%');
//     }
}
// TODO make accesibility features so it's safer

//on ready
$(function() {
    scrollTotal = Math.floor($('#content').height()! * 6/7);
    setScrollHeight();
    setShapeRotation();
});

$(window).on('resize', function(event) {
    setScrollHeight();
    scrollTotal = Math.floor($('#content').height()! * 6/7);
});

var autoScrolling = false;
function gravitate() {
    const scrollTop = documentj.scrollTop()!;
    // const contentTops = $('.main-content-cell').toArray().map(function() {
    // });
    const mainContentCells = $('.main-content-cell');
    let contentTops = [];
    for (let i = 0; i < mainContentCells.length; i++) {
        contentTops.push(mainContentCells.eq(i).offset()!.top);
    }
    const distances = contentTops.map(function(value) {
        return Math.abs(scrollTop - value);
    });

    const minDistance = Math.min(...distances);
    const closestContentIndex = distances.indexOf(minDistance);
    autoScrolling = true;
    $('html, body').animate({scrollTop: contentTops[closestContentIndex] - $('#content-container').offset()!.top}, {complete: function() {
        autoScrolling = false;
    }});
}

function setScrollHeight() {
    const contentHeight = $('#content').height()!;
    const shapeHeight =  $('#shape-sticky').height()!;
    $('#shape-container-cell').height(contentHeight*6/7+shapeHeight);
}

var gravityTimeout: ReturnType<typeof setTimeout>;
documentj.on('scroll', function(event) {
    setShapeRotation();
    if (!autoScrolling && $('#shape-container-cell').css('display') !== 'none') {
        clearTimeout(gravityTimeout);
        gravityTimeout = setTimeout(gravitate, 1000);
    } else if ($('#shape-container-cell').css('display') !== 'none') {
        clearTimeout(gravityTimeout);
    }
});