/*global $ */
$(document).ready(function(){
    fillCalendar();
    hidingElements();
    changingTimes();
    var selected;
    $('#DDN').dropdown();
      $('#list2').on('click', 'div', function(e){
            ($(this)).toggleClass('done', 200);         //WORKS!
            e.stopPropagation();
        });
    $('#dropdown1').dropdown();
    $('#dropdown2').dropdown();

    $(document).on('click', function(e) {
        let X = e.target.nodeClass;
        // console.log(bybys);
        // if (/*bybys === "DIV"||*/ bybys === "BODY"||bybys === "H4") {
        //     console.log(e.target.nodeName);
        //     $("#meeting").val("");
        //     $('.ui.dropdown').dropdown('restore defaults');
        // }
    });
    $('#meetingTable').on('click', 'td', function(e){
                if($(this).data("empty")==true){
                    $('#meeting').focus();
                    $("#meeting").val("");
                    let time = $(this).data("time");
                    $('#dropdown1').dropdown('set selected', time);
                    $('#dropdown2').dropdown('set selected', time+1);
                }
                else if($(this).data("empty")==false){
                    // e.stopImmediatePropagation();
                    // $('#meeting').focus();
                    // $.getJSON("/api/schedules/"+$(this).data("id"))
                    //     .then(function(edit){
                    //         $("#meeting").val(edit.name);
                    //         $('#dropdown1').val(edit.meetingStart).change();
                    //         $('#dropdown2').val(edit.meetingEnd).change();
                        //                 $('#meeting').keypress(function(event){
                        //                     if(event.keyCode===13){
                        //                     event.stopImmediatePropagation();
                        //                     // updateMeeting(edit);
                        //                     alert("miau");
                        //                     }
                        // });
                        
                                        // });
                }
                        
        });
    $('.list,#meetingTable').on('click', 'option', function(e){
        e.stopPropagation();
        dropdownDeleteAndMoveToTomorrow($(this));    //WORKS!
      });
    $('.list,#meetingTable').on('click', '.dropbtn', function(e){
        e.stopPropagation();
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
        selected = chosenDate(this); 
        meetingTable();
        //WORKS!
        $.getJSON("/api/schedules")
        .then(addSchedules);
        });
        $("#demo1").on("click", "i", function(e) {
                e.stopPropagation();
                var date = new Date(), y = date.getFullYear(), m = date.getMonth();
                var lastDay = new Date(y, m + 1, 0).getDate();
                if(this.id=="changeToTomorrow" && selected<lastDay){
                    $("#demo1").transition("fade right");
                    $("#meetingTable").transition("fade right");
                    $(".list").transition("fade right");
                    selected++;
                    $("#demo").text(selected);
                    setTimeout(function(){
                    $("#demo1").html('<div><i class="caret left icon" id="changeToYesterday"></i>'+selected+" of "+getMonth() + ", "+getCurrentDay()+'<i class="caret right icon" id="changeToTomorrow"></i></div>');
                    }, 200);
                    $("#demo1").transition("fade left");
                    $(".list").empty();
                    $("#meetingTable").empty();
                    meetingTable();
                    $("#meetingTable").transition("fade left");
                    $(".list").transition("fade left");
                    $.getJSON("/api/schedules")
                    .then(addSchedules);
        }
        else if (this.id=="changeToYesterday" && selected>1){
                    selected--;
                    $("#demo").text(selected);
                    $("#demo1").transition("fade left");
                    $("#meetingTable").transition("fade left");
                    $(".list").transition("fade left");
                    setTimeout(function(){
                    $("#demo1").html('<div><i class="caret left icon" id="changeToYesterday"></i>'+selected+" of " +getMonth() + ", "+getCurrentDay()+'<i class="caret right icon" id="changeToTomorrow"></i></div>');
                    }, 200);
                    $("#demo1").transition("fade right");
                    $(".list").empty();
                    $("#meetingTable").empty();
                    meetingTable();
                    $("#meetingTable").transition("fade right");
                    $(".list").transition("fade right");
                    $.getJSON("/api/schedules")
                    .then(addSchedules);
        }
        });
        function changingTimes () {
            $('#dropdown1').dropdown({ onChange: function(value, $choise){
                var arr= [];
                var xujznaet = $('#dropdown1').dropdown('get value');
                    if(xujznaet==""){
                        xujznaet=10;
                    }
                console.log(xujznaet);
                    for (var i = xujznaet; i <= 18; i++) {
                        if (i==xujznaet){
                                console.log("pasol nx");
                        } else {
                              arr.push({value: i, name: i});
                        }
                    }
    $('#dropdown2').dropdown('change values', arr);
  }
});
        }
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
                    $('.ui.dropdown').dropdown('restore defaults');
                
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
        // function colors () {
        //     var arr =["#f1ddf2", "#fff6ec", "#e7ebec", "#eafeec", "#eaeed2", "#eadcd2", "#cadcd2", "#cac8d2", "#b9c8d2", "#b9b3d2"];
        //     var i = Math.floor(Math.random() * Math.floor(arr.length));
        //     console.log(arr[i]);
        //     return arr[i];
        // }
        
        function addSchedule(schedule){
            if(selected == schedule.day){
            if(schedule.type==="meeting"){
                var newMeeting = $('<div class="meeting">'+schedule.name+ddnButton(schedule)+'</div>').hide().fadeIn("fast");                 
                newMeeting.data('id', schedule._id);
                newMeeting.data('startTime', schedule.meetingStart);
                newMeeting.data('endTime', schedule.meetingEnd);
                for(var i=schedule.meetingStart; i<schedule.meetingEnd; i++){
                    $('#time'+i).data('empty', false);
                    $('#time'+i).data('id', schedule._id);
                }
                $('#time'+schedule.meetingStart).html(newMeeting);
                $('.ui.dropdown').dropdown('restore defaults');
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
                            return false;
                }
                }
                    return true;
                }
    
        function createMeeting(day){
        var startOfTheMeeting = $('#dropdown1').dropdown('get value');
        // console.log("miau miaju" + startOfTheMeeting);
        // $('#dropdown1').dropdown('set selected', startOfTheMeeting);

        var endOfTheMeeting = $('#dropdown2').find(":selected").val();

        var nameOfTheMeeting = $('#meeting').val();
        var check = checkingTime(Number(startOfTheMeeting), Number(endOfTheMeeting));
        if(nameOfTheMeeting=="" || $('#dropdown1 option:selected').text()=="Start"||$('#dropdown2 option:selected').text()=="End" || check==false) {
                $('#meetingInput').effect("shake");
        } else {
        $.post('/api/schedules',{name: nameOfTheMeeting, type: "meeting", day: day, meetingStart: startOfTheMeeting, meetingEnd: endOfTheMeeting})
        .then(function(newMeeting){
            addSchedule(newMeeting);
            $('#meeting').val('');
            $('.ui.dropdown').dropdown('restore defaults');
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
          var day=schedule.day;
          var updateData ={day: selected+1};
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
    //     var updateUrl = '/api/schedules/' + schedule._id;
    //     var meetingName = $("#meeting").val();
    //     var startTime = $('#dropdown1').val();
    //     var endTime = $('#dropdown2').val();
    //     var updateData= {meetingName: schedule.name, startTime: schedule.meetingStart, endTime: schedule.meetingEnd};
    //     $.ajax({
    //         method: 'PUT',
    //         url: updateUrl,
    //         data: updateData
    //       })
    //       .then(function(data){
    //         addSchedule(data);
    //       });
    // }
function fillCalendar() {
            var date = new Date(), y = date.getFullYear(), m = date.getMonth();
            var firstDay = new Date(y, m, 1).getDate();
            var lastDay = new Date(y, m + 1, 0).getDate();
            var firstWeekDay = new Date(y, m, 1).getDay();
            var lastWeekDay =  new Date(y, m + 1, 0).getDay();
               $('#tableBody').append($('<tr>'));
                  if(firstWeekDay==0){
                    for (var i=0; i<6; i++){
                                    var newDate = $('<td></td>');
                              $('#tableBody').append(newDate);
                                      var theDAY=firstWeekDay;
                    }
                  }
                else {
              for(let i=1; i<firstWeekDay; i++){
                var theDAY=firstWeekDay;
              var newDate = $('<td></td>');
              $('#tableBody').append(newDate);
            }}
          for (var i=firstDay; i<=lastDay; i++){
              if(theDAY==7){
                 theDAY=0;
                 }
               if(theDAY==0){
                 var newDate = $('<td id="td'+i+'">'+i+'</td>');
                 $('#tableBody').append(newDate);
                 $('#tableBody').append($('</tr><tr>'));
                 }
              else {
            var newDate = $('<td id="td'+i+'">'+i+'</td>');
            $('#tableBody').append(newDate);
              }   
                          theDAY++;

          }            
        }
    function hidingElements(){
        $("#meetingTable").hide();
        $("#meetingInput").hide();
        $("#field2").hide();
        $("#smallcalendar").hide();
        $("#demo").hide();
        $("#lists").hide();
        todaysDate();
    }

    function meetingTable() {
        $('#list2').append('<div class="header">Tasks</div>');
        $('#meetingTable').append('<thead class="full-width"><tr><th colspan="2" id = "miau"><div>Meetings</div></th></tr></thead>');
        for(var i=9; i<=17; i++)
          {
            $("#meetingTable").append("<tr><td class=meetingTableTime>"+i+""+"</td><td class=miau id=time"+i+"></td></tr>");
            $("#time"+i).data("time", i);
            $('#time'+i).data('empty', true);
            $('#time'+i).data('id', null);
          }
  }
    function todaysDate(){
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        
        if(mm<10) {
            mm = '0'+mm;
        } 
        months[mm];
        today = mm + '/' + dd + '/' + yyyy;
        $("#td"+dd).css({'background':'rgb(184, 219, 232)'});
        console.log("todays date: " + dd);
        return dd;
    }
    function getMonth(){
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth(); //January is 0!
        return   months[mm];
    }
    function getCurrentDay(){
        var days = ["Sunday","Monday","Tuesday","Wendesday","Thursday","Friday","Saturday"];
        var today = new Date((new Date()).getFullYear()+ getMonth().toString() +" "+selected.toString());
        var dd = today.getDay();
        return   days[dd];
    }
    function smallCalendarPopup () {
        $("#meetingInput").transition("fade");
        $("#field2").transition("fade");
        $("#smallcalendar").transition("fade");
        $("#demo").transition("fade");
        $("#meetingTable").transition("fade");

        $("#lists").transition({
    animation  : 'scale',
    duration   : '0.5s',
    onComplete : function() {
                $("#calendar").transition("fade");

    }
  })
;
        $(".list").empty();
        $("#meetingTable").empty();
        $("#demo1").html('<i class="calendar alternate outline icon"></i>');
    }
        function chosenDate(day){

          $("td").removeClass("changetd"); 
          var  p = ($( day ).text());
          selected = p;
          $(day).toggleClass("changetd");
        $("#calendar").transition({
        animation  : 'fade',
        duration   : '0.4s',
         onComplete : function() {
           $("#meetingInput").transition("fade down");
           $("#field2").transition("fade down");
           $("#lists").transition("fade down");
           $("#smallcalendar").transition("fade down");
                   $("#meetingTable").transition("fade");

           $("#demo").text(p);
           $("#demo").transition("fade down");
          $("#demo1").html('<div><i class="caret left icon" id="changeToYesterday"></i>'+p+" of " +getMonth() + ", "+getCurrentDay()+'<i class="caret right icon" id="changeToTomorrow"></i></div>');
    }
  })
;         
          return p;
    }
});
