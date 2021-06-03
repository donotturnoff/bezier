var ctx, w, h, points, dt, down, selected;

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
    ctx.lineWidth = 4;
    var prev = s(0);
    for (var t = 0; t <= 1+dt; t += dt) {
        var point = s(t);
        ctx.strokeStyle = "rgb(" + point.r + ", " + point.g + ", " + point.b + ")";
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        prev = point;
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

    ctx.clearRect(0, 0, w, h);
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

    if (down) {
        selected.x = x;
        selected.y = y;
    }
}

function mouseDown(e) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top;  //y position within the element.

    down = true;

    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var dx = x - p.x;
        var dy = y - p.y;
        var d = dx*dx + dy*dy;
        if (d <= 100) {
            selected = p;
            break;
        }
    }
}

function mouseUp(e) {
    down = false;
}

function click(e) {

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

    points = [{x: 100, y: 100, r: 255, g: 0, b: 0}, {x: 200, y: 100, r: 128, g: 255, b: 0}, {x: 300, y: 300, r: 0, g: 255, b: 128}, {x: 100, y: 400, r: 0, g: 0, b: 255}];
    dt = 0.02;
    down = false;

    draw();
}
document.addEventListener("DOMContentLoaded", init, false);
