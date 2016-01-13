$(document).ready(function() {

  var $cal = $('#calendar');
  $cal.fullCalendar({
    defaultDate: '2016-01-01',
    events: function(start, end, timezone, callback) {
      $.ajax({
        url: '/events',
        method: "GET",
        dataType: 'json'
      }).done(function(data) {
        console.log(data)
        callback(data);
      });
    },
    eventClick: eventClickHandler

  });
  $('#rsvp-btn').on('click', rsvpClickHandler);
  $('#comment-submit').on('click', commentClickHandler);
});

var eventClickHandler = function(calEvent) {
  // Shows the modal we placed in our HTML
  console.log(calEvent.rsvps.length)
  var $modal = $('.ui.modal');
  $modal.modal('show');
  // Populate the right fields in the modal with the right info
  $modal.find('#event-title').text(calEvent.title);
  $modal.find('#event-date').text(moment(calEvent.start).format('dddd MMMM DD, YYYY'));
  $modal.find('#event-description').text(calEvent.description);
  $modal.find('#_id').val(calEvent._id);
  $modal.find('#event-rsvps').text(calEvent.rsvps.length);
};

var getFormValues = function(querySelectorString){
  var formValues = {};
  $(querySelectorString).each(function(idx, el) {
    formValues[el.name] = el.value;
  });
  return formValues
}

var commentClickHandler = function(event) {
  event.preventDefault();
  var formValues = getFormValues('#add-comment :input');
  console.log(formValues);
};

var rsvpClickHandler = function(event) {
  event.preventDefault();
  var formValues = getFormValues('#add-rsvp :input');
  $.ajax({
    url: '/rsvps',
    method: 'POST',
    dataType: 'json',
    data: formValues
  }).done(function(data) {
    console.log(data);
    // update event
    var filteredEvents = $('#calendar').fullCalendar('clientEvents', function(event) {
      console.log(event._id)
      console.log($('#_id').val());
      if (event._id === $('#_id').val()) {
        return true;
      }
      return false;
    });
    var eventToUpdate = filteredEvents[0];
    eventToUpdate.rsvps = data.rsvps;
    console.log(eventToUpdate)
    $('#calendar').fullCalendar('updateEvent', eventToUpdate);
  })

};


