$(".chromosome").html(chromosome);
$(".best").append(best);

var label = document.querySelector(".label");
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cw = c.width = 900;
var ch = c.height = 450;
var cx = cw / 2,
  cy = ch / 2;
var rad = Math.PI / 180;
var frames = 0;

ctx.lineWidth = 1;
ctx.strokeStyle = "#000";
ctx.fillStyle = "#000";
ctx.font = "14px monospace";

var grd = ctx.createLinearGradient(0, 0, 0, cy);
grd.addColorStop(0, "hsla(167,7%,6%,1)");
grd.addColorStop(1, "hsla(167,72%,60%,0)");

var vData = 0.1;
var hData = valuesRy.length;
var offset = 50.5; //offset chart axis
var chartHeight = ch - 2 * offset;
var chartWidth = cw - 2 * offset;
var t = 1 / 7; // curvature : 0 = no curvature 
var speed = 2; // for the animation

var A = {
  x: offset,
  y: offset
}
var B = {
  x: offset,
  y: offset + chartHeight
}
var C = {
  x: offset + chartWidth,
  y: offset + chartHeight
}

ctx.beginPath();
ctx.moveTo(A.x, A.y);
ctx.lineTo(B.x, B.y);
ctx.lineTo(C.x, C.y);
ctx.stroke();
var aStep = (chartHeight - 290) / (vData);
var Max = Math.ceil(arrayMax(valuesRy) / 10) * 10;
var Min = Math.floor(arrayMin(valuesRy) / 10) * 10;
var aStepValue = (Max - Min) / (vData);
console.log("aStepValue: " + aStepValue); //8 units
var verticalUnit = aStep / aStepValue;

var a = [];
ctx.textAlign = "right";
ctx.textBaseline = "middle";
for (var i = 0; i <= vData; i++) {

  if (i == 0) {
    a[i] = {
      x: A.x,
      y: A.y + 25,
      val: Max
    }
  } else {
    a[i] = {}
    a[i].x = a[i - 1].x;
    a[i].y = a[i - 1].y + aStep;
    a[i].val = a[i - 1].val - aStepValue;
  }
  drawCoords(a[i], 3, 0);
}

var b = [];
ctx.textAlign = "center";
ctx.textBaseline = "hanging";
var bStep = chartWidth / (hData + 1);

for (var i = 0; i < hData; i++) {
  if (i == 0) {
    b[i] = {
      x: B.x + bStep,
      y: B.y,
      val: propsRy[0]
    };
  } else {
    b[i] = {}
    b[i].x = b[i - 1].x + bStep;
    b[i].y = b[i - 1].y;
    b[i].val = propsRy[i]
  }
  drawCoords(b[i], 0, 3)
}

function drawCoords(o, offX, offY) {
  ctx.beginPath();
  ctx.moveTo(o.x - offX, o.y - offY);
  ctx.lineTo(o.x + offX, o.y + offY);
  ctx.stroke();

  ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
}

var oDots = [];
var oFlat = [];
var i = 0;

for (var prop in valuesRy) {
  oDots[i] = {}
  oFlat[i] = {}

  oDots[i].x = b[i].x;
  oFlat[i].x = b[i].x;

  oDots[i].y = b[i].y - valuesRy[prop] * verticalUnit - 25;
  oFlat[i].y = b[i].y - 25;

  oDots[i].val = valuesRy[b[i].val];
  
  i++
}

function animateChart() {
  requestId = window.requestAnimationFrame(animateChart);
  frames += speed; //console.log(frames)
  ctx.clearRect(60, 0, cw, ch - 60);
  
  for (var i = 0; i < oFlat.length; i++) {
    if (oFlat[i].y > oDots[i].y) {
      oFlat[i].y -= speed;
    }
  }
  drawCurve(oFlat);
  for (var i = 0; i < oFlat.length; i++) {
    //   ctx.fillText(oDots[i].val, oFlat[i].x, oFlat[i].y - 25);
      ctx.beginPath();
      ctx.arc(oFlat[i].x, oFlat[i].y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

  if (frames >= Max * verticalUnit) {
    window.cancelAnimationFrame(requestId);
    
  }
}
requestId = window.requestAnimationFrame(animateChart);

c.addEventListener("mousemove", function(e) {
  label.innerHTML = "";
  label.style.display = "none";
  this.style.cursor = "default";

  var m = oMousePos(this, e);
  for (var i = 0; i < oDots.length; i++) {

    output(m, i);
  }

}, false);

function output(m, i) {
  ctx.beginPath();
  ctx.arc(oDots[i].x, oDots[i].y, 20, 0, 2 * Math.PI);
  if (ctx.isPointInPath(m.x, m.y)) {
    //console.log(i);
    label.style.display = "block";
    label.style.top = (m.y + 10) + "px";
    label.style.left = (m.x + 10) + "px";
    label.innerHTML = "<strong>" + propsRy[i] + "</strong>: " + valuesRy[i] ;
    c.style.cursor = "pointer";
  }
}

function controlPoints(p) {
  var pc = [];
  for (var i = 1; i < p.length - 1; i++) {
    var dx = p[i - 1].x - p[i + 1].x; // difference x
    var dy = p[i - 1].y - p[i + 1].y; // difference y
    // the first control point
    var x1 = p[i].x - dx * t;
    var y1 = p[i].y - dy * t;
    var o1 = {
      x: x1,
      y: y1
    };

    var x2 = p[i].x + dx * t;
    var y2 = p[i].y + dy * t;
    var o2 = {
      x: x2,
      y: y2
    };

    pc[i] = [];
    pc[i].push(o1);
    pc[i].push(o2);
  }
  return pc;
}

function drawCurve(p) {

  var pc = controlPoints(p); // the control points array

  ctx.beginPath();
  ctx.lineTo(p[0].x, p[0].y);
  ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);

  if (p.length > 2) {
    for (var i = 1; i < p.length - 2; i++) {
      ctx.bezierCurveTo(pc[i][0].x, pc[i][0].y, pc[i + 1][1].x, pc[i + 1][1].y, p[i + 1].x, p[i + 1].y);
    }
    var n = p.length - 1;
    ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
  }

  ctx.stroke();
  ctx.save();
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
}

function arrayMax(array) {
  return Math.max.apply(Math, array);
};

function arrayMin(array) {
  return Math.min.apply(Math, array);
};

function oMousePos(canvas, evt) {
  var ClientRect = canvas.getBoundingClientRect();
  return { //objeto
    x: Math.round(evt.clientX - ClientRect.left),
    y: Math.round(evt.clientY - ClientRect.top)
  }
}

var colors = new Array(
    [62, 35, 255],
    [60, 255, 60],
    [255, 35, 98],
    [45, 175, 230],
    [255, 0, 255],
    [255, 128, 0]
);

var step = 0;
var colorIndices = [0, 1, 2, 3];

var gradientSpeed = 0.002;

function updateGradient() {
  if ($ === undefined) return;

  var c0_0 = colors[colorIndices[0]];
  var c0_1 = colors[colorIndices[1]];
  var c1_0 = colors[colorIndices[2]];
  var c1_1 = colors[colorIndices[3]];

  var istep = 1 - step;
  var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
  var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
  var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
  var color1 = "rgb(" + r1 + "," + g1 + "," + b1 + ")";

  var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
  var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
  var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
  var color2 = "rgb(" + r2 + "," + g2 + "," + b2 + ")";

  $(".gradient")
    .css({
      background:
        "-webkit-gradient(linear, left top, right top, from(" +
        color1 +
        "), to(" +
        color2 +
        "))",
    })
    .css({
      background:
        "-moz-linear-gradient(left, " + color1 + " 0%, " + color2 + " 100%)",
    })
    .css({
      opacity: "80%",
    });

  step += gradientSpeed;
  if (step >= 1) {
    step %= 1;
    colorIndices[0] = colorIndices[1];
    colorIndices[2] = colorIndices[3];
    colorIndices[1] =
      (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) %
      colors.length;
    colorIndices[3] =
      (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) %
      colors.length;
  }
}

setInterval(updateGradient, 10);
