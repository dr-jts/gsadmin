
UrlParams = { };

UrlParams.extract = function(str) {
	var params = {};
    var paramStr = str.split(/\?|\&/);
    var self = this;
    paramStr.forEach( function(it) {
        if (it) {
            var param = it.split("=");
            params[param[0].toLowerCase()] = param[1];
        }
    });
    return params;
}
UrlParams.asNumArray = function(str)
{
	var numStr = str.split(',');
	var num = [];
	for (var i = 0; i < numStr.length; i++) {
		num.push(parseFloat(numStr[i]));
	}
	return num;
}

