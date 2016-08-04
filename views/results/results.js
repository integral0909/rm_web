/*global $:false */
angular.module('rokketMed.results', [])

    .controller('ResultsController', ["$scope", "$rootScope", "$log", "$routeParams", "getData", "locationService", "Angularytics",
        function ($scope, $rootScope, $log, $routeParams, getData, locationService, Angularytics) {
            'use strict';

            $scope.businessesGroups = [];
            $scope.results = [];
            $scope.dataLoaded = false;
            $scope.maxPrice = 0;
            $scope.minPrice = 0;
            var url = $routeParams.name;
            var urlType = $routeParams.base;

            var businessesCount = 0;
            var names = [];

            $scope.sortBy = 'distance';
            $scope.sortGroupProps = 'distance';
            $scope.distancesortType = "asc";
            $scope.ratingsortType = "asc";
            $scope.costsortType = "asc";
            $scope.sortbyDistance = 'sort-by asc';
            $scope.sortbyRating = '';
            $scope.sortbyCost = '';
            $scope.exp = false;
            $scope.expanded = [];

            $scope.sortGroupBy = function (businessesGroups) {
                if (businessesGroups.mainBusiness.distance == null) {
                    return 0;
                }
                return businessesGroups.mainBusiness.distance;
            };

            $scope.sortGroupProps = function (prop) {

                $scope.sortProps(prop);

                if (prop == 'distance') {
                    if ($scope.sortbyDistance != '') {
                        $scope.distancesortType = ($scope.distancesortType == 'asc') ? 'desc' : 'asc';
                    }
                    $scope.sortbyDistance = 'sort-by ' + $scope.distancesortType;
                    $scope.sortbyRating = '';
                    $scope.sortbyCost = '';
                } else if (prop == 'rating') {
                    if ($scope.sortbyRating != '') {
                        $scope.ratingsortType = ($scope.ratingsortType == 'asc') ? 'desc' : 'asc';
                    }
                    $scope.sortbyRating = 'sort-by ' + $scope.ratingsortType;
                    $scope.sortbyDistance = '';
                    $scope.sortbyCost = '';
                } else {
                    if ($scope.sortbyCost != '') {
                        $scope.costsortType = ($scope.costsortType == 'asc') ? 'desc' : 'asc';
                    }
                    $scope.sortbyCost = 'sort-by ' + $scope.costsortType;
                    $scope.sortbyRating = '';
                    $scope.sortbyDistance = '';
                }

                $scope.sortGroupBy = function (businessesGroups) {
                    return businessesGroups.mainBusiness[prop];
                };
                $scope.groupReverse = !$scope.groupReverse;
            };

            $scope.showAllBusinesses = function (businessesGroups) {
                businessesGroups.visible = !businessesGroups.visible;
                $scope.expanded[businessesGroups.mainBusiness.id] = !$scope.expanded[businessesGroups.mainBusiness.id];
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            };

            $scope.sortProps = function (prop) {
                if ($scope.sortBy == prop) {
                    $scope.reverse = !$scope.reverse;
                } else {
                    $scope.sortBy = prop;
                    $scope.reverse = true;
                }
            };

            function gaImpression(businesses) {
                Angularytics.trackEvent("Business", "impression", businesses.join(','));
            }


            var store = {
                results: [],
                businessesGroups: []
            };

            $scope.type = urlType;

            var formAddress = function(addr1, city, state, zip){
                var address = '';
                if(addr1 != '' && addr1 != ' ' && typeof addr1 !== 'undefined'){
                    address += addr1;
                }

                if(city != '' && typeof city !== 'undefined'){
                    address += ", " + city;
                }

                if(state != '' && typeof state !== 'undefined'){
                    if(address != ''){
                        address += ", " + state;
                    }else{
                        address += state;
                    }
                }

                if(zip != '' && typeof zip !== 'undefined'){
                    address += ", " + zip;
                }

                return address;
            }

            locationService.getUserCoords()
                .then(function setCoords(data) {
                    if ($rootScope.userLat === undefined && $rootScope.userLng === undefined) {
                        $rootScope.userLat = data.latitude;
                        $rootScope.userLng = data.longitude;
                    }

                    switch (urlType) {
                        case "treatments" :
                            return getData.getTreatments(url);
                        case "surgeries":
                            return getData.getSurgeries(url);
                        default:
                            return null;
                    }
                }, function(error){
					$rootScope.userLat = undefined;
					$rootScope.userLng === undefined;
					$scope.sortBy = 'name';
                    switch (urlType) {
                        case "treatments" :
                            return getData.getTreatments(url);
                        case "surgeries":
                            return getData.getSurgeries(url);
                        default:
                            return null;
                    }
				})
                .then(function (data) {
                    store.results = data[0];
                    var tempBusinesses = data[1];
                    var tempResultData;

                    for (var business in tempBusinesses) {

                        switch (urlType) {
                            case "treatments" :
                                tempResultData = tempBusinesses[business].treatmentData;
                                break;
                            case "surgeries":
                                tempResultData = tempBusinesses[business].surgeryData;
                                break;
                            default:
                                tempResultData = null;
                                break;
                        }

                        for (var result in tempResultData) {
                            if (tempResultData[result].id === store.results._id && tempResultData[result].published === true) {
                                tempBusinesses[business].address = formAddress(tempBusinesses[business].addr1, tempBusinesses[business].city, tempBusinesses[business].state, tempBusinesses[business].zip);
                                if(typeof tempResultData[result].providerPrice === 'string' && tempResultData[result].providerPrice.indexOf('-') !== -1){
                                    var price = tempResultData[result].providerPrice.split('-');
                                    if(parseInt(price[0]) < parseInt($scope.minPrice) || $scope.minPrice === 0){
                                        $scope.minPrice = price[0];
                                    }
                                    if(parseInt(price[1]) > parseInt($scope.maxPrice)){
                                        $scope.maxPrice = price[1];
                                    }
                                }else{
                                    if(parseInt(tempResultData[result].providerPrice) < parseInt($scope.minPrice) || $scope.minPrice === 0){
                                        $scope.minPrice = tempResultData[result].providerPrice;
                                    }
                                    if(parseInt(tempResultData[result].providerPrice) > parseInt($scope.maxPrice)){
                                        $scope.maxPrice = tempResultData[result].providerPrice;
                                    }
                                }
                                tempBusinesses[business].cost = tempResultData[result].providerPrice;
                                names.push(tempBusinesses[business].id);
                                if (!store.businessesGroups[tempBusinesses[business].name]) {
                                    store.businessesGroups[tempBusinesses[business].name] = {businesses: []};
                                    $scope.expanded[tempBusinesses[business].id] = $scope.exp;
                                }
                                store.businessesGroups[tempBusinesses[business].name].businesses.push(tempBusinesses[business]);
                            }
                        }
                    }
                })
                .then(function () {
                    var uniqueBusinessNames = [];

                    for (var name in store.businessesGroups) {
                        var minIndex = 0, minDistance = Infinity;
                        for (var i = 0, len = store.businessesGroups[name].businesses.length; i < len; i++) {
                            if (store.businessesGroups[name].businesses[i].loc) {
                                store.businessesGroups[name].businesses[i].lat = store.businessesGroups[name].businesses[i].loc.coordinates[1];
                                store.businessesGroups[name].businesses[i].long = store.businessesGroups[name].businesses[i].loc.coordinates[0];
                            }
                            if (store.businessesGroups[name].businesses[i].lat && store.businessesGroups[name].businesses[i].long) {
                                store.businessesGroups[name].businesses[i].distance = parseFloat(locationService.distance($rootScope.userLat, $rootScope.userLng, store.businessesGroups[name].businesses[i].lat, store.businessesGroups[name].businesses[i].long).toFixed(2));
                            } else {
                                store.businessesGroups[name].businesses[i].distance = null;
                            }
                            if (store.businessesGroups[name].businesses[i].distance && store.businessesGroups[name].businesses[i].distance < minDistance) {
                                minDistance = store.businessesGroups[name].businesses[i].distance;
                                minIndex = i;
                            }
                            if(store.businessesGroups[name].businesses[i].distance === null || store.businessesGroups[name].businesses[i].distance <= 50) {
                                businessesCount++;
                            }

                            store.businessesGroups[name].businesses[i].index = i;
                        }
                        store.businessesGroups[name].mainBusiness = store.businessesGroups[name].businesses[minIndex];
                        store.businessesGroups[name].businesses.splice(minIndex, 1);
                        if (store.businessesGroups[name].mainBusiness.name) {
                            uniqueBusinessNames.push(store.businessesGroups[name].mainBusiness.name);
                        }
                    }

                    gaImpression(uniqueBusinessNames);
                })
                .then(function () {
                    store.businessesList = [];
                    for (var name in store.businessesGroups) {
                        store.businessesList = store.businessesList.concat(store.businessesGroups[name].businesses);
                        store.businessesList.push(store.businessesGroups[name].mainBusiness);
                    }
                })
                .then(function () {
                    $scope.results = store.results;

                    for (var name in store.businessesGroups) {
                        if(store.businessesGroups[name].mainBusiness.lat == null && store.businessesGroups[name].mainBusiness.long == null && store.businessesGroups[name].mainBusiness.state == $rootScope.user_state){
                         store.businessesGroups[name].priority = 1;
                         }else if(store.businessesGroups[name].mainBusiness.lat == null && store.businessesGroups[name].mainBusiness.long == null && store.businessesGroups[name].mainBusiness.state != $rootScope.user_state){
                         store.businessesGroups[name].priority = -1;
                         }else{
                         store.businessesGroups[name].priority = 0;
                         }
                        store.businessesGroups[name].distance = store.businessesGroups[name].mainBusiness.distance || "";
                        $scope.businessesGroups.push(store.businessesGroups[name]);
                    }

                    $scope.businesses = store.businessesList;
                    //$scope.businesses.businessesCount = store.businessesList.length;
                    $scope.businesses.businessesCount = businessesCount;

                    $scope.dataLoaded = true;
                    $rootScope.siteTitle = store.results.name;

                },
                function (err) {
                    $log.log('something went wrong: ' + err);
                });
        }]);
