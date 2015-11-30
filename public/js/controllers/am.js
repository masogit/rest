var am = angular.module('am', []);
am.controller('amCtl', ['$scope', '$http', function ($scope, $http) {
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

//    if (localStorage && localStorage[AM_FORM_DATA])
//        $scope.formData = JSON.parse(localStorage.getItem(AM_FORM_DATA));

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

    $scope.update = function (record) {
        var form = clone($scope.formData);
        form["ref-link"] = record["ref-link"];
        delete form["param"];
        form["collection"] = "";
        $http.post('/am/get', form).success(function (data) {
            if (data instanceof Object) {
                // compare
                var update = {};
                for (key in data) {
                    if (JSON.stringify(data[key]) != JSON.stringify(record[key]))
                        update[key] = record[key];
                }
                form["data"] = update;
                $http.post('/am/put', form).success(function (data) {
                    $scope.message = data;
                });
            }
        });
    };

    $scope.delete = function (record) {
        var form = clone($scope.formData);
        form["ref-link"] = record["ref-link"];
        delete form["param"];
        form["collection"] = "";
        $http.post('/am/delete', form).success(function (data) {
            $scope.message = data;
        });
    };

    $scope.load = function (data) {
        $scope.recordData = clone(data);
    };

    $scope.close = function () {
        delete $scope.recordData;
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

    $scope.showObject = function (obj) {
        var json = obj;
//        console.log("obj: " + obj);
        return JSON.stringify(json);
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

function clone(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}