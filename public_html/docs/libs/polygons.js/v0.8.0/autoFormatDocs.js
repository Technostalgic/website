var pageVar = "docs";

function getDocData(){
	return getLibDocContainer().contentDocument.body.innerText;
}
function getLibDocContainer(){
	return document.getElementById("libDocs");
}

function formatDocContent(e){
	var docsDoc = getLibDocContainer();
	var data = docsDoc.contentDocument.body.innerText;
	docsDoc.contentDocument.body.innerHTML = "";
	
	var bod = formatDocs(data);
	
	var docStyle = document.createElement("link");
	docStyle.setAttribute("rel", "styleSheet");
	docStyle.setAttribute("href", "../docStyle.css");
	docsDoc.contentDocument.head.appendChild(docStyle);
	
	docsDoc.contentDocument.body.appendChild(bod.data);
}

function setPage(){
	var userData = window.location.search;
	userData = userData.split('=');
	if(userData[0] != "?page" || userData.length < 2) return;
	
	pageVar = userData[1];
	getLibDocContainer().src = "./data/" + pageVar + ".txt"
}

window.onload = function(e){
	setPage();
	getLibDocContainer().onload = formatDocContent;
	formatDocContent();
}