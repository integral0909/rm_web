function GoogleMap(name, addr1, city, state, zip, lat, long) {

    this.initialize = function() {
        var map = showMap();
    };

    var MAP_TYPE_ID = 'custom map';

    var showMap = function() {
        var point = new google.maps.LatLng(lat, long);

        var mapOptions = {
            zoom: 15,
            center: point,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.LEFT__TOP
            },
            scrollwheel: false,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, MAP_TYPE_ID]
            },
            mapTypeId: MAP_TYPE_ID
        };

		google.maps.Map.prototype.panToWithOffset = function(latlng, offsetX, offsetY) {
		    var map = this;
		    var ov = new google.maps.OverlayView();
		    ov.onAdd = function() {
		        var proj = this.getProjection();
		        var aPoint = proj.fromLatLngToContainerPixel(latlng);
		        aPoint.x = aPoint.x+offsetX;
		        aPoint.y = aPoint.y+offsetY;
		        map.panTo(proj.fromContainerPixelToLatLng(aPoint));
		    };
		    ov.draw = function() {};
		    ov.setMap(this);
		};

        var map = new google.maps.Map(document.getElementById("g-maps"), mapOptions);

        map.panToWithOffset(point, 0, -11);

        createMarker(map, point, name, "<div class='info-box'><strong>"+ name +"</strong><address>"+ addr1 +"<br>"+ city +", "+ state +" "+ zip +"</address></div>", false);

        var styledOpts = [
            {
                stylers: [
                    { huge: '#555555' },
                    { visibility: 'simplified' },
                    { weight: 0.5 }
                ]
            },
            {
                elementType: 'labels',
                stylers: [
                    { visibility: 'off' }
                ]
            },
            {
                featureType: 'water',
                stylers: [
                    { color: '#999999' }
                ]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [
                    { color: '#888888' }
                ]
            },
            {
                featureType: 'road',
                elementType: 'labels',
                stylers: [
                    { visibility: 'on' }
                ]
            },
            {
                featureType: 'road',
                elementType: 'labels.text',
                stylers: [
                    { color: '#222222' }
                ]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.stroke',
                stylers: [
                    { color: '#ffffff' },
                    { weight: 2 }
                ]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [
                    { color: '#444444' }
                ]
            },
            {
                featureType: 'landscape',
                stylers: [
                    { color: '#f0f0f0' }
                ]
            },
            {
                featureType: 'administrative',
                stylers: [
                    { color: '#cccccc' }
                ]
            },
            {
                featureType: 'poi',
                stylers: [
                    { color: '#b3b3b3' }
                ]
            },
            {
                featureType: 'transit',
                stylers: [
                    { color: '#888888' }
                ]
            }

        ];

        var customMapType = new google.maps.StyledMapType(styledOpts);

        map.mapTypes.set(MAP_TYPE_ID, customMapType);

        return map;
    };
}

function createMarker(map, markerPos, markerTitle, infoWindowContent, displayInfoWindow) {
    var icon = new google.maps.MarkerImage('marker.png', null, null, null, new google.maps.Size(24,34));

    var marker = new google.maps.Marker({
        position: markerPos,
        map: map,
        icon: icon,
        title: markerTitle
    });

    var infowindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    if (displayInfoWindow) {
        infowindow.open(map, marker);
    }
}
