angular.module('authService',[])

//factory is more organized way to fetch from server api
//here factory name is auth
//authtoken is a different factory
	.factory('Auth', function($http, $q, AuthToken) {

		var authFactory = {};

		authFactory.login = function(username,password){
			//fetch data from server
			console.log('reached api will call api now 1');
			return $http.post('/api/login', {
				username: username,
				password: password
			})

			//success callback function called promise
			.success(function(data){
				AuthToken.setToken(data.token);
				return data;
				console.log('beginning loggin 1' + data);
			})

		}

		authFactory.logout = function(){
			AuthToken.setToken();
		}

		authFactory.isLoggedIn = function(){
			if(AuthToken.getToken()){
				return true;
			}else{
				return false;
			}
		}

		authFactory.getUser = function(){
			if(AuthToken.getToken()){
				return $http.get('/api/me');
			}else{
				return $q.reject({ message : "User has no token"});
			}
		}

		return authFactory;

	})

//this factory will deal with browser to get and set token 
//window will get token from browser
//localstorage is browser storage where token will be stored
	.factory('AuthToken', function($window){
		var authTokenFactory = {};
		authTokenFactory.getToken = function(){
			return $window.localStorage.getItem('token');
		}
		authTokenFactory.setToken = function(token){
			if(token){
				$window.localStorage.setItem('token', token);
			}else{
				$window.localStorage.removeItem('token');
			}
		}

		return authTokenFactory;
	})



.factory('AuthInterceptor', function($q, $location, AuthToken){
	var interceptorFactory = {};

	interceptorFactory.request = function(config){
		var token = AuthToken.getToken();
		if(token){
			config.headers['x-access-token'] = token;
		}
		return config;
	}

	interceptorFactory.responseError = function(response){
		if(response.status == 403){
			$location.path('/login');
		}
		return $q.reject(response);
	}

	return interceptorFactory;
});