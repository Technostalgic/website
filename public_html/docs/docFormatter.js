// 				code by Technostalgic
// 	http://technostalgic.tech | @TechnostalgicGM

function formatDocs(docdata){
	var spldat = docdata.split('\n');
	var groups = [];
	var names = [];
	var lastgroup = 0;
	var container = document.createElement("div");
	var contents = document.createElement("div");
	
	for(var i = 0; i < spldat.length; i++){
		if(spldat[i].trim().length <= 0) continue;
		
		var indents = countIndentation(spldat[i]);
		var str = truncateIndents(spldat[i]);
		str = wrapBrackets(str);
		str = wrapNotices(str);
		
		var elem = document.createElement("div");
		var clss = "";
		
		switch(indents){
			case 0: clss = "afmMainDivider"; break;
			case 1: clss = "afmSubDivider"; break;
			case 2: clss = "afmCategory"; break;
			case 3: clss = "afmDescriptor"; break;
		}
		
		if(clss == "afmMainDivider" && str.length > 0){
			var name = str.split(':')[0];
			elem.setAttribute("id", name.replace(' ', ''));
			names.push(name);
		}
		
		elem.innerHTML = "<span class='afmSpan " + clss + "'>" + str + "</span>";
		elem.classList.add("afmDiv");
		
		groups[indents] = elem;
		
		if(indents > 0)
			groups[indents - 1].appendChild(elem);
		else
			container.appendChild(elem);
		lastgroup = indents;
	}
	
	var contentsHTML = "<span class='afmSpan afmContentsHeader'> Contents:</span>\n";
	contentsHTML += "<ul>\n";
	for(var i = 1; i < names.length; i ++){
		var elem = "<li><a href='#" + names[i].replace(' ', '') + "' class='afmLink'>" + names[i] + "</a> <br /></li>\n"
		contentsHTML += elem;
	}
	contentsHTML += "</ul>"
	
	contents.innerHTML = contentsHTML;
	contents.classList.add("afmDiv");
	contents.classList.add("afmContents");
	
	if(container.childNodes.length > 0)
		container.childNodes[0].appendChild(contents);
	
	return { table: contents, data: container };
}

function countIndentation(str){
	var r = 0;
	while(str[r] == '\t')
		r++;
	return r;
}
function truncateIndents(str){
	return str.substr(countIndentation(str));
}

function wrapBrackets(str){
	var found = true;
	var r0 = 0;
	var r1 = 0;
	var fstr = "";
	
	while(found){
		r0 = r1;
		while(str[r0] != '['){
			if(r0 >= str.length){
				found = false;
				break;
			}
			r0++;
		} if(!found) break;
		
		fstr = fstr + str.substr(r1, r0 - r1) + "<span class='afmSpan afmInBrackets'>";
		r1 = r0;
		
		while(str[r1] != ']'){
			if(r1 >= str.length){
				found = false;
				break;
			}
			r1++;
		}
		if(str[r1] == ']') r1++;
		fstr = fstr + str.substr(r0, r1 - r0) + "</span>";
	}
	fstr = fstr + str.substr(r1);
	
	return fstr;
}

function wrapNotices(str){
	var ni = str.indexOf("Note:");
	if(ni < 0)
		return str;
	
	var r = str.substr(0, ni) + "<span class='afmSpan afmNotice'>" + str.substr(ni) + "</span>";
	return r;
}