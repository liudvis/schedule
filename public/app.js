/*global $ */
/*global navigator */
$(document).ready(function(){ //
    $.mobile.loading( 'show', { theme: "b", text: "", textonly: false});  //removes "loading" from page 
    
    calendarSetMonth(getCurrentMonth());
    calendarSetMonthModal(calendarGetMonth());

    fillCalendar(calendarGetMonth()); 
    hidingElements(); 
    coloringPastDays();
    coloringMarkedDays();
    changingTimesOfDropdowns();
    $('#dropdown1').dropdown();
    $('#dropdown2').dropdown();
    nearestMeetings();
    
    $('.ui.modal').modal({
        onHide: function(){
 			$("#tableBodyModal").empty();
 			$("#submitSpan").attr("disabled", true);
		}
    });
    
    $(window).on('hashchange', function(e){ //Back button fix
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
    
    $(document).on("click", ".available", function(event){ // ON EVENT FIRED
        $("#submitSpan").removeAttr('disabled');
        $(".available").removeClass("selectedModalTd");
        $(this).addClass("selectedModalTd");
        setSelectedDayModal($(this));
    });
    
    $(document).on("click", "#submitSpan", function(e){
        if(getSelectedDayModal()==undefined){
            $("#myModal").effect("shake");
        }
        else {
            let id = getSelectedDayModal().data('id'), day = getSelectedDayModal().data('day'), month = getSelectedDayModal().data('month');
            
            updateTodo(id, day, getElement(), month, 1); 
            $("#myModal").modal("hide");
            $("#myModal").remove();
            setSelectedDayModal(undefined);
        }
    });
    
    $(document).on("click", ".unavailable", function(event){ // ON EVENT FIRED
        $("#myModal").effect("shake");
    });

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
            createTodo(getSelectedDay(), calendarGetMonth());  
        }
    });
    
    $('#meeting').keypress(function(event){ // when enter is pressed in the meeting field, meeting is created
        if(event.keyCode===13){
            createTodo(getSelectedDay(), calendarGetMonth());  
        }
    });
    
    $("#submitMeeting").on("click", function(){
        createMeeting(getSelectedDay(), calendarGetMonth());                    // when pressed on a plus button, meeting is created
    });
    
    $("#submitTask").on("click", function(){    //when pressed on a plus button, task is created
        createTodo(getSelectedDay(), calendarGetMonth());                    
    });
        
    $("#smallcalendar").on("click", function(){ // when in single day view, pressing on the small calendar in top left redirects to calendar view
        parent.history.back();
    });
        
    $("#calendar").on("click", "td:not(:empty)", function() { // when pressed on a day in the calendar, redirects to single day view, retrieves data from api
        getSelectedDay(chosenDate($(this).data("day"))); 
        meetingTableAndTaskList();
        $.getJSON("/api/schedules")
            .then(addSchedules);
    });
        
    $("#demo1").on("click", "i", function(e) { // pressing on an arrow switches to another days/months view
        e.stopPropagation();
        var date = new Date(), y = date.getFullYear(), m = calendarGetMonth();
        var lastDay = new Date(y, m + 1, 0).getDate();
        
        if(this.id=="changeToNextDay" && getSelectedDay()<lastDay){
            getNextDay();
        }
        else if (this.id=="changeToBeforeDay" && getSelectedDay()>1){
            getPreviousDay();
        }
        else if (this.id=="changeToBeforeMonth" && calendarGetMonth()>0){
            getPreviousMonth();
        }
        else if(this.id=="changeToNextMonth" && calendarGetMonth()<11){
            getNextMonth();
        }
    });
    
    $(document).on("click", "i", function(e) { // pressing on an arrow switches to another days view
        if (this.id=="changeToBeforeMonthModal" && calendarGetMonthModal()>getCurrentMonth()){
            getPreviousMonthModal();
        }
        else if(this.id=="changeToNextMonthModal" && calendarGetMonthModal()<11){
            getNextMonthModal();
        }
    });
        
    $("#nearestList").on("click", "span", function(e) { // pressing on an element of nearest meetings&tasks panel, 
        var miau = ($(this).attr('id'));                //redirects to single day view of that element
        setSelectedDay(chosenDate(miau)); 
        meetingTableAndTaskList();
        
        $.getJSON("/api/schedules")
            .then(addSchedules);
    });
    
    $("#lists").on("swipeleft", function(e) {
        if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) { //  checks if on desktop or mobile
            swipeDisableOnDesktop();                 
        } else {
            var date = new Date(), y = date.getFullYear(), m = date.getMonth();
            var lastDay = new Date(y, m + 1, 0).getDate();
            if(getSelectedDay()<lastDay){
                getNextDay();
            }
        }
    });
              
    $("#lists").on("swiperight", function(e) {
        if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) { //  checks if on desktop or mobile
            swipeDisableOnDesktop();  
        } else {
            if(getSelectedDay()>1){
                getPreviousDay();
            }
        }
    });
    
    $("#calendar").on("swipeleft", function(e) {
        if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) { //  checks if on desktop or mobile
            swipeDisableOnDesktop();                 
        } else {
            if(calendarGetMonth()<11){
                getNextMonth();
            }
        }
    });
    
    $("#calendar").on("swiperight", function(e) {
        if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) { //  checks if on desktop or mobile
            swipeDisableOnDesktop();               
        } else {
            if(calendarGetMonth()>0){
                getPreviousMonth();
            }
        }
    });
    
    $(document).on("swipeleft", "#calendarModal", function(e) {
        if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) { //  checks if on desktop or mobile
            swipeDisableOnDesktop();            
        } else {
            if(calendarGetMonthModal()<11){
                getNextMonthModal();
            }
        }
    });
    
    $(document).on("swiperight", "#calendarModal", function(e) {
        if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) { //  checks if on desktop or mobile
            swipeDisableOnDesktop();               
        } else {
            if(calendarGetMonthModal()>getCurrentMonth()){
                getPreviousMonthModal();
            }
        }
    });
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function addSchedules(schedules){ // adds schedules to the appropriate lists
        schedules.forEach(function(schedule){
            addSchedule(schedule);
        });
    }
    
    function addSchedule(schedule){     // appends and puts information accordingly for a single schedule element after the ajax call
        if(getSelectedDay() == schedule.day && schedule.month == calendarGetMonth()){
            if(schedule.type==="meeting"){
                var newMeeting = $('<div class="meeting">'+schedule.name+ddnButton(schedule)+'</div>').hide().fadeIn("fast");                 
                newMeeting.data('id', schedule._id);
                newMeeting.data('month', schedule.month);
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
                newTodo.data('month', schedule.month);
                newTodo.data('day', schedule.day);
                newTodo.data('empty', false);
                $('#taskList').append(newTodo);
            }
        }       
    }
    
    
    function createTodo(day, month){    // takes user input and creates a todo
        var userInput = $('#task').val();
        if(userInput==""  || $("#td"+day).hasClass("pastDays")) {
            $('#task').val('');
            $('#field2').effect("shake");
        } else {
        $.post('/api/schedules',{name: userInput, type: "todo", day: day, month: month})
        .then(function(newTodo){
            addSchedule(newTodo);
            $('#task').val('');
        })
        .catch(function(err){
            console.log(err);
        });
        }
    }
    
    function createMeeting(day, month){    // takes user input, undergoes some conditions, and creates a meeting
        var startOfTheMeeting = $('#dropdown1').dropdown('get value');
        var endOfTheMeeting = $('#dropdown2').find(":selected").val();
        var nameOfTheMeeting = $('#meeting').val();

        if(nameOfTheMeeting=="" || $('#dropdown1 option:selected').text()=="Start"||$('#dropdown2 option:selected').text()=="End" || $("#td"+day).hasClass("pastDays")){
            $('#meetingInput').effect("shake");
        } else {
            $.post('/api/schedules',{name: nameOfTheMeeting, type: "meeting", day: day, meetingStart: startOfTheMeeting, meetingEnd: endOfTheMeeting, month: month})
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
    
    function changingTimesOfDropdowns () {     // adjusting times in the meeting input dropdowns
        $('#dropdown1').dropdown({ onChange: function(value, $choise){
            var arr= [];
            value = $('#dropdown1').dropdown('get value');
                if(value==""){
                    value=10;
                }
                for (var i = value; i <= 18; i++) {
                    if(i==value){
                        
                    } else {
                          arr.push({value: i, name: i});
                    }
                }
            $('#dropdown2').dropdown('change values', arr);
        }});
    }
    
    
    function updateTodo(todoId, todoDay, element, todoMonth, ddnOption){  //takes todos id, updates it
        var date = new Date(), y = date.getFullYear(), m = todoMonth;
        var lastDayOfMonth = new Date(y, m + 1, 0).getDate();

        if(lastDayOfMonth<todoDay){
            todoDay=1;
            todoMonth++;
        }
        
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
                    element.html('<div>Moved to '+todoDay+" of "+monthNumberToWord(todoMonth)+'<i class="check icon"></i></div>');
                    element.addClass('elementChange').delay(1000).slideUp(700,function(){
                    });
                }, 100);
            }
        });
    }
    
    function deleteSchedule(scheduleId, element){ // takes schedule id, and deletes it
        var deleteUrl = '/api/schedules/' + scheduleId; 
        $.ajax({
            method: 'DELETE',
            url: deleteUrl
        })
        .then(function(){ // animations happen after deletion
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
                } else if(firstWeekDay==1){
                        $('#tableBody').append(newDate);
                        theDAY=firstWeekDay;
                }
                else {
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
    }
    
    function getNextMonth(){      // when pressed on an arrow in month view, switched to next month's view 
        var miau = (calendarGetMonth())+1;
        calendarSetMonth(miau);
        changeMonth("fade right", "fade left");

    }
    
    function getPreviousMonth(){      // when pressed on an arrow in month view, switched to next month's view 
        var miau = (calendarGetMonth())-1;
        calendarSetMonth(miau);
        changeMonth("fade left", "fade right");
    }
    
    function changeMonth(fadeOne, fadeTwo){
        $("#demo1").transition(fadeOne);
        $("#calendar").transition(fadeOne);

        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeMonth"></i><i class="calendar alternate outline icon"></i>'+monthNumberToWord(calendarGetMonth())+'<i class="caret right icon" id="changeToNextMonth"></i></div>');
        }, 200);
        
        $("#tableBody").empty();
        fillCalendar(calendarGetMonth());
        coloringPastDays();
        coloringMarkedDays();
        todaysDate();
        
        $("#calendar").transition(fadeTwo);
        $("#demo1").transition(fadeTwo);
    }
    
    
    function meetingTableAndTaskList() { // generates a tasks list header and meetings list table
        $('#taskList').append('<div class="header" id="tasksHeader">Tasks</div>'); // appends a task list header
        $('#meetingTable').append('<thead class="full-width"><tr><th colspan="2" id = "miau"><div>Meetings</div></th></tr></thead>'); // appends a meeting list header
        
        for(var i=9; i<=17; i++){
            $("#meetingTable").append("<tr><td class=meetingTableTime>"+i+""+"</td><td class=miau id=time"+i+"></td></tr>");
            $("#time"+i).data("time", i);
            $('#time'+i).data('empty', true);
            $('#time'+i).data('id', null);
        }
    }
    
    function getNextDay(){      // when pressed on an arrow in single day view, switched to next day's view 
        var selected=(getSelectedDay()+1);
        setSelectedDay(selected);
        changeDay("fade right", "fade left");
    }
    
    function getPreviousDay(){    // when pressed on an arrow in single day view, switched to before day's view 
        var selected=(getSelectedDay()-1);
        setSelectedDay(selected);
        changeDay("fade right", "fade left");
    }
    
    function changeDay(fadeOne, fadeTwo){
        $("#demo1").transition(fadeOne);
        $("#meetingTable").transition(fadeOne);
        $(".list").transition(fadeOne);
        $("#demo").text(getSelectedDay());
        
        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeDay"></i>'+getSelectedDay()+" of "+monthNumberToWord(calendarGetMonth()) + ", "+getDayOfTheWeek(getSelectedDay())+'<i class="caret right icon" id="changeToNextDay"></i></div>');
        }, 200);
        
        $("#demo1").transition(fadeTwo);
        $(".list").empty();
        $("#meetingTable").empty();
        meetingTableAndTaskList();
        $("#meetingTable").transition(fadeTwo);
        $(".list").transition(fadeTwo);
        $.getJSON("/api/schedules")
        .then(addSchedules);
    }
    
    
    function nearestMeetings(){
        let meetings = [], tasks = [];
        
        $.getJSON("/api/schedules", function(result){
            $.each(result, function(i, field){          //Putting elements to according arrays
                if(field.day>=todaysDate() && field.day<=todaysDate()+3 && field.month==getCurrentMonth()){
                    if(field.type=="meeting"){
                        meetings.push(field);
                    } else {
                        tasks.push(field);
                    }
                }
            });
        })
        .then(function(){          // populates nearest meetings & tasks list
            bubbleSortTasks(tasks).forEach(function(element){
                $('#nearestTasksList').append('<span id='+element.day+'><strong>'+ element.name + "</strong> on "+ getDayOfTheWeek(element.day) + '<span><br>');
            });
            bubbleSortMeetings(meetings).forEach(function(element){
                $('#nearestMeetingsList').append('<span id='+element.day+'>'+ '<strong>'+ element.name + "</strong>  " + element.meetingStart +":00-"+ element.meetingEnd + ":00 on " + getDayOfTheWeek(element.day) + '<span><br>');
            });
        });
    }
    
    function bubbleSortTasks(arr){   // sorts tasks according to day
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
    
    function dropdownDeleteAndMoveToTomorrow(arg){ // functionality for deleting and updating elements
        let element      = arg.parent().parent().parent();

        setElement(element);
        setElementId(element.data('id'));   
        setElementDay(element.data('day'));
        setElementMonth(element.data('month'));

        if(arg.val()==0){
            updateTodo(getElementId(), getElementDay()+1, getElement(), getElementMonth(), arg.val()); //moving to tomorrow
        }
        else if(arg.val()==1){ // moving to another day
            $('body').append(generateModal());
            calendarSetMonthModal(calendarGetMonth()); 
            $("#myModal").modal('show');
            changeMonthModal();
        }
        else if(arg.val()==2){   
            deleteSchedule(getElementId(), getElement());
        }
    }
    
  
    function generateModal(){  
        let modal = 
        '<div class="ui modal" id="myModal">\
          <div class="header">Select Day: </div>\
          <i class="close icon"></i>\
          <div class="content" >\
            <h4 id="modalDiv"><i class="caret left icon" id="changeToBeforeMonthModal"></i><span id="modalSpan">'  +monthNumberToWord(calendarGetMonth())+  '</span><i class="caret right icon" id="changeToNextMonthModal"></i></h4>\
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
    
    function fillCalendarModal(elementId) { // generates the calendar
        var date = new Date(), y = date.getFullYear(), m = calendarGetMonthModal();
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
                } else if(firstWeekDay==1){
                        $('#tableBody').append(newDate);
                        theDAY=firstWeekDay;
                
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
                        newDate = $('<td class="available '+calendarGetMonthModal()+'" id="Modaltd'+i+'">'+i+'</td>');
                        newDate.data('id', elementId);
                        newDate.data('day', i);
                        newDate.data('month', calendarGetMonthModal());
                        $('#tableBodyModal').append(newDate);
                        $('#tableBodyModal').append($('</tr><tr>'));
                    } else {
                        newDate = $('<td class="available '+calendarGetMonthModal()+'" id="Modaltd'+i+'">'+i+'</td>');
                        newDate.data('id', elementId);
                        newDate.data('day', i);
                        newDate.data('month', calendarGetMonthModal());
                        $('#tableBodyModal').append(newDate);
                    }   
                    theDAY++;
                }
    }
    
    function getNextMonthModal(){      // when pressed on an arrow in month view, switched to next month's view 
        var increaseByOne = (calendarGetMonthModal())+1;
        calendarSetMonthModal(increaseByOne);
        $("#calendarModal").transition("fade left")
        changeMonthModal();
        $("#calendarModal").transition("fade right");
    }
    
    function getPreviousMonthModal(){      // when pressed on an arrow in month view, switched to next month's view 
        var decreaseByOne = (calendarGetMonthModal())-1;
        calendarSetMonthModal(decreaseByOne);
        $("#calendarModal").transition("fade right");
        changeMonthModal();
        $("#calendarModal").transition("fade left")
    }
    
    function changeMonthModal(){
        $("#tableBodyModal").empty();
        fillCalendarModal(getElementId());
        $("#modalSpan").text(monthNumberToWord(calendarGetMonthModal()));
        
        if(getCurrentMonth()==calendarGetMonthModal()){
            for(var i=1; i<todaysDate(); i++){
                $("#Modaltd"+i).removeClass('available');
                $("#Modaltd"+i).addClass('unavailable');
            }
            $("#Modaltd"+todaysDate()).addClass('today');
        }
        if(getElementMonth()==calendarGetMonthModal()){
            $("#Modaltd"+getElementDay()).removeClass('available');
            $("#Modaltd"+getElementDay()).addClass('unavailable');
        }
    }
    
    
    function coloringMarkedDays(){  //colors the days, which hold a meeting or a task.
        $.getJSON("/api/schedules", function(result){
            $.each(result, function(i, field){
                if( field.month==calendarGetMonth() ){
                    $("#td"+field.day).addClass("markedDays");
                }
            });
        });
    }
    
    function coloringPastDays(){
        var date = new Date(), y = date.getFullYear(), m = calendarGetMonth();
        
        var lastDay = new Date(y, m + 1, 0).getDate();
        
        for(let i=1; i<=lastDay; i++){
        if( $("#td"+i).data("month")<getCurrentMonth() ){
            console.log(i);
            console.log(calendarGetMonth());
            $("#td"+i).addClass("pastDays");
        }
        if( $("#td"+i).data("month")==getCurrentMonth() ){
            if(i<todaysDate()){
                $("#td"+i).addClass("pastDays");
            }
        }
        }
    }

    
    function todaysDate(){ // Gives a border to a todays day in the calendar
        var today = new Date();
        var dd = today.getDate();

        if($("#td"+dd).attr("class")==getCurrentMonth()){
            $("#td"+dd).addClass('today');
        }
        return dd;
    }

    function getMonth(){ //return month
        var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
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
    

    function chosenDate(day){  // Displays the panel of chosen date (meeting, task lists, inputs), hides calendar
        setSelectedDay(day);
        document.location.hash = "singleDayView";
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
                    $("#demo").text(day);
                    $("#demo").transition("fade down");
                    $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeDay"></i>'+day+" of " +monthNumberToWord(calendarGetMonth()) + ", "+getDayOfTheWeek(day)+'<i class="caret right icon" id="changeToNextDay"></i></div>');
                }   
        });         
        return day;
    }

    function smallCalendarPopup () { //pressing on a small calendar icon to go back to main view
        document.location.hash.split('#')[0];
        
        setTimeout(function(){
            $("#demo1").html('<div><i class="caret left icon" id="changeToBeforeMonth"></i><i class="calendar alternate outline icon"></i>'+monthNumberToWord(calendarGetMonth())+'<i class="caret right icon" id="changeToNextMonth"></i></div>');
        }, 200);
        
        $("#tableBody").empty();
        fillCalendar(calendarGetMonth());

        for(var i=0; i<31; i++){ // reseting marked days
            $("#td"+i).removeClass( "markedDays" );
        }   
        coloringMarkedDays(); //coloring again
        coloringPastDays();
        
        $("#nearestTasksList").empty(); //reseting nearest meetings and tasks view 
        $("#nearestMeetingsList").empty();
        nearestMeetings(); //populating again 
        
        $("#upcomingMessage").transition('fade up'); //hiding single day view
        $("#meetingInput").transition("fade");
        $("#field2").transition("fade");
        $("#smallcalendar").transition("fade");
        $("#demo").transition("fade");
        $("#inputFields").transition("fade");

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
    
    function hidingElements(){ // hides elements, calls todaysDate(), which gives a border to todays day in the calendar
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

    
    function calendarGetMonth(){
        return this.value;
    }
    function calendarSetMonth(month){
        this.value=month;
    }
    function calendarGetMonthModal(){
        return this.valueModal;
    }
    function calendarSetMonthModal(month){
        this.valueModal=month;
    }
    function getSelectedDayModal() { 
        return this.value1; 
    }
    function setSelectedDayModal(myArgument) { 
        this.value1 = myArgument;
    }
    function getElementId(){
        return this.valueId;
    }
    function setElementId(id){
        this.valueId=id;
    }
    function getElementDay(){
        return this.valueDay;
    }
    function setElementDay(day){
        this.valueDay=day;
    }
    function getElement() { 
        return this.elementValue; 
    }
    function setElement(myArgument) { 
        this.elementValue = myArgument;
    }
    function setSelectedDay(day){
        this.selectedDay=day;
    }
    function getSelectedDay(){
        return this.selectedDay;
    }
    
    // function colors () {
        //     var arr =["#f1ddf2", "#fff6ec", "#e7ebec", "#eafeec", "#eaeed2", "#eadcd2", "#cadcd2", "#cac8d2", "#b9c8d2", "#b9b3d2"];
        //     var i = Math.floor(Math.random() * Math.floor(arr.length));
        //     console.log(arr[i]);
        //     return arr[i];
    // }
    
    function monthNumberToWord(month){
        var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        return months[month];
    }
    function swipeDisableOnDesktop(){
        $(document).on('swiperight', 'html', function(event) {  // swipe on desktop disabled
            event.stopPropagation();
            event.preventDefault();
        });
    }
    function getElementMonth(){
        return this.elementMonth;
    }
    function setElementMonth(elementMonth){
        this.elementMonth=elementMonth;
    }

});
