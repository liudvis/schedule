/*global $ */
$(document).ready(function(){
    fillCalendar();
    hidingElements();
    var selected;
    $('#DDN').dropdown();
      $('#list2').on('click', 'div', function(e){
            ($(this)).toggleClass('done', 200);         //WORKS!
            e.stopPropagation();
        });
    $('#meetingTable').on('click', 'td', function(e){
            e.stopPropagation();
            console.log($(this).data());
                if($(this).data("empty")==true){
                    $('#meeting').focus();
                    let time = $(this).data("time");
                    $('#dropdown1').val(time).change();
                    $('#dropdown2').val(time+1).change();                
                }
            
        

    //         $('#meeting').keypress(function(event){
    //         if(event.keyCode===13){
    //         updateMeeting($(this));
    //             }
    //         });
    //         $("#submit1").on("click", function(){
    //         updateMeeting($(this));
    //             });
        });
    $('.list,#meetingTable').on('click', 'option', function(e){
        e.stopPropagation();
        dropdownDeleteAndMoveToTomorrow($(this));    //WORKS!
      });
    $('#task').keypress(function(event){
        if(event.keyCode===13){
        createTodo(selected);                       //WORKS!
        }
    });
    $('#meeting').keypress(function(event){
        if(event.keyCode===13){
        createMeeting(selected);                    //WORKS!
        }
    });
    $("#submit1").on("click", function(){
        createMeeting(selected);                    //WORKS!
        });
    $("#smallcalendar").on("click", function(){
        smallCalendarPopup();                       //  WORKS!
        });
    $("#calendar").on("click", "td", function() {
        selected = chosenDate(this);                //WORKS!
        $.getJSON("/api/schedules")
        .then(addSchedules);
        });
        $('.ui.dropdown').dropdown();
        
        function addSchedules(schedules){
            schedules.forEach(function(schedule){
                addSchedule(schedule);
            });
        }
        function dropdownDeleteAndMoveToTomorrow(arg){
            var element = arg.parent().parent().parent();
            if(arg.val()==0){
                    element.html('<div>Moved to Tomorrow <i class="check icon"></i></div>');
                    element.addClass('elementChange').delay(1000).slideUp(700,function(){
                    updateTodo(element);
                    });
            }
            else if(arg.val()==2){             
                    element.html('<div>Deleted  <div class="divcheck"><i class="check icon"></div></i></div>');
                    element.addClass('elementChange').delay(1000).slideUp(700,function(){
                    for(var i=element.data("startTime"); i<element.data("endTime"); i++){
                        $('#time'+i).css("background-color", "white");
                        $('#time'+i).data("empty", true);
                        $('#time'+i).data("id", null);
                    }
                    deleteSchedule(element);
                    $('#meeting').val("");
                    $('#dropdown1').val('').change();//Doesnt work
                    $('#dropdown2').val('').change();
                
          });
            }
            
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
                newMeeting.data('startTime', schedule.meetingStart);
                newMeeting.data('endTime', schedule.meetingEnd);
                for(var i=schedule.meetingStart; i<schedule.meetingEnd; i++){
                    $('#time'+i).css("background-color", "#f1ddf2");
                    $('#time'+i).data('empty', false);
                    $('#time'+i).data('id', schedule._id);
                }
                $('#time'+schedule.meetingStart).html(newMeeting);

                $('#dropdown1').val('');
                $('#dropdown2').val('');
            } else if (schedule.type==="todo"){
                var newTodo =  $('<div class="item">'+schedule.name+ddnButton(schedule)+'</div>').hide().fadeIn("fast");
                newTodo.data('id', schedule._id);
                newTodo.data('empty', false);
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
            alert(err);
        });
    }
    }
                function checkingTime(startOfTheMeeting, endOfTheMeeting){
                    for(var i=startOfTheMeeting; i<endOfTheMeeting; i++){
                        if($('#time'+i).data('empty')==false){
                            console.log(i);
                            return false;
                }
                }
                    return true;
                }
    
        function createMeeting(day){
        var startOfTheMeeting = $('#dropdown1 option:selected').text();
        var endOfTheMeeting = $('#dropdown2 option:selected').text();
        var nameOfTheMeeting = $('#meeting').val();
        var check = checkingTime(Number(startOfTheMeeting), Number(endOfTheMeeting));
        if(nameOfTheMeeting=="" || $('#dropdown1 option:selected').text()=="Start"||$('#dropdown2 option:selected').text()=="End" || check==false) {
                $('#meetingInput').effect("shake");
        } else {
        $.post('/api/schedules',{name: nameOfTheMeeting, type: "meeting", day: day, meetingStart: startOfTheMeeting, meetingEnd: endOfTheMeeting})
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
            alert(err);
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
    // function updateMeeting(schedule){
    //     var updateUrl = '/api/schedules/' + schedule.data('id');
    //     var meetingName = schedule.name;
    //     var startTime = schedule.meetingStart;
    //     var endTime = schedule.meetingEnd;
    //     var updateData= {name: schedule.name, startTime: schedule.meetingStart, endTime: schedule.meetingEnd};
    //     $.ajax({
    //         method: 'PUT',
    //         url: updateUrl,
    //         data: updateData
    //       })
    //       .then(function(){
    //       alert("asdasd");
    //       });
    // }
    
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
          meetingTable();
          $('#list1').append('<div class="header">Meetings</div>');
          $('#list2').append('<div class="header">Tasks</div>');
          return p;
    }
    function meetingTable() {
        for(var i=9; i<=17; i++)
          {
            $("#meetingTable").append("<tr><td class=meetingTableTime>"+i+""+"</td><td class=miau id=time"+i+"></td></tr>");
            $("#time"+i).data("time", i);
            $('#time'+i).data('empty', true);
            $('#time'+i).data('id', null);
          }
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
        $("#meetingTable").empty();
    }
});
