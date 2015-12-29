var am = angular.module('am', ['ui.bootstrap']);
am.controller('amCtl', function ($scope, $http, $uibModal) {
    var AM_FORM_DATA = "amFormData";
    $scope.title = "AM REST DB Client";
    $scope.formData = {
        server: "16.165.217.186:8081",
        context: "/AssetManagerWebService/rs/",
        "ref-link": "",     // "db/amLocation/126874",
        collection: "",     // "EmplDepts",
        param: {
            limit: "100",
            offset: "0",
            filter: "",
            orderby: "",
            fields: []
        },

        method: "get",
        user: "admin",
        password: "",

        pageSize: 10
    };

    $scope.breadcrumb = [];

    $scope.store = function () {
        if (localStorage) {
            var form = {
                server: $scope.formData.server,
                user: $scope.formData.user,
                password: $scope.formData.password,
                pageSize: $scope.formData.pageSize
            };
            localStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
        }

    };

    if (localStorage && localStorage[AM_FORM_DATA]) {
        var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
        $scope.formData.server = form.server;
        $scope.formData.user = form.user;
        $scope.formData.password = form.password;
        $scope.formData.pageSize = form.pageSize;
    }

    $scope.toggleCheckbox = function (array, field) {
        if (!array)
            array = [];
        var idx = array.indexOf(field);
        if (idx > -1) {
            array.splice(idx, 1);
        }
        else {
            array.push(field);
        }
    };

    $scope.addFields = function (fields) {
//        var form = clone($scope.formData);
        $scope.formData.param.fields = fields;
        $scope.query();
        $scope.hiddenRelations();
    };

    // amx_record query
    $scope.query = function (form) {
        $scope.loading = true;
        $scope.tableData = {};

        // if param is query form, use it
        var form = form ? form : clone($scope.formData);
        $scope.tableName = form["ref-link"].split("/")[1];

        form.method = "get";
        $http.post('/am/rest', form).success(function (data) {
//            console.log("rest data: " + JSON.stringify(data));
            $scope.loading = false;
            if (data instanceof Object) {
//                console.log("query data:" + JSON.stringify(data));
                if (data.entities instanceof Array)
                    $scope.tableData = data;
                else if (data.type == 'Buffer') {
                    $scope.tableData.count = 0;
                } else {
                    $scope.tableData.count = 1;
                    $scope.tableData.entities = [];
                    $scope.tableData.entities.push(data);
                }
            } else {
                $scope.message = JSON.stringify(form) + "<br>" + data;
            }
        });
        $scope.store();
    };

    // load modal for CRUD
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
                    return clone($scope.formData);
                }
            }
        });

        modalInstance.result.then(function () {

        });
    };

    // retrieve amTree via AM metadata REST API
    $scope.metadata = function (schema, link, callback) {
        var form = clone($scope.formData);
        var metadata = "";
        if (schema == 'all') {
            metadata = "metadata/tables";
        } else {
            metadata = "metadata/schema/" + schema;

            // click query table from tree
            if (!link && !callback) {
                $scope.formData['ref-link'] = "db/" + schema;
//                $scope.tableName = schema;
                $scope.formData.param.fields = [];
                $scope.query();
                $scope.hiddenRelations();
            }

        }
        form['metadata'] = metadata;
        $http.post('/am/metadata', form).success(function (data) {

            if (callback instanceof Function) {
                callback(data);
            } else {
                if (data.Tables) {
                    $scope.metadata["tables"] = [];
                    for (var t in data.Tables.Table) {
                        $scope.metadata["tables"].push(data.Tables.Table[t]["$"]);
                    }

//                console.log("meta data: " + JSON.stringify($scope.metadata["tables"]));
                } else if (data.table) {
//                console.log("meta data table: " + JSON.stringify(data));
//                console.log("parent: " + JSON.stringify(parent));

                    if (link) {
                        link["table"] = data.table;
                        link["table"]["name"] = schema;

                        if (link["parent"])
                            link["table"].parent = link["parent"] + "." + link["$"]["sqlname"];
                        else
                            link["table"].parent = link["$"]["sqlname"];
//                    console.log("parent's reverse: " + parent["table"].parent);
                    }
                    else {
                        $scope.metadata["table"] = data.table;
                        $scope.metadata["table"]["name"] = schema;
                        $scope.metadata["table"]["fields"] = [];
                    }

                }
            }

        });
    };

    $scope.foldChild = function (link) {
//        console.log("child: " + JSON.stringify(child));
        delete link["table"];
    };

    // Breadcrumb feature ----------------------------------
    $scope.addBreadcrumb = function (refLink) {
        var bread = {
            label: refLink.split("/")[1] + "[" + refLink.split("/")[2] + "]",
            link: refLink
        };

        if ($scope.breadcrumb.map(function (e) {
            return e.label;
        }).indexOf(bread.label) < 0)
            $scope.breadcrumb.push(bread);
    };

    $scope.useBreadcrumb = function (bread) {
        var form = clone($scope.formData);
        form["ref-link"] = bread.link;
        form.param.fields = [];
        $scope.query(form);
        $scope.hiddenRelations();
    };

    $scope.removeBreadcrumb = function (refLink) {
//        console.log("refLink: " + refLink);
        if (!refLink)
            $scope.breadcrumb = [];
        else {
            var bread = {
                label: refLink.split("/")[1] + "[" + refLink.split("/")[2] + "]",
                link: refLink
            };
            var pos = $scope.breadcrumb.map(function (e) {
                return e.label;
            }).indexOf(bread.label);

            $scope.breadcrumb.splice(pos, 1);
        }
    };

    // advanced filter condition for ng-repeat
    $scope.filterFields = function (query) {
        if (query)
            return function (item) {
                return item['$']['sqlname'].toLowerCase().indexOf(query.toLowerCase()) > -1;
            };
    };

    // amTree fields checking
    $scope.checkTreeFields = function (field, fields, parent) {
        $scope.toggleCheckbox(fields, (parent) ? parent + '.' + field['$']['sqlname'] : field['$']['sqlname'])
    };

    $scope.ifTreeFieldsChecked = function (field, fields, parent) {
        return fields.indexOf((parent) ? parent + '.' + field['$']['sqlname'] : field['$']['sqlname']) > -1;
    };

    $scope.showRelations = function (record, parent) {
        var form = clone($scope.formData);
        form["ref-link"] = record["ref-link"];
        form.method = "get";
        if (!parent) {
            $scope.relations = [];
            $scope.relations.push({
                link: record["ref-link"].split("/")[1],
                'ref-link': record["ref-link"],
                schema: record["ref-link"].split("/")[1],
                active: true,
                form: form,
                records: [record],
                displayColumns: [],
                child: null
            });
        } else {
            parent.child = [];
            parent.child.push({
                link: parent.link,
                'ref-link': parent["ref-link"],
                schema: parent.schema,
                form: parent.form,
                active: true,
                records: [record],
                displayColumns: [],
                child: null
            });
        }

        $scope.addBreadcrumb(record["ref-link"]);

        $scope.metadata(record["ref-link"].split("/")[1], null, function (data) {
            var links = data.table.link;

            for (var i in links) {
                var form = clone($scope.formData);
                var sqlname = links[i]['$']['sqlname'];
                var schema = links[i]['$']['desttable'];

                // check 1v1
                if (links[i]['$']['card11']) {
                    form["ref-link"] = "db/" + schema;
                    form.param.filter = links[i]['$']['reverse'] + ".PK=" + record["ref-link"].split('/')[2];
                } else {
                    form["ref-link"] = record["ref-link"];
                    form["collection"] = "/" + sqlname;
                }

                form.param.fields = "";
                form.method = "get";

                if (!parent) {
                    $scope.relations.push({
                        link: sqlname,
                        schema: schema,
                        records: [],
                        displayColumns: [],
                        form: form
                    });
                } else {
                    parent.child.push({
                        link: sqlname,
                        schema: schema,
                        records: [],
                        displayColumns: [],
                        form: form
                    });
                }
//                console.log("fields: " + JSON.stringify(fields));

            }
        });

    };

    $scope.saveTemplate = function (obj) {

        $http.post('/json/template', obj).success(function (data) {
            console.log("saveTemplate: " + data);
        });
    };

    $scope.getFields = function (record) {
        $scope.metadata(record.schema, null, function (data) {
            record["fields"] = [];
            for (var i in data.table.field)
                record["fields"].push(data.table.field[i]['$']);
        });
    };

    $scope.getRecords = function (record) {
        if (record.form) {
            if (record.displayColumns.length > 0) {
                record.form.param.fields = record.displayColumns;
            }

            $http.post('/am/rest', record.form).success(function (data) {
                if (data.entities)
                    record.records = data.entities;
                else if (data)
                    record.records = [data];
            });
        }
    };

    $scope.hiddenRelations = function (record) {
//        console.log("record: " + JSON.stringify(record));
        if (record && record.link) {
            $scope.removeBreadcrumb("db/" + record.table + "/dummy");
            delete record.child;
        } else {
            delete $scope.relations;
            $scope.removeBreadcrumb();
        }
    };

    $scope.backTableList = function () {
        delete $scope.metadata["table"];
        $scope.formData.param.fields = [];
        $scope.breadcrumb = [];
        $scope.hiddenRelations();
        delete $scope.tableData;
        delete $scope.tableName;
        delete $scope.fieldSearch;
        delete $scope.linkSearch;
    };

    $scope.getMeta = function (ref) {
        var words = ref.split('/');
        for (var i in words) {
            if (words[i].indexOf("am") == 0)
                return 'metadata/schema/' + words[i];
        }
        return "metadata/tables";
    };

    $scope.clearMsg = function () {
        delete $scope.message;
    };

    $scope.length = function (obj) {
        return Object.keys(obj).length;
    };

    // list order by and pagination =============================
    $scope.predicate = '';
    $scope.reverse = true;
    $scope.order = function (predicate, reQuery) {
        console.log("order: " + predicate);
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
//        $scope.formData.param.orderby = predicate + ($scope.reverse) ? " desc" : "";
        if (reQuery) {
            var form = clone($scope.formData);
            form.param.orderby = predicate;
            if ($scope.reverse)
                form.param.orderby = form.param.orderby + " desc";
            $scope.query(form);
        }
    }
    ;

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
});

am.directive('fullHeight', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            console.log("element: " + element);
            var headerAndFooter = 154;
            scope.initializeWindowSize = function () {
                element.css('max-height', $window.innerHeight - headerAndFooter);
            };
            scope.initializeWindowSize();
            angular.element($window).bind('resize', function () {
                scope.initializeWindowSize();
            });
        }
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