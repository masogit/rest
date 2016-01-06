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

    //    $scope.breadcrumb = [];

    $scope.store = function () {
        if (localStorage) {
            var form = {
                server: $scope.formData.server,
                user: $scope.formData.user,
                password: $scope.formData.password,
                pageSize: $scope.formData.pageSize,
                limit: $scope.formData.param.limit,
                offset: $scope.formData.param.offset
            };
            localStorage.setItem(AM_FORM_DATA, JSON.stringify(form));
        }
        delete $scope.serverbar;
    };

    if (localStorage && localStorage[AM_FORM_DATA]) {
        var form = JSON.parse(localStorage.getItem(AM_FORM_DATA));
        $scope.formData.server = form.server;
        $scope.formData.user = form.user;
        $scope.formData.password = form.password;
        $scope.formData.pageSize = form.pageSize;
        $scope.formData.param.limit = form.limit;
        $scope.formData.param.offset = form.offset;
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
        //        console.log("metadata table: " + JSON.stringify($scope.metadata.table));
        var form = clone($scope.formData);
        form.param.fields = fields;
        //        $scope.formData.param.fields = fields;
        $scope.query(form);
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
                $scope.tableData.form = form;
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
        var org_schema = clone(schema);
        var metadata = "";
        if (schema == 'all') {
            metadata = "metadata/tables";
            $scope.metadata.loading = true;
        } else {
            metadata = "metadata/schema/" + schema;

            if (!link && !callback) {
                $scope.formData['ref-link'] = "db/" + schema;
            }

        }

        // loading
        if (link)
            link.loading = true;

        form['metadata'] = metadata;
        $http.post('/am/metadata', form).success(function (data) {
            // loading
            if (link)
                link.loading = false;

            if (callback instanceof Function) {
                callback(data);
            } else {
                if (data.Tables) {
                    $scope.metadata.loading = false;
                    $scope.metadata["tables"] = [];
                    for (var t in data.Tables.Table) {
                        $scope.metadata["tables"].push(data.Tables.Table[t]["$"]);
                    }

                    //                console.log("meta data: " + JSON.stringify($scope.metadata["tables"]));
                } else if (data.table) {
                    //                console.log("meta data table: " + JSON.stringify(data));
                    //                console.log("parent: " + JSON.stringify(parent));

                    if (link) {
                        link.loading = false;
                        link["table"] = data.table;
                        // link["table"]["name"] = schema;

                        if (link["parent"])
                            link["table"].parent = link["parent"] + "." + link["$"]["sqlname"];
                        else
                            link["table"].parent = link["$"]["sqlname"];
                        //                    console.log("parent's reverse: " + parent["table"].parent);
                    }
                    else {
                        // schema.loading = false;
                        $scope.metadata["table"] = data.table;
                        $scope.metadata["table"]["fields"] = [];
                        if ($scope.tempTable)
                            $scope.metadata["table"]["fields"] = $scope.tempTable.fields;
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
    //    $scope.addBreadcrumb = function (refLink) {
    //        var bread = {
    //            label: refLink.split("/")[1] + "[" + refLink.split("/")[2] + "]",
    //            link: refLink
    //        };
    //
    //        if ($scope.breadcrumb.map(function (e) {
    //            return e.label;
    //        }).indexOf(bread.label) < 0)
    //            $scope.breadcrumb.push(bread);
    //    };
    //
    //    $scope.useBreadcrumb = function (bread) {
    //        var form = clone($scope.formData);
    //        form["ref-link"] = bread.link;
    //        form.param.fields = [];
    //        $scope.query(form);
    //        $scope.hiddenRelations();
    //    };
    //
    //    $scope.removeBreadcrumb = function (refLink) {
    //        //        console.log("refLink: " + refLink);
    //        if (!refLink)
    //            $scope.breadcrumb = [];
    //        else {
    //            var bread = {
    //                label: refLink.split("/")[1] + "[" + refLink.split("/")[2] + "]",
    //                link: refLink
    //            };
    //            var pos = $scope.breadcrumb.map(function (e) {
    //                return e.label;
    //            }).indexOf(bread.label);
    //
    //            $scope.breadcrumb.splice(pos, 1);
    //        }
    //    };

    // advanced filter condition for ng-repeat
    $scope.filterFields = function (query) {
        if (query)
            return function (item) {
                return item['$']['sqlname'].toLowerCase().indexOf(query.toLowerCase()) > -1;
            };
    };

    // amTree fields checking
    $scope.checkTreeFields = function (field, fields, parent) {
        field.selected = !field.selected; // for generate template
        $scope.toggleCheckbox(fields, (parent) ? parent + '.' + field['$']['sqlname'] : field['$']['sqlname']);
    };

    $scope.ifChecked = function (field, fields, parent) {
        if (field.selected)
            return field.selected;
        else {
            var path = (parent) ? parent + '.' + field['$']['sqlname'] : field['$']['sqlname'];

            for (var i in fields) {
                if (fields[i] == path) {
                    field.selected = true;
                    return true;
                }
            }
        }

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

        //        $scope.addBreadcrumb(record["ref-link"]);

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

    // template module---------------------------------------------------------
    $scope.toNewTemp = function (table) {
        var tempTable = clone(table);
        $scope.tempTable = table2template(tempTable);

        delete $scope.tableData;
        delete $scope.relations;
        // console.log("table2template table: " + JSON.stringify(tempTable));
    };

    function table2template(table) {
        delete table['index'];
        // delete table['$'];
        // console.log("raw table: " + JSON.stringify(table));

        // remove all not selected fields
        var selectedFields = table.field.filter(function (obj) {
            return obj.selected;
        });
        table.field = selectedFields;

        // remove all linked without child table
        var expandLinks = table.link.filter(function (obj) {
            // call self to check child table
            if (obj.table)
                obj.table = table2template(obj.table);
            // console.log("obj.table: " + obj.table);
            return (obj.table === undefined) ? false : true;
        });
        table.link = expandLinks;

        // When both filed and link empty, set null
        if (table.field.length == 0 && table.link.length == 0)
            table = undefined;

        // console.log("template table: " + JSON.stringify(table));

        return table;
    };

    $scope.loadTemplates = function () {

        $http.get('/json/template').success(function (data) {
            $scope.templates = data;
        });
    };

    $scope.loadOneTemp = function (temp) {
        $scope.queryRootByTemp(temp);
        $scope.tempTable = clone(temp);
        $scope.metadata(temp['$']['sqlname']);

        $scope.tab = "tables";
        //        $scope.queryRootByTemp(temp);
    };

    $scope.removeTemplate = function (temp) {

        if (temp.$loki)
            $http.post('/json/template/delete', temp).success(function (data) {
                $scope.loadTemplates();
            });

        delete $scope.tempTable;
    };

    $scope.saveTemplate = function (temp) {
        console.log("saveTemplate: " + JSON.stringify(temp));
        $http.post('/json/template', temp).success(function (data) {
            //            console.log("saveTemplate: " + JSON.stringify(data));
            temp = data;
        });

        $scope.loadTemplates();
        $scope.tab = "templates";
        delete $scope.tempTable;

    };

    $scope.closeTemplate = function () {
        delete $scope.tempTable;
    };

    $scope.queryRootByTemp = function (template) {
        $scope.backTableList();
        var template = clone(template);
        var form = clone($scope.formData);
        form["ref-link"] = "db/" + template["$"]["sqlname"];

        // clean param fields generated by amTree
        form.param.fields = [];
        for (var i in template.field) {
            form.param.fields.push(template.field[i]["$"]["sqlname"]);
        }
        if (template.AQL)
            form.param.filter = template.AQL;

        $scope.tempRecords = template;

        $http.post('/am/rest', form).success(function (data) {
            $scope.tempRecords.records = data.entities;
            if (data.entities[0])
                $scope.getRecordByTemp(data.entities[0], template, true);
        });

    };

    $scope.getRecordByTemp = function (data, template, root) {

        var tempRecord = template;


        for (var i in tempRecord.field) {
            var sqlname = tempRecord.field[i]["$"]["sqlname"];
            tempRecord.field[i].data = data[sqlname];
        }

        for (var i in tempRecord.link) {
            var form = clone($scope.formData);
            var link = tempRecord.link[i];
            if (link['$']['card11'] == 'yes') {
                form["ref-link"] = "db/" + link['$']['desttable'];
                form.param.filter = link['$']['reverse'] + ".PK=" + data["ref-link"].split('/')[2];
            } else {
                form["ref-link"] = data["ref-link"];
                form["collection"] = "/" + link['$']['sqlname'];
                if (link.table.AQL)
                    form.param.filter = link.table.AQL;
            }

            for (var j in link.table.field)
                form.param.fields.push(link.table.field[j]['$']['sqlname']);

            link.form = form;

            $scope.queryLinkData(link);
        }
        if (root)
            $scope.tempRecord = tempRecord;
    };

    $scope.queryLinkData = function (link) {
        if (link.form)
            $http.post('/am/rest', link.form).success(function (data) {
                if (data.entities) {
                    //                    link.records = data.entities;

                    if (link['$']['card11'] == 'yes' && data.entities[0]) {
                        $scope.getRecordByTemp(data.entities[0], link.table);
                    } else {
                        link.tables = [];
                        for (var i in data.entities) {
                            var table = clone((link.table) ? link.table : link);
                            $scope.getRecordByTemp(data.entities[i], table);
                            link.tables.push(table);
                        }
                    }
                }

                //                if (data instanceof Object) {
                //                    //                console.log("query data:" + JSON.stringify(data));
                //                    if (data.entities instanceof Array)
                //                        $scope.tableData = data;
                //                    else if (data.type == 'Buffer') {
                //                        $scope.tableData.count = 0;
                //                    } else {
                //                        $scope.tableData.count = 1;
                //                        $scope.tableData.entities = [];
                //                        $scope.tableData.entities.push(data);
                //                    }
                //                } else {
                //                    $scope.message = JSON.stringify(form) + "<br>" + data;
                //                }
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
            //            $scope.removeBreadcrumb("db/" + record.table + "/dummy");
            delete record.child;
        } else {
            delete $scope.relations;
            //            $scope.removeBreadcrumb();
        }
    };

    $scope.backTableList = function () {
        delete $scope.metadata["table"];
        $scope.formData.param.fields = [];
        //        $scope.breadcrumb = [];
        $scope.hiddenRelations();
        delete $scope.tableData;
        delete $scope.tableName;
        delete $scope.tempTable;
        delete $scope.tempRecord;
        delete $scope.tempRecords;
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
    $scope.order = function (predicate) {
        console.log("order: " + predicate);
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
        //        $scope.formData.param.orderby = predicate + ($scope.reverse) ? " desc" : "";
        if (predicate != 'ref-link') {
            var form = $scope.tableData.form;
            form.param.orderby = predicate;
            if ($scope.reverse)
                form.param.orderby = form.param.orderby + " desc";
        } else {
            $scope.tableData.form.param.orderby = "";
        }
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
});

am.directive('fullHeight', function ($window) {
    return {
        restrict: 'A',
        scope: {
            fullHeight: '&'
        },
        link: function (scope, element, attrs) {
//            var obj = element.prop('offsetTop');;
//            console.log("attrs.fullHeight: " + attrs.fullHeight);

            scope.initializeWindowSize = function () {

//                console.log("$window.innerHeight: " + $window.innerHeight);
//                console.log("$window.innerWidth: " + $window.innerWidth);
//                console.log("offsetTop: " + element.prop('offsetTop'));
//                console.log("clientTop: " + element.prop('clientTop'));
//                console.log("scrollTop: " + element.prop('scrollTop'));
//                console.log("offsetLeft: " + element.prop('offsetLeft'));
//                console.log("document.documentElement.clientWidth: " + document.documentElement.clientWidth);
//                console.log("document.documentElement.clientHeight: " + document.documentElement.clientHeight);

                var elementTop = (attrs.fullHeight) ? attrs.fullHeight : element.prop('offsetTop');
                element.css('max-height', ($window.innerHeight - elementTop - 10) + 'px');
                element.css('overflow-y', 'auto');
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