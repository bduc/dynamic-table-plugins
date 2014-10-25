;(function($) {
    "use strict;"

    var RemoteData = function ($table, options) {

        this.$table = $table;
        this.$tbody = this.$table.find('tbody').first();

        if( this.$tbody.length == 0 ) {
            this.$tbody = this.$table.append('<tbody></tbody>').find('tbody');
        }

        this.options = $.extend(true, {}, this.defaults, {
            url: this.$table.data('url'),
            noautoload: this.$table.data('noautoload'),
            rowCallback:  this.defaultRowCallback,
            cellCallback: {
            }
        },options);

        this.initialize();
    };

    $.extend(RemoteData.prototype, {
        defaults: {
            selector: 'thead > tr > th',
            noautoload: false,
            dataType: 'json'
        },

        populateCell: function(td,row_data,column_info) {
            var content;

            if( column_info.column === undefined || row_data[column_info.column] === undefined ) {
                content = "";
            } else {
                content = row_data[column_info.column];
            }

            var $td = $(td);

            if( ! column_info.visible ) {
                $td.hide();
            }

            if( column_info.class ) {
                $td.addClass(column_info.class);
            }

            if( this.options.cellCallback[column_info.column] ) {
                content = this.options.cellCallback[column_info.column].apply(this,[td,row_data,column_info])                       }

            $td.html( content );

            $td = null;
        },

        defaultRowCallback: function() {
        },

        initialize: function() {

            this.$table.on('data:load', $.proxy(function(event,params){
                this.load(params);
            },this));
            
            if( ! this.options.noautoload ) {
                this.load();
            }
        },

        columnOrderVisibility: function() {
            var self = this,
                columns = [];

            this.$table.find(this.options.selector).each(function () {
                var $th = $(this);
                columns.push({ 
                    column:  $th.data('column'), 
                    visible: $th.is(':visible'),
                    class:   $th.data('class')
                })
            });
            return columns;
        },

        load: function( params ) {
            var query_params = $.extend({},params);
            
            // gather params from other plugins 
            this.$table.trigger("data:params", query_params );
            
            console.log("data#load params=",query_params );
            
            $.ajax({
                url: this.options.url,
                dataType: this.options.dataType,
                success: $.proxy(this._dataLoaded,this),
                data: this._encode_params_for_rails( query_params )
            });
        },
        
        // rails wants NO numbers between brackets for array elements; if the numbers is present
        // a hash is created
        _encode_params_for_rails: function( query_params ) {
            return $.param(query_params).replace(/%5B\d+%5D/g,'%5B%5D')
        },

        _dataLoaded: function(json_data , status , options ) {
            console.log(arguments);
            this.$tbody.empty();
            var column_order = this.columnOrderVisibility();
            _.each( json_data.data , function( row_data ) {

                var tr = document.createElement('TR');

                this.options.rowCallback.apply(this,[tr,row_data]);

                _.each( column_order, function( column_info ) {
                    var td = document.createElement('TD');

                    this.populateCell(td,row_data,column_info);

                    tr.appendChild(td);
                    $td = null;
                },this);
                this.$tbody.append(tr);
            },this);
        }

    });

    $.fn.remoteData = function () {
        var args, option;
        option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.each(function () {
            var $table, data;
            $table = $(this);
            data = $table.data('remoteData');
            if (!data) {
                $table.data('remoteData', (data = new RemoteData($table, option)));
            }
            if (typeof option === 'string') {
                return data[option].apply(data, args);
            }
        });
    };
}(jQuery));


