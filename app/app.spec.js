'use strict';

describe('PostcodeApp', function () {

    var $httpBackend, $rootScope, $location, createController;

    beforeEach(module('myApp'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $location = $injector.get('$location');
        
        $rootScope = $injector.get('$rootScope');
        var $controller = $injector.get('$controller');

        createController = function () {
            return $controller('PostcodeApp', { '$scope': $rootScope });
        };
    }));


    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Should adapt postcode response into app data format', function () {
        $httpBackend.expectGET('http://postcodes.io/postcodes/CB233AA').respond(200, {
            result: {
                country: 'England',
                region: 'East of England'
            }
        });
        $httpBackend.expectGET('http://postcodes.io/postcodes/CB233AA/nearest').respond(200, {
            result: [
                {
                    postcode: 'CB23 3AA',
                    region: 'East of England',
                    country: 'England'
                },
                {
                    postcode: 'CB23 3AH',
                    region: 'East of England',
                    country: 'England'
                }
            ]
        });
        var controller = createController();
        $rootScope.postcodeInput = "CB233AA";
        $rootScope.fetchPostcode();
        $httpBackend.flush();
        expect($rootScope.query.result).toEqual({
            country: 'England',
            region: 'East of England'
        });
        expect($rootScope.nearestQuery.result).toEqual([
            {
                postcode: 'CB23 3AA',
                region: 'East of England',
                country: 'England'
            },
            {
                postcode: 'CB23 3AH',
                region: 'East of England',
                country: 'England'
            }
        ]);
        expect($rootScope.query.success).toEqual(true);
        expect($rootScope.query.failure).toEqual(false);
        
    })

    it('Should handle bad requests', function () {
        $httpBackend.expectGET('http://postcodes.io/postcodes/bad').respond(404, {error: "Invalid postcode"});
        $httpBackend.expectGET('http://postcodes.io/postcodes/bad/nearest').respond(404, {error: "Invalid postcode"});
        var controller = createController();
        $rootScope.postcodeInput = "bad";
        $rootScope.fetchPostcode();
        $httpBackend.flush();
        expect($rootScope.query.success).toEqual(false);
        expect($rootScope.query.failure).toEqual(true);
        expect($rootScope.query.result).toEqual({error: "Invalid postcode"});
    })

    it('should handle submission of postcode into form', function() {
        $httpBackend.expectGET('http://postcodes.io/postcodes/CB233AA').respond(200, {
            result: {
                country: 'England',
                region: 'East of England'
            }
        });
        $httpBackend.expectGET('http://postcodes.io/postcodes/CB233AA/nearest').respond(200, {
            result: [
                {
                    postcode: 'CB23 3AA',
                    region: 'East of England',
                    country: 'England'
                },
                {
                    postcode: 'CB23 3AH',
                    region: 'East of England',
                    country: 'England'
                }
            ]
        });
        $httpBackend.expectGET('index.html').respond(200, {});
        var controller = createController();
        $rootScope.postcodeInput = "CB233AA";
        $rootScope.submitPostcode();
        $httpBackend.flush();
        expect($location.path()).toEqual('/CB233AA');
        expect($rootScope.query.result).toEqual({
            country: 'England',
            region: 'East of England'
        });
        expect($rootScope.nearestQuery.result).toEqual([
            {
                postcode: 'CB23 3AA',
                region: 'East of England',
                country: 'England'
            },
            {
                postcode: 'CB23 3AH',
                region: 'East of England',
                country: 'England'
            }
        ]);
        expect($rootScope.query.success).toEqual(true);
        expect($rootScope.query.failure).toEqual(false);
    })

});