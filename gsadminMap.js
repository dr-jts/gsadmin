(function() {
	
	// Web Mercator
Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";

GSAdmin.prototype.initMap = function(mapDiv) {
	this.mapOverlayName = 'GeoServer';
    this.map = new OpenLayers.Map({        
            theme: null,   // disable OL auto-loading of CSS
    		div: mapDiv, 
    		projection: 'EPSG:3857',
    		displayProjection: 'EPSG:3857'
	});
    //map.addControl(new OpenLayers.Control.LayerSwitcher());
    
    this.map.addControl(new OpenLayers.Control.Navigation({
            id: 'NavigationControl',
            title: 'Zoom / Pan',
            zoomWheelEnabled: true,
            dragPanOptions: {
                enableKinetic: true
            },
            mouseWheelOptions: {
            	interval: 200, maxDelta: 1, cumulative: false
            }
        }));
	var osmLayer = new OpenLayers.Layer.OSM();
	osmLayer.setOpacity(0.5);
    this.map.addLayers([
    	osmLayer,
    	new OpenLayers.Layer.TMS('White', 'img/tile-256-white.png',
	        { 
	            getURL: function() { return this.url; }
	        } ),
		new OpenLayers.Layer.ArcGISCache('DataBC', 'http://maps.gov.bc.ca/arcserver/rest/services/Province/web_mercator_cache/MapServer', 
			{
	            resolutions: [9783.9400003175, 4891.969998835831, 2445.9849999470835, 1222.9925001058336, 611.4962500529168, 305.74812489416644, 152.8740625, 76.4370312632292, 38.2185156316146, 19.10925781316146, 9.554628905257811, 4.7773144526289055, 2.3886572265790367, 1.1943286131572264],
	            tileSize: new OpenLayers.Size(256, 256),
	            tileOrigin: new OpenLayers.LonLat(-16427500 , 9550000),
	            maxExtent: new OpenLayers.Bounds( [ -19948632.67243053, 1581977.5003146366, -7105731.9866291545, 12472249.280858198 ] ),
	            projection: 'EPSG:3857',
	            opacity: 0.5
	        } )    
 	    ]);
	this.map.addControl(new OpenLayers.Control.LayerSwitcher());
	var infoCtl = new OpenLayers.Control.WMSGetFeatureInfo({
                url: this.site().wmsURL, 
                title: 'Identify features by clicking',
                //layers: [water],
                queryVisible: true
           });
    infoCtl.events.register("getfeatureinfo", this, function(e) { this.showInfo(e); } );
	this.map.addControl( infoCtl );
	infoCtl.activate();
 	    
/*
    var road = new OpenLayers.Layer.Bing({
        name: "Road",
        type: "Road"
    });
    var hybrid = new OpenLayers.Layer.Bing({
        name: "Hybrid",
        type: "AerialWithLabels"
    });
    var aerial = new OpenLayers.Layer.Bing({
        name: "Aerial",
        type: "Aerial"
    });
    this.map.addLayers([road, hybrid, aerial]);
*/    
    
    //map.setCenter(new OpenLayers.LonLat(-126, 54), 3);
    
    var bcCentre = new OpenLayers.Geometry.Point(-126, 54.5)
        .transform('EPSG:4326', 'EPSG:3857');
    this.map.setCenter(bcCentre.getBounds().getCenterLonLat(), 5);
    gsadmin.map = this.map;
}

GSAdmin.prototype.showInfo = function(evt) {
	//console.log(evt);
	var $div = this.showDataPanel('WMS GetFeatureInfo');
	$div.html(evt.text);
}
GSAdmin.prototype.addOverlay = function(url) { 
	var name = extractHost(url);
	if (! name) name = "UNKNOWN HOST";
	var ov = new Overlay(this.map, name, url);
	ov.createUI();
	this.overlays.push(ov);
	return ov;
}
function extractHost(url) {
	var rx = /\/\/(.+?)\//;
	var arr = rx.exec(url);
	if (! arr) return null;
	return arr[1]; 	
}
GSAdmin.prototype.redrawMap = function (map)
{
	for (var i = 0; i < this.overlays.length; i++) {
		this.overlays[i].reload();
	}
}



})();
