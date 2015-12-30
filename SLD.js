(function() {
	
SLD =  { };

SLD.readableSLD = function(sld) {
	sld = sld.replace(/<?.*>/, "");
	sld = sld.replace(/<sld:StyledLayer.*>/, "");
	sld = sld.replace(/<\/.+>/g, "");
	sld = sld.replace(/<.+:(.+)>/g, "$1  ");
	sld = sld.replace(/CssParameter name=/g, "  ");
	sld = sld.replace(/"(.+)"/g, "$1");
	sld = sld.replace(/name=/g, "");
	sld = sld.replace(/\S+\//g, "");
	
	
	sld = transformSLD(sld);
	
	return sld;
};

function transformSLD(sld)
{
	var line = sld.split("\n");
	var out = [];
	for (var i = 0; i < line.length; i++) {
		if (line[i].length == 0) continue;
		if (matches(line[i], [
			"Fill", "Stroke", "LabelPlacement", "PointPlacement"
		])) continue;
		
		if (line[i].indexOf("FeatureTypeStyle") >= 0) {
			out.push("==============");
		}
		if (line[i].indexOf("Rule") >= 0) {
			out.push("--------------");
		}
		if (line[i].indexOf("AnchorPoint") >= 0) {
			var x = line[i+1].slice(12);
			var y = line[i+2].slice(12);
			out.push("AnchorPoint " + x + " " + y);
			i += 2;
			continue;
		}
		if (line[i].indexOf("Displacement  ") >= 0) {
			var x = line[i+1].slice(13);
			var y = line[i+2].slice(13);
			out.push("Displacement   " + x + " " + y);
			i += 2;
			continue;
		}
		
		if (line[i+1].indexOf("Name ") == 0) {
			var name = line[i+1].slice(4);
			out.push(line[i] + " " + name);
			i++;
			continue;
		}
		if (line[i].indexOf("PropertyName  ") == 0) {
			var name = line[i].slice(14);
			out.push("[ " + name + " ]");
			continue;
		}
		out.push(line[i]);
	}
	return out.join("\n");
}

function matches(s, strs) {
	for (var i = 0; i < strs.length; i++) {
		if (s.indexOf(strs[i]) >= 0) return true;
	}
	return false;
}
})();