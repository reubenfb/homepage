const sketch = (s) => {

	let height = 450;
	let width = height * 4/3;
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
	let faceExpression = 'neutral';
	let mouthAngles = [];
	let expressionValues = [0, 0, 0];
	let displaySize = { width: width, height: height };
	let positionBounds = [0,180];

	// open wide positions
	let perfectPositions = [90, 0, 90, 0, 135, 45, 135, 45];

	// obj that contains line commands
	let commands = {
		speeds: [],
		currentPositions: [0,0,0,0,0,0,0,0],
		goalPositions: []
	}

	// set initial random speeds and goal positions
	for(let i = 0; i < perfectPositions.length; i++){
		commands.speeds.push(getRandomInt(1, 9));
		commands.goalPositions.push(getRandomInt(0, 180));
		//commands.goalPositions = [0,0,0,0,0,0,0,0];
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

	// config for positioning and length of the lines

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

	s.setup = () => {

		p5Canvas = s.createCanvas(width, height*2);
		p5CanvasElement = p5Canvas.elt;
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		captureElement = capture.elt;
		captureElement.setAttribute('playsinline', '');
		capture.size(width, height);
		capture.hide();
		faceapi.matchDimensions(p5Canvas, displaySize);

		// line styling
		s.stroke(50)
		s.strokeWeight(3)

		s.frameRate(40);
		s.angleMode(s.DEGREES);
		loadModels();
		s.noLoop();

	};

	s.draw = async () => {

		s.clear();
		drawLoops++;

		// for performance, only re-detect face every 4 loops
		if(drawLoops % 4 == 0){
			faceapi.detectAllFaces(captureElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
				.then(result => detectFace(faceapi.resizeResults(result, displaySize)));
			drawLoops = 0;
		}

		// s.push();
		// //flip video
		// s.translate(width,0);
		// s.scale(-1, 1);
		// s.image(capture, 0, height, width, height);
		// s.pop();

		// CODE TO ACTUALLY MOVE THE LINES
		for (let i = 0; i < points.length; i++){

			// if mouth is open, interrupt movement and head to perfectPositions
			if(faceExpression === 'open'){
				commands.goalPositions[i] = perfectPositions[i];
			}

			// figure out if you need to increment up or down
			let direction = commands.goalPositions[i] > commands.currentPositions[i] ? 1 : -1;

			// move in that direction 
			commands.currentPositions[i] += (speedMap(commands.speeds[i]) * direction);

			// check to see if the next step would be in the same direction
			let newDirection = commands.goalPositions[i] > commands.currentPositions[i] ? 1 : -1;

			//if you've overshot, set currentPosition to goalPosition
			if(newDirection != direction){

				commands.currentPositions[i] = commands.goalPositions[i];

				// if you're not open mouthed, set a new goal and speed based on expression
				if(faceExpression !== 'open'){
					getNewCommands(faceExpression, i);
				}
			}

			// DRAW AND ROTATE LINES
			s.push();
			s.translate(points[i].x, points[i].y);
			s.rotate(commands.currentPositions[i]);

			let offsetX = sideCenters[i].x - points[i].x;
			let offsetY = sideCenters[i].y - points[i].y;
			let offset = Math.sqrt(Math.pow(offsetX,2) + Math.pow(offsetY,2));

			s.line(0, -points[i].len/2 - offset, 0, points[i].len/2 - offset);
			s.pop();

		};

		// if(faceResult){
		// 	s.circle(-(faceResult[51]._x - width), height + faceResult[51]._y,3)
		// 	s.circle(-(faceResult[48]._x - width), height + faceResult[48]._y,3)
		// 	s.circle(-(faceResult[54]._x - width), height + faceResult[54]._y,3)
		// }

	};

	function detectFace(result){

		if(result[0]){
			if(!faceResult){
				faceResult = result[0].landmarks.positions;
			}
			else {
				// smoothed recording of facial landmarks
				for(let i = 0; i < result[0].landmarks.positions.length; i++){
					faceResult[i]._x = smoothVal(faceResult[i]._x, result[0].landmarks.positions[i]._x, 0.2);
					faceResult[i]._y = smoothVal(faceResult[i]._y, result[0].landmarks.positions[i]._y, 0.2);
				}
			}

			// smoothed recording of happy/neutral/sad expressions
			expressionValues[0] = smoothVal(expressionValues[0], result[0].expressions.happy, 0.2);
			expressionValues[1] = smoothVal(expressionValues[1], result[0].expressions.neutral, 0.2);
			expressionValues[2] = smoothVal(expressionValues[2], result[0].expressions.sad, 0.2);

			// pull the most likely expressions
			faceExpression = getTopExpression(expressionValues);

			// calculcate the two mouth angles to see if open
			mouthAngles[0] = 180 - calculateAngle(faceResult[51], faceResult[48]);
			mouthAngles[1] = calculateAngle(faceResult[51], faceResult[54]);

			if(mouthAngles[0] > 30 && mouthAngles[1] > 30){
				faceExpression = 'open';
			}

		}
	}

	// load face-api models
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

	// generate new goals/speeds based on expressions
	function getNewCommands(expression, i){

		let newGoal;
		let newSpeed;

		if(expression === 'X'){
		}
		// if happy, do tight wiggles
		// if sad, do slow sweeping arcs
		// if neutral, do default 
		else {
			newGoal = getRandomInt(0, 180);
			newSpeed = getRandomInt(1, 9);
		}

		commands.goalPositions[i] = newGoal,
		commands.speeds[i] = newSpeed

	}

	// get top expression out of expressions array
	function getTopExpression(smoothedValues){

		let valuesArray = [
			{ expression: 'happy', value: smoothedValues[0] },
			{ expression: 'neutral', value: smoothedValues[1] },
			{ expression: 'sad', value: smoothedValues[2] }
		]

		let sortedArray = valuesArray.sort((a, b) => b.value - a.value);
		return sortedArray[0].expression;

	}

	// function to smooth value readings over time
	function smoothVal(oldVal, newVal, fade){
		return oldVal * fade + newVal * (1 - fade);
	}

	// generate a random integer given bounds
	function getRandomInt(low, high){
		return Math.round(s.random(low, high));
	}

	// map 1-9 speed values to actual increments
	function speedMap(speed){
		return s.map(speed, 1, 9, 0.8, 2);
	}

	// calculate angle between two points
	function calculateAngle(p1, p2){
		return Math.atan2(p2._y - p1._y, p2._x - p1._x) * 180 / Math.PI;
	}


};
let myp5 = new p5(sketch, document.querySelector('#canvas-container'));