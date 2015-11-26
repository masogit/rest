angular.module('cmsController', [])

    .controller('dashboardCtl', ['$scope', '$http', 'topology', '$interval', function ($scope, $http, topology, $interval) {

        $scope.title = "Dashboard Console";
        $scope.formData = {
            server: "16.165.217.57:9091",
            view: "AM Node Push 2.0",
            interval: 2,
            pageSize: 5,
            ciType: ''
        };

        $scope.statistics = {};
        $scope.time = "";
        $scope.currentPage = 0;
        $scope.raw = [];
        $scope.cis = [];


        // get UCMDB TQL data
        $scope.getREST = function () {
//            $scope.getContainer();
            $scope.getTopology();
        };


        $scope.getTopology = function () {
            topology.get($scope.formData).success(function (data) {
                var d = new Date();
                $scope.time = d.toLocaleString();

                if (data.cis instanceof Array) {

                    $scope.raw = data.cis; // save raw data

                    var ciNumber = {};
                    var ISNumber = {};
                    data.cis.map(function (obj) {

                        // count all CI type
                        if (obj.type in ciNumber)
                            ciNumber[obj.type]++;
                        else
                            ciNumber[obj.type] = 1;

                        // create time
                        if ('create_time' in obj.properties) {
                            obj.properties['timestamp'] = Date.parse(obj.properties['create_time']);
                        }

                    });


                    $scope.statistics = ciNumber;	// caculate statistics

                    $scope.queryCis($scope.formData.ciType); // query specified Cis by ciType

                }

            });
        };

        // build records
        $scope.queryCis = function (ciType) {

            $scope.formData.ciType = ciType;
            $scope.disp_ciType = ciType;

            // save web storage
            if (localStorage)
                localStorage.ciType = $scope.formData.ciType;

            $scope.cis = [];
            for (i in $scope.raw) {
                if ($scope.raw[i].type == ciType && $scope.raw[i].properties)
                    $scope.cis.push($scope.raw[i].properties);
            }

        };

        // capitalize each word, replace _ to " "
        $scope.t2t = function (type) {
            return type.replace(/_/g, " ").capitalize();
        };


        // form behavior ==========================================
        $scope.submit = function () {
            for (form in $scope.formData) {
                $scope.formData[form] = $scope["disp_" + form];

                // save web storage
                if (localStorage)
                    localStorage[form] = $scope.formData[form];
            }

            $scope.getREST();
            $scope.setInterval();
            $scope.initCharts();

        };

        $scope.reset = function () {

            for (form in $scope.formData) {
                // load web storage
                if (localStorage)
                    $scope.formData[form] = localStorage[form] ? localStorage[form] : $scope.formData[form];

                $scope["disp_" + form] = $scope.formData[form]
            }

        };

        $scope.setInterval = function () {
            $interval.cancel(interval);
            interval = $interval(function () {
                $scope.getREST();
            }, $scope.formData.interval * 1000);
        };

        $scope.disp = function () {
            var display = false;
            for (form in $scope.formData) {
                display = display || ($scope.formData[form] != $scope["disp_" + form]);
            }
            return display;
        };


        // list order by and pagination =============================
        $scope.predicate = 'timestamp';
        $scope.reverse = true;
        $scope.order = function (predicate) {
            console.log("order: " + predicate);
            $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
            $scope.predicate = predicate;
        };

        $scope.jump = function (i) {
            var pos = i;
            $scope.currentPage = pos;
        };

        // initial ======================================================
        $scope.reset();	// inital run for set disp value
        $scope.getREST(); // inital get, then interval
        var interval = $interval(function () {
            $scope.getREST();
        }, $scope.formData.interval * 1000);

    }]);
