var ctx, w, h, points, dt;

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
    var sum = {x: 0, y: 0};
    for (var i = 0; i <= n; i++) {
        let p = points[i];
        let b = choose(n, i) * Math.pow(t, i) * Math.pow(1-t, n-i);
        sum.x += p.x*b;
        sum.y += p.y*b;
    }
    return sum;
}

function draw() {
    ctx.beginPath();
    for (var t = 0; t <= 1; t += dt) {
        var next = s(t);
        ctx.lineTo(next.x, next.y);
    }
    ctx.stroke();
    for (var i = 0; i < points.length; i++) {
        let p = points[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2*Math.PI, false);
        ctx.fill();
    }
}

function init() {
    let cvs = document.getElementById("cvs");
    ctx = cvs.getContext("2d");
    w = cvs.width;
    h = cvs.height;
    points = [{x: 100, y: 100}, {x: 200, y: 100}, {x: 300, y: 300}, {x: 400, y: 200}];
    dt = 0.01;
    draw();
}
document.addEventListener("DOMContentLoaded", init, false);
