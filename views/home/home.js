/*global $:false */
angular.module('rokketMed.home', [])

.controller('HomeController', ["$rootScope", '$scope', 'locationService', "$location", 'getData', function($rootScope, $scope, locationService, $location, getData) {

	$scope.featuredItems = null;
	$scope.dataLoaded = false;
	
	$scope.goTo = function(type, name){
		$location.path("/"+type+"s/"+name);
	};

	getData.getFeaturedItems(0, 0)
		.then(function(data){
			$scope.featuredItems = data;
			$scope.dataLoaded = true;
			locationService.getUserCoords();
	});

	'use strict';
	//Added site title
	$rootScope.siteTitle = 'RokketMed';
}]);
