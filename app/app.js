'use strict';

angular.module('myApp', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/:code', {
    templateUrl: 'index.html',
    controller: 'PostcodeApp'
  });
  $routeProvider.otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
}])

.service('postcodeApi', ['$http', function($http) {
  const endpoint = 'http://postcodes.io/postcodes/';

  let apiService = {};

  apiService.getPostcodeData = postcode => $http.get(`${endpoint}${postcode}`);
  apiService.getNearestPostcodes = postcode => $http.get(`${endpoint}${postcode}/nearest`);

  return apiService;
}])

.controller('PostcodeApp', ['$scope', '$location', '$routeParams', 'postcodeApi', function($scope, $location, $routeParams, postcodeApi) {

  class ApiRequestHandler {
    constructor(responseAdapter) {
      this.responseAdapter = responseAdapter,
      this.submitted = false,
      this.loading = false,
      this.success = false,
      this.failure = false,
      this.result = {}
    }

    submitRequest() {
      this.submitted = true,
      this.loading = true
    }

    handleValidResponse(response) {
      this.loading = false;
      this.success = true;
      this.failure = false;
      this.result = this.responseAdapter(response);
    }

    handleInvalidResponse(error) {
      this.loading = false;
      this.success = false,
      this.failure = true,
      this.result = {
        error: error.data.error
      }
    }
  }

  function postcodeResponseAdapter(response) {
    return {
      country: response.data.result.country,
      region: response.data.result.region
    }
  }

  function nearestPostcodeResponseAdapter(response) {
    return response.data.result.map((item) => {
      return {
        postcode: item.postcode,
        country: item.country,
        region: item.region
      }
    })
  }
  
  $scope.postcodeInput = '';
  
  $scope.query = new ApiRequestHandler(postcodeResponseAdapter);
  $scope.nearestQuery = new ApiRequestHandler(nearestPostcodeResponseAdapter);

  $scope.fetchPostcode = function() {
    $scope.query.submitRequest();
    postcodeApi.getPostcodeData($scope.postcodeInput).then(
      function(response) {
        $scope.query.handleValidResponse(response);
      },
      function(error) {
        console.warn(error);
        $scope.query.handleInvalidResponse(error)
      }
    )
    $scope.nearestQuery.submitRequest();
    postcodeApi.getNearestPostcodes($scope.postcodeInput).then(
      function(response) {
        $scope.nearestQuery.handleValidResponse(response);
      },
      function(error) {
        console.warn(error);
        $scope.nearestQuery.handleInvalidResponse(error);
      }
    )
  }

  $scope.submitPostcode = function() {
    $location.path(`/${$scope.postcodeInput}`);
    $scope.fetchPostcode();
  }

  if ($location.path().length > 1) {
    $scope.postcodeInput = $location.path().substring(1);
    $scope.fetchPostcode();
  }
  
}]);