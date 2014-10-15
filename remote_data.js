;(function($) {
    "use strict;"

    var RemoteData = function ($table, options) {

        this.$table = $table;
        this.$tbody = this.$table.find('tbody').first();

        if( this.$tbody.length == 0 ) {
            this.$tbody = this.$table.append('<tbody></tbody>').find('tbody');
        }

        this.options = $.extend({}, this.defaults, {
                url: this.$table.data('url'),
                noautoload: this.$table.data('noautoload')
            },options);

        this.initialize();
    };

    $.extend(RemoteData.prototype, {
        defaults: {
            selector: 'thead > tr > th',
            noautoload: false,
            dataType: 'json'
        },

        initialize: function() {
            this.$table.on('data:load', $.proxy(this.load,this));
            
            if( ! this.options.noautoload ) {
                this.load();
            }
        },

        columnOrderVisibility: function() {
            var self = this,
                columns = [];

            this.$table.find(this.options.selector).each(function () {
                var $th = $(this);
                columns.push( { column: $th.data('column') , visible: $th.is(':visible') } )
            });
            return columns;
        },

        load: function() {
            var params = {};
            
            // gather params from other plugins 
            this.$table.trigger("data:params", params);
            
            console.log("data#load params=",params);
            
            $.ajax({
                url: this.options.url,
                dataType: this.options.dataType,
                success: $.proxy(this._dataLoaded,this),
                data: params
            });
        },

        _dataLoaded: function(json_data , status , options ) {
            console.log(arguments);
            this.$tbody.empty();
            var column_order = this.columnOrderVisibility();
            _.each( json_data.data , function( row_data ) {
                var tmpRow = "";
                _.each( column_order, function( column_info ) {
                    var content;
                    if( column_info.column === undefined || row_data[column_info.column] === undefined ) {
                        content = "";    
                    } else {
                        content = row_data[column_info.column]; 
                    }
                    if( column_info.visible ) {
                        tmpRow += "<td>" + content + "</td>"
                    } else {
                        tmpRow += "<td style='display: none;'>" + content + "</td>"
                    }
                } , this);
                this.$tbody.append("<tr>"+tmpRow+"</td>");
            } , this);
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


