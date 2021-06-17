var cvs, ctx, w, h, points, segments, selected, curve, picker, pickerOpen, mode;

function componentToHex(c) {
    c = parseInt(c);
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function fact(n) {
    var f = 1;
    for (var i = 2; i <= n; i++) {
        f *= i;
    }
    return f;
}

function choose(n, r) {
    return fact(n)/(fact(r) * fact(n-r));
}

function s(t) {
    let n = points.length-1;
    var point = {x: 0, y: 0, r: 0, g: 0, b: 0};
    for (var i = 0; i <= n; i++) {
        let p = points[i];
        let b = choose(n, i) * Math.pow(t, i) * Math.pow(1-t, n-i);
        point.x += p.x*b;
        point.y += p.y*b;
        point.r += p.r*b;
        point.g += p.g*b;
        point.b += p.b*b;
    }
    return point;
}

function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 4;
    var prev = s(0);
    for (var i = 0; i <= segments; i++) {
        var t = i/segments;
        var p = s(t);
        curve[i] = p;
        ctx.strokeStyle = "rgb(" + p.r + ", " + p.g + ", " + p.b + ")";
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        prev = p;
    }
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 2;
    for (var i = 0; i < points.length; i++) {
        let p = points[i];
        ctx.fillStyle = "rgb(" + p.r + ", " + p.g + ", " + p.b + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2*Math.PI, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2*Math.PI, false);
        ctx.stroke();
    }
}

function mouseMove(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    document.body.style.cursor = "default";

    draw();

    let p = findPoint(x, y);
    if (p != null) {
        document.body.style.cursor = "pointer";
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, 2*Math.PI, false);
        ctx.stroke();
    }

    if (selected !== null && mode != "pick") {
        mode = "move";
        selected.x = x;
        selected.y = y;
    }
}

function mouseDown(e) {
    let prevSelected = selected;
    closePicker(null);

    if (mode == "pick") {
        return;
    }

    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    selected = findPoint(x, y);
    if (selected !== null) {
        return;
    }

    if (prevSelected === null && !e.shiftKey) {
        let t = getClosestParam(x, y);
        if (t >= 0) {
            createPoint(x, y, t);
        }
    }

    draw();

}

function mouseUp(e) {
    if (mode == "move" || mode == "create") {
        mode = null;
        selected = null;
    } else {
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.

        let p = findPoint(x, y);
        if (p !== null) {
            if (e.shiftKey) {
                deletePoint(p);
            } else {
                openPicker(e, p);
            }
        }
    }
}

function createPoint(x, y, t) {
    mode = "create";
    let index = (t > 0) ? (t * (points.length-1) + 1) : 0;
    let p = s(t);
    selected = {x: x, y: y, r: p.r, g: p.g, b: p.b};
    points.splice(index, 0, selected);
    segments = points.length * 20;
}

function findPoint(x, y) {
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var dx = x - p.x;
        var dy = y - p.y;
        var d = dx*dx + dy*dy;
        if (d <= 100) {
            return p;
        }
    }
    return null;
}

function deletePoint(p) {
    const index = points.indexOf(p);
    if (index > -1) {
        points.splice(index, 1);
        draw();
    }
    closePicker(null);
}

function getClosestParam(x, y) {
    var closest = -1;
    var min = Infinity;
    for (var i = 0; i <= segments; i++) {
        var c = curve[i];
        var dx = x - c.x;
        var dy = y - c.y;
        var d = dx*dx + dy*dy;
        if (d < min) {
            min = d;
            closest = i;
        }
    }
    return closest/segments;
}

function openPicker(e, p) {
    mode = "pick";
    picker.style.visibility = "visible";
    picker.value = rgbToHex(p.r, p.g, p.b);
    picker.style.top = (e.clientY+10) + "px";
    picker.style.left = (e.clientX+10) + "px";
}

function closePicker(e) {
    picker.style.visibility = "hidden";
    mode = null;
    selected = null;
}

function updateColour(e) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e.target.value);
    selected.r = parseInt(result[1], 16);
    selected.g = parseInt(result[2], 16);
    selected.b = parseInt(result[3], 16);
}

function resize() {
    w = cvs.offsetWidth;
    h = cvs.offsetHeight;

    cvs.width = w;
    cvs.height = h;

    draw();
}

function init() {
    cvs = document.getElementById("cvs");
    picker = document.getElementById("picker");

    ctx = cvs.getContext("2d");
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    points = [{x: 100, y: 100, r: 255, g: 0, b: 0}, {x: 200, y: 100, r: 255, g: 200, b: 0}, {x: 300, y: 200, r: 255, g: 242, b: 0}, {x: 100, y: 200, r: 13, g: 183, b: 0}, {x: 100, y: 300, r: 0, g: 123, b: 255}, {x: 300, y: 300, r: 187, g: 0, b: 255}];
    shiftPressed = false;
    selected = null;
    curve = [];
    segments = points.length * 20;
    mode = null;

    window.addEventListener("resize", resize);
    cvs.addEventListener("mousemove", mouseMove);
    cvs.addEventListener("mousedown", mouseDown);
    cvs.addEventListener("mouseup", mouseUp);
    picker.addEventListener("input", updateColour);
    picker.addEventListener("change", closePicker);

    resize();
    draw();
}
document.addEventListener("DOMContentLoaded", init, false);
