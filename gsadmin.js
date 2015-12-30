(function() {

var MESSAGES = {
	add_layer: 'Add Map Layer (Ctl for visible)'
};
var DEFAULT_CONFIG = { 
	protocol: 'http', 
	host: 'localhost' 
};
	
GSAdmin = function(config) {
	this.config = $.extend({}, DEFAULT_CONFIG, config);
	this.sites = [	];
	this.mapLayers = [];
	this.overlays = [];
	
	// only one supported for now
	var siteURL = this.config.protocol + '://' + this.config.host;
	
	document.title = 'GSAdmin: ' + this.config.host;
	$('#gs-host').text(siteURL);
	$('#gs-ui-link').attr('href', siteURL + '/web');
		
	this.sites.push({
		siteURL: siteURL,
		wmsURL: siteURL + '/wms',
		rest: new GS(siteURL, 'admin', 'XXX')
	});
};
GSAdmin.prototype.init = function(mapdiv) { 
	this.initMap('map_div');
	this.load();
}


GSAdmin.prototype.site = function() { return this.sites[0]; }

GSAdmin.prototype.load = function() {
	this.loadStyles();
	this.loadSite();
	this.loadLayers();
};
GSAdmin.prototype.loadSite = function() {
	
	var site = this.site();
	site.overlay = this.addOverlay(site.wmsURL);
	
	var $site = $('#workspaces');
	$site.empty();
	var $div = $('<div/>');
	$site.append($div)
	$div.addClass('gsa-host').text(this.host);
	var self = this;
	this.site().rest.getWorkspaces(
		$.proxy(function(ws) { self.addWorkspaceItem($site, ws); }, self));
}
GSAdmin.prototype.addMapLayer = function(name, isVisible ) {
	var site = this.site();
	site.overlay.addLayers( [ name ], isVisible );	
}
GSAdmin.prototype.addWorkspaceItem = function($parent, ws) {
	var self = this;
	var $div = $('<div/>');
	$parent.append($div);
	var $title = $('<div/>').addClass('gsa-ws').text(ws.name + ' :')
	$div.append($title);
	
	this.site().rest.getDatastores(ws.name, 
		$.proxy(function(ds) { self.addDatastoreItem($div, ws, ds); }, self));
}
GSAdmin.prototype.addDatastoreItem = function($parent, ws, ds) {
	var self = this;
	var $div = $('<div/>');
	$parent.append($div);
	var $title = $('<div/>').addClass('gsa-datastore').addClass('gsa-link').text(ds.name);
	$div.append($title);
	$title  //.click($.proxy(self.loadDatastore, self, ws.name, ds.name));
		.click(function() {
			self.showDataPanel('Datastore: ' + ds.name, self.site().rest.dsURL(ws.name, ds.name) );
			self.loadDatastore(ws.name, ds.name);
		} );
	
	this.site().rest.getFTs(ws.name, ds.name,
		$.proxy(function(ft) { self.addFTItem($div, ws, ds, ft); }, self));
		
}
GSAdmin.prototype.addFTItem = function($parent, ws, ds, ft) {
	var self = this;
	var $div = $('<div/>');
	$parent.append($div);
	$div.addClass('gsa-featuretype')
	var $status = $('<span/>').text('+')
		.addClass('gsa-layer-status')
		.attr('title', MESSAGES.add_layer )
		//.click( $.proxy(self.addMapLayer, self, ft.name) )
		.click( function(e) {
			var isVisible = (e.ctrlKey || e.metaKey);
			self.addMapLayer(ft.name, isVisible);
			 })
		.appendTo($div);
	var $name = $('<span>').addClass('gsa-link').text(ft.name)
		.click(function() {
			self.showDataPanel('Feature Type: ' + ft.name, self.site().rest.ftURL(ws.name, ds.name, ft.name))
			self.loadFT(ws.name, ds.name, ft.name);
		} );
	$name.appendTo($div)
}

GSAdmin.prototype.loadLayers = function() {
	var $root = $('#lyrs');
	$root.empty();
	var self = this;
	this.site().rest.getLayers($.proxy(function(lyr) { self.addLayerItem($root, lyr); }, self));
};
GSAdmin.prototype.addLayerItem = function($root, layer) {
	var self = this;
	var $div = $('<div/>').addClass('gsa-layer').appendTo($root);
	var $status = $('<span/>').text('+')
		.addClass('gsa-layer-status')
		.attr('title', MESSAGES.add_layer )
		.click( function(e) {
			var isVisible = (e.ctrlKey || e.metaKey);
			self.addMapLayer(layer.name, isVisible);
			 })
		.appendTo($div);
	var $title = $('<span/>').text(layer.name)
		.addClass('gsa-layer-title').addClass('gsa-link')
		.click(function() {
			self.showDataPanel('Layer: ' + layer.name, self.site().rest.layerURL(layer.name))
			self.loadLayer(layer.name);
			} )
		.appendTo($div);
};
/*
GSAdmin.prototype.updateLayerItems = function() {
	var $root = $('#lyrs');
	$root.find('.gsa-layer-status').removeClass('gsa-layer-visible');
	this.mapLayers.forEach(function (lyr) {
		$('.gsa-layer:contains(' + lyr.name + ')').find('.gsa-layer-status').addClass('gsa-layer-visible');
	})	
}
*/
GSAdmin.prototype.loadDatastore = function(wsname, name)
{
	this.site().rest.getDatastore(wsname, name, $.proxy(this.showDS, this) );
};
GSAdmin.prototype.loadFT = function(wsname, dsname, name)
{
	this.site().rest.getFT(wsname, dsname, name, $.proxy(this.showFT, this) );
};
GSAdmin.prototype.loadLayer = function(name)
{
	this.site().rest.getLayer(name, $.proxy(this.showLayer, this) );
};
GSAdmin.prototype.loadStyles = function() {
	var $root = $('#styles');
	$root.empty();
	var self = this;
	this.site().rest.getStyles(function (style) {
		var $title = $('<div/>').addClass('gsa-style').addClass('gsa-link').text(style.name)
		$root.append($title);
		$title.click($.proxy(self.loadStyle, self, style.name)); 
	});
}
GSAdmin.prototype.loadStyle = function(name)
{
	this.site().rest.getStyle(name, $.proxy(function(sld) { this.showStyle(name, sld); }, this) );
};
GSAdmin.prototype.loadFTbyURL = function(url)
{
	this.site().rest.getFTbyURL(url, $.proxy(this.showFT, this) );
};
GSAdmin.prototype.loadDSbyURL = function(url)
{
	this.site().rest.getDSbyURL(url, $.proxy(this.showDS, this) );
};

function showInfoPanel(type, title) {
	$('.info-panel').hide();
	$('#info-panel-' + type).show();
	$('#' + type + '-name').text(title);
	$('.popout-panel').show();
}
function showDataPanel(title, url) {
	$('.info-panel').hide();
	$('#data-panel').show();
	if (url) {
		var $link = $('<a>').text(title).attr('href', url).attr('target','_blank');
		$('#data-title').html($link);	
	}
	else {
		$('#data-title').text(title);
	}
	var $data = $('#data-content').empty();
	$data.text('LOADING....');
	$('.popout-panel').show();
	return $data;
}
GSAdmin.prototype.showDataPanel = function(title, url) {
	return showDataPanel(title, url);
}
GSAdmin.prototype.getDataPanelContent = function() {
	$('#data-panel').show();
	var $data = $('#data-content').empty();
	return $data;
}

GSAdmin.prototype.showDS = function(obj) {
	var $p = this.getDataPanelContent();
	addAttr($p, "Name", obj.name);
	addAttr($p, "Type", obj.type);
	addAttr($p, "Workspace", obj.workspace.name);
	addTitle($p, "Connection Parameters");
	var param = obj.connectionParameters.entry;
	for (var i = 0; i < param.length; i++) {
		addAttr($p, param[i]['@key'], param[i].$);
	}
}
GSAdmin.prototype.showFT = function(ftobj) {
	var self = this;
	
	var $p = this.getDataPanelContent();

	addAttr($p, "Store", ftobj.store.name, function() {
		self.site().rest.getDSbyURL(ftobj.store.href, $.proxy(self.showDS, self, ftobj.store.href ));
	});
	addAttr($p, "Name", ftobj.name);
	addAttr($p, "Native Name", ftobj.nativeName);
	addAttr($p, "Title", ftobj.title);
	addAttr($p, "SRS", ftobj.srs);
	addTitle($p, "Native BBOX");
	addAttr($p, "X", ftobj.nativeBoundingBox.minx + ' : ' + ftobj.nativeBoundingBox.maxx);
	addAttr($p, "Y", ftobj.nativeBoundingBox.miny + ' : ' + ftobj.nativeBoundingBox.maxy);
}
GSAdmin.prototype.showLayer = function (obj) {
	var self = this;
	
	wsRE = /workspaces\/(.+)\/data/g;
	var workspace = wsRE.exec(obj.resource.href)[1];
	
	var $p = this.getDataPanelContent();
	addAttr($p, "Workspace", workspace );
	addAttr($p, "Name", obj.name);
	addAttr($p, "Type", obj.type);
	addAttr($p, "Resource class", obj.resource['@class']);
	addAttr($p, "Resource name", obj.resource.name, $.proxy(this.loadFTbyURL, this, obj.resource.href) );
	addAttr($p, "Default Style", obj.defaultStyle.name, $.proxy(this.loadStyle, this, obj.defaultStyle.name)  );
	if (obj.styles) {
		for (var i = 0; i < obj.styles.style.length; i++) {
			addAttr($p, "Alt Style", obj.styles.style[i].name);
		}
	}
}
GSAdmin.prototype.showStyle = function(name, sld) {
	showInfoPanel('style', 'Style: ' + name);
	var sldFormatted = sld.replace(/></g, '>\n<');
	
	$('#style-heading').text(name);
	$('#style-text').text(sldFormatted);
}
GSAdmin.prototype.showGetMapResponse = function() {
	//showInfoPanel('layer', 'foo');
	this.site().rest.ajax(this.site().overlay.getMapURL(), 'text', callbackGetMapResponse);
	
	function callbackGetMapResponse(data, textStatus, jqXHR) {
		var $p = $('#map-response');
		$p.empty();
		var isImage = jqXHR.getResponseHeader('Content-Type').substr(0, 5) == 'image';
		var dispStr = isImage ? jqXHR.getResponseHeader('Content-Type') : data;
		$p.text(dispStr)
	}
}
function addAttr($parent, title, val, onClick) {
	if (! val) return;
	var $div = $('<div/>');
	$div.append($('<div/>').addClass('attr-title').text(title + ": "));
	var $val = $('<div/>').text(val);
	$div.append($val);
	if (onClick) {
		$val.addClass('gsa-link')
			.on('click', onClick);
	}
	$div.addClass('gsa-attr');
	$parent.append($div);
}
function addTitle($parent, title) {
	var $div = $('<div/>');
	$div.append($('<div/>').addClass('title').text(title));
	$div.addClass('gsa-attr');
	$parent.append($div);
}

})();