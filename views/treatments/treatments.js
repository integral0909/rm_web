angular.module('rokketMed.treatments', [])

    .controller('TreatmentsController', ["$scope", "$rootScope", "$http", "$log", "getData", "Angularytics", function ($scope, $rootScope, $http, $log, getData, Angularytics) {
        'use strict';

        $rootScope.siteTitle = 'Treatments';
        $rootScope.bgImg = '';
        $scope.treatments = [];
        $scope.dataLoaded = false;
        $scope.gaTreatments = function (prop) {
            Angularytics.trackEvent('Treatment Category', 'treatment clicked', prop);
        };       
        getData.getTreatmentsName()
            .then(function (data) {
                $scope.treatments = _.filter(data, function (item) {
                    item.url = encodeURIComponent(item.name);
                    if (typeof item.businessesCount != 'undefined') {
                        return !!item.businessesCount;
                    }
                    return true;
                });
                $log.log($scope.treatments);
                $scope.dataElements = $scope.treatments;
            })
            .then(function () {
                $scope.dataLoaded = true;
            })
            .catch($log.err);

    }]);
