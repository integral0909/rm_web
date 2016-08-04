var quickblox = angular.module('rokketMed');

quickblox.factory('quickblox', ["$rootScope", "$q", function($rootScope, $q) {
	'use strict';

	var STORE = {
		user: null
	};

	return {

		sessionStart: function() {
			
			var deferred = $q.defer();
			//Initialise Quickblox session
			QB.init(14131, 'uEeydURq8JKpY4S', 'q27C3Xa4zEP4t4y', false);
			
			//Create and start the session
			QB.createSession(function(err, result) {
				if (err) {
					deferred.reject(err);
				}else{
					deferred.resolve(result);
				}	
			});
			
			return deferred.promise;
		},

		signUp: function(login, email, password) {
			
			//User already in session, return it
			if(STORE.user != null){
				var deferred = $q.defer();
				deferred.resolve(STORE.user);
				return deferred.promise;
			}else{
				var deferred = $q.defer();
				
				//Set register params
				var params = {
					login: login,
					email: email,
					password: password
				};
				
				//Create new user
				QB.users.create(params, function(err, result) {
					if (result !== null) {
						//User registered -> return user info
						STORE.user = result;
						deferred.resolve(STORE.user);
					} else {
						//Error on user registration, return it
						deferred.reject(err);
					}
				});
				return deferred.promise;
			}
			
		},

		logIn: function(username, password) {

			//User already in session, return it
			if(STORE.user != null){
				var deferred = $q.defer();
				deferred.resolve(STORE.user);
				return deferred.promise;
			} else {
				var deferred = $q.defer();

				var params = {
					login: username,
					password: password
				};

				QB.login(params, function (err, result) {
					if(err){
						deferred.reject(err);
					}else{
						//Return user
						STORE.user = result;
						deferred.resolve(STORE.user);
					}
				});
				return deferred.promise;
			}
		},

		logout: function() {
			QB.logout(function() {
				STORE.user = null;
			});
		},

		resetPassword: function(email){
			var deferred = $q.defer();

			QB.users.resetPassword(email, function(error, response){
				if (!error) {
					deferred.resolve(response);
				}else{
					deferred.reject(error);
				}
			});

			return deferred.promise;
		},

		createCustomData: function(data) {

			QB.data.create("UserSpecs", data, function(err, result) {
				if(err){
					console.log(err);
				}
			});

		},

		updateCustomData: function(data) {

			QB.data.update("UserSpecs", data, function(err, result) {
				if(err){
					console.log(err);
				}
			});

		},

		customData: function(userId, customData) {
			var deferred = $q.defer();
			var self = this;
			var data = { user_id: userId };
			QB.data.list("UserSpecs", data, function(err, result) {
				if(customData){
					if (result.items.length === 0) {
						self.createCustomData(customData);
					} else {
						self.updateCustomData(customData);
					}
				}
				deferred.resolve(result);

			});
			return deferred.promise;
		},

		createComment: function(data) {

			var deferred = $q.defer();

			QB.data.create("Comments", data, function(err, result) {
				if (result !== null) {
					deferred.resolve(result);
				} else {
					deferred.reject(err);
				}
			});

			return deferred.promise;
		},

		listComments: function(bizID) {

			var deferred = $q.defer();

			var data = {
				_parent_id: bizID,
				sort_asc: 'created_at'
			}

			QB.data.list("Comments", data, function(err, result) {
				if(err){
					deferred.reject(err);
				}else{
					deferred.resolve(result);
				}
			});

			return deferred.promise;
		}
	};
}]);
