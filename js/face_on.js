(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const sketch = (s) => {

	let height = 450;
	let width = height * 4/3;
	let offset = 0;
	let vidWidth = width;
	const pixelDensity = 1;

	// p5.js canvas and it's HTML <canvas/> element
	let p5Canvas;
	let p5CanvasElement;
	// p5.js capture and it's HTML <video/> element
	let capture;
	let captureElement;
	// store dimenions formatted for faceapi
	let displaySize;
	let noseX = 0;
	let noseY = 0;
	let faceResult = null;

	let fade = 0.2;
	let increment = 0;
	let heads = [];
	let maxHeads = 8;
	let headNum = 0;
	let totalRecordings = 0;
	let pixelSet = [];

	// if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
	// 	vidWidth = height * 3/4;
	// 	offset = (width - vidWidth)/2;
	// 	document.querySelector('#canvas-container').style.transform = 'scale(1.5)';
	// }

	function loadModels(){
	  Promise.all([
	  	faceapi.nets.tinyFaceDetector.load('../miscFiles/face-api-files/'),
	    //faceapi.nets.ssdMobilenetv1.load('../miscFiles/face-api-files/'),
	    faceapi.nets.faceLandmark68Net.load('../miscFiles/face-api-files/')
	  ])
	  // noLoop() was called in setup, pausing draw() while we load, we resume here once models are loaded
	  .then(()=>{
	  	s.loop();
	  })
	}

	s.setup = () => {

		p5Canvas = s.createCanvas(width, height);
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
		loadModels();
		s.noLoop();


	};

	s.draw = async () => {

		s.clear();

		faceapi.detectAllFaces(captureElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
		//faceapi.detectAllFaces(captureElement).withFaceLandmarks()
			.then(result => drawFace(faceapi.resizeResults(result, displaySize)))

		s.push();
		//flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.tint(255,255 * 0.2)
		s.image(capture, offset, 0, vidWidth, height);
		s.pop();
		increment++;
			
		if(heads.length > 0){

			for(let i = 0; i < heads.length; i++){

				// s.loadPixels();
				// pixelSet[i] = [...s.pixels];

				let angle = calculateAngle(heads[i].eye1, heads[i].eye2) - calculateAngle(faceResult[39], faceResult[42])
				let scale = lengthOfLine(faceResult[39], faceResult[42])/lengthOfLine(heads[i].eye1, heads[i].eye2)
				s.push();
				s.translate(-(faceResult[39]._x - width), faceResult[39]._y);
				s.rotate(angle);
				s.scale(-scale, scale);
				s.tint(255,255*0.2);
				s.blendMode(s.SOFT_LIGHT)
				s.imageMode(s.CENTER);
				s.image(heads[i].image, heads[i].translate.transX, heads[i].translate.transY);
				s.pop();

			}


			//s.loadPixels();

			// for(let i = 0; i < s.pixels.length; i++){
			// 	let newValue = s.pixels[i];
			// 	for(let j = 0; j < pixelSet.length; j++){
			// 		newValue += pixelSet[j][i];
			// 	}
			// 	s.pixels[i] = newValue/(pixelSet.length + 1)
				
			// }

			// s.updatePixels();

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

			if(increment > 15 + 15 * totalRecordings){

				let box = result[0].alignedRect._box;
				//let head = s.get(-(box._x - width) - box._width, box._y, box._width, box._height);
				let head = capture.get(box._x, box._y, box._width, box._height);

				heads[headNum] = {
					eye1: {
						_x: faceResult[39]._x,
						_y: faceResult[39]._y
					},
					eye2: {
						_x: faceResult[42]._x,
						_y: faceResult[42]._y
					},
					translate: {
						transX: (box._x + box._width/2) - faceResult[39]._x,
						transY: (box._y + box._height/2) - faceResult[39]._y
					},
					image: head
				};

				totalRecordings++;
				headNum++;

				if(heads.length === maxHeads){
					headNum = 0;
				}

			}
		}
	}
};

function calculateAngle(p1, p2){
	return Math.atan2(p2._y - p1._y, p2._x - p1._x) * 180 / Math.PI;
}

function lengthOfLine(p1, p2){
	let a = p1._x - p2._x;
	let b = p1._y - p2._y;
	return Math.sqrt(a*a + b*b);
}
let myp5 = new p5(sketch, document.querySelector('#canvas-container'));
},{}]},{},[1]);
