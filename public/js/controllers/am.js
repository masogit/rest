var am = angular.module('am', ['ui.bootstrap']);
am.controller('amCtl', ['$scope', '$http', '$uibModal', '$log', function ($scope, $http, $uibModal, $log) {
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

}]);

am.controller('amModalCtrl', function ($scope, $http, $uibModalInstance, data, form) {
    $scope.title = data['ref-link'];
    $scope.recordData = data;
    $scope.modifyData = {};
    $scope.ifUpdated = false;
    for (key in $scope.recordData) {
        $scope.modifyData[key] = "";
    }
    var form = clone(form);

    $scope.create = function (record) {
        var pos = data["ref-link"].lastIndexOf("/")
        form["ref-link"] = data["ref-link"].substring(0, pos);
        console.log("ref-link:" + form["ref-link"]);
        delete form["param"];
        form["collection"] = "";

        var update = {};
        for (key in record) {
            if (!JSON.stringify(record[key]).isEmpty() && key != 'ref-link' && key != 'self')
                update[key] = record[key];
        }
        form["data"] = update;
        $http.post('/am/post', form).success(function (data) {
            $scope.message = data;
            $scope.ifUpdated = true;
        });
    };

    $scope.update = function (record) {
        form["ref-link"] = data["ref-link"];
        delete form["param"];
        form["collection"] = "";

        var update = {};
        for (key in record) {
//            console.log("JSON.stringify(record[key]: " + JSON.stringify(record[key]));
            if (!JSON.stringify(record[key]).isEmpty() && key != 'ref-link' && key != 'self')
                update[key] = record[key];
        }
        form["data"] = update;
        $http.post('/am/put', form).success(function (data) {
            $scope.message = data;
            $scope.ifUpdated = true;
        });
    };

    $scope.delete = function (record) {
        form["ref-link"] = record["ref-link"];
        delete form["param"];
        form["collection"] = "";
        $http.post('/am/delete', form).success(function (data) {
            $scope.message = data;
            $scope.ifUpdated = true;
        });
    };

    $scope.fill = function () {
        for (var data in $scope.recordData) {
            if ($scope.recordData[data] instanceof Object)
                $scope.modifyData[data] = Object.keys($scope.recordData[data])[0];
            else
                $scope.modifyData[data] = $scope.recordData[data];
        }
    };

    $scope.clearMsg = function () {
        delete $scope.message;
    };

    $scope.ok = function () {
        if ($scope.ifUpdated)
            $uibModalInstance.close();
        else
            $uibModalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
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

String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};