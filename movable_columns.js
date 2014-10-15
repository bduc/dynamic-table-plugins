;(function($) {
    "use strict;"

    var MovableColumns = function ($table, options) {

        this.options = $.extend({}, this.defaults, options);

        this.$table = $table;

        this.$table.on('mousedown.move_columns', this.options.selector, $.proxy(this._headerMousedown, this));
    };

    $.extend(MovableColumns.prototype, {
        defaults: {
            selector: 'tr th'
        },

        _swapColumns: function (oldIndex, newIndex) {
            if (oldIndex !== newIndex) {
                var rows = this.$table.find('tr');

                rows.each(function () {
                    // this points to the DOM element
                    var c1 = this.children[oldIndex];
                    var c2 = this.children[newIndex];
                    if (oldIndex > newIndex) {
                        $(c1).insertBefore(c2);
                    } else {
                        $(c1).insertAfter(c2);
                    }
                });
            }
        },

        _headerMousedown: function (event) {
            event.preventDefault();

            var $source = $(event.target).closest('th');
            
            if( $source.data('unmovable') ) {
                return false;
            }
            
            var offset = $source.offset();
            var sourceIndex = $source.index();

            this.startX = event.pageX;
            this.startY = event.pageY;
            this.offsetX = event.pageX - offset.left;
            this.offsetY = event.pageY - offset.top;
            this.source_th = $source.get(0);
            this.targetIndex = sourceIndex;
            this.sourceIndex = sourceIndex;
            this.drag_node = null;

            $(document)
                .on('mousemove.move_columns', $.proxy(this._headerMousemove, this))
                .on('mouseup.move_columns', $.proxy(this._headerMouseup, this));
        },

        _headerMousemove: function (event) {

            if (this.drag_node == null) {

                if (Math.pow(
                        Math.pow(event.pageX - this.startX, 2) +
                        Math.pow(event.pageY - this.startY, 2), 0.5) < 5) {
                    return;
                }

                this.$table.trigger("column:move:start", [this, this.source_th]);

                this._createDragNode();
                this._dragTargetMargins();
            }

            this.drag_node.css({
                left: event.pageX - this.offsetX,
                top: event.pageY - this.offsetY
            });

            var found = false;
            var lastTargetIndex = this.targetIndex;

            for (var i = 1, iLen = this.targets.length; i < iLen; i++) {
                if (event.pageX < this.targets[i - 1].x + ((this.targets[i].x - this.targets[i - 1].x) / 2)) {
                    this.pointer_node.css('left', this.targets[i - 1].x);
                    this.targetIndex = this.targets[i - 1].index;
                    found = true;
                    break;
                }
            }

            // The insert element wasn't positioned in the array (less than
            // operator), so we put it at the end
            if (!found) {
                this.pointer_node.css('left', this.targets[this.targets.length - 1].x);
                this.targetIndex = this.targets[this.targets.length - 1].index;
            }

        },

        _headerMouseup: function (event) {

            $(document).off('mousemove.move_columns mouseup.move_columns');

            if (this.drag_node != null) {
                this.drag_node.remove();
                this.pointer_node.remove();
                this.drag_node = null;
                this.pointer_node = null;

                this._swapColumns(this.sourceIndex, this.targetIndex);

                this.$table.trigger("column:move:stop", [this,
                    this.source_th,
                    this.sourceIndex,
                    this.targetIndex]);
                this.$table.trigger('table:layout:changed',[this]);
            }

        },

        _createDragNode: function () {

            var orig_cell = this.source_th;
            var orig_tr = orig_cell.parentNode;
            var orig_thead = orig_tr.parentNode;
            var orig_table = orig_thead.parentNode;
            var cloned_cell = $(orig_cell).clone();

            var cloned_tr = orig_tr.cloneNode(false);
            var cloned_thead = orig_thead.cloneNode(false);

            cloned_tr.appendChild(cloned_cell[0]);
            cloned_thead.appendChild(cloned_tr);

            this.drag_node = $(orig_table.cloneNode(false))
                .addClass('drag')
                .append(cloned_thead)
                .css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: $(orig_cell).outerWidth(),
                    height: $(orig_cell).outerHeight()
                })
                .appendTo('body');

            this.pointer_node = $('<div></div>')
                .addClass('pointer')
                .css({
                    position: 'absolute',
                    top: this.$table.offset().top,
                    height: this.$table.height(),
                    'border-left': '2px solid blue'
                })
                .appendTo('body');
        },

        _dragTargetMargins: function () {
            this.targets = [];

            this.targets.push({
                x: this.$table.offset().left,
                index: 0
            });

            var targetIndex = 0;
            var self = this;
            this.$table.find('thead > tr > th').each(function (idx) {
                var $th = $(this);
                
                console.log(idx,$th);
                if( $th.data('unmovable') ) {
                    if( idx == 0 ) {
                        self.targets = [];
                    } else {
                        return;
                    }
                }
                
                if (idx != self.sourceIndex) {
                    targetIndex++;
                }

                if ($th.is(':visible')) {
                    self.targets.push({
                        x: $(this).offset().left + $(this).outerWidth(),
                        index: targetIndex
                    })
                }
            });

            
        }
    });

    $.fn.movableColumns = function () {
        var args, option;
        option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.each(function () {
            var $table, data;
            $table = $(this);
            data = $table.data('movableColumns');
            if (!data) {
                $table.data('movableColumns', (data = new MovableColumns($table, option)));
            }
            if (typeof option === 'string') {
                return data[option].apply(data, args);
            }
        });
    };
}(jQuery));


