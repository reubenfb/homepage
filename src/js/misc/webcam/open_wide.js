const sketch = (s) => {

	let height = 450;
	let width = height * 4/3;
	let offset = 0;
	let vidWidth = width;
	const pixelDensity = 2;

	// count the loops so we don't detect faces constantly
	let drawLoops = 0;

	// p5.js canvas and it's HTML <canvas/> element
	let p5Canvas;
	let p5CanvasElement;
	// p5.js capture and it's HTML <video/> element
	let capture;
	let captureElement;

	// storage variables for faceapi
	let faceResult = null;
	let expressionResult;
	let mouthAngles = [];
	let expressionValues = [0, 0, 0];
	let displaySize;
	let fade = 0.2;
	let positionBounds = [0,180];

	function loadModels(){
	  Promise.all([
	  	faceapi.nets.tinyFaceDetector.load('../miscFiles/face-api-files/'),
	    faceapi.nets.faceLandmark68Net.load('../miscFiles/face-api-files/'),
	    faceapi.nets.faceExpressionNet.load('../miscFiles/face-api-files/')
	  ])
	  // noLoop() was called in setup, pausing draw() while we load, we resume here once models are loaded
	  .then(()=>{
	  	s.loop();
	  })
	}

	let perfectPositions = [90, 0, 90, 0, 135, 45, 135, 45];
	let currentPositions = [0,0,0,0,0,0,0,0];
	let speeds = [];
	let goalPositions = [];

	for(let i = 0; i < perfectPositions.length; i++){
		goalPositions.push(getRandomAngle());
		//goalPositions = [0,0,0,0,0,0,0,0];
		speeds.push(getRandomSpeed());
	}


// STACK ORDER (bottom to top)
// 5, 1, 6, 3, 8, 2, 7, 4

// 1 goes on top of 5
// 2 goes on top of 5, 6 
// 3 goes on top of 6
// 4 goes on top of 3, 6, 7, 8
// 5 all clear
// 6 all clear
// 7 goes on top of 3, 8
// 8 goes on top of 1

	let longLength = 200 - 16;
	let shortLength = 141 - 16;

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
		{'x': 265, 'y': 100, 'len': longLength},
		{'x': 400, 'y': 200, 'len': longLength},
		{'x': 260, 'y': 300, 'len': longLength},
		{'x': 200, 'y': 250, 'len': longLength},
		{'x': 340, 'y': 140, 'len': shortLength},
		{'x': 330, 'y': 270, 'len': shortLength},
		{'x': 220, 'y': 220, 'len': shortLength},
		{'x': 235, 'y': 165, 'len': shortLength}
	]

	// document.getElementById('canvas-container').onclick = function() {
	// 	console.log('fired')
    //     goalPositions = [...perfectPositions];
    //     goingHome = goingHome ? false : true;
    // };

	s.setup = () => {

		p5Canvas = s.createCanvas(width, height*2);
		p5CanvasElement = p5Canvas.elt;
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		captureElement = capture.elt;
		captureElement.setAttribute('playsinline', '');
		capture.size(width, height);
		capture.hide();
		displaySize = { width: width, height: height };
		faceapi.matchDimensions(p5Canvas, displaySize);

		s.frameRate(40);
		s.angleMode(s.DEGREES);
		loadModels();
		s.noLoop();


	};

	s.draw = async () => {

		s.clear();
		s.background(255);
		drawLoops++;

		// for performance, only redect face every 4 frames
		if(drawLoops % 4 == 0){
			faceapi.detectAllFaces(captureElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
				.then(result => detectFace(faceapi.resizeResults(result, displaySize)));

			drawLoops = 0;
		}

		s.push();
		//flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, offset, height, vidWidth, height);
		s.pop();

		for (let i = 0; i < points.length; i++){

			// figure out if you need to increment up or down
			let direction = goalPositions[i] > currentPositions[i] ? 1 : -1;

			// move in that direction 
			currentPositions[i] += (speedMap(speeds[i]) * direction);

			// check to see if the next step would be in the same direction
			let newDirection = goalPositions[i] > currentPositions[i] ? 1 : -1;

			// if you've overshot, set current to goal
			if(newDirection != direction){
				currentPositions[i] = goalPositions[i];

				speeds[i] = getRandomSpeed();
				// set a new goal based on expression
				if(faceExpression !== 'open'){
					goalPositions[i] = getRandomAngle();
				}
				else {
					goalPositions = [...perfectPositions];
				}
			}

			// console.log(goalPositions)
			// console.log(speeds)

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

			s.line(0, -point.len/2 - offset, 0, point.len/2 - offset)
			s.pop();

		};

		if(faceResult){
			s.circle(-(faceResult[51]._x - width), height + faceResult[51]._y,3)
			s.circle(-(faceResult[48]._x - width), height + faceResult[48]._y,3)
			s.circle(-(faceResult[54]._x - width), height + faceResult[54]._y,3)
		}

	};

	function detectFace(result){

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

		//fade expressionValues
		expressionValues[0] = expressionValues[0] * fade + result[0].expressions.happy * (1 - fade);
		expressionValues[1] = expressionValues[1] * fade + result[0].expressions.neutral * (1 - fade);
		expressionValues[2] = expressionValues[2] * fade + result[0].expressions.sad * (1 - fade);

		faceExpression = getTopExpression(expressionValues);
		mouthAngles[0] = 180 - calculateAngle(faceResult[51], faceResult[48]);
		mouthAngles[1] = calculateAngle(faceResult[51], faceResult[54]);

		if(mouthAngles[0] > 30 && mouthAngles[1] > 30){
			faceExpression = 'open';
		}
		console.log(faceExpression, mouthAngles);


		}
	}

	function getTopExpression(smoothedValues){

		let valuesArray = [
			{ expression: 'happy', value: smoothedValues[0] },
			{ expression: 'neutral', value: smoothedValues[1] },
			{ expression: 'sad', value: smoothedValues[2] }
		]

		let sortedArray = valuesArray.sort((a, b) => b.value - a.value);
		return sortedArray[0].expression;

	}


	function getRandomAngle(){
		return Math.round(s.random(positionBounds[0],positionBounds[1]));
	}

	function getRandomSpeed(){
		return Math.round(s.random(0.1, 0.5));
	}

	function speedMap(speed){
		return s.map(speed, 1, 9, 0.5, 1.5);
	}

	function calculateAngle(p1, p2){
		return Math.atan2(p2._y - p1._y, p2._x - p1._x) * 180 / Math.PI;
	}

	function lengthOfLine(p1, p2){
		let a = p1._x - p2._x;
		let b = p1._y - p2._y;
		return Math.sqrt(a*a + b*b);
	}

};
let myp5 = new p5(sketch, document.querySelector('#canvas-container'));