var ctx, w, h, points, segments, selected, curve;

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
    ctx.fillStyle = "#666666";
    for (var i = 0; i < points.length; i++) {
        let p = points[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2*Math.PI, false);
        ctx.fill();
    }
}

function mouseMove(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    document.body.style.cursor = "default";

    draw();

    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var dx = x - p.x;
        var dy = y - p.y;
        var d = dx*dx + dy*dy;
        if (d <= 100) {
            document.body.style.cursor = "pointer";
            ctx.strokeStyle = "#666666";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, 2*Math.PI, false);
            ctx.stroke();
            break;
        }
    }

    if (selected !== null) {
        selected.x = x;
        selected.y = y;
    }
}

function mouseDown(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var dx = x - p.x;
        var dy = y - p.y;
        var d = dx*dx + dy*dy;
        if (d <= 100) {
            selected = p;
            return;
        }
    }

    if (!e.shiftKey) {
        var closest = null;
        var min = Infinity;
        var pos = 0;
        for (var i = 0; i <= segments; i++) {
            var c = curve[i];
            var dx = x - c.x;
            var dy = y - c.y;
            var d = dx*dx + dy*dy;
            if (d < min) {
                min = d;
                closest = c;
                pos = i/segments*points.length;
            }
        }

        if (closest !== null) {
            selected = {x: x, y: y, r: 102, g: 102, b: 102};
            points.splice(pos, 0, selected);
        }
    }

    draw();

}

function mouseUp(e) {
    selected = null;
}

function click(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var dx = x - p.x;
        var dy = y - p.y;
        var d = dx*dx + dy*dy;
        if (d <= 100) {
            if (e.shiftKey) {
                // Remove point from array
                const index = points.indexOf(p);
                if (index > -1) {
                    points.splice(index, 1);
                    draw();
                }
            }
            break;
        }
    }
}

function init() {
    let cvs = document.getElementById("cvs");
    w = cvs.width;
    h = cvs.height;
    cvs.onmousemove = mouseMove;
    cvs.onmousedown = mouseDown;
    cvs.onmouseup = mouseUp;
    cvs.onclick = click;

    ctx = cvs.getContext("2d");
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    points = [{x: 100, y: 100, r: 255, g: 0, b: 0}, {x: 200, y: 100, r: 128, g: 255, b: 0}];
    shiftPressed = false;
    selected = null;
    curve = [];
    segments = 50;

    draw();
}
document.addEventListener("DOMContentLoaded", init, false);
