(function() {
	
	GS = function(siteURL, user, password) {
		this.siteURL = siteURL;
		this.user = user;
		this.password = password;
		this.workspaces = {};
	}
	GS.prototype.wsURL =  function(name) {
		if (name) {
			return this.siteURL + "/rest/workspaces/" + name + ".json";
		}
		return this.siteURL + "/rest/workspaces.json";
	}
	GS.prototype.dsURL =  function(ws, name) {
		if (name) {
			return this.siteURL + "/rest/workspaces/" + ws + "/datastores/" + name + ".json";	
		}
		return this.siteURL + "/rest/workspaces/" + ws + "/datastores.json";
	}
	GS.prototype.ftURL =  function(ws, ds, name) {
		if (name) {
			return this.siteURL + "/rest/workspaces/" + ws + "/datastores/" + ds + "/featuretypes/" + name + ".json";	
		}
		return this.siteURL + "/rest/workspaces/" + ws + "/datastores/" + ds + "/featuretypes.json";
	}
	GS.prototype.layerURL =  function(name) {
		if (name) {
			return this.siteURL + "/rest/layers/" + name + ".json";	
		}
		return this.siteURL + "/rest/layers.json";
	}
	GS.prototype.styleURL =  function(name) {
		if (name) {
			return this.siteURL + "/rest/styles/" + name + ".sld";	
		}
		return this.siteURL + "/rest/styles.json";	
	}

	GS.prototype.getWorkspaces = function(callback) {
		var url = this.wsURL();
		this.ajax(url, "json", function(data) { 
			if (data.workspaces === "") return;
			var ws = data.workspaces.workspace;
			ws.sort(compareName);
			for (var i = 0; i < ws.length; i++) {
				callback(ws[i]);
			}	
		});
	}
	GS.prototype.loadWorkspaces = function(callback) {
		var url = GS.Workspace.urlAll(this.siteURL);
		this.ajax(url, "json", function(data) { 
			if (data.workspaces === "") return;
			var ws = data.workspaces.workspace;
			ws.sort(compareName);
			callback(ws);	
		});
	}
	GS.prototype.getWorkspace = function(name, callback) {
		var self = this;
		var url = GS.Workspace.url(this.siteURL, name);
		this.ajax(url, "json", function(data) 
		{ 
			self.workspaces[name] = data.workspace;
			callback(data.workspace ); 
			});
	}
	GS.prototype.getDatastores = function(wsname, callback) {
		var url = GS.Datastore.urlAll(this.siteURL, wsname);
		this.ajax(url, "json", function(data) { 
			if (data.dataStores === "") return;
			var ds = data.dataStores.dataStore;
			ds.sort(compareName);
			for (var i = 0; i < ds.length; i++) {
				callback(ds[i]);
			}	
		});
	}
	GS.prototype.getDatastore = function(wsname, name, callback) {
		var url = GS.Datastore.url(this.siteURL, wsname, name);
		this.ajax(url, "json", function(data) 
		{ 
			callback(data.dataStore ); 
			});
	}
	GS.prototype.getFTs = function(wsname, dsname, callback) {
		var url = GS.FT.urlAll(this.siteURL, wsname, dsname);
		this.ajax(url, "json", function(data) { 
			if (data.featureTypes === "") return;
			var ft = data.featureTypes.featureType;
			ft.sort(compareName);
			for (var i = 0; i < ft.length; i++) {
				callback(ft[i]);
			}	
		});
	}
	GS.prototype.getFT = function(wsname, dsname, name, callback) {
		var url = GS.FT.url(this.siteURL, wsname, dsname, name);
		this.ajax(url, "json", function(data) 
		{ 
			callback(data.dataStore ); 
			});
	}
	GS.prototype.getLayers = function(callback) {
		var url = GS.Layer.urlAll(this.siteURL);
		this.ajax(url, "json", function(data) { 
			if (data.layers === "") return;
			var layer = data.layers.layer;
			layer.sort(compareName);
			for (var i = 0; i < layer.length; i++) {
				callback(layer[i]);
			}	
		});
	}
	GS.prototype.getLayer = function(name, callback) {
		var url = GS.Layer.url(this.siteURL, name);
		this.ajax(url, "json", function(data) 
		{ 
			callback(data.layer ); 
			});
	}
	GS.prototype.getStyles = function(callback) {
		var url = GS.Style.urlAll(this.siteURL);
		this.ajax(url, "json", function(data) { 
			if (data.styles === "") return;
			var list = data.styles.style;
			list.sort(compareName);
			for (var i = 0; i < list.length; i++) {
				callback(list[i]);
			}	
		});
	}
	GS.prototype.getStyle = function(name, callback) {
		var url = GS.Style.url(this.siteURL, name);
		this.ajax(url, "text", function(data) 
		{ 
			callback(data ); 
			});
	}
	GS.prototype.getFT = function(ws, ds, ft, callback) {
		var url = GS.FT.url(this.siteURL, ws, ds, ft);
		this.getFTbyURL(url, callback);
	}
	GS.prototype.getFTbyURL = function(url, callback) {
		this.ajax(url, "json", function(data) { callback(GS.FT.toFT(data) ); });
	}
	GS.prototype.getDS = function(ws, ds, callback) {
		var url = GS.DS.url(this.siteURL, ws, ds);
		this.getDSbyURL(url, callback);
	}
	GS.prototype.getDSbyURL = function(url, callback) {
		this.ajax(url, "json", function(data) { callback(GS.DS.toDS(data) ); });
	}
	GS.prototype.ajax = function(url, datatype, callback) {
		$ajax(url, this.user, this.password, datatype, callback)
	}
	
	GS.Workspace = function(name) {	}
	GS.Workspace.urlAll =  function(siteURL) {
		return siteURL + "/rest/workspaces.json";
	}
	GS.Workspace.url =  function(siteURL, name) {
		return siteURL + "/rest/workspaces/" + name + ".json";
	}
	
	GS.Datastore = function(name) {	}
	GS.Datastore.urlAll =  function(siteURL, ws) {
		return siteURL + "/rest/workspaces/" + ws + "/datastores.json";	
	}
	GS.Datastore.url =  function(siteURL, ws, name) {
		return siteURL + "/rest/workspaces/" + ws + "/datastores/" + name + ".json";	
	}
	
	GS.Layer = function(name) {
		
	}
	GS.Layer.urlAll =  function(siteURL) {
		return siteURL + "/rest/layers.json";
	}
	GS.Layer.url =  function(siteURL, name) {
		return siteURL + "/rest/layers/" + name + ".json";
	}
	GS.Style = function(name) {
		
	}
	GS.Style.urlAll =  function(siteURL) {
		return siteURL + "/rest/styles.json";
	}
	GS.Style.url =  function(siteURL, name) {
		return siteURL + "/rest/styles/" + name + ".sld";
	}
	GS.FT = function(name) {
		
	}
	GS.FT.urlAll =  function(siteURL, ws, ds) {
		return siteURL + "/rest/workspaces/" + ws + "/datastores/" + ds + "/featuretypes.json";
	}
	GS.FT.url =  function(siteURL, ws, ds, ft) {
		return siteURL + "/rest/workspaces/" + ws + "/datastores/" + ds + "/featuretypes/" + ft + ".json";
	}
	GS.FT.toFT =  function(data) {
		var gsft = data.featureType;
		return gsft;
	}

	GS.DS = function(name) {
		
	}
	GS.DS.url =  function(siteURL, ws, ds) {
		return siteURL + "/rest/workspaces/" + ws + "/datastores/" + ds + ".json";
	}
	GS.DS.toDS =  function(data) {
		var obj = data.dataStore;
		return obj;
	}

	function $ajax(url, user, password, datatype, callback) {
		$.ajax(url,
			{ 	type: "GET",
			 	//contentType: false, //"application/json",
	    		dataType: datatype,
	    		// for some reason using this causes CORS failures 
	    		//beforeSend: function(xhr) { setAuthHeader(xhr, user, password) },
	    		xhrFields: {
					withCredentials: true
	  			},
				crossDomain: true }
		).done(callback);	
	}
	function setAuthHeader(xhr, user, password){
		var creds = user + ':' + password;
		//var creds = 'admin:bismark';
		var basicScheme = btoa(creds);
		var hashStr = "Basic "+basicScheme;
		xhr.setRequestHeader('Authorization', hashStr);
		xhr.withCredentials = true;
	}

	function compareName(a, b) {
		var an = a.name.toLowerCase();
		var bn = b.name.toLowerCase();
		if (an == bn) return 0;
		return (an < bn) ? -1 : 1;
	}
	
})();