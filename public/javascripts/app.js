$(document).ready(function() {

  var self = this;

  self.elms = {
    input: function(fieldName, value) {
      if (typeof value == 'boolean') {
        var checked = value || false;
        return '<label>' +
          '<input data-data-type="' +
          typeof value +
          '" type="checkbox" name="" value=""' +
          ' class="item-input-field"' +
          ' data-field-name="' + fieldName + '"' +
          ' value="' + value + '"' +
          (checked == true ? 'checked=""' : '') +
          '/>' +
          fieldName +
          '</label>';
      } else {
        return '<input type="text" class="form-control' +
          ' item-input-field" ' +
          ' data-data-type="' +
          'string' +
          '"' +
          'data-field-name="' + fieldName +
          '" name="" value="' + value + '"/>'
      }
    },
  };

  self.randomNumber = function(min, max) {
    var min = min || 0;
    var max = max || 100;
    return Math.floor(Math.random() * max) + min;
  };


  //=======================================================================
  // Models
  //=======================================================================

  self.itemDefaults = {
    'Name': 'Default House',
    'Doors': 1,
    'Windows': 14,
    'Heating': true,
    'Chimneys': 2,
    'selected': false,
  };

  self.Item = Backbone.Model.extend({
    // defaults: self.itemDefaults,
    rawInfo: function() {
      return JSON.stringify(this.attributes);
    },
  });


  //=======================================================================
  // Collections
  //=======================================================================

  self.ItemList = Backbone.Collection.extend({
    model: self.Item,
    comparator: 'name',
  });

  self.testItems = [];
  self.testItemNames = [
    'Red House',
    'Blue House',
    'Green House',
    'Yellow House',
    'Orange House',
    'Violet House',
    'Pink House',
    'Brown House',
    'Grey House',
  ];
  for (var i = 0; i < self.testItemNames.length; i++) {
    self.testItems.push(new self.Item({
      'Name': self.testItemNames[i],
      'Doors': i,
      'id': i,
      'Windows': self.randomNumber(1, 20),
    }));
  }

  // self.testItems = [new self.Item({})];
  self.itemList = new self.ItemList(self.testItems);

  self.itemList.remove(self.itemList.at(3));


  //=======================================================================
  // Views
  //=======================================================================

  self.flash = function(element) {
    element.css({'opacity': '0.0'})
      .animate({'opacity': '1.0'}, 1000);
  };

  self.scrollIntoView = function(element, top, callback) {
    var top = top || 20;
    var callback = callback || function() {};
    $('html, body').animate({
      'scrollTop': element.offset().top - top,
    }, 'fast', function() {
      callback();
    });
  };

  self.scrollBoxIntoView = function(element) {
    self.scrollIntoView(
      element, self.scrollTopMargin,
      function() { self.flash(element); });
  };

  self.selectedElementClass = 'selected-element';
  self.elementBoxClass = 'item-box';
  self.itemEditButtonClass = 'item-edit-button';
  self.itemCancelButtonClass = 'item-cancel-button';
  self.createNewItemId = 'new-item-button';
  self.addNewFieldButtonId = 'add-new-field-button';
  self.removeFieldsButtonId = 'remove-fields-button';
  self.doRemoveFieldsButtonId = 'do-remove-fields-button';
  self.cancelRemoveFieldsButtonId = 'cancel-remove-fields-button';

  self.addFieldsBoxId = 'add-fields-box';
  self.addFieldsAnchorId = 'add-fields-anchor';
  self.addFieldsAnchor = 'add-fields-anchor';
  self.addFieldRemoveButtonClass = 'add-field-remove-button';
  self.addFieldAddButtonId = 'add-field-add-button';
  self.addFieldCreateButtonId = 'add-field-create-button';
  self.addFieldCancelButtonId = 'add-field-cancel-button';
  self.addFieldsTemplateId = 'add-fields-template';
  self.newFieldBoxClass = 'new-field-box';
  self.newFieldNameClass = 'new-field-name';
  self.newFieldTypeClass = 'new-field-type';

  self.removeFieldsBoxId = 'remove-fields-box';
  self.removeFieldsTemplateId = 'remove-fields-template';
  self.removeFieldsAnchorId = 'remove-fields-anchor';
  self.removeFieldsDialogId = 'remove-fields-dialog';

  self.itemButtonContainerClass = 'item-button-container';
  self.itemSaveButtonClass = 'item-save-button';
  self.itemInputFieldName = 'item-input-field';
  self.itemsInfoBoxId = 'items-info-box';

  self.inEditModeClass = 'in-edit-mode';
  self.ignoredFields = ['selected'];
  self.scrollTopMargin = 100;
  self.isToggleable = true;

  self.editViewClass = 'edit-view';
  self.nonEditViewClass = 'non-edit-view';

  self.sortByFieldButtonClass = 'sort-by-field-button';

  self.sortButtonsTemplateId = 'sort-buttons-template';
  self.sortButtonsAnchorId = 'sort-buttons-anchor';

  self.ItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'item-box',
    template: function() {
      return _.template($('#item-box-template').html(),
                        {model: this.model.toJSON(),
                         ignoredFields: self.ignoredFields,
                         self: self,});
    },
    initialize: function() {
      this.render();
      this.originalBgColor = this.$el.find('.' + self.elementBoxClass)
        .css('background-color');

      var that = this;
      // Events with dynamically generated keys.
      _.each(this.model, function(model) {
        _.each(model, function(value, key) {
          that.events['click .' + self.itemEditButtonClass] = 'edit';
        });
      });
      this.events['click .' + self.itemCancelButtonClass] =
        function() {
          this.$el.slideUp('fast', function() {
            that.render();
            that.$el.show();  // `slideUp' hides the element
            // Animate
            self.scrollBoxIntoView(that.$el);
          });
        };
      this.events['click .' + self.itemSaveButtonClass] =
        function() {
          this.saveChanges();
          var that = this;
          that.$el.slideUp('fast', function() {
            that.render();
            that.$el.show();  // `slideUp' hides the element
            // Animate
            self.scrollBoxIntoView(that.$el);
          });
        };
      this.events['click .' + self.elementBoxClass] ='toggleSelected';
    },
    events: {
      'click .info-button': 'info',
      'drop': 'drop',
    },
    drop: function(e, index) {
      self.itemListView.updateSort('update-sort', this.model, index);
    },
    toggleSelected: function(e) {
      if (self.isToggleable &&
          !$(e.target).parents('.' + self.elementBoxClass)
          .hasClass(self.inEditModeClass) &&
          !$(e.target).hasClass(self.inEditModeClass) &&
          !$(e.target).is('button') &&
          !$(e.target).is('a') &&
          !$(e.target).is('input') &&
          !$(e.target).is('textarea') &&
          !$(e.target).is('label') &&
          !$(e.target).hasClass(self.itemSaveButtonClass) &&
          !$(e.target).hasClass(self.itemCancelButtonClass)) {
        e.preventDefault();
        this.model.set('selected', !this.model.get('selected'));
        this.render();
      }
    },
    info: function() {
      alert(this.model.info());
    },
    edit: function() {
      var editButton = this.$el
        .find('.' + self.itemEditButtonClass);
      editButton.hide('normal');

      // Show input fields.
      var inputs = this.$el.find('.' + self.itemInputFieldName);
      // this.$el.hide();  // 1. Prepare animation...
      this.$el.find('.' + self.nonEditViewClass).hide();
      this.$el.find('.' + self.editViewClass).removeClass('hidden').hide()
        .slideDown();
      var that = this;
      inputs.each(function() {
        var input = $(this);

        that.$el.find('.' + self.elementBoxClass)
          .addClass(self.inEditModeClass);

        inputs.first().focus();
        input.keypress(function(e) {
          if (e.keyCode == 13) {  // Return
            var inps = that.$el.find('.' + self.itemInputFieldName);
            inps.each(function() {
              var inp = $(this);
              that.saveChangesForInput(inp);
            });
            that.$el.slideUp('fast', function() {
              that.render();
              that.$el.show();  // `slideUp' hides the element
              // Animate
              self.scrollBoxIntoView(that.$el);
            });
          } else if (e.keyCode == 27) {  // Esc
            that.$el.slideUp('fast', function() {
              that.render();
              that.$el.show();  // `slideUp' hides the element
              // Animate
              self.scrollBoxIntoView(that.$el);
            });
          }
        });
      });
      // Animate
      self.scrollIntoView(
        that.$el, 80);
    },
    saveChangesForInput: function(input) {
      input.addClass('hidden');
      if (input.attr('type') == 'checkbox') {
        // Checkbox input (boolean fields)
        this.model.set(input.attr('data-field-name'),
                       (input.is(':checked') ? true : false));
      } else {
        // Text input (string fields)
        this.model.set(input.attr('data-field-name'), input.val());
      }
      input.blur();
    },
    saveChanges: function() {
      var that = this;
      var inputs = this.$el.find('.' + self.itemInputFieldName);
      inputs.each(function() {
        that.saveChangesForInput($(this));
      });
    },
    render: function(classes) {
      var elm = this.$el.html(this.template());
      if (this.model.get('selected') == true) {
        this.$el.find('.' + self.elementBoxClass)
          .addClass(self.selectedElementClass);
      }
      return elm;
    },
  });

  self.listDelay = 40;
  self.ItemListView = Backbone.View.extend({
    tagName: 'div',
    initialize: function() {
      this.render();
    },
    updateSort: function(e, model, position) {
      var clone = model.clone();
      this.model.remove(model);
      this.model.add(clone, {at: position});
    },
    render: function() {
      $('#' + self.itemsInfoBoxId + ' .item-box').remove();
      this.model.each(function(item, i) {
        new self.ItemView({model: item}).render()
          .css({'opacity': '0.0'})
          .appendTo($('#'+ self.itemsInfoBoxId))
          .delay(self.listDelay * i)
          .animate({'opacity': '1.0'}, self.listDelay * 2);
      });
    },
    selectedModels: function() {
      return this.model.filter(function(model) {
        return model.get('selected') == true;
      });
    },
    toggleSelection: function(option) {
      this.model.each(function(model) {
        model.set('selected', (option == null ? !model.get('selected') :
                               option));
      });
      this.render();
    },
    selectAll: function() { this.toggleSelection(true); },
    unselectAll: function() { this.toggleSelection(false); },
    invertSelection: function() { this.toggleSelection(); },
    createNewItem: function() {
      this.model.add(new self.Item(), {at: 0});
      this.render();
      $('.' + self.itemEditButtonClass + ':first').trigger('click');
    },
    addNewField: function(name, initValue) {
      if (name.length > 0) {
        _.each(this.model.models, function(model) {
          model.attributes[name] = initValue;
        });
        this.render();
      }
    },
    removeField: function(name) {
      _.each(this.model.models, function(model) {
	delete model.attributes[name];
	var array = self.sortButtonsView.model;
	// Update the sort buttons view.
	var newArray = _.reject(array, function(item) {
	  return item == name;
	});
	self.sortButtonsView.model = newArray;
	self.sortButtonsView.render();
      });
      this.render();
    },
  });

  self.itemListView = new self.ItemListView({model: self.itemList});

  $('#items-reverse-button').click(function(e) {
    e.preventDefault();
    var reversed = [];
    self.itemList.each(function(model) {
      reversed.unshift(model.attributes);
    });
    // Unset the comparator, else the new (reversed) collection will not
    // apply.
    self.itemList.comparator = function() {};
    self.itemList.reset(reversed);
    self.itemListView.render();
  });

  self.sortItemsBy = function(attribute) {
    self.itemList.comparator = attribute;
    self.itemList.sort();
    self.itemListView.render();
  };

  // Sorting

  self.sortButtonsId = 'sort-buttons';
  self.SortButtonsView = Backbone.View.extend({
    tagName: 'div',
    className: 'sort-buttons btn-group btn-group-sm',
    template: function() {
      return _.template($('#' + self.sortButtonsTemplateId).html(),
                        {fields: this.model, self: self});
    },
    initialize: function() {
      this.render();

      // `Add new field' button.
      this.events['click #' + self.addNewFieldButtonId] = function(e) {
        e.preventDefault();
        self.newFieldsView.show();
      };

      // `Remove fields' button.
      this.events['click #' + self.removeFieldsButtonId] = function(e) {
	self.removeFieldsView.show();
      };

    },
    events: {
      // `initialize' (and potentially other things) depends on this to be
      // defined.
    },
    render: function() {
      var elm = this.$el.html(this.template());
      elm.attr('id', self.sortButtonsId);
      elm.insertAfter($('#' + self.sortButtonsAnchorId));
      $('.sort-by-field-button').each(function(idx, button) {
        $(button).click(function(e) {
          e.preventDefault();
          self.sortItemsBy($(button).attr('data-field-name'));
        });
      });
      return this.$el;
    },
    update: function() {
      this.model = _.difference(_.keys(self.itemList.models[0]
                                       .attributes || []),
                                self.ignoredFields);
      this.render();
    },
  });

  self.itemListAttributes = [];
  try {
    self.itemListAttributes = _.keys(self.itemList.models[0].attributes);
  } catch(error) {
    // Ignore.
  }
  self.sortButtonsView = new self.SortButtonsView({
    model: _.difference(self.itemListAttributes, self.ignoredFields),
  });

  // Buttons handlers etc.

  $('#remove-selected-elements-button').click(function(e) {
    e.preventDefault();
    var selectedModels = self.itemListView.selectedModels();
    self.itemListView.model.remove(selectedModels);
    self.itemListView.render();
  });

  $('#keep-only-selected-elements-button').click(function(e) {
    e.preventDefault();
    var selectedModels = self.itemListView.selectedModels();
    var selectedModelIds = [];
    _.map(selectedModels, function(model) {
      selectedModelIds.push(model.get('id'));
    });
    var allModels = self.itemListView.model.models;

    var removables = [];
    _.each(allModels, function(model, i) {
      if (!_.contains(selectedModelIds, model.get('id'))) {
        removables.push(model);
      }
    });
    self.itemListView.model.remove(removables);
    self.itemListView.render();
  });

  $('#select-all-elements-button').click(function(e) {
    e.preventDefault();
    self.itemListView.selectAll();
  });

  $('#unselect-all-elements-button').click(function(e) {
    e.preventDefault();
    self.itemListView.unselectAll();
  });

  $('#invert-selection-for-all-elements-button').click(function(e) {
    e.preventDefault();
    self.itemListView.invertSelection();
  });

  // Drag + drop

  // Animate non-dragged elements.
  $.widget("app.sortable", $.ui.sortable, {
    options: {
      effects: false
    },

    _rearrange: function ( e, item ) {
      if ( !this.options.specialEffects ) {
        return this._superApply( arguments );
      }

      var $item = $( item.item[ 0 ] );

      // $item.hide();
      this._superApply( arguments );
      // $item.show( "fade", 260 );
      $item.css({'opacity': '0.0'})
        .animate({'opacity': '1.0'}, 160);
    }
  });

  // Make elements sortable by dragging + droppping.
  self.draggedElementClass = 'dragged-element';
  $('#' + self.itemsInfoBoxId).sortable({
    specialEffects: true,
    axis: 'y',
    revert: 120,
    cursor: 'move',
    placeholder: 'ui-state-highlight',
    start: function(e, ui) {
      ui.placeholder.css({'height': ui.item.height()});
      ui.item.addClass(self.draggedElementClass);
      // Prohibit toggling while dragging.
      self.isToggleable = false;
    },
    stop: function(e, ui) {
      ui.item.trigger('drop', ui.item.index());
      ui.item.removeClass(self.draggedElementClass);
      var next = ui.item.next();
      // self.flash(ui.item).
      window.setTimeout(function() {
        // Allow toggling again.
        self.isToggleable = true;

        next.css.bind(next, {
          '-moz-transition':'border-top-width 0.1s ease-in',
          '-webkit-transition':'border-top-width 0.1s ease-in',
          'transition':'border-top-width 0.1s ease-in'})
      }, 0.1);
    },
  });

  // Item creation

  $('#' + self.createNewItemId).click(function(e) {
    e.preventDefault();
    self.itemListView.createNewItem();
  });

  // Keyboard shortcuts

  $('*').keypress(function(e) {
    if (!($('input').is(':focus'))) {
      if (e.which == 110) {  // `n'
        e.preventDefault();
        $('#' + self.createNewItemId).trigger('click');
      } else if (e.which == 43) {  // `+'
	$('#' + self.addNewFieldButtonId).trigger('click');
      } else if (e.which == 45) {  // `-'
	$('#' + self.removeFieldsButtonId).trigger('click');
      }
    }
  })

  // Adding fields

  self.NewFieldsView = Backbone.View.extend({
    tagName: 'div',
    className: 'row jumbotron-custom hidden',
    id: self.addFieldsBoxId,
    initialize: function() {
      this.events['click #' + self.addFieldAddButtonId] = function(e) {
        self.newFieldsView.addField();
      };
      this.events['click .' + self.addFieldRemoveButtonClass] =
        function(e) {
          var index = $(e.target).attr('data-index');
          this.removeField(index);
          this.render();
        }
      this.events['click #' + self.addFieldCreateButtonId] = function(e) {
        this.syncModel();
        _.each(this.model, function(field) {
          var initValue = null;
          if (field.type == 'boolean') {
            initValue = false;
          } else if (field.type == 'number') {
            initValue = 0;
          } else {
            initValue = '';
          }
          self.itemListView.addNewField(field.name, initValue);
        });
        this.hide();
        // Update the sort buttons.
        self.sortButtonsView.update();
      };
      this.events['click #' + self.addFieldCancelButtonId] = function(e) {
        this.hide();
      }
    },
    show: function() {
      this.$el.removeClass('hidden').hide().slideDown();
      this.$el.find('input').first().focus();
    },
    hide: function() {
      var that = this;
      this.$el.slideUp('normal', function() {
        that.model = [{name: '', type: 'string'}];
        that.render();
        // Scroll the item list into view.
        self.scrollIntoView(self.itemListView.$el);
      });
    },
    events: {
      // This has to be defined so that `initialize' can reference it.
    },
    template: function() {
      return _.template($('#' + self.addFieldsTemplateId).html(),
                        {model: this.model})
    },
    render: function() {
      var elm = this.$el.html(this.template());
      elm.insertAfter($('#' + self.addFieldsAnchorId))
      return this.$el;
    },
    syncModel: function() {
      var that = this;
      $('.' + self.newFieldBoxClass).each(function(i, elm) {
        that.model[i].name = $(this).find('.' + self.newFieldNameClass)
          .val();
        that.model[i].type = $(this).find('.' + self.newFieldTypeClass)
          .val();
      });
    },
    addField: function() {
      this.syncModel();
      this.model.push({name: 'Field', type: 'string',});
      this.render();
    },
    removeField: function(index) {
      this.model =
        _.reject(this.model, function(elm, i) {return i == index; });
      this.render();
    },
  });

  self.newFieldsView = new self.NewFieldsView({
    model : [{name: '', type: 'string'},],
  });
  self.newFieldsView.render();

  // $('#' + self.addNewFieldButtonId).click(function(e) {
  //   e.preventDefault();
  //   self.newFieldsView.show();
  // });


  // Removing fields

  self.RemoveFieldsView = Backbone.View.extend({
    tagName: 'div',
    id: self.removeFieldsBoxId,
    className: 'row jumbotron-custom danger-panel hidden',
    template: function() {
      return _.template($('#' + self.removeFieldsTemplateId).html(),
                        {fields: this.model});
    },
    initialize: function() {
      this.events['click #' + self.doRemoveFieldsButtonId] = function(e) {
	this.removeFields();
      };

      this.events['click #' + self.cancelRemoveFieldsButtonId] =
        function(e) { this.hide(); };

      // REnder,
      this.render();
    },
    removeFields: function() {
      $('#' + self.removeFieldsBoxId).find('input')
        .each(function(i, elm) {
          if ($(elm).is(':checked')) {
            var fieldName = $(elm).attr('data-field-name');
            self.itemListView.removeField(fieldName);
          }
        });
      this.hide();
    },
    show: function() {
      this.render();
      this.$el.removeClass('hidden').hide().slideDown();
      this.$el.find('input').first().focus();
    },
    hide: function() {
      var that = this;
      this.$el.slideUp(function() {
	that.model = [];
	that.render();
      });
    },
    events: {
      // `initialize' depends on this.
    },
    render: function() {
      this.model = self.sortButtonsView.model;
      var elm = this.$el.html(this.template());
      elm.insertAfter($('#' + self.removeFieldsAnchorId))
      return this.$el;
    },
  });
  
  self.removeFieldsView = new self.RemoveFieldsView();

});
