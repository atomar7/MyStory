angular.module('MyApp',['reverseDirective','storyService', 'storyCtrl', 'mainCtrl', 'authService', 'appRoutes', 'userCtrl', 'userService'])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptor');
});