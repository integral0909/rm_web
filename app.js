var app = angular.module('rokketMed',
    ['ngRoute',
        'ngSanitize',
        'rokketMed.home',
        'rokketMed.treatments',
        'rokketMed.results',
        'rokketMed.details',
        'rokketMed.terms',
        'rokketMed.privacy',
        'rokketMed.search',
        'rokketMed.surgeries',
        'rokketMed.surgeryCategories',
        'angularytics'
    ]);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', 'AngularyticsProvider', function ($routeProvider, $locationProvider, $httpProvider, AngularyticsProvider) {
    'use strict';

    AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
    $routeProvider
        .when('/', {
            templateUrl: 'views/home/home.html',
            controller: 'HomeController'
        })
        .when('/treatments', {
            templateUrl: 'views/treatments/treatments.html',
            controller: 'TreatmentsController'
        })
        .when('/surgeries-categories', {
            templateUrl: 'views/surgeries/categories.html',
            controller: 'SurgeriesCategoryController'
        })
        .when('/surgery-categories/:name', {
            templateUrl: 'views/surgeries/surgeries.html',
            controller: 'SurgeriesController'
        })
        .when('/search/:search', {
            templateUrl: 'views/search/search.html',
            controller: 'SearchController'
        })
        .when('/:base/:name', {
            templateUrl: 'views/results/results.html',
            controller: 'ResultsController'
        })
        .when('/business/:business/:businessId', {
            templateUrl: 'views/details/details.html',
            controller: 'DetailsController'
        })
        .when('/business/:type/:name/:business/:businessId', {
            templateUrl: 'views/details/details.html',
            controller: 'DetailsController'
        })
        .when('/terms', {
            templateUrl: 'views/terms/terms.html',
            controller: 'TermsController'
        })
        .when('/privacy', {
            templateUrl: 'views/privacy/privacy.html',
            controller: 'PrivacyController'
        })
        .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]).run(['Angularytics', '$rootScope', function (Angularytics, $rootScope) {
    $rootScope.siteTitle = 'RokketMed';
    Angularytics.init();
}]);

app.controller('MainController', ["$scope", "$rootScope", "quickblox", "$location", "Angularytics", 'getData', '$log', '$window',
    function ($scope, $rootScope, quickblox, $location, Angularytics, getData, $log, $window) {
        'use strict';

        //Start quickblox session
        quickblox.sessionStart();

        //Modal
        /*$scope.modals = {
         login: false,
         signUp: false,
         settings: false,
         passwordReset: false
         };*/

        $scope.modalLogin = false;
        $scope.modalSignup = false;
        $scope.modalSettings = false;
        $scope.modalResetPassword = false;
        $scope.dataLoaded = false;
        //Modal handler
        $scope.modal_opened = false;
        $scope.notification = true;

        $rootScope.isSignedIn = false;
        $scope.passwordSent = false;

        $scope.mobile = false;
        $scope.visible = false;

        $scope.search = {
            selected_option: ''
        };

        $scope.isHome = ($location.path() === '/');

        $scope.$on('$routeChangeSuccess', function () {
            $scope.isHome = ($location.path() === '/');
        });

        $rootScope.user = {
            email: '',
            username: '',
            password: '',
            signUser: '',
            signPass: '',
            signEmail: '',
            employer: '',
            gender: '',
            age: '',
            id: ''
        };

        $scope.errors = {
            signUser: null,
            signPass: null,
            signEmail: null,
            passwordSent: null,
            login: false
        };

        $scope.toggleLogin = function () {
            $scope.modal_opened = true;
            $scope.modalLogin = !$scope.modalLogin;
            $scope.modalSignup = false;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        };

        $scope.toggleSignup = function () {
            $scope.modal_opened = true;
            $scope.modalSignup = !$scope.modalSignup;
            $scope.modalLogin = false;
        };

        $scope.toggleSettings = function () {
            $scope.modal_opened = true;
            $scope.modalSettings = !$scope.modalSettings;
        };

        $scope.saveSettings = function () {
            var customData = {
                employer: $rootScope.user.employer,
                gender: $rootScope.user.gender,
                age: $rootScope.user.age,
                user_id: $rootScope.user.id
            };
            quickblox.customData($rootScope.user.id, customData);
            $scope.notification = true;
        };

        $scope.toggleResetPassword = function () {
            $scope.modalLogin = false;
            $scope.modalResetPassword = !$scope.modalResetPassword;
        };

        $scope.resetPassword = function () {
            quickblox.resetPassword(email)
                .then(function (result) {
                    $scope.modal_opened = false;
                    $scope.passwordSent = true;
                }, function (error) {
                    $scope.errors.passwordSent = error;
                });
        };

        $scope.login = function () {

            quickblox.logIn($rootScope.user.username, $rootScope.user.password)
                .then(function (result) {
                    $rootScope.user.username = result.login;
                    $rootScope.user.email = result.email;
                    $rootScope.user.id = result.id;

                    $scope.modal_opened = false;
                    $scope.modalLogin = false;
                    $rootScope.isSignedIn = true;
                    return quickblox.customData(result.id);
                }, function () {
                    $scope.errors.login = true;
                }).then(function (result) {
                    $rootScope.user.age = result.items.age;
                    $rootScope.user.employer = result.items.employer;
                    $rootScope.user.gender = result.items.gender;
                });
        };

        $scope.signup = function () {

            quickblox.signUp($rootScope.user.signUser, $rootScope.user.signEmail, $rootScope.user.signPass)
                .then(function (result) {
                    //Set user info
                    $rootScope.user.username = result.login;
                    $rootScope.user.email = result.email;

                    //Mark user as loged in, hide signup model and show settings modals
                    $rootScope.isSignedIn = true;
                    $scope.modalSignup = false;
                    $scope.modalSettings = true;

                }, function (err) {
                    var errors = JSON.parse(err.detail);

                    for (var prop in errors) {
                        if (typeof errors[prop] != 'function') {
                            switch (prop) {
                                case "base":
                                    $scope.errors.signBase = errors[prop];
                                    $scope.errors.signEmail = true;
                                    $scope.errors.signUser = true;
                                    break;
                                case "email":
                                    $scope.errors.signEmail = errors[prop];
                                    break;
                                case "login":
                                    $scope.errors.signUser = errors[prop].join(' ');
                                    break;
                                case "password":
                                    $scope.errors.signPass = errors[prop].join(' ');
                                    break;
                            }
                        }
                    }

                });
        };

        $scope.logout = function () {
            quickblox.logout();
            $rootScope.isSignedIn = false;
        };

        $scope.activeSelection = [];

        $scope.isOpenSelection = function (prop) {
            return $scope.activeSelection.indexOf(prop) > -1;
        };

        $scope.editSelection = function (prop) {
            if ($scope.isOpenSelection(prop)) {
                $scope.activeSelection.splice($scope.activeSelection.indexOf(prop), 1);
            } else {
                $scope.activeSelection.push(prop);
            }
        };

        $scope.$on("openLoginModal", function () {
            $scope.toggleLogin();
        });

        $scope.gaServices = function (prop) {
            Angularytics.trackEvent(prop + ' category', 'button clicked');
        };

        $scope.clickOnNavItem = function (prop) {
            $scope.revealMobile();

            $scope.gaServices(prop);
        };

        $scope.revealMobile = function () {
            return $scope.visible = !$scope.visible;
        };

        $scope.clearSearch = function () {
            $scope.search.selected_option = '';
            $scope.results = [];
        };

        $scope.results = [];
        $scope.activeRow = null;

        var store = {
            conditions: [],
            treatments: [],
            businesses: [],
            results: []
        };

        getData.getTreatmentsName()
            .then(function (data) {
                store.results = store.results.concat(_.map(angular.copy(data), function (treatment) {
                    treatment.type = "treatments";
                    treatment.title = "Treatments";

                    return treatment;
                }));
            },
            function (err) {
                $log.log('something went wrong: ' + err);
            });

        getData.getSurgeriesName()
            .then(function (data) {
                store.results = store.results.concat(_.map(angular.copy(data), function (surgery) {
                    surgery.type = "surgeries";
                    surgery.title = "Surgeries";
                    return surgery;
                }));
            },
            function (err) {
                $log.log('something went wrong: ' + err);
            });

        getData.getBusinessesName()
          .then(function (data) {
              store.results = store.results.concat(_.map(angular.copy(data.businesses), function (business) {
                  business.type = "business";
                  business.title = "business";
                  return business;
              }));

              $scope.dataLoaded = true;
          },
          function (err) {
              $log.log('something went wrong: ' + err);
          });

        $('.base-drop-down').slideToggle(150);
        function hideList() {
            $scope.hideDropdown = true;
        }

        function showList() {
            $scope.hideDropdown = false;
        }
        hideList();
        $scope.hideDropdownOnBlur = hideList;

        $scope.showDropdownList = showList;

        $scope.searchFor = function (option) {
            if (option == 1) {
                $location.path('/search/' + encodeURIComponent($scope.search.selected_option));
            } else {
                var name = $scope.search.selected_option;
                if (name.trim() !== "") {
                    $scope.results = _.sortBy(_.filter(store.results, function (result) {
                        var x = name.split(' ');
                        var z = 1;
                        for (var i in x) {
                            if (result.name.toLowerCase().indexOf(x[i]) == -1) {
                                z = 0;
                            }
                        }
                        return z;
                    }), function (item) {
                        var point = 0;
                        var item_name = item.name.toLowerCase();
                        var index = item_name.indexOf(name);
                        if (index !== 0) {
                            point += 100 / index;
                        } else if (index === 0) {
                            point += 200;
                        }
                        return -point;
                    });
                    showList();
                } else {
                    hideList();
                   // $scope.results = [];
                }
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
                $scope.activeRow = 0;
            }
        };

        //Set application link for mobile devices
        var getMobileLink = function () {
            var deviceIphone = "iphone";
            var deviceIpod = "ipod";
            var deviceAndroid = "android";

            //Initialize our user agent string to lower case.
            var uagent = $window.navigator.userAgent.toLowerCase();

            //**************************
            // Detects if the current device is an iPhone.
            if (uagent.search(deviceIphone) > -1) {
                return "itunes.apple.com/us/app/rokketmed/id1024147868?ls=1&mt=8";
            }
            //**************************
            // Detects if the current device is an iPod Touch.
            if (uagent.search(deviceIpod) > -1) {
                return "itunes.apple.com/us/app/rokketmed/id1024147868?ls=1&mt=8";
            }

            if (uagent.search(deviceAndroid) > -1) {
                return 'play.google.com/store/apps/details?id=com.ionicframework.rokketmed786682';
            }

            return "itunes.apple.com/us/app/rokketmed/id1024147868?ls=1&mt=8";
        };
        $scope.mobile_link = getMobileLink();
    }]);

app.controller('ValidateFormController', ['$scope', '$rootScope', 'quickblox', 'getData',
        function ($scope, $rootScope, quickblox, getData) {
            'use strict';

            $scope.submitted = false;
            $scope.noRating = false;

            function resetComments() {
                $scope.form = {
                    rating: [
                        {
                            'name': 'rating1',
                            'value': '1',
                            'checked': false,
                            'ratingModel': false
                        },
                        {
                            'name': 'rating2',
                            'value': '2',
                            'checked': false,
                            'ratingModel': false
                        },
                        {
                            'name': 'rating3',
                            'value': '3',
                            'checked': false,
                            'ratingModel': false
                        },
                        {
                            'name': 'rating4',
                            'value': '4',
                            'checked': false,
                            'ratingModel': false
                        },
                        {
                            'name': 'rating5',
                            'value': '5',
                            'checked': false,
                            'ratingModel': false
                        }
                    ],
                    bedside: [
                        {
                            'name': 'bedside1',
                            'value': '1',
                            'checked': false,
                            'bedsideModel': false
                        },
                        {
                            'name': 'bedside2',
                            'value': '2',
                            'checked': false,
                            'bedsideModel': false
                        },
                        {
                            'name': 'bedside3',
                            'value': '3',
                            'checked': false,
                            'bedsideModel': false
                        },
                        {
                            'name': 'bedside4',
                            'value': '4',
                            'checked': false,
                            'bedsideModel': false
                        },
                        {
                            'name': 'bedside5',
                            'value': '5',
                            'checked': false,
                            'bedsideModel': false
                        }
                    ],
                    time: [
                        {
                            'name': 'time1',
                            'value': '1',
                            'checked': false,
                            'timeModel': false
                        },
                        {
                            'name': 'time2',
                            'value': '2',
                            'checked': false,
                            'timeModel': false
                        },
                        {
                            'name': 'time3',
                            'value': '3',
                            'checked': false,
                            'timeModel': false
                        },
                        {
                            'name': 'time4',
                            'value': '4',
                            'checked': false,
                            'timeModel': false
                        },
                        {
                            'name': 'time5',
                            'value': '5',
                            'checked': false,
                            'timeModel': false
                        }
                    ]
                };

                $scope.comment = {
                    'rating': 0,
                    'bedside': 0,
                    'time': 0,
                    'text': ''
                };

            }

            resetComments();

            $scope.checkRating = function (rating) {
                for (var i in $scope.form.rating) {

                    if ($scope.form.rating[i].value < rating) {
                        $scope.form.rating[i].checked = true;
                        $scope.form.rating[i].ratingModel = true;
                    } else {
                        $scope.form.rating[i].checked = false;
                        $scope.form.rating[i].ratingModel = false;
                    }
                }
                $scope.comment.rating = rating;
            };

            $scope.checkTime = function (rating) {
                for (var i in $scope.form.time) {

                    if ($scope.form.time[i].value < rating) {
                        $scope.form.time[i].checked = true;
                        $scope.form.time[i].timeModel = true;
                    } else {
                        $scope.form.time[i].checked = false;
                        $scope.form.time[i].timeModel = false;
                    }
                }
                $scope.comment.time = rating;
            };

            $scope.checkBedside = function (rating) {
                for (var i in $scope.form.bedside) {

                    if ($scope.form.bedside[i].value < rating) {
                        $scope.form.bedside[i].checked = true;
                        $scope.form.bedside[i].bedsideModel = true;
                    } else {
                        $scope.form.bedside[i].checked = false;
                        $scope.form.bedside[i].bedsideModel = false;
                    }
                }
                $scope.comment.bedside = rating;
            };

            $scope.validateForm = function () {
                if (!$rootScope.isSignedIn) {
                    //replace with service.
                    $scope.$emit("openLoginModal");
                } else {
                    if ($scope.comment.text != '' &&
                        $scope.comment.rating != 0 &&
                        $scope.comment.time != 0 &&
                        $scope.comment.bedside != 0
                    ) {
                        getData._STORE.businesses = null;

                        var comment = {
                            body: $scope.comment.text,
                            name: $scope.$parent.user.username,
                            bedsideManner: $scope.comment.bedside,
                            rating: $scope.comment.rating,
                            waitTime: $scope.comment.time,
                            _parent_id: $scope.$parent.business._id
                        };

                        quickblox.createComment(comment)
                            .then(function (result) {
                                var comment = {};
                                var unixDate = new Date(result.created_at * 1000);
                                var date = unixDate.getDate();
                                var month = unixDate.getMonth() + 1;
                                var year = unixDate.getFullYear();

                                comment.postDate = month + "/" + date + "/" + year;
                                comment.postName = result.name;
                                comment.rating = result.rating;
                                comment.comment = result.body;


                                $scope.$parent.comments.push(comment);

                                resetComments();
                            });

                    } else {
                        $scope.ratingForm.submitted = true;
                    }
                }
            };

            function createComment() {
                quickblox.createComment($rootScope.business.id);
            }
        }]
);

app.directive('modal', function () {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            show: '='
        },
        replace: true,
        transclude: true,
        link: function (scope, element, attrs) {
            scope.modalStyle = {};
            if (attrs.width) {
                scope.modalStyle.width = attrs.width;
            }
            if (attrs.height) {
                scope.modalStyle.height = attrs.height;
            }
            scope.hideModal = function () {
                scope.show = false;
                $(".notification").addClass("hidden");
                $("body").removeClass("modal-open");
            };
            $(element).find(".age").click(function (event) {
                $(element).find(".age").removeClass("active");
                $(event.target).addClass("active");
            });
            $(element).find(".gender").click(function (event) {
                $(element).find(".gender").removeClass("active");
                $(event.target).addClass("active");
            });
        },
        template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='modalStyle'><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
    };
});
