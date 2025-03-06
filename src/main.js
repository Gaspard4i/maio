const canvas = document.querySelector('.gameCanvas');
const context = canvas.getContext('2d');

context.moveTo(0, 0);
context.beginPath();
context.arc(300, 200, 10, 0, 2 * Math.PI);
context.fill();
context.stroke();
