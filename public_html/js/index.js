var BGComp_reziseTimeout;
var BGHeightComp = 300;

function initBGHeight(){
	var bgLayers = $(".parallaxLayer");
	var blockContainers = $(".blockContainer");
	var cHeight = 0;
	
	for (var i = blockContainers.length - 1; i >= 0; i--)
		cHeight += blockContainers[i].clientHeight;
	cHeight += BGHeightComp;
	
	if($(document).height() > cHeight)
		cHeight = $(document).height();
	
	for(var i = bgLayers.length - 1; i >= 0; i--)
		bgLayers[i].style.height = cHeight.toString() + "px";
	
	console.log("BG height set: " + cHeight.toString());
}
function BGComp_resize(){
	clearTimeout(BGComp_reziseTimeout);
	BGComp_reziseTimeout = setTimeout(initBGHeight, 200);
}

window.addEventListener("load", initBGHeight);
window.addEventListener("resize", BGComp_resize);