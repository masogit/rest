var ssh = angular.module('ssh', []);
ssh.controller('sshCtl', ['$scope', '$http', function ($scope, $http) {

    $scope.title = "Dashboard Console";

    $scope.ssh = {
        host: '16.165.217.163',
        user: 'root',
        pass: 'cmstest',
        cmd: 'source /root/keystonerc_admin && /root/create_vm.sh maso_vm 3',
        msg: []
    };

    // SSH command
    $scope.sshExec = function () {
        $scope.ssh.msg.push($scope.ssh.cmd);
        $http.post('/ssh/exec', $scope.ssh).success(function (data) {
            console.log("execute ssh command");
            if (data) {
                $scope.ssh.msg.push(data);
            }
        });
    };
}]);