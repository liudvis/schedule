/*global $ */
$(document).ready(function(){
    fillCalendar();
    hidingElements();
    var selected =0;
    $('#DDN').dropdown();
      $('#list2').on('click', 'div', function(e){
            ($(this)).toggleClass('done', 200);
            e.stopPropagation();

        });
      $('.list').on('click', 'option', function(e){
            var element = $($(this).parent().parent().parent());
            if($(this).val()==0){
                    element.html('Moved to Tomorrow <i class="check icon"></i>');
                    element.addClass('elementChange');
                    element.fadeOut(2000,function(){
                    updateTodo(element);
                    });
            }
            else if($(this).val()==2){
                    element.html('Deleted <i class="check icon"></i>');
                    element.addClass('elementChange');
                    element.fadeOut(2000,function(){
                    deleteSchedule(element);
                    });
            }
            e.stopPropagation();
          });
    $('#task').keypress(function(event){
        if(event.keyCode===13){
        createTodo(selected);
        }
    });
    $('#meeting').keypress(function(event){
        if(event.keyCode===13){
        createMeeting(selected);
        }
    });
    $("#submit1").on("click", function(){
        createMeeting(selected);
        });
    $("#smallcalendar").on("click", function(){
        smallCalendarPopup();
        });
    $("#calendar").on("click", "td", function() {
        selected = chosenDate(this);
        $.getJSON("/api/schedules")
        .then(addSchedules);
        });
        $('.ui.dropdown').dropdown();
        
        function addSchedules(schedules){
            schedules.forEach(function(schedule){
                addSchedule(schedule);
            });
        }
        function ddnButton (schedule) {
            if(schedule.type==="todo"){
            var ddnTodo= 
            '<div class="dropdown" style="float:right;">\
                  <button class="dropbtn"><i class="ellipsis horizontal icon"></i></button>\
                  <div class="dropdown-content">\
                    <option value="0">Move to tomorrow</option>\
                    <option value="1">Move to another day</option>\
                    <option value="2">Delete</option>\
                  </div>\
                </div>';
            return ddnTodo;}
            else {
            var ddnMeeting = 
                    '<div class="dropdown" style="float:right;">\
                  <button class="dropbtn"><i class="ellipsis horizontal icon"></i></button>\
                  <div class="dropdown-content">\
                    <option value="2">Delete</option>\
                  </div>\
                </div>';
            return ddnMeeting;}
            
        }
        function addSchedule(schedule){
            if(selected == schedule.day){
            if(schedule.type==="meeting"){
                var newMeeting = $('<div class="meeting">'+schedule.name+ddnButton(schedule)+'</div>').hide().fadeIn("fast");                 
                newMeeting.data('id', schedule._id);
                $('#list1').append(newMeeting);
                $('#dropdown1').val('');
                $('#dropdown2').val('');
            } else if (schedule.type==="todo"){
                var newTodo =  $('<div class="item">'+schedule.name+ddnButton(schedule)+'</div>').hide().fadeIn("fast");
                newTodo.data('id', schedule._id);
                newTodo.data('day', schedule.day);
                    if(newTodo.completed){
                        newTodo.addClass("done");
                    }
                $('#list2').append(newTodo);
            }
            }       
    }
    function createTodo(day){
        var userInput = $('#task').val();
        if(userInput=="") {
            $('#field2').effect("shake");
        } else {
        $.post('/api/schedules',{name: userInput, type: "todo", day: day})
        .then(function(newTodo){
            addSchedule(newTodo);
            $('#task').val('');
        })
        .catch(function(err){
            console.log(err);
        });
    }
    }
    
        function createMeeting(day){
        var timeInput = $('#dropdown1 option:selected').text()+"-"+$('#dropdown2 option:selected').text();
        var userInput = '<strong>'+timeInput+'</strong>  '+$('#meeting').val();
        if(userInput=="" || $('#dropdown1 option:selected').text()=="Start"||$('#dropdown2 option:selected').text()=="End") {
            $('#meetingInput').effect("shake");
        } else {
        $.post('/api/schedules',{name: userInput, type: "meeting", day: day})
        .then(function(newMeeting){
            addSchedule(newMeeting);
            $('#meeting').val('');
            $('#dropdown1').dropdown('restore placeholder text');
            $('#dropdown2').dropdown('restore placeholder text');
        })
        .catch(function(err){
            console.log(err);
        });
        }
    }
    function deleteSchedule(schedule){
          var clickedId = schedule.data('id');
          var deleteUrl = '/api/schedules/' + clickedId; 
          $.ajax({
            method: 'DELETE',
            url: deleteUrl
          })
          .then(function(data){
            schedule.remove();
            
          })
          .catch(function(err){
            console.log(err);
          });
    }
    function updateTodo(schedule){
          var updateUrl = '/api/schedules/' + schedule.data('id');
          var day=schedule.data('day');
          var updateData ={day: day+1};
          $.ajax({
            method: 'PUT',
            url: updateUrl,
            data: updateData
          })
          .then(function(){
          schedule.remove();
          });
    }
    
      function fillCalendar() {
          for (var i=1; i<=31; i++){
            if(i==1){
              $('#tableBody').append($('<tr>'));
            }
            if(i==31){
              $('#tableBody').append($('</tr>'));
            }
            var newDate = $('<td id="td'+i+'">'+i+'</td>');
            $('#tableBody').append(newDate);
              if(i==7 || i==14 || i==21 || i==28){
                 $('#tableBody').append($('</tr><tr>'));
                 }
          }
            
        }
    function hidingElements(){
        $("#meetingInput").hide();
        $("#field2").hide();
        $("#smallcalendar").hide();
        $("#demo").hide();
        $(".list").hide();
        todaysDate();
    }
    function chosenDate(day){
          $("td").removeClass("changetd"); 
          var  p = ($( day ).text());
          selected = p;
          $(day).toggleClass("changetd");
        $("#calendar").transition('scale');
          $("#meetingInput").show("fast");
          $("#field2").show("fast");
          $("#smallcalendar").show("fast");
          $("#demo").text(p);
          $("#demo1").text("The " +p+" of March");
          $("#demo").show("fast");
          $(".list").show("fast");
          $('#list1').append('<div class="header">Meetings</div>');
          $('#list2').append('<div class="header">Tasks</div>');
          return p;
    }
    function todaysDate(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10) {
            dd = '0'+dd;
        } 
        if(mm<10) {
            mm = '0'+mm;
        } 
        today = mm + '/' + dd + '/' + yyyy;
        $("#td"+dd).css({'background':'rgb(184, 219, 232)'});
        return dd;
    }
    function smallCalendarPopup () {
        $("#calendar").transition('scale');
        $("#meetingInput").hide("fast");
        $("#field2").hide("fast");
        $("#smallcalendar").hide("fast");
        $("#demo").hide("fast");
        $(".list").hide("fast");
        $(".list").empty();
    }
});
