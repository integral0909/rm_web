angular.module('rokketMed.surgeryCategories', [])

    .controller('SurgeriesCategoryController', ["$scope", "$rootScope", "$log", "getData", "Angularytics", function($scope, $rootScope, $log, getData, Angularytics) {
        'use strict';

        $rootScope.siteTitle = 'Surgeries Category';
        $scope.categories = [];

        $scope.dataLoaded = false;

        $scope.gaSurgeryCategories = function(prop){
            Angularytics.trackEvent('Surgeries', 'surgeries category clicked', prop);
        }

        getData.getSurgeryCategories()
            .then(function(data){
                $scope.categories = _.filter(data, function (item) {
                    item.url = encodeURIComponent(item.name);
                    return true;
                });
            }, function(error){
                console.log(error);
            })
            .finally(function(){
                $scope.dataLoaded = true;
            });
    }]);
