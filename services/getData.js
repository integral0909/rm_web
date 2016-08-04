var appData = angular.module('rokketMed');

appData.factory('getData', ['$q', '$http', function($q, $http) {
	'use strict';

	var baseURL = 'https://${ROKKET_API_HOST}/api/v1/';
	var STORE = {
		conditions: null,
		treatments: null,
		treatment: null,
		surgeries: null,
		businesses: null,
		preventionsPromise: null,
		treatmentsPromise: null,
		surgeriesPromise: null,
		featured: null,
		surgeryCategories: null,
		businessesPromise: null
	};
	return {
		_STORE: STORE,
		getTreatmentsName: function(){
			if (STORE.treatmentsPromise) {
				return STORE.treatmentsPromise;
			} else if (STORE.treatments) {
				var deferred = $q.defer();
				deferred.resolve(STORE.treatments);
				return deferred.promise;
			} else {
				var self = this;
				var deferred = $q.defer();
				$http.get(baseURL + 'treatments')
				.then(function (response) {
					if (typeof response.data === 'object') {
						var treatments = response.data;
						STORE.treatments = treatments;
						deferred.resolve(STORE.treatments);
					} else {
						deferred.reject(response.data);
					}
					STORE.treatmentsPromise = null;
				},
				function (error) {
					deferred.reject(error.data);
					STORE.treatmentsPromise = null;
				});
				STORE.treatmentsPromise = deferred.promise;
				return deferred.promise;
			}
		},
		getSurgeriesName: function(){
			if (STORE.surgeriesPromise) {
				return STORE.surgeriesPromise;
			} else if (STORE.surgeries) {
				var deferred = $q.defer();
				deferred.resolve(STORE.surgeries);
				return deferred.promise;
			} else {
				var self = this;
				var deferred = $q.defer();
				$http.get(baseURL + 'surgeries')
				.then(function (response) {
					if (typeof response.data === 'object') {
						var surgeries = response.data;
						STORE.surgeries = surgeries;
						deferred.resolve(STORE.surgeries);
					} else {
						deferred.reject(response.data);
					}
					STORE.surgeriesPromise  = null;
				},
				function (error) {
					deferred.reject(error.data);
					STORE.surgeriesPromise  = null;
				});
				STORE.surgeriesPromise  = deferred.promise;
				return deferred.promise;
			}
		},
		getBusinessesName: function(){
			if (STORE.businessesPromise) {
				return STORE.businessesPromise;
			} else if (STORE.businesses) {
				var deferred = $q.defer();
				deferred.resolve(STORE.businesses);
				return deferred.promise;
			} else {
				var self = this;
				var deferred = $q.defer();
				$http.get(baseURL + 'businesses?projection=["name"]')
					.then(function (response) {
						if (typeof response.data === 'object') {
							var businesses = response.data;
							STORE.businesses = businesses;
							deferred.resolve(STORE.businesses);
						} else {
							deferred.reject(response.data);
						}
						STORE.businessesPromise  = null;
					},
					function (error) {
						deferred.reject(error.data);
						STORE.businessesPromise  = null;
					});
				STORE.businessesPromise  = deferred.promise;
				return deferred.promise;
			}
		},
		getTreatments: function(name) {
				var self = this;
				var deferred = $q.defer();
				$http.get(baseURL + 'treatment/name/'+encodeURIComponent(name))
				.then(function (response) {
					if (typeof response.data === 'object') {
						var treatments = response.data;

						$http.get(baseURL + 'businesses/treatment/'+encodeURIComponent(name) + '?projection=["name", "loc", "treatmentData", "state", "addr2", "addr1", "city", "state", "zip"]')
						.then(function(businesses){
							var business = businesses.data;
							for (var i= 0,treatment; treatment = treatments[i]; i++) {
								if (typeof treatment.businessesCount == "undefined") {
									treatment.businessesCount = 0;
									for (var j in business) {
										if (business[j].treatmentData) {
											for (var businessTreatment in business[j].treatmentData) {
												if (business[j].treatmentData[businessTreatment].id == treatment._id) {
													treatment.businessesCount++;
												}
											}
										}
									}
								}
							}
							treatments[1] = business;
							STORE.treatment = treatments;
							deferred.resolve(STORE.treatment);
						},
						function (error) {
							deferred.reject(error.data);
						});
					} else {
						deferred.reject(response.data);
					}
				},
				function (error) {
					deferred.reject(error.data);
				});
				return deferred.promise;
		},
		getSurgeryCategories: function(){
			var deferred = $q.defer();
			$http.get(baseURL + 'surgery-categories')
				.then(function(response){
					if(typeof  response.data === 'object'){
						STORE.surgeryCategories = response.data;
						deferred.resolve(STORE.surgeryCategories);
					}
				},function(error){
					deferred.reject(error.data);
				});

			return deferred.promise;
		},
		getSurgeriesNameByCategory: function(name){
			var deferred = $q.defer();
			$http.get(baseURL + 'surgery/group/'+encodeURIComponent(name)+'?projection["addr2", "addr1", "city", "state","zip"]')
				.then(function (response) {
					if (typeof response.data === 'object') {
						var surgeries = response.data;
						STORE.surgeries = surgeries;
						deferred.resolve(STORE.surgeries);
					} else {
						deferred.reject(response.data);
					}
					STORE.surgeriesPromise  = null;
				},
				function (error) {
					deferred.reject(error.data);
					STORE.surgeriesPromise  = null;
				});
			return deferred.promise;
		},
		getSurgeries: function(name) {
				var self = this;
				var deferred = $q.defer();
				$http.get(baseURL + 'surgery/name/'+encodeURIComponent(name))
				.then(function (response) {
					if (typeof response.data === 'object') {
						var surgeries = response.data;
						$http.get(baseURL + 'businesses/surgery/'+encodeURIComponent(name) + '?projection=["name", "loc", "surgeryData", "state", "addr2", "addr1", "city", "state", "zip"]')
						.then(function(businesses){
							var business = businesses.data;
							for (var i= 0,surgery; surgery = surgeries[i]; i++) {
								if (typeof surgery.businessesCount == "undefined") {
									surgery.businessesCount = 0;
									for (var j in business) {
										if(business[j].surgeryData){
											for (var businessSurgery  in business[j].surgeryData) {
												if (business[j].surgeryData[businessSurgery ].id == surgery._id) {
													surgery.businessesCount++;
												}
											}
										}
									}
								}
							}
							surgeries[1] = business;
							STORE.surgery = surgeries;
							deferred.resolve(STORE.surgery);
						},
						function (error) {
							deferred.reject(error.data);
						});
					} else {
						deferred.reject(response.data);
					}
				},
				function (error) {
					deferred.reject(error.data);
				});
				return deferred.promise;
		},
		getBusinessById: function(businessId){
			return $http.get(baseURL + 'businesses/'+encodeURIComponent(businessId))
				.then(function(response) {
					if (typeof response.data === 'object') {
						STORE.businesses = response.data;
						return response.data;
					} else {
						return $q.reject(response.data);
					}
				},
				function(error) {
					return $q.reject(error.data);
				});
		},
		getBusinessesByNameAndTreatment: function(name, business){
			return $http.get(baseURL + 'businesses/treatment/'+encodeURIComponent(name)+'/business/'+encodeURIComponent(business))
			.then(function(response) {
				if (typeof response.data === 'object') {
					STORE.businesses = response.data;
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			},
			function(error) {
				return $q.reject(error.data);
			});
		},
		getBusinessesByNameAndSurgery: function(name, business){
			return $http.get(baseURL + 'businesses/surgery/'+encodeURIComponent(name)+'/business/'+encodeURIComponent(business))
			.then(function(response) {
				if (typeof response.data === 'object') {
					STORE.businesses = response.data;
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			},
			function(error) {
				return $q.reject(error.data);
			});
		},
		getBusinesses: function(name) {
			return $http.get(baseURL + 'businesses')
			.then(function(response) {
				if (typeof response.data === 'object') {
					STORE.businesses = response.data;
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			},
			function(error) {
				return $q.reject(error.data);
			});
		},
		getBusinessExtras: function() {
			return $http.get(baseURL + 'categories/?visible=false')
			.then(function(response) {
				if (typeof response.data === 'object') {
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			},
			function(error) {
				return $q.reject(error.data);
			});
		},
		getBusinessPhoto: function(id) {
			return $http.get(baseURL + 'businesses/' + id + '/images')
			.then(function(response) {
				if (typeof response.data === 'object') {
					return response.data;
				} else {
					return $q.reject(response.data);
				}
			},
			function(error) {
				return $q.reject(error.data);
			});
		},
		getFeaturedItems: function(lat, long){
			if (STORE.featured) {
				var deferred = $q.defer();
				deferred.resolve(STORE.featured);
				return deferred.promise;
			} else {
				var deferred = $q.defer();
				$http.get(baseURL + 'services/featured/lat/'+lat+'/long/'+long)
					.then(function(response) {
						if (typeof response.data === 'object') {
							STORE.featured = response.data;
							deferred.resolve(STORE.featured);
						} else {
							STORE.featured = null;
							deferred.reject(null);
						}
					},
					function(error) {
						STORE.featured = null;
						deferred.reject(error.data);
					});
				return deferred.promise;
			}
		}
	};
}]);
