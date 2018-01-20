
function initIndex(){
	resizeIndex();
}
function resizeIndex(){
	var logo = $("#logoHead1")[0];
	
	if(window.innerWidth < logo.naturalWidth)
		logo.style.width = (logo.naturalWidth / 2).toString() + "px";
	
	if(window.innerWidth >= logo.naturalWidth)
		logo.style.width = logo.naturalWidth.toString() + "px";
}

window.addEventListener("load", initIndex);
window.addEventListener("resize", resizeIndex);