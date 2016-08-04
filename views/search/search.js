/*global $:false */
angular.module('rokketMed.search', [])

.controller('SearchController', ["$scope", '$http', "$rootScope", '$location', "$log", "getData", function($scope, $http, $rootScope, $location, $log, getData) {
	
	$scope.searchResults = [];
	$scope.searchString = decodeURI($location.path().split('/')[2]);
	
	var store = {
		results: []
	};
	
	$rootScope.siteTitle = 'RokketMed - Search '+$scope.searchString;

	getData.getTreatmentsName()
		.then(function(data) {
			store.results = store.results.concat(_.map(_.filter(angular.copy(data), function(treatment){
				return true;
			}), function(treatment){
				treatment.type = "treatments";
				treatment.title = "Treatments";
				
				return treatment;
			}));
			getData.getPreventionsName()
				.then(function(data) {
					store.results = store.results.concat(_.map(_.filter(angular.copy(data), function(prevention){
						return !!prevention.businessesCount;
					}), function(prevention){
						prevention.type = "preventions";
						prevention.title = "Preventions";
						return prevention;
					}));
					
					$scope.searchResults = _.sortBy(_.filter(store.results, function(result){
						var x = $scope.searchString.split(' ');
						var z = 1;
						for(var i in x){
							if(result.name.toLowerCase().indexOf(x[i]) == -1){
								z = 0;
							}
						}
						return z;
					}), function(item){
						var point = 0;
						var item_name = item.name.toLowerCase();
						var index = item_name.indexOf($scope.searchString);
						if (index !== 0) {
							point += 100/index;
						} else if (index === 0) {
							point += 200;
						}
						return -point;
					});
				},
				function(err) {
					$log.log('something went wrong: ' + err);
			})
			.then(function(){
				$scope.dataLoaded = true;
			})
			.then(function(){
				getData.getTreatments();
				getData.getBusinesses()
				.then(function(data){
					_.each(data, function(business) {
						var filterPublished = function(data, serviceDisplayType, serviceType){
							_.each(angular.copy(data), function(item){
								if(item.published){
									var result = {
										type: "businesses",
										title: "Business",
										service: {
											displayType: serviceDisplayType,
											type: serviceType,
											name: item.name
										},
										name: business.name
									};
									store.results.push(result);
								}
							});
						};
						filterPublished((business.treatmentData || []), "Treatment", "treatments");
					});
				}, function(err){
					$log.log('something went wrong: ' + err);
				});

			},
			function(err) {
				$log.log('something went wrong: ' + err);
			});
		});
}]);
