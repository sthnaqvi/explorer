// begin AltSheets changes
///////////////////////////////
// TODO: Put go into a config.js
// But how to include a file from local?

var GETH_HOSTNAME = "localhost";	// put your IP address!
var APP_HOSTNAME = "See package.json --> scripts --> start: Change 'localhost'!!!";

var GETH_RPCPORT = 8545; 		// for geth --rpcport GETH_RPCPORT
var APP_PORT = "See package.json --> scripts --> start: Perhaps change '8000'";

// this is creating the corrected geth command
var WL = window.location;
var geth_command = "geth --rpc --rpcaddr " + GETH_HOSTNAME + " --rpcport " + GETH_RPCPORT + '\
 --rpcapi "web3,eth" ' + ' --rpccorsdomain "' + WL.protocol + "//" + WL.host + '"';

////////////////////////////////////////////////////
//end AltSheets changes


'use strict';

angular.module('ethExplorer', ['ngRoute', 'ui.bootstrap', 'filters', 'ngSanitize', 'angularMoment'])

    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'views/main.html',
                controller: 'mainCtrl'
            }).when('/block/:blockId', {
                templateUrl: 'views/blockInfos.html',
                controller: 'blockInfosCtrl'
            }).when('/tx/:transactionId', {
                templateUrl: 'views/transactionInfos.html',
                controller: 'transactionInfosCtrl'
            }).when('/address/:addressId', {
                templateUrl: 'views/addressInfos.html',
                controller: 'addressInfosCtrl'
            }).// info page with links:
            when('/chain/api', {
                templateUrl: 'views/api/api.html',
                controller: 'chainInfosCtrl'
            }).// getBlock (current) & getBlock (last)
            when('/chain/', {
                templateUrl: 'views/chainInfos.html',
                controller: 'chainInfosCtrl'
            }).when('/chain/gaslimit', {
                templateUrl: 'views/api/gaslimit.html',
                controller: 'chainInfosCtrl'
            }).when('/chain/difficulty', {
                templateUrl: 'views/api/difficulty.html',
                controller: 'chainInfosCtrl'
            })./*
            // fast = doesn't need to getBlock any block
            when('/chain/blocknumber', {
                templateUrl: 'views/api/blocknumber.html',
                controller: 'fastInfosCtrl'
            }).
            when('/chain/supply', {
                templateUrl: 'views/api/supply.html',
                controller: 'fastInfosCtrl'
            }).
            when('/chain/mined', {
                templateUrl: 'views/api/mined.html',
                controller: 'fastInfosCtrl'
            }).

            // begin of: not yet, see README.md
            when('/chain/supply/public', {
                templateUrl: 'views/api/supplypublic.html',
                controller: 'fastInfosCtrl'
            }).*/
            // end of: not yet, see README.md

            otherwise({
                redirectTo: '/'
            });

            //$locationProvider.html5Mode(true);
        }])
    .run(function ($rootScope) {
        var Web3 = require('web3');
        var web3 = new Web3();

        // begin AltSheets changes
        web3.setProvider(new web3.providers.HttpProvider("https://mainnet.infura.io/0zolWfJDat4Hlc8ellFT"));
        // end AltSheets changes

        $rootScope.web3 = web3;
        // MetaMask injects its own web3 instance in all pages, override it
        // as it might be not compatible with the one used here
            window.web3 = web3;

        function sleepFor(sleepDuration) {
            var now = new Date().getTime();
            while (new Date().getTime() < now + sleepDuration) { /* do nothing */
            }
        }

        var connected = false;
        if (!web3.isConnected()) {
            $('#connectwarning').modal({keyboard: false, backdrop: 'static'})
            $('#connectwarning').modal('show')
        }
    })
    .controller('processRequestCtrl', function ($scope, $location) {

        $scope.processRequest = function () {
            var requestStr = $scope.ethRequest;

            if (requestStr !== undefined) {

                // maybe we can create a service to do the reg ex test, so we can use it in every controller ?
                var regexpTx = /[0-9a-zA-Z]{64}?/;
                //var regexpAddr =  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/; // TODO ADDR REGEX or use isAddress(hexString) API ?
                var regexpAddr = /^(0x)?[0-9a-f]{40}$/; //New ETH Regular Expression for Addresses
                var regexpBlock = /[0-9]{1,7}?/;

                var result = regexpTx.test(requestStr);
                if (result === true) {
                    goToTxInfos(requestStr)
                }
                else {
                    result = regexpAddr.test(requestStr.toLowerCase());
                    if (result === true) {
                        goToAddrInfos(requestStr.toLowerCase())
                    }
                    else {
                        result = regexpBlock.test(requestStr);
                        if (result === true) {
                            goToBlockInfos(requestStr)
                        }
                        else {
                            console.log("nope");
                            return null;
                        }
                    }
                }
            }
            else {
                return null;
            }
        };

        function goToBlockInfos(requestStr) {
            $location.path('/block/' + requestStr);
        }

        function goToAddrInfos(requestStr) {
            $location.path('/address/' + requestStr.toLowerCase());
        }

        function goToTxInfos(requestStr) {
            $location.path('/tx/' + requestStr);
        }
    })
    .directive('nTooltips', function () {
        return {
            link: function ($scope, element, attrs) {
                var imgArrow = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAALCAYAAACQy8Z9AAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAACgSURBVHjaYlx28hEDEYANiEOAeBm6RKSZLIZiJiIN3CgvzLUUSNcR4wIWYgxUl+D10JLkZWBjZmq8/eoLSLyJXENBBq4DGWgkJwAW0JHmA1EEDWYiYKA3zEAQ4GBlBhusKsbTiC8omIg1kBSDmUgxEJvBy089rsNnKFEGEmMwE5KBq4k1kJDBTEgG+pFiILLBJgqCKAYz/gcCBioDgAADAErmMqR0X1/QAAAAAElFTkSuQmCC';
                var imgArrowCss = {'position': 'absolute', 'top': '-10px', 'left': '5px'};
                var ntooltipsCss = {
                    'display': 'none',
                    'position': 'absolute',
                    'padding': '10px',
                    'left': '5px',
                    'font-size': '0.8em',
                    'background-color': 'white',
                    'border': '1px solid #a6c9e2',
                    '-moz-border-radius': '5px',
                    '-webkit-border-radius': '5px',
                    'z-index': '9999'
                };
                var ntooltips = function () {
                    this.xOffset = -10;
                    this.yOffset = 10;
                    element.unbind().hover(function (a) {
                        this.t = this.title;
                        this.title = ""
                        this.top = (a.pageY + yOffset);
                        this.left = (a.pageX + xOffset);
                        $("body").append('<p id="ntooltips"><img id="ntooltipsArrow" />' + this.t + "</p>");
                        $("p#ntooltips #ntooltipsArrow").attr("src", imgArrow).css(imgArrowCss);
                        $("p#ntooltips").css(ntooltipsCss).css("top", this.top + "px").css("left", this.left + "px").fadeIn("slow")
                    }, function () {
                        this.title = this.t;
                        $("p#ntooltips").fadeOut("slow").remove()
                    }).mousemove(function (a) {
                        this.top = (a.pageY + yOffset);
                        this.left = (a.pageX + xOffset);
                        $("p#ntooltips").css("top", this.top + "px").css("left", this.left + "px")
                    })
                };
                jQuery(document).ready(function (a) {
                    ntooltips()
                });
            }
        };
    });