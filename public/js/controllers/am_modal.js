am.controller('amModalCtrl', function ($scope, $http, $uibModalInstance, data, form) {
    $scope.title = data['ref-link'];
    $scope.recordData = data;
    $scope.modifyData = {};
    $scope.ifUpdated = false;
    for (var key in $scope.recordData) {
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
            if (JSON.stringify(record[key]).length > 2 && key != 'ref-link' && key != 'self')
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
            if (JSON.stringify(record[key]).length > 2 && key != 'ref-link' && key != 'self')
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