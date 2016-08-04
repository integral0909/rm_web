var app = angular.module('rokketMed');

app.factory('locationService', ["$rootScope", "$q", function($rootScope, $q) {
	'use strict';
    var userCoords;
	return {
		getUserCoords: function(isNeedCountAgain) {
			var deffered = $q.defer();
            if (userCoords && !isNeedCountAgain){
                deffered.resolve(userCoords);
            } else {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        userCoords = position.coords;
						var latlng = new google.maps.LatLng(userCoords.latitude, userCoords.longitude);
						var request = {
							latLng: latlng
						}
						
						var geocoder = new google.maps.Geocoder();
						
						geocoder.geocode(request, function(data, status) {
							if (status == google.maps.GeocoderStatus.OK) {
								if (data[0] != null) {
									for(var ix=0; ix< data[0].address_components.length; ix++){
										if (data[0].address_components[ix].types[0] == "administrative_area_level_1")
										{	
											$rootScope.user_state = data[0].address_components[ix].short_name;
											deffered.resolve(userCoords);
										}
									}
								} else {
									//do nothing
									$rootScope.user_state = null;
									deffered.resolve(userCoords);
								}
							}
						});
                    },
                    function(error) { 
						deffered.reject(null); 
					}
                );
            }
		    return deffered.promise;
		},
	    distance: function(lat1, lon1, lat2, lon2) {
			if(typeof lat1 === 'undefined' || typeof lat2 === 'undefined' || typeof lon1 === 'undefined' || typeof lon2 === 'undefined'){
				return 0;
			}
	        var radlat1 = Math.PI * lat1/180;
	        var radlat2 = Math.PI * lat2/180;
	        var radlon1 = Math.PI * lon1/180;
	        var radlon2 = Math.PI * lon2/180;
	        var theta = lon1-lon2;
	        var radtheta = Math.PI * theta/180;
	        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	        dist = Math.acos(dist);
	        dist = dist * 180/Math.PI;
	        dist = dist * 60 * 1.1515;
	        return dist;
	    }
	};
}]);