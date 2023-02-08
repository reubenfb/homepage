const sketch = (s) => {

	let height = 450;
	let width = height * 4/3;
	let offset = 0;
	let vidWidth = width;
	const pixelDensity = 4;

	// p5.js canvas and it's HTML <canvas/> element
	let p5Canvas;
	let p5CanvasElement;
	// p5.js capture and it's HTML <video/> element
	let capture;
	let captureElement;
	// store dimenions formatted for faceapi
	// let displaySize;
	// let noseX = 0;
	// let noseY = 0;
	// let faceResult = null;

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

	// function loadModels(){
	//   Promise.all([
	//   	faceapi.nets.tinyFaceDetector.load('../miscFiles/face-api-files/'),
	//     //faceapi.nets.ssdMobilenetv1.load('../miscFiles/face-api-files/'),
	//     faceapi.nets.faceLandmark68Net.load('../miscFiles/face-api-files/')
	//   ])
	//   // noLoop() was called in setup, pausing draw() while we load, we resume here once models are loaded
	//   .then(()=>{
	//   	s.loop();
	//   })
	// }


	let perfectPositions = [90, 0, 90, 0, -45, 45, -45, 45];
	let currentPositions = [];
	let goalPositions = [];
	let goingHome = false;

	for(let i = 0; i < perfectPositions.length; i++){
		currentPositions.push(s.random(-90,90));
		goalPositions.push(s.random(-90,90));
	}


	document.getElementById('canvas-container').onclick = function() {
		console.log('fired')
        goalPositions = [...perfectPositions];
        goingHome = true;
    };

	s.setup = () => {

		p5Canvas = s.createCanvas(width, height*2);
		p5CanvasElement = p5Canvas.elt;
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		//captureElement = capture.elt;
		//captureElement.setAttribute('playsinline', '');
		//capture.size(width, height);
		capture.hide();
		//displaySize = { width: width, height: height };
		//faceapi.matchDimensions(p5Canvas, displaySize);

		//s.frameRate(10);
		s.angleMode(s.DEGREES);
		//loadModels();
		//s.noLoop();


	};

	let longLength = 200;
	let shortLength = 141;

	let sideCenters = [
		{'x': 300, 'y': 100},
		{'x': 400, 'y': 200},
		{'x': 300, 'y': 300},
		{'x': 200, 'y': 200},
		{'x': 350, 'y': 150},
		{'x': 350, 'y': 250},
		{'x': 250, 'y': 250},
		{'x': 250, 'y': 150}
	]

	let points = [
		{'x': 280, 'y': 100, 'len': longLength},
		{'x': 400, 'y': 150, 'len': longLength},
		{'x': 320, 'y': 300, 'len': longLength},
		{'x': 200, 'y': 220, 'len': longLength},
		{'x': 360, 'y': 160, 'len': shortLength},
		{'x': 330, 'y': 270, 'len': shortLength},
		{'x': 230, 'y': 230, 'len': shortLength},
		{'x': 260, 'y': 140, 'len': shortLength}
	]

	let speeds = new Array(points.length).fill(0.5);

	s.draw = async () => {

		s.clear();

		// faceapi.detectAllFaces(captureElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
		// 	.then(result => drawFace(faceapi.resizeResults(result, displaySize)))

		s.push();
		//flip video
		s.translate(width,0);
		s.scale(-1, 1);
		//s.tint(255,255 * 0.2)
		s.image(capture, offset, height, vidWidth, height);
		s.pop();

		for (let i = 0; i < points.length; i++){

			// figure out if you need to increment up or down
			let direction = goalPositions[i] > currentPositions[i] ? 1 : -1;

			// move in that direction 
			currentPositions[i] += (speeds[i] * direction);

			// check to see if the next step would be in the same direction
			let newDirection = goalPositions[i] > currentPositions[i] ? 1 : -1;

			// if you've overshot, set current to goal
			if(newDirection != direction){
				currentPositions[i] = goalPositions[i];

				// set a new goal and speed, unless you're going home
				if(!goingHome){
					speeds[i] = s.random(0.2, 0.7);
					goalPositions[i] = s.random(-90, 90);
				}
			}


			let point = points[i]
			s.push();
			s.translate(point.x, point.y);
			s.stroke(50)
			s.strokeWeight(3)
			s.fill(50)
			s.rotate(currentPositions[i])

			let offsetX = sideCenters[i].x - point.x;
			let offsetY = sideCenters[i].y - point.y;
			let offset = Math.sqrt(Math.pow(offsetX,2) + Math.pow(offsetY,2));

			let newOffset = offset;

			if(offsetY > 0){
				newOffset = -offset
			}

			if(offsetY == 0 && offsetX < 0){
				newOffset = -offset
			}

			s.line(0, -point.len/2 - newOffset, 0, point.len/2 - newOffset)
			//s.circle(0,0,3)
			s.pop();

		}

	};
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

		// if(increment > 15 + 15 * totalRecordings){

		// 	let box = result[0].alignedRect._box;
		// 	//let head = s.get(-(box._x - width) - box._width, box._y, box._width, box._height);
		// 	let head = capture.get(box._x, box._y, box._width, box._height);

		// 	heads[headNum] = {
		// 		eye1: {
		// 			_x: faceResult[39]._x,
		// 			_y: faceResult[39]._y
		// 		},
		// 		eye2: {
		// 			_x: faceResult[42]._x,
		// 			_y: faceResult[42]._y
		// 		},
		// 		translate: {
		// 			transX: (box._x + box._width/2) - faceResult[39]._x,
		// 			transY: (box._y + box._height/2) - faceResult[39]._y
		// 		},
		// 		image: head
		// 	};

		// 	totalRecordings++;
		// 	headNum++;

		// 	if(heads.length === maxHeads){
		// 		headNum = 0;
		// 	}

		// }
	}
}

function calculateAngle(p1, p2){
	return Math.atan2(p2._y - p1._y, p2._x - p1._x) * 180 / Math.PI;
}

function lengthOfLine(p1, p2){
	let a = p1._x - p2._x;
	let b = p1._y - p2._y;
	return Math.sqrt(a*a + b*b);
}
let myp5 = new p5(sketch, document.querySelector('#canvas-container'));