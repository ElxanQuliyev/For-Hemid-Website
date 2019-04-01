function m2_ce_googlemap_init(dom_obj, coords) {
	"use strict";
	if (typeof M2_CE_STORAGE['googlemap_init_obj'] == 'undefined') m2_ce_googlemap_init_styles();
	M2_CE_STORAGE['googlemap_init_obj'].geocoder = '';
	try {
		var id = dom_obj.id;
		M2_CE_STORAGE['googlemap_init_obj'][id] = {
			dom: dom_obj,
			markers: coords.markers,
			geocoder_request: false,
			opt: {
				zoom: coords.zoom,
				center: null,
				scrollwheel: false,
				scaleControl: false,
				disableDefaultUI: false,
				panControl: true,
				zoomControl: true, //zoom
				mapTypeControl: false,
				streetViewControl: false,
				overviewMapControl: false,
				styles: M2_CE_STORAGE['googlemap_styles'][coords.style ? coords.style : 'default'],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
		};
		
		m2_ce_googlemap_create(id);

	} catch (e) {
		
		dcl(M2_CE_STORAGE['strings']['googlemap_not_avail']);

	};
}

function m2_ce_googlemap_create(id) {
	"use strict";

	// Create map
	M2_CE_STORAGE['googlemap_init_obj'][id].map = new google.maps.Map(M2_CE_STORAGE['googlemap_init_obj'][id].dom, M2_CE_STORAGE['googlemap_init_obj'][id].opt);

	// Add markers
	for (var i in M2_CE_STORAGE['googlemap_init_obj'][id].markers)
		M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].inited = false;
	m2_ce_googlemap_add_markers(id);
	
	// Add resize listener
	jQuery(window).resize(function() {
		if (M2_CE_STORAGE['googlemap_init_obj'][id].map)
			M2_CE_STORAGE['googlemap_init_obj'][id].map.setCenter(M2_CE_STORAGE['googlemap_init_obj'][id].opt.center);
	});
}

function m2_ce_googlemap_add_markers(id) {
	"use strict";
	for (var i in M2_CE_STORAGE['googlemap_init_obj'][id].markers) {
		
		if (M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].inited) continue;
		
		if (M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].latlng == '') {
			
			if (M2_CE_STORAGE['googlemap_init_obj'][id].geocoder_request!==false) continue;
			
			if (M2_CE_STORAGE['googlemap_init_obj'].geocoder == '') M2_CE_STORAGE['googlemap_init_obj'].geocoder = new google.maps.Geocoder();
			M2_CE_STORAGE['googlemap_init_obj'][id].geocoder_request = i;
			M2_CE_STORAGE['googlemap_init_obj'].geocoder.geocode({address: M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].address}, function(results, status) {
				"use strict";
				if (status == google.maps.GeocoderStatus.OK) {
					var idx = M2_CE_STORAGE['googlemap_init_obj'][id].geocoder_request;
					if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
						M2_CE_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = '' + results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					} else {
						M2_CE_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = results[0].geometry.location.toString().replace(/\(\)/g, '');
					}
					M2_CE_STORAGE['googlemap_init_obj'][id].geocoder_request = false;
					setTimeout(function() { 
						m2_ce_googlemap_add_markers(id); 
						}, 200);
				} else
					dcl(M2_CE_STORAGE['strings']['geocode_error'] + ' ' + status);
			});
		
		} else {
			
			// Prepare marker object
			var latlngStr = M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].latlng.split(',');
			var markerInit = {
				map: M2_CE_STORAGE['googlemap_init_obj'][id].map,
				position: new google.maps.LatLng(latlngStr[0], latlngStr[1]),
				clickable: M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].description!=''
			};
			if (M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].point) markerInit.icon = M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].point;
			if (M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].title) markerInit.title = M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].title;
			M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].marker = new google.maps.Marker(markerInit);
			
			// Set Map center
			if (M2_CE_STORAGE['googlemap_init_obj'][id].opt.center == null) {
				M2_CE_STORAGE['googlemap_init_obj'][id].opt.center = markerInit.position;
				M2_CE_STORAGE['googlemap_init_obj'][id].map.setCenter(M2_CE_STORAGE['googlemap_init_obj'][id].opt.center);				
			}
			
			// Add description window
			if (M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].description!='') {
				M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].infowindow = new google.maps.InfoWindow({
					content: M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].description
				});
				google.maps.event.addListener(M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].marker, "click", function(e) {
					var latlng = e.latLng.toString().replace("(", '').replace(")", "").replace(" ", "");
					for (var i in M2_CE_STORAGE['googlemap_init_obj'][id].markers) {
						if (latlng == M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].latlng) {
							M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].infowindow.open(
								M2_CE_STORAGE['googlemap_init_obj'][id].map,
								M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].marker
							);
							break;
						}
					}
				});
			}
			
			M2_CE_STORAGE['googlemap_init_obj'][id].markers[i].inited = true;
		}
	}
}

function m2_ce_googlemap_refresh() {
	"use strict";
	for ([id] in M2_CE_STORAGE['googlemap_init_obj']) {
		m2_ce_googlemap_create(id);
	}
}

function m2_ce_googlemap_init_styles() {
	"use strict";
	// Init Google map
	M2_CE_STORAGE['googlemap_init_obj'] = {};
	M2_CE_STORAGE['googlemap_styles'] = {
		'default': []
	};
	if (window.m2_ce_theme_googlemap_styles!==undefined)
		M2_CE_STORAGE['googlemap_styles'] = m2_ce_theme_googlemap_styles(M2_CE_STORAGE['googlemap_styles']);
}