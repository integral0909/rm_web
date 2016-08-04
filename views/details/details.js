/*global $:false */
angular.module('rokketMed.details', [])

    .controller('DetailsController', ["$scope", "$rootScope", "$q", "$log", "$location", "$routeParams", "getData", "quickblox", "Angularytics",
        function ($scope, $rootScope, $q, $log, $location, $routeParams, getData, quickblox, Angularytics) {
            'use strict';

            $rootScope.bgImg = '';
            var routeType = $routeParams.type || '',
                routeName = $routeParams.name || '',
                routeBusiness = $routeParams.business,
                routeBusinessId = $routeParams.businessId;

            var businessExtras = [],
                currentOption;

            $rootScope.business = [];
            $scope.business = [];
            $scope.displayBusiness = [];
            $scope.dataLoaded = false;
            $scope.associations = [];
            $scope.insurances = [];
            $scope.educations = [];
            $scope.photos = [];
            $scope.comment = false;
            $scope.ratingBox = false;
            $scope.btnText = "Show photo";
            $scope.comments = [];
            $scope.overAllRating = 0;
            $scope.needsHalf = 0;

            var getSmallDevice = function () {
                var windowWidth = window.innerWidth;
                if (windowWidth < 480) {
                    $scope.photo = false;
                } else {
                    $scope.photo = true;
                }
            };

            getSmallDevice();

            $scope.checkLocationValues = function () {
                return $scope.business && $scope.business.lat && $scope.business.long && $scope.business.addr1 && $scope.business.city && $scope.business.state && $scope.business.zip;
            };

            $scope.showCommentBox = function () {
                $scope.comment = !$scope.comment;
            };

            $scope.showPhoto = function () {
                $scope.photo = !$scope.photo;

                if ($scope.photo) {
                    $scope.btnText = "Hide photo";
                } else {
                    $scope.btnText = "Show photo";
                }
            };

            $scope.gaMaps = function (prop) {
                Angularytics.trackEvent(prop + ' Category', 'map clicked');
            };

            $scope.gaPhone = function (prop) {
                Angularytics.trackEvent(prop + 'Category', 'phone clicked');
            };

            $scope.gaConversion = function (business) {
                Angularytics.trackEvent('Business', 'conversion', business.name + "," + business._id);
            };

            function setBusiness(type) {
                return function (data) {
                    var businessData = data,
                        conProcData;

                    if(type){
                        for (var business in businessData) {
                            if (businessData[business]._id === routeBusinessId) {
                                $scope.business = businessData[business];
                                break;
                            }
                        }
                        $rootScope.business = $scope.business;

                        conProcData = $scope.business[type];

                        for (var datas in conProcData) {
                            if (routeName === conProcData[datas].name) {
                                $scope.displayBusiness = conProcData[datas];
                            }
                        }
                    }else{
                        $scope.business = businessData;
                        console.log($scope.business);
                    }


                    if ($scope.business.loc) {
                        $scope.business.lat = $scope.business.loc.coordinates[1];
                        $scope.business.long = $scope.business.loc.coordinates[0];
                    }

                    return getData.getBusinessPhoto($scope.business._id);
                }
            }

            function setBusinessPhoto() {
                return function (data) {
                    var bizPhotos = data;

                    for (var photos in bizPhotos) {
                        $scope.photos = bizPhotos[photos];
                    }

                    return getData.getBusinessExtras();
                }
            }

            function setBusinessExtra() {
                return function (data) {
                    businessExtras = data;

                    for (var i = 0; i < businessExtras.length; i++) {
                        switch (businessExtras[i].name) {
                            case 'Associations':
                                $scope.associations = '';
                                if ($scope.business.class_541f1642ad3f620200543b68_Ids) {
                                    var tempAssociations = [];
                                    for (var j = 0; j < businessExtras[i].types.length; j++) {
                                        if ($scope.business.class_541f1642ad3f620200543b68_Ids.indexOf(businessExtras[i].types[j].id) != -1) {
                                            tempAssociations.push(businessExtras[i].types[j].name);
                                        }
                                    }
                                    $scope.associations = tempAssociations.join(', ');
                                }
                                break;
                            case 'Education':
                                $scope.educations = '';
                                if ($scope.business.class_541f165dad3f620200543b6b_Ids) {
                                    var tempEducations = [];
                                    for (var j = 0; j < businessExtras[i].types.length; j++) {
                                        if ($scope.business.class_541f165dad3f620200543b6b_Ids.indexOf(businessExtras[i].types[j].id) != -1) {
                                            tempEducations.push(businessExtras[i].types[j].name);
                                        }
                                    }
                                    $scope.educations = tempEducations.join(', ');
                                }
                                break;
                            case 'Insurance':
                                $scope.insurances = '';
                                if ($scope.business.class_541f160ead3f620200543b62_Ids) {
                                    var tempInsurances = [];
                                    for (var j = 0; j < businessExtras[i].types.length; j++) {
                                        if ($scope.business.class_541f160ead3f620200543b62_Ids.indexOf(businessExtras[i].types[j].id) != -1) {
                                            tempInsurances.push(businessExtras[i].types[j].name);
                                        }
                                    }
                                    $scope.insurances = tempInsurances.join(', ');
                                }
                                break;
                            case 'Specialty':
                                $scope.specialties = '';
                                if ($scope.business.class_541f162bad3f620200543b65_Ids) {
                                    var tempSpecialties = [];
                                    for (var j = 0; j < businessExtras[i].types.length; j++) {
                                        if ($.inArray(businessExtras[i].types[j].id, $scope.business.class_541f162bad3f620200543b65_Ids) != -1) {
                                            tempSpecialties.push(businessExtras[i].types[j].name);
                                        }
                                    }
                                    $scope.specialties = tempSpecialties.join(', ');
                                }
                                break;
                        }
                    }

                    $rootScope.siteTitle = $scope.business.name + " - " + $scope.displayBusiness.name;
                    $scope.dataLoaded = true;

                    if ($scope.checkLocationValues()) {
                        var map = new GoogleMap($scope.business.name, $scope.business.addr1, $scope.business.city, $scope.business.state, $scope.business.zip, $scope.business.lat, $scope.business.long);
                        map.initialize();
                    }

                    //List comments
                    return quickblox.listComments($scope.business._id, $scope.business);
                }
            }

            function handleComments() {
                return function (result) {
                    var ratings = [];

                    for (var i = 0; i < result.items.length; i++) {
                        var comment = {};
                        var unixDate = new Date(result.items[result.items.length - i - 1].created_at * 1000);
                        var date = unixDate.getDate();
                        var month = unixDate.getMonth() + 1;
                        var year = unixDate.getFullYear();

                        comment.postDate = month + "/" + date + "/" + year;
                        comment.postName = result.items[result.items.length - i - 1].name;
                        comment.rating = result.items[result.items.length - i - 1].rating;
                        ratings.push(result.items[result.items.length - i - 1].rating);
                        comment.comment = result.items[result.items.length - i - 1].body;

                        $scope.comments.push(comment);
                    }

                    var sum = 0;
                    for (var r = 0, len = ratings.length; r < len; r++) {
                        sum += parseInt(ratings[r]);
                    }
                    var avg = sum / ratings.length || 0;

                    var needsHalf = (avg.toFixed(1) % 1);

                    $scope.overAllRating = parseInt(avg);
                    $scope.needsHalf = needsHalf;
                }
            }

            switch (routeType) {
                case "treatments":
                    getData.getBusinessesByNameAndTreatment(routeName, routeBusiness)
                        .then(setBusiness('treatmentData'))
                        .then(setBusinessPhoto())
                        .then(setBusinessExtra())
                        .then(handleComments(),
                        function (err) {
                            $log.log('something went wrong: ' + err);
                        }
                    );
                    break;
                case "surgeries":
                    getData.getBusinessesByNameAndSurgery(routeName, routeBusiness)
                        .then(setBusiness('surgeryData'))
                        .then(setBusinessPhoto())
                        .then(setBusinessExtra())
                        .then(handleComments(),
                        function (err) {
                            $log.log('something went wrong: ' + err);
                        }
                    );
                    break;
                default:
                    getData.getBusinessById(routeBusinessId)
                      .then(setBusiness())
                      .then(setBusinessPhoto())
                      .then(setBusinessExtra())
                      .then(handleComments(),
                      function (err) {
                          $log.log('something went wrong: ' + err);
                      }
                    );
                    break;
            }

        }]).filter('tel', function () {

        return function (tel) {
            if (!tel) {
                return '';
            }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country === 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " (" + city + ") " + number).trim();
        };
    });
