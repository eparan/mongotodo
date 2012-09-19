
$(function(){

/*
// Models
/// Todo
*/
// Our basic **Todo** model has 'text', 'order' and 'done' attributes.
  Todo = Backbone.Model.extend({
    idAttribute:"_id",

    // Default attributes for a todo item.
    default: function(){
      return {
        done:false,
        order:Todos.nextOrder()
      };
    },

    // Toggle the 'done' state of this todo item.
    toggle : function() {
      this.save( {done: !this.get("done")} );
    }
  });


/*
// Collections
/// TodoList
*/
  TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model:Todo,

    // Save all of the todo items under the "todos" namespace.
    // LocalStorage : new Store("todos"),
    url: "/api/todos",

    // Filter down the list of all todo items that are finished.
    done: function(){
      return this.filter(function(todo){return todo.get("done");});
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function(){
      return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being save by unordered
    // Guid in the database. This generates the next order number for new items.
    nextOrder : function(){
      if(!this.length) return 1;
      return this.last().get('order') + 1;
    },

    comparator : function(todo) {
      return todo.get('order');
    }
  });



/*
// Views
/// TodoView
/// AppView
*/

// Our overall **AppView** is the top-level piece of UI.
  AppView = Backbone.Views.extend({

    // Instead of generating a new element, bind to the existing skeleton of 
    // the App already present in the HTML.
    el:$("todoapp"),

    // Our template for the line of creating new item, and clearing completed ones.
    statsTemplate : _.template($("#stats-template").html()),

    // Delegated events for creating new items, and clearing completed ones.
    events:{
      "keypress #new-todo":"createOnEnter",
      "keyup #new-todo" : "showTooltip",
      "click .todo-clear a" : "clearCompleted"
    },

    // At initialization
    initialize: function(){
      this.input = this.$("#new-todo");
      Todos.on("add", this.addOne, this);
      Todos.on("reset", this.addAll, this);
      Todos.on("all", this.render, this);

      Todos.fetch();
    },

    // Re-rendering the App just means refreshing the satistics -- 
    // the rest of the app doesn't change.
    render: function(){
      this.$("todo-stats").html(this.statsTemplate({
        total : Todos.length,
        done: Todos.done().length,
        remaining: Todos.remaining().length
      }));
    },

    // Add a single todo item to the list by creating a view for it, 
    // and appending its element to the "<ul>".
    addOne: function(todo){
      var view = new TodoView({model:todo});
      this.$("#todo-list").append(view.render().el);
    },

    // Add all items in the ** Todos ** collections at once.
    addAll: function(){
        Todos.each(this.addOne);
    },

    // Generate the attributes for a new todo item.
    newAttributes : function(){
      return {
        content:this.input.val(),
        order:Todos.nextOrder(),
        done:false
      };
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*
    createOnEnter: function(e){
      if(e.keyCode != 13) return;
      Todos.create(this.newAttributes());
      this.input.val("");
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function(){
      _.each(Todos.done(), function(todo){todo.clear();});
      return false;
    },

    // Lazily show the tooltip that tells you to press 'enter' to save
    // a new todo item, after on second.
    showTooltip : function(e) {
      var tooltip = this.$(".ui-tooltip-top");
      var val = this.input.val();
      tooltip.fadeOut();
      if (this.tootipTimeout) clearTimeout(this.tooltipTimeout);
      if (val == '' || val == this.input.attr('placeholder')) return;
      var show = function(){tooltip.show().fadeIn();};
      this.tooltipTimeout = _.delay(show, 1000);
    }

  });

  var appView = new AppView();

});

