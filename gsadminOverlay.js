(function() {

Overlay = function(map, name, url) {
	this.map = map;
	this.name = name;
	this.url = url;
	this.mapLayers = [];
	this.isTiled = false;
}
Overlay.prototype.create = function() { 
	this.remove();
  	var params = {
			layers: "",
			transparent: true
		};
  	var options = {
			visibility: false,  // Is layer displayed when loaded? 
			singleTile: ! this.isTiled,
			opacity: 0.7,
			visibleInLayerSwitcher: false
		};
	this.mapOverlay = new OpenLayers.Layer.WMS(this.name, this.url, params, options);
	this.map.addLayers([ this.mapOverlay ]); 
	var self = this;
	this.mapOverlay.events.register('loadstart', this, function () {
		self.initMapTimer();
	});
}
Overlay.prototype.createUI = function() {
	var self = this;
	var $overlayBlock = $('<div>').appendTo($('#overlays'));
	this.$root = $('<div>').appendTo($overlayBlock);
	
	var $title = $('<div class="overlay-name">').appendTo(this.$root);
	$('<input type="checkbox" >')
            	.prop('checked', true )
            	.click(function () { 
	            	self.findOverlay().setVisibility( $(this).is(':checked') );
	            	//self.reload();
            	} )
            	.appendTo($title);
	$('<span>').text(this.name)
		.attr('title', this.url)
		.appendTo($title);
	
   	var $add = $('<div class="overlay-controls">').appendTo($overlayBlock); 
   	var $name = $('<input type="text" size=20>')
   		.attr('id', 'text_layer_name')
   		.attr('title', 'Enter layer names, comma-separated')
   		.appendTo($add);
   	$('<input type="button">')
   		.attr('value', 'Add Layers')
   		.click(function() {
   			var txt = $name.val();
   			var lyrs = txt.split(',');
   			self.addLayers( lyrs );
   			$name.val('');
   		})
   		.appendTo($add);
   		
	var $ctl = $('<div class="overlay-controls">').appendTo(this.$root);
	$('<img>')
		.attr( 'src', 'img/redraw-button.jpg' )
		.click(function() { self.reload(); })
		.appendTo($ctl);
	$('<div class="overlay-time">').text('0').appendTo($ctl);
	$('<span class="xx">').text(' sec  ').appendTo($ctl);
   	$('<span class="overlay-tiled-title">').text(' Tiled: ').appendTo($ctl);
	$('<input type="checkbox" class="checkbox-single"/>')
            	.prop('checked', self.isTiled)
            	.click(function () { 
	            	self.isTiled = $(this).is(':checked');
	            	self.reload();
            	} )
            	.appendTo($ctl);
}

Overlay.prototype.reload = function ()
{
	this.create();
	this.updateMap();
}
Overlay.prototype.getMapURL = function () {
	var overlay = this.findOverlay();
	return overlay.getURL(overlay.getTileBounds(new OpenLayers.Pixel(0,0)));
}

Overlay.prototype.findOverlay = function() {
	return this.map.getLayersByName(this.name)[0];
}
Overlay.prototype.remove = function() {
	var overlay = this.findOverlay();
	if (overlay) this.map.removeLayer(overlay);
}
Overlay.prototype.removeMapLayer = function (lyr)
{		
	for (var i = 0; i < this.mapLayers.length; i++) {
		if (this.mapLayers[i] == lyr) {
			this.mapLayers.splice(i, 1);
		}
	}
	this.updateMap();
	this.updateLayerItems();
}
Overlay.prototype.updateLayerItems = function() {
	var $root = $('#lyrs');
	$root.find('.gsa-layer-status').removeClass('gsa-layer-visible');
	this.mapLayers.forEach(function (lyr) {
		$('.gsa-layer:contains(' + lyr.name + ')').find('.gsa-layer-status').addClass('gsa-layer-visible');
	})	
}

Overlay.prototype.updateMapLayer = function (lyr)
{		
	this.updateMap();
	//this.showGetMapResponse();
}
Overlay.prototype.updateMap = function (map)
{
	var overlay = this.findOverlay();
	var layersList = this.visibleMapLayers(this.mapLayers);
	var hasLayers = layersList.length > 0;
	if (hasLayers) {
		overlay.mergeNewParams({ layers: layersList });
		overlay.setVisibility(true);
		overlay.redraw({ force:true });
	}
	else {
		overlay.setVisibility(false);		
	}
	// DEBUGGING
	//console.log(this.getMapURL());
	//this.initMapTimer();
}
Overlay.prototype.addLayers = function (names, isVisible )
{
	for (var i = 0; i < names.length; i++) {
		this.addSingleLayer(names[i], isVisible);
	}
	this.create();
	this.updateMap();
}
Overlay.prototype.addSingleLayer = function (name, isVisible)
{
	var visible = isVisible ? true : false;
	var lyr = {
			name: name,
			style: '',
			visibility: visible
	};
	this.mapLayers.unshift(lyr);
	this.addMapLayerItem(lyr);
}
Overlay.prototype.addMapLayerItem = function (lyr)
{
	var self = this;
	var $div = $('<div>').addClass('gsa-maplayer');
	$('<span>').addClass('gsa-maplayer-remove').text('x')
		.click(function() {
			self.removeMapLayer(lyr);
			$div.remove();
		})
		.appendTo($div);
	$('<input type="checkbox"/>')
            	.attr('title', 'Change layer visibility')
            	.prop('checked', lyr.visibility)
            	.click(function () { 
	            	var isVisible = $(this).is(':checked');
	            	lyr.visibility = isVisible;
	            	self.updateMapLayer(lyr);
            	} )
            	.appendTo($div);
	$('<span/>').text(lyr.name)
		.addClass('gsa-maplayer-title') //.addClass('gsa-link')
		.click(function() {
			$('#maplayers').find('.title-selected').removeClass('title-selected'); 
			$(this).toggleClass('title-selected'); })
		//.dblclick(function() { self.loadLayer(lyr.name); })
		.appendTo($div);
	this.$root.append($div);
}

Overlay.prototype.isLoading = function() {
	var overlay = this.findOverlay();
	return overlay.loading === true;
}
Overlay.prototype.initMapTimer = function() {
	if (this.mapInterval != null) return;
	var $mapSec = this.$root.find('.overlay-time');
	$mapSec.text('0');

	var self = this;
	this.mapStartTime = (new Date()).getTime();
	this.mapInterval = setInterval(function() {
		if (self.isLoading()) {
			var mapLoadDuration = (new Date()).getTime() - self.mapStartTime;
			//$('#map-spinner').show();
			$mapSec.text(mapLoadDuration / 1000);
		}
		else {
			//$('#map-spinner').hide();
			clearInterval(self.mapInterval);
			self.mapInterval = null;
		}
	}, 200);	
} 
Overlay.prototype.visibleMapLayers = function(mapLyrs)
{
	var lyrNames = [];
	// use for loop rather than map since not all elements may be used
	// iterate in reverse, to reflect ordering of map layer list UI
	for (var i = mapLyrs.length-1; i >= 0; i--) {
		var lyr = mapLyrs[i]
		if (lyr.visibility) {
			lyrNames.push(lyr.name);
		}
	}
	return lyrNames.join(",");
}

})();
