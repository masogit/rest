var am = angular.module('am', ['ui.bootstrap']);
am.controller('amCtl', function ($scope, $http, $uibModal, $log) {
    var AM_FORM_DATA = "amFormData";
    $scope.title = "AM REST DB Client";
    $scope.formData = {
        server: "16.165.217.186:8081",
        context: "/AssetManagerWebService/rs/",
        "ref-link": "db/amLocation/126874",
        collection: "EmplDepts",
        param: {
            limit: "10",
            offset: "1",
            filter: "",
            orderby: "",
            fields: []
        },

        user: "admin",
        password: ""
    };
    $scope.pageSize = 10;

    if (localStorage && localStorage[AM_FORM_DATA])
        $scope.formData = JSON.parse(localStorage.getItem(AM_FORM_DATA));

    $scope.query = function () {
        $scope.tableData = {};
        $http.post('/am/get', $scope.formData).success(function (data) {
            if (data instanceof Object) {
                if (data.entities instanceof Array)
                    $scope.tableData = data;
                else if (data.type == 'Buffer') {
                    $scope.tableData.count = 0;
                } else {
                    $scope.tableData.count = 1;
                    $scope.tableData.entities = [];
                    $scope.tableData.entities.push(data);
                }
            }
        });
        $scope.store();
    };

    $scope.load = function (data) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'am_modal.html',
            controller: 'amModalCtrl',
            size: "modal-lg",
            resolve: {
                data: function () {
                    return data;
                },
                form: function () {
                    return $scope.formData;
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.query();
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.store = function () {
        if (localStorage)
            localStorage.setItem(AM_FORM_DATA, JSON.stringify($scope.formData));
    };

    // list order by and pagination =============================
    $scope.predicate = '';
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

    $scope.showValue = function (value) {
        if (value instanceof Object)
            return value[Object.keys(value)[0]];
        else
            return value;
    };

    $scope.getMeta = function (ref) {
        return ref.replace(/db/g, 'metadata/schema');
    };
});

am.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
    }
});

am.filter('range', function () {
    return function (input, total) {
        total = Math.ceil(total);
        for (var i = 0; i < total; i++) {
            input.push(i);
        }
        return input;
    };
});