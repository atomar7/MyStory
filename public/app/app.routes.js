angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider){
	$routeProvider
		.when('/', {
			templateUrl: 'app/views/pages/home.html',
			controller: 'MainController',
			controllerAs: 'main'
		})
		.when('/login', {
			templateUrl: 'app/views/pages/login.html'
		})
		.when('/signup', {
			templateUrl: 'app/views/pages/signup.html'
		})
		.when('/allStories', {
			templateUrl: 'app/views/pages/allStories.html',
			controller: 'AllStoriesController',
			controllerAs: 'story',

			//we need to add resolve otherwise it will load all together and app will be slow
			resolve: {
				stories: function(Story){
					return Story.allStories();
				}
			}
		})
		

		//to configure how the app linking path is stored
	$locationProvider.html5Mode(true);
})