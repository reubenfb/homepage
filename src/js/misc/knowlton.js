var d3 = require("d3-selection");
var scale = require("d3-scale");

let text = "Itwasafterdinner.Youweretalkingtomeacrossthetableaboutsomethingorother,agreyhoundyouhadseenthatdayorasongyouliked,andIwaslookingpastyouoveryourbareshoulderatthethreeorangeslyingonthekitchencounternexttothesmallelectricbeangrinder,whichwasalsoorange,andtheorangeandwhitecruetsforvinegarandoil.Allofwhichconvergedintoarandomstilllife,sofastenedtogetherbythehaspofcolor,andsofixedbehindtheanimatedforegroundofyourtalkingandsmiling,gesturingandpouringwine,andthecamberofyourshouldersthatIcouldfeelitbeingpaintedwithinme,brushedonthewallofmyskull,whilethetoneofyourvoiceliftedandfellinitsflight,andthethreeorangesremainedfixedonthecounterthewaystarsaresaidtobefixedintheuniverse.Thenallthemomentsofthepastbegantolineupbehindthatmomentandallthemomentstocomeassembledinfrontofitinalongrow,givingmereasontobelievethatthiswasamomentIhadrescuedfromthemillionsthatrushoutofsightintoadarknessbehindtheeyes.EvenafterIhaveforgottenwhatyearitis,mymiddlename,andthemeaningofmoney,Iwillstillcarryinmypocketthesmallcoinofthatmoment,mintedinthekingdomthatwepacethrougheveryday.PoemByBillyCollins1998"

let startX = 1;
let xPos = startX;
let yPos = -5;
let fontSize = 20;
let charWidth = fontSize * 0.5;
let lineHeight = fontSize * 0.75;
let width = Math.round(fontSize/30*602);
let height = Math.round(fontSize/30*610);
let cols = 40;
let rows = text.length/cols;


let canvas = d3.select('#canvas').append('canvas')
	.attr('width', width)
	.attr('height', height);

let context = canvas.node().getContext('2d');

make_base();

function make_base() {
  base_image = new Image();
  base_image.src = 'images/brooke2.jpg';
  base_image.onload = function(){
  	let scaleX = width/base_image.width;
  	let scaleY = height/base_image.height;
    context.drawImage(base_image, 0, 0, base_image.width * scaleX, base_image.height * scaleY);


	let imgData = context.getImageData(0, 0, width, height);
	let data = imgData.data;

	// create an array of arrays to store our lum values
	let charValues = [];
	for(let i = 0; i<cols*rows; i++){
		let newArray = [];
		charValues.push(newArray);
	}

	// loop through the pixels
	for(let i = 0; i < data.length; i+=4){

		let r = data[i];
		let g = data[i+1];
		let b = data[i+2];

		// calculcate lum
		let lum = 0.299*r + 0.587*g + 0.114*b;

		// figure out which character the pixel falls into
		let pixel = i/4;
		let x = pixel % width;
		let y = Math.floor(pixel/width);

		let gridX = Math.floor(x/width*cols);
		let gridY = Math.floor(y/height*rows);
		let gridIndex = gridY * cols + gridX;

		charValues[gridIndex].push(lum);
	}

	let avgLum = charValues.map(function(pixelArray){
		return pixelArray.reduce((a, b) => a + b) / pixelArray.length;
	});

	let lumMin = Math.min(...avgLum);
	let lumMax = Math.max(...avgLum)

    // then actually draw the text
	let poem = d3.select('.poem')
		.style('width', `${width}px`)
		.style('height', `${height}px`);

	let weightScale = scale.scaleLinear()
		.domain([lumMin, lumMax])
		.range([200, 900]);

	let opacityScale = scale.scaleLinear()
		.domain([lumMin, lumMax])
		.range([0.25, 1]);

	for(let i = 0; i < text.length; i++){

	  let div = poem.append('div').html(text.charAt(i));

	  div.style('font-size', `${fontSize}px`);
	  div.style('left', `${xPos}px`);
	  div.style('top', `${yPos}px`);
	  div.style('font-weight', Math.round(weightScale(avgLum[i])));
	  div.style('opacity', opacityScale(avgLum[i]))

	  if((i + 1) % cols == 0){
	    xPos = startX;
	    yPos = yPos + lineHeight;
	  }
	  else {
	    xPos += charWidth;
	  }
	}

  }
}



