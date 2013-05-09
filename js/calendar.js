$(function(){
    var Calendar = Backbone.Model.extend();

    var Calendars = Backbone.Collection.extend({
        model: Calendar,
        url: 'Calendars'
    }); 
 
    var CalendarsView = Backbone.View.extend({
        initialize: function(){
            _.bindAll(this); 

            this.collection.bind('reset', this.addAll);
            this.collection.bind('add', this.addOne);
            this.collection.bind('change', this.change);            
            this.collection.bind('destroy', this.destroy);
            
            this.CalendarView = new CalendarView();            
        },
        render: function() {
            this.el.fullCalendar({
            	header: false,
            	calendars: {},
            	scrollNavigation: true,
            	keyboardNavigation: true,
            	editable: true,
            	dragdropimport: true,
            	fullCalendar: {
					timeFormat: {
						agenda: 'HH:mm',
						'': 'HH:mm'
					},
				},
				firstDay: 0,
                selectable: true,
                selectHelper: true,
                editable: true,
                ignoreTimezone: false,
                select: this.select,
                CalendarClick: this.CalendarClick,
                CalendarDrop: this.CalendarDropOrResize,
                CalendarResize: this.CalendarDropOrResize
            });
        },
        addAll: function() {
            this.el.fullCalendar('addCalendarSource', this.collection.toJSON());
        },
        addOne: function(Calendar) {
            this.el.fullCalendar('renderCalendar', Calendar.toJSON());
        },        
        select: function(startDate, endDate) {
            this.CalendarView.collection = this.collection;
            this.CalendarView.model = new Calendar({start: startDate, end: endDate});
            this.CalendarView.render();            
        },
        CalendarClick: function(fcCalendar) {
            this.CalendarView.model = this.collection.get(fcCalendar.id);
            this.CalendarView.render();
        },
        change: function(Calendar) {
            // Look up the underlying Calendar in the calendar and update its details from the model
            var fcCalendar = this.el.fullCalendar('clientCalendars', Calendar.get('id'))[0];
            fcCalendar.title = Calendar.get('title');
            fcCalendar.color = Calendar.get('color');
            this.el.fullCalendar('updateCalendar', fcCalendar);           
        },
        CalendarDropOrResize: function(fcCalendar) {
            // Lookup the model that has the ID of the Calendar and update its attributes
            this.collection.get(fcCalendar.id).save({start: fcCalendar.start, end: fcCalendar.end});            
        },
        destroy: function(Calendar) {
            this.el.fullCalendar('removeCalendars', Calendar.id);         
        }        
    });

    var CalendarView = Backbone.View.extend({
        el: $('#CalendarDialog'),
        initialize: function() {
            _.bindAll(this);           
        },
        render: function() {
            var buttons = {'Ok': this.save};
            if (!this.model.isNew()) {
                _.extend(buttons, {'Delete': this.destroy});
            }
            _.extend(buttons, {'Cancel': this.close});            
            
            this.el.dialog({
                modal: true,
                title: (this.model.isNew() ? 'New' : 'Edit') + ' Calendar',
                buttons: buttons,
                open: this.open
            });

            return this;
        },        
        open: function() {
            this.$('#title').val(this.model.get('title'));
            this.$('#color').val(this.model.get('color'));            
        },        
        save: function() {
            this.model.set({'title': this.$('#title').val(), 'color': this.$('#color').val()});
            
            if (this.model.isNew()) {
                this.collection.create(this.model, {success: this.close});
            } else {
                this.model.save({}, {success: this.close});
            }
        },
        close: function() {
            this.el.dialog('close');
        },
        destroy: function() {
            this.model.destroy({success: this.close});
        }        
    });
    
    var Calendars = new Calendars();
    new CalendarsView({el: $("#fullcalendar"), collection: Calendars}).render();
    Calendars.fetch();
});