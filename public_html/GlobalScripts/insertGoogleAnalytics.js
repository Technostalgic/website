// Global site tag (gtag.js) - Google Analytics 
// (modified for use in a single external script by Technostalgic Games)

var headALTCS = document.getElementsByTagName('head')[0];
var scriptALTCS = document.createElement('script');
scriptALTCS.type = 'text/javascript';
scriptALTCS.onload = function() {
    initALTCS();
}
scriptALTCS.async = true;
scriptALTCS.src = 'https://www.googletagmanager.com/gtag/js?id=UA-108782136-1';
headALTCS.appendChild(scriptALTCS);

function initALTCS(){
	window.dataLayer = window.dataLayer || [];
	gtag = function(){
		dataLayer.push(arguments);
	}
	gtag('js', new Date());
	gtag('config', 'UA-108782136-1');
}