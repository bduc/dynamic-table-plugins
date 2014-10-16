;(function($) {
    "use strict;"

    var SortableColumns = function ($table, options) {

        this.options = $.extend({}, this.defaults, options);

        this.$table = $table;

        var self = this;

        var sort_order = [];

        this.$table.find(this.options.selector).each(function(){
            var $th = $(this);

            var column_name = $th.data('column');
            var unsortable  = $th.data('unsortable');

            if( ! unsortable ) {
                $th.append("<span class='pull-right'><span class='sort fa fa-fw'></span></span>");
            }
        });

        // suppress initial event
        this.sortOrder( this.sortOrder(), true );

        this.$table.on('click.sortable_columns', this.options.selector, $.proxy(this._headerClick, this));

        // integrate with remote_data plugin by adding the sort_order to the request params
        this.$table.on('data:params', $.proxy(function(event, params) {
            console.log("sortable_column[data:params]", arguments);
            params['order'] = this.sortOrder();
        },this));

        this.$table.on('column:sorted', function() { $(this).trigger('data:load') });
    };

    $.extend(SortableColumns.prototype, {
        defaults: {
            selector: 'tr th',
            sort_key: {
                column: 'c',
                direction: 'd'
            }
        },

        _headerClick: function( event ) {
            event.preventDefault();
            var $th = $(event.target).closest('th');
            var column_name = $th.data('column');
            var unsortable  = $th.data('unsortable');

            if( unsortable ) {
                return ;
            }

            var sort_keys = this.sortOrder()||[];
            
            var search_column = {};
            search_column[this.options.sort_key.column] = column_name;
            
            var sort_key = _.findWhere(sort_keys,search_column);
            
            if( _.isUndefined(sort_key) ) {
                sort_key = {};
                sort_key[this.options.sort_key.direction] = 'asc';
                sort_key[this.options.sort_key.column] = column_name;
                // sort key is not in the current list
                if( ! event.shiftKey ) {
                    // in non add mode this is the only field to search on
                    sort_keys = [ sort_key ]
                } else {    
                    sort_keys.push(sort_key)
                }
            } else {
                sort_key[this.options.sort_key.direction] = { asc: 'desc', desc: 'asc' } [sort_key[this.options.sort_key.direction]] || 'asc';                 
                if( ! event.shiftKey ) {
                    // in non add mode this is the only field to search on
                    sort_keys = [ sort_key ]
                } 
                // in multi mode the direction is toggled if the field already exists; this is accomplished
                // by the first line in this block (reference to existing sort_key
            }
            
            this.sortOrder( sort_keys );
        },
        
        sortOrder: function( set_sort_order, suppress_event ) {
            var self = this;

            if( ! _.isUndefined(set_sort_order) ) {
                
                this.$table.find(this.options.selector).find("span.sort")
                                                       .removeClass('fa-sort-up')
                                                       .removeClass('fa-sort-down')
                                                       .text('');
                this.$table.find(this.options.selector).data('sort',null).data('sort-idx',null);
 
                var length = set_sort_order.length;
                
                _.each(set_sort_order, function(sort_key,idx) {
                    var $th = this.$table.find(this.options.selector).filter("[data-column='" + sort_key[this.options.sort_key.column]+ "']").first();
                    if( $th.length ) {
                        var arrow = "";
                        if( sort_key[this.options.sort_key.direction] == 'asc' ) {
                            arrow = 'up';
                        } else if( sort_key[this.options.sort_key.direction] == 'desc' ) {
                            arrow = 'down';
                        }
                        $th.data('sort',sort_key[this.options.sort_key.direction]);
                        $th.find("span.sort").removeClass('fa-sort')
                                             .removeClass('text-muted')
                                             .addClass("fa-sort-"+arrow);
                        if( length > 1 ) {
                            $th.data('sort-idx',idx+1);
                            $th.find("span.sort").text(idx+1);
                        }
                        
                    }
                },this);
                
            } else {
                // for the getter we never need an event fired
                suppress_event = true
            }
            
            var get_sort_order = [];
            this.$table.find(this.options.selector).each(function() {
                var $th=$(this);

                var column_name = $th.data('column');
                var sort      = ($th.data('sort')||"").toLowerCase();
                var sort_idx  = parseInt($th.data('sort-idx'));
                
                if( sort == 'asc' || sort == 'desc') {
                    var sort_key = {};
                    sort_key[self.options.sort_key.direction] = sort;
                    sort_key[self.options.sort_key.column] = column_name;
                    
                    if(_.isNaN(sort_idx)) {
                        get_sort_order.push(sort_key);
                    } else {
                        if( get_sort_order[sort_idx] !== undefined ) {
                            get_sort_order.splice(sort_idx, 0, sort_key);
                        } else {
                            get_sort_order[ sort_idx ] = sort_key;
                        }
                    }
                }
            });
            get_sort_order = _.compact(get_sort_order);
            
            if( ! suppress_event ) {
                this.$table.trigger("column:sorted",get_sort_order);
            }
            
            return get_sort_order;
        }
    });

    $.fn.sortableColumns = function () {
        var args, option;
        option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.each(function () {
            var $table, data;
            $table = $(this);
            data = $table.data('sortableColumns');
            if (!data) {
                $table.data('sortableColumns', (data = new SortableColumns($table, option)));
            }
            if (typeof option === 'string') {
                return data[option].apply(data, args);
            }
        });
    };
}(jQuery));



