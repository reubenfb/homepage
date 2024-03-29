let started = true;

// obj that contains line commands
let commands = {
	speeds: [],
	currentPositions: [0,0,0,0,0,0,0,0],
	goalPositions: [],
	wiggleAngle: [0,0,0,0,0,0,0,0],
	happyWiggleDirection: [0,0,0,0,0,0,0,0],
	sadArcDirection: [0,0,0,0,0,0,0,0]
}

// event handler to trigger serial communication
// document.querySelector('h1').addEventListener('click', async () => {
// 	started = true;
// 	const port = await navigator.serial.requestPort();
// 	await port.open({ baudRate: 115200 });

// 	const textEncoder = new TextEncoderStream();
// 	const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
// 	const writer = textEncoder.writable.getWriter();

// 	setInterval(sendMessage, 10);

// 	async function sendMessage(){
// 		let message = stitchMessage(1);
// 		await writer.write(message);
// 		console.log(message);
// 	}

// });

const sketch = (s) => {

	let height = 480;
	let width = height * 4/3;
	let vidWidth = width;
	const pixelDensity = 2;

	let webcamHeight = 120;
	let webcamWidth = webcamHeight * 4/3;

	if(webcamWidth % 1 !== 0){
		console.error('Bad webcam aspect ratio')
	}

	if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
		vidWidth = height * 3/4;
		webcamWidth = webcamHeight * 3/4;
		document.querySelector('#canvas-container').style.transform = 'scale(1.5)';
	}

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

	// set initial random speeds and goal positions
	for(let i = 0; i < perfectPositions.length; i++){
		commands.speeds.push(getRandomInt(1, 9));
		commands.goalPositions.push(getRandomInt(0, 180));
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
	let longLength = 200 - 14;
	let shortLength = 141 - 14;

	let sideCenters = [
		{'x': 300, 'y': 140},
		{'x': 400, 'y': 240},
		{'x': 300, 'y': 340},
		{'x': 200, 'y': 240},
		{'x': 350, 'y': 190},
		{'x': 350, 'y': 290},
		{'x': 250, 'y': 290},
		{'x': 250, 'y': 190}
	]

	let points = [
		{'x': 265, 'y': 140, 'len': longLength},
		{'x': 400, 'y': 240, 'len': longLength},
		{'x': 260, 'y': 340, 'len': longLength},
		{'x': 200, 'y': 290, 'len': longLength},
		{'x': 340, 'y': 180, 'len': shortLength},
		{'x': 330, 'y': 310, 'len': shortLength},
		{'x': 220, 'y': 260, 'len': shortLength},
		{'x': 235, 'y': 205, 'len': shortLength}
	]

	s.setup = () => {

		p5Canvas = s.createCanvas(width, height);
		p5CanvasElement = p5Canvas.elt;
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		captureElement = capture.elt;
		captureElement.setAttribute('playsinline', '');
		capture.size(vidWidth, height);
		capture.hide();
		faceapi.matchDimensions(p5Canvas, displaySize);

		s.frameRate(40);
		s.angleMode(s.DEGREES);
		s.textSize(14);
		s.textFont('Courier New');
		s.strokeCap(s.SQUARE);
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

		// add webcam
		s.push();
		//flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, width - webcamWidth, height - webcamHeight, webcamWidth, webcamHeight);
		s.pop();

		// draw mood above webcam
		if(faceResult){
			s.noStroke();
			s.textAlign(s.CENTER);
			s.text(faceExpression.toUpperCase(), webcamWidth/2, height - webcamHeight - 5);
		}

		// CODE TO ACTUALLY MOVE THE LINES
		s.stroke(50)
		s.strokeWeight(3)

		for (let i = 0; i < points.length; i++){

			// only start moving if facial recognition is working, and the button has been clicked
			if(faceResult && started){
				// if mouth is open, interrupt movement and head to perfectPositions
				if(faceExpression === 'open'){
					commands.happyWiggleDirection[i] = 0;
					commands.sadArcDirection[i] = 0;
					commands.goalPositions[i] = perfectPositions[i];
					commands.speeds[i] = getRandomInt(3,7);
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

			// add a bunch of bad vibe variables together for sad
			let sad = result[0].expressions.sad +
					  result[0].expressions.fearful +
					  result[0].expressions.angry +
					  result[0].expressions.disgusted;

			// smoothed recording of happy/neutral/sad expressions
			expressionValues[0] = smoothVal(expressionValues[0], result[0].expressions.happy, 0.2);
			expressionValues[1] = smoothVal(expressionValues[1], result[0].expressions.neutral, 0.2);
			expressionValues[2] = smoothVal(expressionValues[2], sad, 0.2);

			// pull the most likely expressions
			faceExpression = getTopExpression(expressionValues);

			// calculcate the two mouth angles to see if open
			mouthAngles[0] = 180 - calculateAngle(faceResult[51], faceResult[48]);
			mouthAngles[1] = calculateAngle(faceResult[51], faceResult[54]);

			if(mouthAngles[0] > 30 && mouthAngles[1] > 30){
				faceExpression = 'open';
			}

		}
		else {
			// if no face detected, set expression back to neutral
			faceExpression = 'neutral';
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

		// tight, fast wiggles if happy
		if(expression === 'happy'){

			commands.sadArcDirection[i] = 0;
			newSpeed = getRandomInt(7, 9);

			// if just arriving at happy, set a random wiggle
			if(commands.happyWiggleDirection[i] === 0){
				commands.wiggleAngle[i] = getRandomInt(15, 35);
				newGoal = getRandomInt(75, 105);
				commands.happyWiggleDirection[i] = Math.random() < 0.5 ? -1 : 1;
			}
			// otherwise, oscillate the wiggle angle
			else {
				newGoal = commands.currentPositions[i] + (commands.wiggleAngle[i] * commands.happyWiggleDirection[i]);
				commands.happyWiggleDirection[i] = -commands.happyWiggleDirection[i];
			}
		}
		// slow, big arcs if sad
		else if(expression === 'sad'){

			commands.happyWiggleDirection[i] = 0;
			newSpeed = getRandomInt(1, 2);
			
			// if just arriving at sad, set a random big arc
			if(commands.sadArcDirection[i] === 0){
				commands.wiggleAngle[i] = getRandomInt(150, 180);
				commands.sadArcDirection[i] = Math.random() < 0.5 ? -1 : 1;
				// pick an edge to start on based on which direction the first arc will go
				newGoal = commands.sadArcDirection[i] > 0 ? 
					getRandomInt(0, 180 - commands.wiggleAngle[i]) :
					getRandomInt(commands.wiggleAngle[i], 180);

			}
			// otherwise, oscillate the arc
			else {
				newGoal = commands.currentPositions[i] + (commands.wiggleAngle[i] * commands.sadArcDirection[i]);
				commands.sadArcDirection[i] = -commands.sadArcDirection[i];
			}

		}
		// if neutral, do default 
		else {
			commands.happyWiggleDirection[i] = 0;
			commands.sadArcDirection[i] = 0;
			newGoal = getRandomInt(20, 160);
			newSpeed = getRandomInt(3, 7);
		}

		commands.goalPositions[i] = newGoal;
		commands.speeds[i] = newSpeed;

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
	function getRandomInt(min, max){
		// make it inclusive of max as well
		max = max + 1;
		return Math.floor(Math.random() * (max - min)) + min;
	}

	// map 1-9 speed values to actual increments
	function speedMap(speed){
		return s.map(speed, 1, 9, 0.6, 5.4);
	}

	// calculate angle between two points
	function calculateAngle(p1, p2){
		return Math.atan2(p2._y - p1._y, p2._x - p1._x) * 180 / Math.PI;
	}

};

// stitch together commands for serial communication
// this one is initialized outside of sketch
function stitchMessage(servos){
	let string = '';

	for(let i = 0; i < servos; i++){
		string += commands.goalPositions[i] + ',';
		string += commands.speeds[i];
		if(i !== (servos - 1)){
			string += ',';
		}
		else {
			string += '\n';
		}
	}
	return string;
}

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));