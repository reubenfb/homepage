let pointInPoly = require('./pointinpoly');
let additionalMouthsShown = 0;

const sketch = (s) => {

	let height = 450;
	let width = height * 4/3;
	let offset = 0;
	let vidWidth = width;
	const pixelDensity = 2;

	// p5.js canvas and it's HTML <canvas/> element
	let p5Canvas;
	let p5CanvasElement;
	// p5.js capture and it's HTML <video/> element
	let capture;
	let captureElement;
	// store dimenions formatted for faceapi
	let displaySize;
	let faceResult = null;
	let newImg;

	let fade = 0.2;
	let imageLoops = 100;

	let randoms = {
		x: [],
		y: [],
		scale: [],
		rotate: []
	}

	let radius = 100;

	for(let i = 0; i < imageLoops; i++){
		let point = randomPointInsideCircle(radius);
		randoms.x.push(point[0]);
		randoms.y.push(point[1]);
		randoms.scale.push(randomNumber(-0.1, 0.3))
		randoms.rotate.push(randomNumber(-10, 10))
	}

	// if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
	// 	vidWidth = height * 3/4;
	// 	offset = (width - vidWidth)/2;
	// 	document.querySelector('#canvas-container').style.transform = 'scale(1.5)';
	// }

	function loadModels(){
	  Promise.all([
	  	faceapi.nets.tinyFaceDetector.load('../miscFiles/face-api-files/'),
	    faceapi.nets.faceLandmark68Net.load('../miscFiles/face-api-files/')
	  ])
	  // noLoop() was called in setup, pausing draw() while we load, we resume here once models are loaded
	  .then(()=>{
	  	s.loop();
	  })
	}

	s.setup = () => {

		p5Canvas = s.createCanvas(width, height);
		newImg = s.createImage(width * pixelDensity, height * pixelDensity);
		p5CanvasElement = p5Canvas.elt;
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		captureElement = capture.elt;
		captureElement.setAttribute('playsinline', '');
		capture.size(width, height);
		capture.hide();
		displaySize = { width: width, height: height };
		faceapi.matchDimensions(p5Canvas, displaySize);

		s.frameRate(10);
		s.angleMode(s.DEGREES);
		s.textAlign(s.CENTER, s.CENTER);
		s.textSize(20)
		loadModels();
		s.noLoop();


	};

	s.draw = async () => {

		s.clear();

		s.background(250,250,250);
		s.text('Loading ...', width/2, height/2);

		faceapi.detectAllFaces(captureElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
			.then(result => drawFace(faceapi.resizeResults(result, displaySize)))

		if(faceResult){
			s.push();
			//flip video
			s.translate(width,0);
			s.scale(-1, 1);
			s.image(capture, offset, 0, vidWidth, height);
			s.pop();

			let mouth = generatePolygon(faceResult, [48,49,50,51,52,53,54,55,56,57,58,59], width);

			// s.beginShape();
			// for(pair of right){
			// 	s.vertex(pair[0], pair[1])
			// }
			// s.endShape(s.CLOSE);

			let mouthCenter = [-(faceResult[66]._x - width), faceResult[66]._y];

			s.loadPixels();
			let pixels = s.pixels;

			for(let i = 0; i < pixels.length; i+=4){
				let pixelIndex = i/(4 * pixelDensity);
				let x = pixelIndex % width;
				let y = Math.floor(pixelIndex/width)/pixelDensity;

				if(!pointInPoly.pointInPoly(x, y, mouth)){
					pixels[i+3] = 0;
				}

			}

			s.updatePixels();

			newImg.loadPixels();
			for(let i = 0; i < newImg.pixels.length; i++){
				newImg.pixels[i] = pixels[i];
			}

			newImg.updatePixels();

			s.imageMode(s.CENTER);
			for(let i = 0; i < additionalMouthsShown; i++){
				s.push();
				s.translate(randoms.x[i] + width - mouthCenter[0], randoms.y[i] + height - mouthCenter[1]);
				s.rotate(randoms.rotate[i]);
				s.scale(1/pixelDensity + randoms.scale[i]);
				s.image(newImg, 0, 0);
				s.pop();
			}
			s.imageMode(s.CORNER);
		}
	};

	function drawFace(result){

		if(result[0]){

			if(!faceResult){
				faceResult = result[0].landmarks.positions;
			}
			else {
				for(let i = 0; i < result[0].landmarks.positions.length; i++){
					let newResult = result[0].landmarks.positions[i];
					faceResult[i]._x = faceResult[i]._x * fade + newResult._x * (1 - fade);
					faceResult[i]._y = faceResult[i]._y * fade + newResult._y * (1 - fade);
				}
			}

		}
	}
};

// this function puts the polygons in the right format
// and also mirrors them like the webcam is mirrored
function generatePolygon(faceResult, facePoints, width){
	let finalPoly = [];

	for(point of facePoints){
		let newPair = [];
		newPair[0] = -(faceResult[point]._x - width);
		newPair[1] = faceResult[point]._y;
		finalPoly.push(newPair)
	}

	return finalPoly;
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function randomPointInsideCircle(radius){
	let r = radius * Math.sqrt(Math.random());
	let a = Math.random() * 2 * Math.PI;
	return [r * Math.cos(a), r * Math.sin(a)];
}

let button = document.getElementById('button');
button.addEventListener('click', () => {
	additionalMouthsShown++;
});

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));