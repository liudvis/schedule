/*global $ */
/*global navigator */

$(document).ready(function(){ // TRY TO REMOVE SELECTED VAR!!!!!!!!!!!??????????? GET&SET selected /////
    $.mobile.loading( 'show', { theme: "b", text: "", textonly: false});  //removes "loading" from page 
    
    var selected;
    
    calendarSetMonth(getCurrentMonth());
    
    fillCalendar(calendarGetMonth()); 
    hidingElements(); 
    coloringMarkedDays();
    changingTimes();
    $('#dropdown1').dropdown();
    $('#dropdown2').dropdown();
    nearestMeetings();
    
    $(window).on('hashchange', function(e){
        if(document.location.hash==''){
            smallCalendarPopup();                       
        }
    });    
    
    setTimeout(function() { //hides the login/registration message
        $(".messages").transition('fade up');
    }, 2000); 
    
    $("#closeMessage").on('click', function(e){ //removes the upcoming meetings&schedules preview
        e.stopPropagation();
        $('#upcomingMessage').transition({ 
            animation : 'fade',
            duration : '500ms',
            onComplete : function(){
                $("#upcomingMessage").remove();
            }
        });
    });
    
    $("#upcomingHeader").on('click', function(e){ //shrinks the upcoming meetings&schedules preview
        // e.stopPropagation();
        $("#nearestList").transition("fade");
        $("#arrowRotate").toggleClass("arrowRotateClass");
    });
    
    $(document).on("click", "td", function(event){ 
        console.log($(this).data());
        console.log($(this).attr("id"));
    });
    
    
    $(document).on("click", ".available", function(event){ // ON EVENT FIRED
        $("#submitSpan").removeAttr('disabled');
        $(".available").removeClass("selectedModalTd");
        $(this).addClass("selectedModalTd");
        setSpan($(this));
    });
    
    $(document).on("click", "#submitSpan", function(e){
        if(getSpan()==undefined){
            $("#myModal").effect("shake");
        }
        else {
            let id = getSpan().data('id');
            let day = getSpan().data('day'); 
            let month = getSpan().data('month');

            updateTodo(id, day, getElement(), month, 1);  // BBBBUUUUUUUUGGGGGGG
            $("#myModal").modal("hide");
            $("#myModal").remove();
            setSpan(undefined);
        }
    });
    
    $(document).on("click", ".unavailable", function(event){ // ON EVENT FIRED
        $("#myModal").effect("shake");
        setSpan(undefined);
    });

    function coloringMarkedDays(){  //colors the days, which hold a meeting or a task.
        $.getJSON("/api/schedules", function(result){
            $.each(result, function(i, field){
                if( field.month==calendarGetMonth() ){
                    $("#td"+field.day).addClass("markedDays");
                }
            });
        });
    }

    $('#taskList').on('click', 'div.item', function(e){ //crosses out a task (if its done)
        ($(this)).toggleClass('done', 200);         
        e.stopPropagation();
    });
    
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
      
    $('.list,#meetingTable').on('click', '.dropbtn', function(e){ // unwanted behaviour fix
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
        parent.history.back();
    });
        
    $("#calendar").on("click", "td:not(:empty)", function() { // when pressed on a day in the calendar, redirects to single day view, retrieves data from api
        selected = chosenDate($(this).text()); 
        meetingTable();
        $.getJSON("/api/schedules")
            .then(addSchedules);
    });
        
    $("#demo1").on("click", "i", function(e) { // pressing on an arrow switches to another days view
        e.stopPropagation();
        var date = new Date(), y = date.getFullYear(), m = calendarGetMonth();
        var lastDay = new Date(y, m + 1, 0).getDate();
        
        if(this.id=="changeToNextDay" && selected<lastDay){
            getNextDay();
        }
        else if (this.id=="changeToBeforeDay" && selected>1){
            getBeforeDay();
        }
        else if (this.id=="changeToBeforeMonth"){
            console.log("Change to Previous Month");
            getBeforeMonth();
        }
        else if(this.id=="changeToNextMonth"){
            console.log("Change to Next Month");
            getNextMonth();
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
        .then(function(){          // populates nearest meetings & tasks list
            bubbleSort(tasks).forEach(function(element){
                $('#nearestTasksList').append('<span id='+element.day+'><strong>'+ element.name + "</strong> on "+ getDayOfTheWeek(element.day) + '<span><br>');
            });
            bubbleSortMeetings(meetings).forEach(function(element){
                $('#nearestMeetingsList').append('<span id='+element.day+'>'+ '<strong>'+ element.name + "</strong>  " + element.meetingStart +":00-"+ element.meetingEnd + ":00 on " + getDayOfTheWeek(element.day) + '<span><br>');
            });
        });
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
        
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];

        
        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeDay"></i>'+selected+" of "+months[calendarGetMonth()] + ", "+getDayOfTheWeek(selected)+'<i class="caret right icon" id="changeToNextDay"></i></div>');
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
        
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];
        
        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeDay"></i>'+selected+" of " +months[calendarGetMonth()] + ", "+getDayOfTheWeek(selected)+'<i class="caret right icon" id="changeToNextDay"></i></div>');
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
    
    
    function fillCalendarModal(elementId) { // generates the calendar
        var date = new Date(), y = date.getFullYear(), m = calendarGetMonth();
        var firstDay = new Date(y, m, 1).getDate();
        var lastDay = new Date(y, m + 1, 0).getDate();
        var firstWeekDay = new Date(y, m, 1).getDay();
        
        var theDAY;
        var newDate;
            $('#tableBodyModal').append($('<tr>'));
                if(firstWeekDay==0){
                    for (var i=0; i<6; i++){
                        newDate = $('<td></td>');
                        $('#tableBodyModal').append(newDate);
                        theDAY=firstWeekDay;
                    }
                } else {
                    for(let i=1; i<firstWeekDay; i++){
                        theDAY=firstWeekDay;
                        newDate = $('<td></td>');
                        $('#tableBodyModal').append(newDate);
                    }
                }
                for (var i=firstDay; i<=lastDay; i++){
                    if(theDAY==7){
                        theDAY=0;
                    }
                    if(theDAY==0){
                        newDate = $('<td class="available '+calendarGetMonth()+'" id="Modaltd'+i+'">'+i+'</td>');
                        newDate.data('id', elementId);
                        newDate.data('day', i);
                        newDate.data('month', calendarGetMonth());
                        $('#tableBodyModal').append(newDate);
                        $('#tableBodyModal').append($('</tr><tr>'));
                    } else {
                        newDate = $('<td class="available '+calendarGetMonth()+'" id="Modaltd'+i+'">'+i+'</td>');
                        newDate.data('id', elementId);
                        newDate.data('day', i);
                        newDate.data('month', calendarGetMonth());
                        $('#tableBodyModal').append(newDate);
                    }   
                    theDAY++;
                }
    }
        
    function dropdownDeleteAndMoveToTomorrow(arg){ // functionality for deleting and updating elements
        let element = arg.parent().parent().parent();
        let elementId = arg.parent().parent().parent().data('id');
        let elementDay = arg.parent().parent().parent().data('day');
        let elementMonth = arg.parent().parent().parent().data('month');
        console.log(elementDay);
        
        if(arg.val()==0){
            updateTodo(elementId, elementDay+1, element, elementMonth, arg.val()); //moving to tomorrow
        }
        else if(arg.val()==1){ // moving to another day
            $('body').append(generateModel());
            fillCalendarModal(elementId);
            $("#myModal").append();
            $("#myModal").modal('show');

            var miau = new Date();
            var dd = miau.getDate();
            
            for(var i=0; i<dd; i++){
                    console.log($("#Modaltd"+i).data());
                }
            
            if(calendarGetMonth()==getCurrentMonth()){
                for(var i=1; i<dd; i++){
                    $("#Modaltd"+i).removeClass('available');
                    $("#Modaltd"+i).addClass('unavailable');
                    console.log($("#Modaltd"+i).data());
                }
            } 
            else {
                for(var i=1; i<dd; i++){
                    $("#Modaltd"+i).removeClass('available');
                    console.log($("#Modaltd"+i).data());
                }
            }
            $("#Modaltd"+dd).addClass('today');

            $("#Modaltd"+elementDay).addClass('unavailable');
            setElement(element);
            
            $('.ui.modal').modal({
                onHide: function(){
         			$("#tableBodyModal").empty();
         			$("#submitSpan").attr("disabled", true);
        		}
            });
        }
        else if(arg.val()==2){   
            deleteSchedule(elementId, element);
        }
    }
    
    function getElement() { 
        return this.elementValue; 
    }
    
    function setElement(myArgument) { 
        this.elementValue = myArgument;
    }
    
    function generateModel(){  
        let modal = 
        '<div class="ui modal" id="myModal">\
          <div class="header">Select Day: </div>\
          <i class="close icon"></i>\
          <div class="content" >\
            <table class="ui celled striped table unstackable" id="calendarModal">\
              <thead>\
                <tr><th>M</th>\
                <th>T</th>\
                <th>W</th>\
                <th>T</th>\
                <th>F</th>\
                <th>S</th>\
                <th>S</th>\
              </tr></thead>\
              <tbody id="tableBodyModal">\
              </tbody>\
              </table>\
          </div>\
          <button class="positive ui button" id="submitSpan" disabled>OK</button>\
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
        if(selected == schedule.day && schedule.month == calendarGetMonth()){
            console.log("schedule.month="+schedule.month+"; getCurrentMonth()"+calendarGetMonth());
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
        $.post('/api/schedules',{name: userInput, type: "todo", day: day, month: calendarGetMonth()})
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
            $.post('/api/schedules',{name: nameOfTheMeeting, type: "meeting", day: day, meetingStart: startOfTheMeeting, meetingEnd: endOfTheMeeting, month: calendarGetMonth})
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
    
    function updateTodo(todoId, todoDay, element, todoMonth, ddnOption){  //takes schedules id, updates it
        var updateUrl = '/api/schedules/' + todoId;
        var updateData ={day: todoDay, month: todoMonth};
        
        $.ajax({
            method: 'PUT',
            url: updateUrl,
            data: updateData
        })
        .then(function(){
            if(ddnOption==0){
                element.html('<div>Moved to Tomorrow <i class="check icon"></i></div>');
                element.addClass('elementChange').delay(1000).slideUp(700,function(){
                });
            } else {
                setTimeout(function(){  
                    element.html('<div>Moved to '+todoDay+'th <i class="check icon"></i></div>');
                    element.addClass('elementChange').delay(1000).slideUp(700,function(){
                    });
                }, 100);
            }
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
    
    function fillCalendar(month) { // generates the calendar
        var date = new Date(), y = date.getFullYear(), m = month;
        
        var firstDay = new Date(y, m, 1).getDate();
        var lastDay = new Date(y, m + 1, 0).getDate();
        var firstWeekDay = new Date(y, m, 1).getDay();

        let newDate, theDAY;
        
            $('#tableBody').append($('<tr>')); 
                if(firstWeekDay==0){
                    for (var i=0; i<6; i++){
                        newDate = $('<td></td>');
                        $('#tableBody').append(newDate);
                        theDAY=firstWeekDay;
                    }
                } else {
                    for(let i=1; i<firstWeekDay; i++){
                        theDAY=firstWeekDay;
                        newDate = $('<td></td>');
                        $('#tableBody').append(newDate);
                    }
                }
                for (var i=firstDay; i<=lastDay; i++){
                    if(theDAY==7){
                        theDAY=0;
                    }
                    if(theDAY==0){
                        newDate = $('<td class="'+m+'"id="td'+i+'">'+i+'</td>');
                        newDate.data("month", m);
                        newDate.data("day", i);
                        $('#tableBody').append(newDate);
                        $('#tableBody').append($('</tr><tr>'));
                    } else {
                        newDate = $('<td class="'+m+'" id="td'+i+'">'+i+'</td>');
                        newDate.data("month", m);
                        newDate.data("day", i);
                        $('#tableBody').append(newDate);
                    }   
                    theDAY++;
                }      
        // nearestMeetings();
    }
        
    function hidingElements(){ // hides elements, calls todaysDate(), which gives a border to todays day in the calendar
        // $("#meetingTable").hide();
        $("#meetingInput").hide();
        $("#field2").hide();
        $("#smallcalendar").hide();
        $("#demo").hide();
        $("#lists").hide();
        $("#inputFields").hide();
        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeMonth"></i><i class="calendar alternate outline icon"></i>'+getMonth()+'<i class="caret right icon" id="changeToNextMonth"></i></div>');
        }, 200);
        todaysDate();
    }

    function meetingTable() { // generates a tasks list header and meetings list table
        $('#taskList').append('<div class="header" id="tasksHeader">Tasks</div>'); // appends a task list header
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

        if($("#td"+dd).attr("class")==getCurrentMonth()){
            $("#td"+dd).addClass('today');
        }
    }

    function getMonth(){ //return month
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];
        var today = new Date();
        // var dd = today.getDate();
        var mm = today.getMonth(); 
        return   months[mm];
    }
    
    function getCurrentMonth(){ //return month
        var today = new Date();
        return   today.getMonth();
    }
    
    
    
    function getDayOfTheWeek(day){ //returns day of the week in a word format
        var weekDays = ["Sunday","Monday","Tuesday","Wendesday","Thursday","Friday","Saturday"];
        var selectedDay = new Date((new Date()).getFullYear()+ getMonth().toString() +" "+day.toString());
        var dd = selectedDay.getDay();
        return   weekDays[dd];
    }
    
    function smallCalendarPopup () { //pressing on a small calendar icon to go back to main view
        document.location.hash.split('#')[0];
        
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];


        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeMonth"></i><i class="calendar alternate outline icon"></i>'+months[calendarGetMonth()]+'<i class="caret right icon" id="changeToNextMonth"></i></div>');
        }, 200);

        for(var i=0; i<31; i++){ // reseting marked days
            $("#td"+i).removeClass( "markedDays" );
        }   
        coloringMarkedDays(); //coloring again
        
        $("#nearestTasksList").empty(); //reseting nearest meetings and tasks view 
        $("#nearestMeetingsList").empty();
        nearestMeetings(); //populating again 
        
        $("#upcomingMessage").transition('fade up'); //hiding single day view
        $("#meetingInput").transition("fade");
        $("#field2").transition("fade");
        $("#smallcalendar").transition("fade");
        $("#demo").transition("fade");
        $("#inputFields").transition("fade");

        // $("#meetingTable").transition("fade");
        // $('#taskList').transition("fade");

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
        document.location.hash = "singleDayView";
        
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];

        
        $("#upcomingMessage").transition('fade down');
        
        $("#calendar").transition({
            animation  : 'fade',
            duration   : '0.4s',
                onComplete : function() { // hiding the calendar view, tranisting to single day view
                    $("#meetingInput").transition("fade down");
                    $("#field2").transition("fade down");
                    $("#lists").transition("fade down");
                    $("#smallcalendar").transition("fade down");
                    $("#inputFields").transition("fade down");
                    // $("#meetingTable").transition("fade");
                    // $('#taskList').transition("fade down");
                    $("#demo").text(day);
                    $("#demo").transition("fade down");
                    $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeDay"></i>'+day+" of " +months[calendarGetMonth()] + ", "+getDayOfTheWeek(day)+'<i class="caret right icon" id="changeToNextDay"></i></div>');
                }   
        });         
        return day;
    }
    
    
    
    function getNextMonth(){      // when pressed on an arrow in month view, switched to next month's view 
        $("#demo1").transition("fade right");
        var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        
        var miau = (calendarGetMonth())+1;
        calendarSetMonth(miau);

        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeMonth"></i><i class="calendar alternate outline icon"></i>'+months[calendarGetMonth()]+'<i class="caret right icon" id="changeToNextMonth"></i></div>');
        }, 200);
        
        $("#tableBody").empty();
        fillCalendar(calendarGetMonth());
        coloringMarkedDays();
        todaysDate();

        $("#demo1").transition("fade left");
        // $(".list").empty();
        // $("#meetingTable").empty();
        // meetingTable();
        // $("#meetingTable").transition("fade left");
        // $(".list").transition("fade left");
        // $.getJSON("/api/schedules")
        // .then(addSchedules);
    }
    
    function getBeforeMonth(){      // when pressed on an arrow in month view, switched to next month's view 
        $("#demo1").transition("fade right");
        
        var months = ["January","Februrar","March","April","May","June","July","August","September","October","November","December"];
        var miau = (calendarGetMonth())-1;
        calendarSetMonth(miau);

        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeMonth"></i><i class="calendar alternate outline icon"></i>'+months[calendarGetMonth()]+'<i class="caret right icon" id="changeToNextMonth"></i></div>');
        }, 200);
        
        $("#tableBody").empty();
        fillCalendar(calendarGetMonth());
        coloringMarkedDays();
        todaysDate();

        
        
        $("#demo1").transition("fade left");
        // $(".list").empty();
        // $("#meetingTable").empty();
        // meetingTable();
        // $("#meetingTable").transition("fade left");
        // $(".list").transition("fade left");
        // $.getJSON("/api/schedules")
        // .then(addSchedules);
    }
    
    function calendarGetMonth(){
        return this.value;
    }
    function calendarSetMonth(month){
        this.value=month;
    }
    function getSpan() { 
        return this.value1; 
    }
    function setSpan(myArgument) { 
        this.value1 = myArgument;
    }
    
});
