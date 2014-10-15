;(function($) {
    "use strict;"

    var VisibleColumns = function ($table, options) {

        this.options = $.extend({}, this.defaults, options);

        this.$table = $table;

        this.$columns_menu = $(this.options.columns_menu);

        this.initialize();
    };


    $.extend(VisibleColumns.prototype, {
        defaults: {
            columns_menu: '',
            selector: 'tr th'
        },

        initialize: function() {
            this.$columns_menu.empty();
            var self = this;
            this.$table.find(this.options.selector).each(function(){
                var th_el = $(this);

                var column_name = th_el.data('column');
                var hidden      = th_el.data('hidden');
                var unhideable  = th_el.data('unhideable');

                if( ! unhideable ) {
                    self.$columns_menu.append('<li><a href="javascript: false;" data-column="' + column_name + '"><span class="fa fa-fw fa-check-square-o"></span>' + th_el.text() + '</a></li>');
                }

                if( hidden ) {
                    self.hideColumn(column_name);
                }
            });

            this.$columns_menu.on('click.dynamic_table', 'li > a', function (event) {
                event.preventDefault();
                var $a = $(event.target).closest('a');
                var column_name = $a.data('column');
                var $th = self.$table.find(self.options.selector).filter("[data-column='" + column_name + "']").first();
                if ($th.is(":visible")) {
                    self.hideColumn(column_name);
                } else {
                    self.showColumn(column_name);
                }
            });

        },

        hideColumn: function( column_name, suppress_event ) {
            this.$columns_menu.find("li > a[data-column='" + column_name + "'] > span").removeClass('fa-check-square-o').addClass('fa-square-o');
            var $th = this.$table.find(this.options.selector).filter("[data-column='" + column_name + "']");
            var col_index = $th.index();
            $th.hide();
            this.$table.find("tbody > tr > td:nth-child(" + (col_index + 1) + ")").hide();
            if( ! suppress_event ) {
                this.$table.trigger("column:hide", [this, $th]);
                this.$table.trigger('table:layout:changed', [this]);
            }
        },

        showColumn: function ( column_name, suppress_event ) {
            this.$columns_menu.find("li > a[data-column='" + column_name + "'] > span").removeClass('fa-square-o').addClass('fa-check-square-o');
            var $th = this.$table.find(this.options.selector).filter("[data-column='" + column_name + "']");
            $th.show();
            var col_index = $th.index();
            this.$table.find("tbody > tr > td:nth-child("+(col_index+1)+")").show();
            if( ! suppress_event ) {
                this.$table.trigger("column:show", [this, $th]);
                this.$table.trigger('table:layout:changed', [this]);
            }
        }
    });

    $.fn.visibleColumns = function () {
        var args, option;
        option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.each(function () {
            var $table, data;
            $table = $(this);
            data = $table.data('visibleColumns');
            if (!data) {
                $table.data('visibleColumns', (data = new VisibleColumns($table, option)));
            }
            if (typeof option === 'string') {
                return data[option].apply(data, args);
            }
        });
    };
}(jQuery));


