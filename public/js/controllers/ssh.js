var ssh = angular.module('ssh', []);
ssh.controller('sshCtl', ['$scope', '$http', function ($scope, $http) {
    var SSH_FORM_DATA = "sshFormData";
    $scope.title = "SSH Console";

    $scope.ssh = {
        host: '16.165.217.163',
        user: 'root',
        pass: 'cmstest',
        cmd: 'source /root/keystonerc_admin && /root/create_vm.sh maso_vm 3',
        msg: []
    };

    if (localStorage && localStorage[SSH_FORM_DATA])
        $scope.ssh = JSON.parse(localStorage.getItem(SSH_FORM_DATA));

    // SSH command
    $scope.sshExec = function () {
        $scope.ssh.msg.push($scope.ssh.cmd);
        $http.post('/ssh/exec', $scope.ssh).success(function (data) {
            console.log("execute ssh command");
            if (data) {
                $scope.ssh.msg.push(data);
            }
        });
        if (localStorage)
            localStorage.setItem(SSH_FORM_DATA, JSON.stringify($scope.ssh));
    };
}]);