angular.module('rokketMed.surgeries', [])

.controller('SurgeriesController', ["$scope", "$rootScope", "$log", "getData", "Angularytics", '$routeParams', function($scope, $rootScope, $log, getData, Angularytics, $routeParams) {
	'use strict';
	
	//Set site title and scope variables
	$rootScope.siteTitle = 'Surgeries';
	$scope.surgeries = [];

	$scope.currentCategory = $routeParams.name;

	$scope.dataLoaded = false;
	//Track actions on surgeries with google analytics
	$scope.gaSurgeries = function(prop) {
		Angularytics.trackEvent('Surgeryes', 'surgery clicked', prop);
	};

	//Get all surgeries with names and id
	getData.getSurgeriesNameByCategory($scope.currentCategory)
	.then(function(data) {
		//Filter surgeries and get only surgeries that have businesses
		$scope.surgeries = _.filter(data, function(item){
			item.url = encodeURIComponent(item.name);
			if(typeof item.businessesCount != 'undefined'){
				return !!item.businessesCount;
			}
			return true;
		});
	})
	.then(function() {
		//Site has loaded -> show it
		$scope.dataLoaded = true;
	})
	.catch($log.err);
	
}]);
