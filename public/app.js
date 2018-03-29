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
        
        
//         $("#dropdown2").dropdown().on("click", function() {
//     getValue();
//      function getValue(){
//     $('#dropdown1').dropdown('set values', 12);
// }            });
    $('#dropdown1').dropdown({
        onChange: function(value, $choise){
            var arr= [];
            var xujznaet = $('#dropdown1').find(':selected').val();
            console.log(xujznaet);
            for (var i = xujznaet; i <= 18; i++) {
                if (i==xujznaet){
                        console.log("pasol nx");
                } else {
                      arr.push({value: i, name: i});
                }
            }
                    console.log("2  "+arr);

    // arr[arr.length - 1].selected = true;
    $('#dropdown2')
    	.dropdown('change values', arr);
  }
});
// $('#dropdown2').dropdown({
//             onChange: function(value, $choise){
//             var arr= [];
//             var xujznaet = $('#dropdown2').find(':selected').val();
//             console.log(xujznaet);
//             for (var i = 9; i <= xujznaet; i++) {
//                 if (i==xujznaet){
//                         console.log("pasol nx");
//                 } else {
//                       arr.push({value: i, name: i});
//                 }
//             }
//                     console.log("2  "+arr);

//     // arr[arr.length - 1].selected = true;
//     $('#dropdown1')
//     	.dropdown('change values', arr);
//   }
// });
$('#dropdown2')
    	.dropdown();
//     $('.ui.dropdown.year').dropdown({
//   onChange: function (value, text, $choice) {
//     var arr = [];
//     var months = $('#year').find(':selected').data('month');
//     for (var i = 0; i < months.length; i++) {
//       var m = months[i];
//       arr.push({value: m, name: m});
//     }
//     arr[arr.length - 1].selected = true;
//     $('.ui.dropdown.month')
//     	.dropdown('change values', arr);
//   }
// });
// $('.ui.dropdown.month').dropdown({
//   onChange: function (value, text, $choice) {
//     console.log(value)
//   }
// });

        // $('#dropdown1').change(function() {
        //     var miau = $('#dropdown1 option:selected').val();
        //     console.log(miau);
        //     for (var i=10; i<=miau; i++){
        //             // $("#dropdown2 option[value=" + i + "]").text("asds").change();
        //             // $("#dropdown2 option[value=" + i + "]").val("asds").change();
        //                 console.log($("#dropdown2 option[value=" + i + "]").val());                                    
        //                 $("#dropdown2").dropdown('remove selected', i);

        //     }

    // });
    $(document).on('click', function(e) {
        if (e.target.nodeName === "BODY") {
            console.log(e.target.nodeName);
            $("#meeting").val("");
            $('.ui.dropdown').dropdown('restore defaults');
        }
    });
    $('#meetingTable').on('click', 'td', function(e){
            e.stopPropagation();
            console.log($(this).data());
                if($(this).data("empty")==true){
                    $('#meeting').focus();
                    $("#meeting").val("");
                    let time = $(this).data("time");
                    $('#dropdown1').val(time).change();
                    $('#dropdown2').val(time+1).change();                
                }
                else if($(this).data("empty")==false){
                    $('#meeting').focus();
                    $.getJSON("/api/schedules/"+$(this).data("id"))
                        .then(function(edit){
                            $("#meeting").val(edit.name);
                            $('#dropdown1').val(edit.meetingStart).change();
                            $('#dropdown2').val(edit.meetingEnd).change();
                        //                 $('#meeting').keypress(function(event){
                        //                     if(event.keyCode===13){
                        //                     updateMeeting(edit);
                        //                     }
                        // });
                        
                                        });
                }
                        
        });
    //         });
    //         $("#submit1").on("click", function(){
    //         updateMeeting($(this));
    //             });

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
        selected = chosenDate(this);                //WORKS!
        $.getJSON("/api/schedules")
        .then(addSchedules);
        });
        
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
                            console.log(i);
                            return false;
                }
                }
                    return true;
                }
    
        function createMeeting(day){
        var startOfTheMeeting = $('#dropdown1 option:selected').text();
        $("#dropdown2").children('option[value="12"]').hide();


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
          
          for (var i=1; i<=31; i++){
            if(i==1){
              $('#tableBody').append($('<tr>'));
            }
            // if(i>-2 && i<1){
            //  var emptyDate = $('<td>""</td>');
            // $('#tableBody').append(emptyDate);
          
            // }
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
