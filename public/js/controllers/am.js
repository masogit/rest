var am = angular.module('am', []);
am.controller('amCtl', ['$scope', '$http', function ($scope, $http) {
    var AM_FORM_DATA = "amFormData";
    $scope.title = "AM REST DB Client";
    $scope.formData = {
        user: "admin",
        password: "",
        server: "16.165.217.186:8081",
        context: "/AssetManagerWebService/rs/db/",
        table: "amEmplDept",
        limit: "10",
        offset: "0",
        filter: "",
        orderBy: "",
        fields: [],
        id: "",
        collection: "",
        pageSize: 5,
        binary: 'false'
    };

    if (localStorage && localStorage[AM_FORM_DATA])
        $scope.formData = JSON.parse(localStorage.getItem(AM_FORM_DATA));

    $scope.query = function () {
        $scope.tableData = {};
        $http.post('/am/rest', $scope.formData).success(function (data) {
            if (data) {
                $scope.tableData = data;
            }
        });
        $scope.save();
    };

    $scope.save = function () {
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
}]);

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