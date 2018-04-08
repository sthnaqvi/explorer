//var cryptoSocket = require('crypto-socket');
var BigNumber = require('bignumber.js');
angular.module('ethExplorer')
    .controller('viewCtrl', function ($rootScope, $location) {
        $rootScope.locationPath = $location.$$path;
    })
    .controller('mainCtrl', function ($rootScope, $scope, $location) {

        // Display & update block list
        getETHRates();
        updateBlockList();
        updateTXList();
        updateStats();
        getHashrate();

        web3.eth.filter("latest", function (error, result) {
            if (!error) {
                getETHRates();
                updateBlockList();
                updateTXList();
                updateStats();
                getHashrate();
                $scope.$apply();
            }
        });

        function updateStats() {
            web3.eth.getBlockNumber(function (err, currentBlockNumber) {
                if (err)
                    return console.log(err);
                $scope.blockNum = currentBlockNumber;
                if (!(!$scope.blockNum)) {
                    web3.eth.getBlock($scope.blockNum, function (err, blockNewest) {
                            if (err)
                                return console.log(err);
                            if (!(!blockNewest)) {
                                // difficulty
                                $scope.difficulty = blockNewest.difficulty;

                                // Gas Limit
                                $scope.gasLimit = new BigNumber(blockNewest.gasLimit).toFormat(0) + " m/s";

                                web3.eth.getBlock($scope.blockNum - 1, function (err, blockBefore) {
                                    if (err)
                                        return console.log(err);
                                    $scope.blocktime = blockNewest.timestamp - blockBefore.timestamp;
                                });
                            }
                        }
                    );
                }
            });
        }


        function getHashrate() {
            $.getJSON("https://www.etherchain.org/api/miningEstimator", function (json) {
                var hr = json.hashrate;
                $scope.hashrate = hr;
            });
        }

        function getETHRates() {
            $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function (json) {
                var price = Number(json[0].price_usd);
                $scope.ethprice = "$" + price.toFixed(2);
            });

            $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function (json) {
                var btcprice = Number(json[0].price_btc);
                $scope.ethbtcprice = btcprice;
            });

            $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function (json) {
                var cap = Number(json[0].market_cap_usd);
                //console.log("Current ETH Market Cap: " + cap);
                $scope.ethmarketcap = cap;
            });
        }

        function updateTXList() {
            web3.eth.getBlockNumber(function (err, currentBlockNumber) {
                if (err)
                    return console.log(err);
                $scope.txNumber = currentBlockNumber;
                $scope.recenttransactions = [];

                getTransactionsFromBlock(currentBlockNumber);

                function getTransactionsFromBlock(blockNumber) {
                    web3.eth.getBlock(blockNumber, true, function (err, block) {
                        if (err) {
                            console.log(err);
                            return getTransactionsFromBlock(blockNumber);
                        }

                        var transInBlock = [];
                        var loopLimit = 10;

                        if (loopLimit > block.transactions.length)
                            loopLimit = block.transactions.length;

                        for (var i = 0; i < loopLimit; i++) {
                            transInBlock.push(block.transactions[i]);

                            if (i === loopLimit - 1) {
                                $scope.recenttransactions = $scope.recenttransactions.concat(transInBlock);
                                $scope.$apply();
                                if ($scope.recenttransactions.length <= 10 && blockNumber > 0)
                                    getTransactionsFromBlock(--blockNumber)
                            }
                        }
                    });
                }
            });
        }

        function updateBlockList() {
            web3.eth.getBlockNumber(function (err, currentBlockNumber) {
                if (err)
                    return console.log(err);
                $scope.currentBlockNumber = currentBlockNumber;
                $scope.blocks = [];
                getBlockDetails(currentBlockNumber);

                function getBlockDetails(blockNumber) {
                    web3.eth.getBlock(blockNumber, function (err, block) {
                        if (err) {
                            console.log(err);
                            return getBlockDetails(blockNumber);
                        }
                        $scope.blocks = $scope.blocks.concat(block);
                        $scope.$apply();

                        if ($scope.blocks.length <= 10 && blockNumber > 0)
                            getBlockDetails(--blockNumber)
                    })
                }
            });
        }

    })
;

angular.module('filters', [])
    .filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length))
                length = 10;

            if (!end)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            } else {
                return String(text).substring(0, length - end.length) + end;
            }
        };
    })
    .filter('diffFormat', function () {
        //convert hash/solution to different kiloHash,MegaHash/solution and others
        return function (diffi) {
            if (isNaN(diffi)) return diffi;
            if (diffi > 1000000000000000) {
                var n = diffi / 1000000000000000;
                return n.toFixed(3) + " P";
            }
            if (diffi > 1000000000000) {
                var n = diffi / 1000000000000;
                return n.toFixed(3) + " T";
            }
            if (diffi > 1000000000) {
                var n = diffi / 1000000000;
                return n.toFixed(3) + " G";
            }
            if (diffi > 1000000) {
                var n = diffi / 1000000;
                return n.toFixed(3) + " M";
            }
            var n = diffi / 1000;
            return n.toFixed(3) + " K";
        };
    })
    .filter('stylize', function () {
        return function (style) {
            if (isNaN(style)) return style;
            var si = '<span class="btn btn-primary">' + style + '</span>';
            return si;
        };
    })
    .filter('stylize2', function () {
        return function (text) {
            if (isNaN(text)) return text;
            var si = '<i class="fa fa-exchange"></i> ' + text;
            return si;
        };
    })
    .filter('hashFormat', function () {
        //convert hash/second to different kiloHash,MegaHash/second and others
        return function (hashr) {
            if (isNaN(hashr)) return hashr;
            if (hashr > 1000000000000000) {
                var n = hashr / 1000000000000000;
                return n.toFixed(3) + " PH/s";
            }
            if (hashr > 1000000000000) {
                var n = hashr / 1000000000000;
                return n.toFixed(3) + " TH/s";
            }
            if (hashr > 1000000000) {
                var n = hashr / 1000000000;
                return n.toFixed(3) + " GH/s";
            }
            if (hashr > 1000000) {
                var n = hashr / 1000000;
                return n.toFixed(3) + " MH/s";
            }
            var n = hashr / 1000;
            return n.toFixed(3) + " KH/s";
        };
    })
    .filter('gasFormat', function () {
        return function (txt) {
            if (isNaN(txt)) return txt;
            var b = new BigNumber(txt);
            return b.toFormat(0) + " m/s";
        };
    })
    .filter('BigNum', function () {
        return function (txt) {
            if (isNaN(txt)) return txt;
            var b = new BigNumber(txt);
            var w = web3.fromWei(b, "ether");
            return w.toFixed(6) + " ETH";
        };
    })
    .filter('timestampAge', function () {
        return function (timestamp) {
            function dhms(ms) {
                var days = Math.floor(ms / (24 * 60 * 60 * 1000));
                var daysms = ms % (24 * 60 * 60 * 1000);
                var hrs = Math.floor((daysms) / (60 * 60 * 1000));
                var hrsms = daysms % (60 * 60 * 1000);
                var mins = Math.floor((hrsms) / (60 * 1000));
                var minsms = hrsms % (60 * 1000);
                var secs = Math.floor((minsms) / (1000));

                var diff = " ago";
                var secsString = secs + " sec";
                var minsString = mins + " min";
                var hrsString = hrs + " hr";
                var daysString = days + " day";

                if (secs > 1)
                    secsString = secs + " secs";
                if (mins > 1)
                    minsString = mins + " mins";
                if (hrs > 1)
                    hrsString = hrs + " hrs";
                if (days > 1)
                    daysString = days + " days";

                if (days >= 1)
                    return daysString + " " + hrsString + diff;
                if (hrs >= 1)
                    return hrsString + " " + minsString + diff;
                if (mins >= 1)
                    return minsString + " " + secsString + diff;

                return secsString + diff;
            }

            var dateNow = moment.utc();
            var txtTime = moment.utc(timestamp);
            var diffInMs = dateNow.diff(txtTime);
            return dhms(diffInMs);
        };
    })
    .filter('sizeFormat', function () {
        return function (size) {
            if (isNaN(size)) return size;
            var s = size / 1000;
            return s.toFixed(3) + " kB";
        };
    });
