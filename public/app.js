/*global $ */
$(document).ready(function(){ // TRY TO REMOVE SELECTED VAR!!!!!!!!!!!??????????? GET&SET selected ///// move to another day popup,selection of tds


    

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//     if (event.target == modal) {
//         modal.style.display = "none";
//     }
// }
    let value;
    
    $.mobile.loading( 'show', { theme: "b", text: "", textonly: false});  //removes "loading" from page
    
    fillCalendar(); 
    hidingElements(); 
    coloringMarkedDays();
    changingTimes();
    var selected;
    
    setTimeout(function() { //hides the login/registration message
        $(".messages").transition('fade up');
    }, 2000); 
    
    $("#closeMessage").on('click', function(e){ //removes the upcoming meetings&schedules preview
        e.stopPropagation()
        $('#upcomingMessage').transition({ 
            animation : 'fade',
            duration : '500ms',
            onComplete : function(){
                $("#upcomingMessage").remove();
            }
        });
    });
    
    $("#upcomingHeader").on('click', function(e){ //shrinks the upcoming meetings&schedules preview
        e.stopPropagation();
        $("#nearestList").transition("fade");
        $("#arrowRotate").toggleClass("arrowRotateClass");
    });
    
    $(document).on("click", ".modalSpan", function(event){
        $(this).css("background-color","grey")
        $(this).text()
        setSpan($(this))
        console.log($(this).data())
    });
    
    $(document).on("click", "#submitSpan", function(e){
        getSpan();
        console.log("GET SPAN");
        let id = getSpan().data('id');
        let day = getSpan().text();
        
        updateTodoAnotherDay(id, day);
        
    })
    
    
    $(".close").on("click", function(){
        $("#myModal").modal("hide");
    })
    
    function getSpan() { 
        return this.value; 
    }
    
    function setSpan(myArgument) { 
        this.value = myArgument;
    }
    
    function coloringMarkedDays(){  //colors the days, which hold a meeting or a task.
        $.getJSON("/api/schedules", function(result){
            $.each(result, function(i, field){
                $("#td"+field.day).addClass("markedDays");
            });
        });
    }

    // $('#DDN').dropdown();
    
    $('#taskList').on('click', 'div.item', function(e){ //crosses out a task (if its done)
        ($(this)).toggleClass('done', 200);         
        e.stopPropagation();
    });
        
    $('#dropdown1').dropdown();
    $('#dropdown2').dropdown();
    
    // $(document).on('click', function(e) {
        // let X = e.target.nodeName;
        // console.log(X);
        // if (/*bybys === "DIV"||*/ bybys === "BODY"||bybys === "H4") {
        //     console.log(e.target.nodeName);
        //     $("#meeting").val("");
        //     $('.ui.dropdown').dropdown('restore defaults');
        // }
    // });
    
    $('#meetingTable').on('click', 'td', function(e){ // if pressed on an empty td of a meeting table,
        if($(this).data("empty")==true){              // focuses on meeting input and sets times of ddns
            $('#meeting').focus();
            $("#meeting").val("");
            let time = $(this).data("time");
            $('#dropdown1').dropdown('set selected', time);
            $('#dropdown2').dropdown('set selected', time+1);
        }
    });
        
    $('.list,#meetingTable').on('click', 'option', function(e){ // calls a function when dropdown element is selected
        e.stopPropagation();
        dropdownDeleteAndMoveToTomorrow($(this));    
      });
      
    $('.list,#meetingTable').on('click', '.dropbtn', function(e){ // bug fix 
        e.stopPropagation();
      }); 
      
    $('#task').keypress(function(event){ // when enter is pressed in the task field, a task is created
        if(event.keyCode===13){
            createTodo(selected);                       
        }
    });
    
    $('#meeting').keypress(function(event){ // when enter is pressed in the meeting field, meeting is created
        if(event.keyCode===13){
            createMeeting(selected);                    
        }
    });
    
    $("#submitMeeting").on("click", function(){
        createMeeting(selected);                    // when pressed on a plus button, meeting is created
    });
    
    $("#submitTask").on("click", function(){    //when pressed on a plus button, task is created
        createTodo(selected);                    
    });
        
    $("#smallcalendar").on("click", function(){ // when in single day view, pressing on the small calendar in top left redirects to calendar view
        smallCalendarPopup();                       
    });
        
    $("#calendar").on("click", "td:not(:empty)", function() { // when pressed on a day in the calendar, redirects to single day view, retrieves data from api
        selected = chosenDate($(this).text()); 
        meetingTable();
        $.getJSON("/api/schedules")
            .then(addSchedules);
    });
        
    $("#demo1").on("click", "i", function(e) { // pressing on an arrow switches to another days view
        e.stopPropagation();
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var lastDay = new Date(y, m + 1, 0).getDate();
        
        if(this.id=="changeToNextDay" && selected<lastDay){
            getNextDay();
        }
        else if (this.id=="changeToBeforeDay" && selected>1){
            getBeforeDay();
        }
    });
        
    $("#nearestList").on("click", "span", function(e) { // pressing on an element of nearest meetings&tasks panel, 
        var miau = ($(this).attr('id'));                //redirects to single day view of that element
        selected = chosenDate(miau); 
        meetingTable();
        
        $.getJSON("/api/schedules")
            .then(addSchedules);
    });
    
    $("#lists").on("swipeleft", function(e) {
        if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) { //  checks if on desktop or mobile
            $(document).on('swipeleft', 'html', function(event) {  // swipe on desktop disabled
                event.stopPropagation();
                event.preventDefault();
            });                 
        } else {
            e.stopPropagation();    //changes view to next day
            var date = new Date(), y = date.getFullYear(), m = date.getMonth();
            var lastDay = new Date(y, m + 1, 0).getDate();
            if(selected<lastDay){
                getNextDay();
            }
        }
    });
              
    $("#lists").on("swiperight", function(e) {
        if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) { //  checks if on desktop or mobile
            $(document).on('swiperight', 'html', function(event) {  // swipe on desktop disabled
                 event.stopPropagation();
                 event.preventDefault();
            }); 
        } else {
            e.stopPropagation();    //changes view to previous day
            if(selected>1){
                getBeforeDay();
            }
        }
    });
        
    function nearestMeetings(){
        var today = new Date();
        var dd = today.getDate();
        var meetings = [];
        var tasks = [];
        $.getJSON("/api/schedules", function(result){
            $.each(result, function(i, field){          //Putting elements to according arrays
                if(field.day>=dd && field.day<=dd+3){
                    if(field.type=="meeting"){
                        meetings.push(field);
                    } else {
                        tasks.push(field);
                    }
                }
            });
        })
        .then(function() {          // populates nearest meetings & tasks list
            bubbleSort(tasks).forEach(function(element){
                $('#nearestTasksList').append('<span id='+element.day+'><strong>'+ element.name + "</strong> on "+ getDayOfTheWeek(element.day) + '<span><br>');
            });
            bubbleSortMeetings(meetings).forEach(function(element){
                $('#nearestMeetingsList').append('<span id='+element.day+'>'+ '<strong>'+ element.name + "</strong>  " + element.meetingStart +":00-"+ element.meetingEnd + ":00 on " + getDayOfTheWeek(element.day) + '<span><br>');
            });
            
        });
        //sort meetings and todos (a method?)
        //display chronoligically
    }

    function bubbleSort(arr){   // sorts tasks according to day
        var len = arr.length;
        for (var i = len-1; i>=0; i--){
            for(var j = 1; j<=i; j++){
                if(arr[j-1].day>arr[j].day){
                    var temp = arr[j-1];
                    arr[j-1] = arr[j];
                    arr[j] = temp;
                }
            }
       }
       return arr;
    }
        
    function bubbleSortMeetings(arr){    // sorts meetings kinda
       var len = arr.length;
       for (var i = len-1; i>=0; i--){
            for(var j = 1; j<=i; j++){
                if(arr[j-1].meetingStart>arr[j].meetingStart){
                    var temp = arr[j-1];
                    arr[j-1] = arr[j];
                    arr[j] = temp;
                }
            }
        }        
       return arr;
    }
    
    function changingTimes () {     // adjusting times in the meeting input dropdowns
        $('#dropdown1').dropdown({ onChange: function(value, $choise){
            var arr= [];
            var value = $('#dropdown1').dropdown('get value');
                if(value==""){
                    value=10;
                }
                for (var i = value; i <= 18; i++) {
                    if (i==value){
                        
                    } else {
                          arr.push({value: i, name: i});
                    }
                }
            $('#dropdown2').dropdown('change values', arr);
        }});
    }
        
    function getNextDay(){      // when pressed on an arrow in single day view, switched to next day's view 
        $("#demo1").transition("fade right");
        $("#meetingTable").transition("fade right");
        $(".list").transition("fade right");
        selected++;
        $("#demo").text(selected);
        
        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeDay"></i>'+selected+" of "+getMonth() + ", "+getDayOfTheWeek(selected)+'<i class="caret right icon" id="changeToNextDay"></i></div>');
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
    
    function getBeforeDay(){    // when pressed on an arrow in single day view, switched to before day's view 
        selected--;
        $("#demo").text(selected);
        $("#demo1").transition("fade left");
        $("#meetingTable").transition("fade left");
        $(".list").transition("fade left");
        
        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeDay"></i>'+selected+" of " +getMonth() + ", "+getDayOfTheWeek(selected)+'<i class="caret right icon" id="changeToNextDay"></i></div>');
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
        
    function addSchedules(schedules){ // adds schedules to the appropriate lists
        schedules.forEach(function(schedule){
            addSchedule(schedule);
        });
    }
        
    function dropdownDeleteAndMoveToTomorrow(arg){ // functionality for deleting and updating elements
        let element = arg.parent().parent().parent();
        let elementId = arg.parent().parent().parent().data('id');
        let elementDay = arg.parent().parent().parent().data('day');
        
        if(arg.val()==0){
            updateTodo(elementId, elementDay, element);
        }
        else if(arg.val()==1){
            // $("#myBtn").on("click", function(){  // Get the modal
            $('body').append(generateModel());
            $("#myModal").append()
            $("#myModal").modal('show');
            
            var date = new Date(), y = date.getFullYear(), m = date.getMonth();
            var firstDay = new Date(y, m, 1).getDate();
            var lastDay = new Date(y, m + 1, 0).getDate();
            
            for(var i=elementDay; i<=lastDay; i++){
                var txt1 = $('<span class="modalSpan" id="span'+i+'"'+'>'+i+' </span>');               // Create element with HTML 
                
                // var newMeeting = $('<div class="meeting">'+schedule.name+ddnButton(schedule)+'</div>').hide().fadeIn("fast");                 
                // newMeeting.data('id', schedule._id);
                
                txt1.data('id', elementId);
                txt1.data('day', elementDay);
                $("#modalContent").append(txt1);
                console.log(i); //setters and getters needed
            }
        }
        else if(arg.val()==2){   
            deleteSchedule(elementId, element);
        }
    }
    
    
    
    function generateModel(){   // id="myModal"   id="sudas"    <i class="close icon"></i>
        let modal = 
        '<div class="ui modal" id="myModal">\
          <div class="header">Header</div>\
          <i class="close icon"></i>\
          <div class="content" >\
          <div id="modalContent"></div>\
          </div>\
          <button class="positive ui button" id="submitSpan">Positive Button</button>\
        </div>';
        return modal;
    }
    
    
    
    function ddnButton (schedule){   //generating ddn buttons for elements
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
            return ddnTodo;
        } else {
            var ddnMeeting = 
                    '<div class="dropdown" style="float:right;">\
                  <button class="dropbtn"><i class="ellipsis horizontal icon"></i></button>\
                  <div class="dropdown-content">\
                    <option value="2">Delete</option>\
                  </div>\
                </div>';
            return ddnMeeting;
        }
    }
    
        // function colors () {
        //     var arr =["#f1ddf2", "#fff6ec", "#e7ebec", "#eafeec", "#eaeed2", "#eadcd2", "#cadcd2", "#cac8d2", "#b9c8d2", "#b9b3d2"];
        //     var i = Math.floor(Math.random() * Math.floor(arr.length));
        //     console.log(arr[i]);
        //     return arr[i];
        // }
        
    function addSchedule(schedule){     // appends and puts information accordingly for a single schedule element after the ajax call
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
                newTodo.data('day', schedule.day);
                newTodo.data('empty', false);
                $('#taskList').append(newTodo);
            }
        }       
    }
    
    function createTodo(day){    // takes user input and creates a todo
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
    
    
    function checkingTime(startOfTheMeeting, endOfTheMeeting){ // ???? not needed????
        for(var i=startOfTheMeeting; i<endOfTheMeeting; i++){
            if($('#time'+i).data('empty')==false){
                return false;
            }
        }
        return true;
    }

    function createMeeting(day){    // takes user input, undergoes some conditions, and creates a meeting
        var startOfTheMeeting = $('#dropdown1').dropdown('get value');
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
    
    function deleteSchedule(scheduleId, element){ // takes schedule id, and deletes it
        var deleteUrl = '/api/schedules/' + scheduleId; 
        
        $.ajax({
            method: 'DELETE',
            url: deleteUrl
        })
        .then(function(){
            element.html('<div>Deleted  <div class="divcheck"><i class="check icon"></div></i></div>');
            element.addClass('elementChange').delay(1000).slideUp(700,function(){
                for(var i=element.data("startTime"); i<element.data("endTime"); i++){
                    $('#time'+i).css("background-color", "white");
                    $('#time'+i).data("empty", true);
                    $('#time'+i).data("id", null);
                }
                $('#meeting').val("");
                $('.ui.dropdown').dropdown('restore defaults');
            });
        })
        .catch(function(err){
            console.log(err);
        });
    }
    
    function updateTodo(todoId, todoDay, element){  //takes schedules id, updates it
        var updateUrl = '/api/schedules/' + todoId;
        var updateData ={day: todoDay+1};
        
        $.ajax({
            method: 'PUT',
            url: updateUrl,
            data: updateData
        })
        .then(function(){
            element.html('<div>Moved to Tomorrow <i class="check icon"></i></div>');
            element.addClass('elementChange').delay(1000).slideUp(700,function(){
            });
        })
    }
    
    function updateTodoAnotherDay(todoId, todoDay){  //takes schedules id, updates it
        var updateUrl = '/api/schedules/' + todoId;
        var updateData ={day: todoDay};
        
        $.ajax({
            method: 'PUT',
            url: updateUrl,
            data: updateData
        })
        // .then(function(){
        //     element.html('<div>Moved to '+todoDay+'th <i class="check icon"></i></div>');
        //     element.addClass('elementChange').delay(1000).slideUp(700,function(){
        //     });
        // })
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
    
    function fillCalendar() { // generates the calendar
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
                } else {
                    for(let i=1; i<firstWeekDay; i++){
                        var theDAY=firstWeekDay;
                        var newDate = $('<td></td>');
                        $('#tableBody').append(newDate);
                    }
                }
                for (var i=firstDay; i<=lastDay; i++){
                    if(theDAY==7){
                        theDAY=0;
                    }
                    if(theDAY==0){
                        var newDate = $('<td id="td'+i+'">'+i+'</td>');
                        $('#tableBody').append(newDate);
                        $('#tableBody').append($('</tr><tr>'));
                    } else {
                        var newDate = $('<td id="td'+i+'">'+i+'</td>');
                        $('#tableBody').append(newDate);
                    }   
                    theDAY++;
                }      
        nearestMeetings();
    }
        
    function hidingElements(){ // hides elements, calls todaysDate(), which gives a border to todays day in the calendar
        $("#meetingTable").hide();
        $("#meetingInput").hide();
        $("#field2").hide();
        $("#smallcalendar").hide();
        $("#demo").hide();
        $("#lists").hide();
        todaysDate();
    }

    function meetingTable() { // generates a tasks list header and meetings list table
        $('#taskList').append('<div class="header">Tasks</div>'); // appends a task list header
        $('#meetingTable').append('<thead class="full-width"><tr><th colspan="2" id = "miau"><div>Meetings</div></th></tr></thead>'); // appends a meeting list header
        
        for(var i=9; i<=17; i++){
            $("#meetingTable").append("<tr><td class=meetingTableTime>"+i+""+"</td><td class=miau id=time"+i+"></td></tr>");
            $("#time"+i).data("time", i);
            $('#time'+i).data('empty', true);
            $('#time'+i).data('id', null);
          }
    }
  
    function todaysDate(){ // Gives a border to a todays day in the calendar
        var today = new Date();
        var dd = today.getDate();
        $("#td"+dd).addClass('today');
    }

    function getMonth(){ //return month
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];
        var today = new Date();
        // var dd = today.getDate();
        var mm = today.getMonth(); 
        return   months[mm];
    }
    
    function getDayOfTheWeek(day){ //returns day of the week in a word format
        var weekDays = ["Sunday","Monday","Tuesday","Wendesday","Thursday","Friday","Saturday"];
        var selectedDay = new Date((new Date()).getFullYear()+ getMonth().toString() +" "+day.toString());
        var dd = selectedDay.getDay();
        return   weekDays[dd];
    }
    
    function smallCalendarPopup () { //pressing on a small calendar icon to go back to main view
        
        for(var i=0; i<31; i++){ // reseting marked days
            $("#td"+i).removeClass( "markedDays" );
        }   
        coloringMarkedDays() //coloring again
        
        $("#nearestTasksList").empty(); //reseting nearest meetings and tasks view 
        $("#nearestMeetingsList").empty();
        nearestMeetings(); //populating again 
        
        $("#upcomingMessage").transition('fade up'); //hiding single day view
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
        });
        
        $(".list").empty(); // reseting lists of a single day view
        $("#meetingTable").empty();
        $("#demo1").html('<i class="calendar alternate outline icon"></i>');
    }
    
    function chosenDate(day){  // Displays the panel of chosen date (meeting, task lists, inputs), hides calendar
        selected = day;
        
        $("#upcomingMessage").transition('fade down');
        
        $("#calendar").transition({
            animation  : 'fade',
            duration   : '0.4s',
                onComplete : function() { // hiding the calendar view, tranisting to single day view
                    $("#meetingInput").transition("fade down");
                    $("#field2").transition("fade down");
                    $("#lists").transition("fade down");
                    $("#smallcalendar").transition("fade down");
                    $("#meetingTable").transition("fade");
                    $("#demo").text(day);
                    $("#demo").transition("fade down");
                    $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeDay"></i>'+day+" of " +getMonth() + ", "+getDayOfTheWeek(day)+'<i class="caret right icon" id="changeToNextDay"></i></div>');
                }   
        });         
        return day;
    }
    
});
