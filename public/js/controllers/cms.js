angular.module('cmsController', [])

    .controller('dashboardCtl', ['$scope', '$http', 'topology', '$interval', function ($scope, $http, topology, $interval) {
        var CMS_FORM_DATA = "cmsFormData";
        $scope.title = "CMS REST Console";
        $scope.formData = {
            server: "16.165.217.57:9091",
            view: "AM Node Push 2.0",
            history: "",
            historyViews: ["AM Node Push 2.0", "AM Installed Software Push 2.0"],
//            interval: 2,
            pageSize: 5,
            ciType: ''
        };


        $scope.init = function () {
            $scope.statistics = {};
            $scope.time = "";
            $scope.currentPage = 0;
            $scope.raw = [];
            $scope.cis = [];
            if (localStorage)
                $scope.formData = JSON.parse(localStorage.getItem(CMS_FORM_DATA));
        };

        $scope.getTopology = function () {
            $scope.statistics = {};
            $scope.cis = [];
            topology.get($scope.formData).success(function (data) {
                var d = new Date();
                $scope.time = d.toLocaleString();

                if (data.cis instanceof Array) {

                    $scope.raw = data.cis; // save raw data

                    var ciNumber = {};
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

            // save web storage
            if (localStorage)
                localStorage.setItem(CMS_FORM_DATA, JSON.stringify($scope.formData));

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
        $scope.save = function () {
//            console.log("$scope.view: " + $scope.view);
            if ($scope.formData.view && $scope.formData.historyViews.indexOf($scope.formData.view) < 0)
                $scope.formData.historyViews.push($scope.formData.view);

            if (localStorage)
                localStorage.setItem(CMS_FORM_DATA, JSON.stringify($scope.formData));

            $scope.getTopology();

        };

        $scope.remove = function () {
            var i = $scope.formData.historyViews.indexOf($scope.formData.view);
            $scope.formData.historyViews.splice(i, 1);

            if ($scope.formData.historyViews[0])
                $scope.formData.view = $scope.formData.historyViews[0];

            $scope.save();
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
        $scope.init();	// inital run for set disp value

    }]);
