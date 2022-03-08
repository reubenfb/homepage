var d3 = require("d3-selection");
var scale = require("d3-scale");

let text = "Itwasafterdinner.Youweretalkingtomeacrossthetableaboutsomethingorother,agreyhoundyouhadseenthatdayorasongyouliked,andIwaslookingpastyouoveryourbareshoulderatthethreeorangeslyingonthekitchencounternexttothesmallelectricbeangrinder,whichwasalsoorange,andtheorangeandwhitecruetsforvinegarandoil.Allofwhichconvergedintoarandomstilllife,sofastenedtogetherbythehaspofcolor,andsofixedbehindtheanimatedforegroundofyourtalkingandsmiling,gesturingandpouringwine,andthecamberofyourshouldersthatIcouldfeelitbeingpaintedwithinme,brushedonthewallofmyskull,whilethetoneofyourvoiceliftedandfellinitsflight,andthethreeorangesremainedfixedonthecounterthewaystarsaresaidtobefixedintheuniverse.Thenallthemomentsofthepastbegantolineupbehindthatmomentandallthemomentstocomeassembledinfrontofitinalongrow,givingmereasontobelievethatthiswasamomentIhadrescuedfromthemillionsthatrushoutofsightintoadarknessbehindtheeyes.EvenafterIhaveforgottenwhatyearitis,mymiddlename,andthemeaningofmoney,Iwillstillcarryinmypocketthesmallcoinofthatmoment,mintedinthekingdomthatwepacethrougheveryday."

let startX = 1;
let xPos = startX;
let yPos = 14;
let fontSize = 30;
let charWidth = fontSize * 0.5;
let lineHeight = fontSize * 0.75;

let poem = d3.select('.poem');

let weightScale = scale.scaleLinear()
	.domain([0, 1])
	.range([200, 900]);

for(let i = 0; i < text.length; i++){

  let div = poem.append('div').html(text.charAt(i));

  let weight = Math.round(weightScale(Math.random()));

  div.style('font-size', `${fontSize}px`);
  div.style('left', `${xPos}px`);
  div.style('top', `${yPos}px`);
  div.style('font-weight', weight);

  if((i + 1) % 40 == 0){
    xPos = startX;
    yPos = yPos + lineHeight;
  }
  else {
    xPos += charWidth;
  }
}