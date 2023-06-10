$("#roscoreStart").click(function(event){

    const Url = "http://localhost:3000/roscoreStart";
    $.post(Url,function(data,status){
        console.log(`${data} and Status is ${status}`);
        $("#roscoreStatus").text("Connected");
        $("#roscoreStart").attr("disabled", true);
        $("#roscoreEnd").attr('disabled',false);
    });
    
    event.preventDefault();
});

$("#roscoreEnd").click(function(event){
    $("#roscoreEnd").attr('disabled',true);
    $("#roscoreEnd").attr('value','Disconnecting');
    $("#roscoreStatus").text("Disconnecting...");

    const Url = "http://localhost:3000/roscoreEnd";
    $.post(Url,function(data,status){
        console.log(`${data} and Status is ${status}`);
        $("#roscoreStatus").text("Closed");
        $("#roscoreEnd").attr('value','End');
        $("#roscoreStart").attr("disabled", false);
    });
    event.preventDefault();
});


$("#gazeboStart").click(function(event){

    const Url = "http://localhost:3000/gazeboStart";
    $.post(Url,function(data,status){
        console.log(`${data} and Status is ${status}`);
        $("#gazeboStatus").text("Connected");
        $("#gazeboStart").attr("disabled", true);
        $("#gazeboEnd").attr('disabled',false);
    });
    event.preventDefault();
});

$("#gazeboEnd").click(function(event){
    $("#gazeboEnd").attr('disabled',true);
    $("#gazeboEnd").attr('value','Disconnecting');
    $("#gazeboStatus").text("Disconnecting...");
    const Url = "http://localhost:3000/gazeboEnd";
    $.post(Url,function(data,status){
        console.log(`${data} and Status is ${status}`);
        $("#gazeboStatus").text("Closed");
        $("#gazeboEnd").attr('value','End');
        $("#gazeboStart").attr("disabled", false);
    });
    event.preventDefault();
});

$("#mapvizStart").click(function(event){

    const Url = "http://localhost:3000/mapvizStart";
    $.post(Url,function(data,status){
        console.log(`${data} and Status is ${status}`);
        $("#mapvizStatus").text("Connected");
        $("#mapvizStart").attr("disabled", true);
        $("#mapvizEnd").attr('disabled',false);
    });
    event.preventDefault();
});

$("#mapvizEnd").click(function(event){
    $("#mapvizEnd").attr('disabled',true);
    $("#mapvizEnd").attr('value','Disconnecting');
    $("#mapvizStatus").text("Disconnecting...");
    const Url = "http://localhost:3000/mapvizEnd";
    $.post(Url,function(data,status){
        console.log(`${data} and Status is ${status}`);
        $("#mapvizStatus").text("Closed");
        $("#mapvizEnd").attr('value','End');
        $("#mapvizStart").attr("disabled", false);
    });
    event.preventDefault();
});

$("#camStart").click(function(event){
    const Url = "http://localhost:3000/camStart";
    $.post(Url, function(data, status){
        console.log(`${data} and Status is ${status}`);
        $("#camStart").attr("disabled", true);
        $("#camEnd").attr('disabled', false);
       
    });
    setTimeout(function(){
        $("#video").attr("src", "http://localhost:8080/stream?topic=/usb_cam/image_raw");
        $("#video").attr("src", "images/loading.png");
    }, 2000);

    event.preventDefault();
});

$("#camEnd").click(function(event){
    $("#camEnd").attr('disabled', true);
    $("#camEnd").attr('value', 'Disconnecting');
    const Url = "http://localhost:3000/camEnd";
    $.post(Url, function(data, status){
        console.log(`${data} and Status is ${status}`);
        $("#camEnd").attr('value', 'End');
        $("#camStart").attr("disabled", false);
    });
    $("#video").attr("src", "images/camera1.png");
    event.preventDefault();
});

$("#autonomousStart").click(function(event){

    const Url = "http://localhost:3000/autonomousStart";
    $.post(Url,function(data,status){
        console.log(`${data} and Status is ${status}`);
        $("#autonomousStatus").text("Connected");
        $("#autonomousStart").attr("disabled", true);
        $("#autonomousEnd").attr('disabled',false);
    });
    event.preventDefault();
});

$("#autonomousEnd").click(function(event){
    $("#autonomousEnd").attr('disabled',true);
    $("#autonomousEnd").attr('value','Disconnecting');
    $("#autonomousStatus").text("Disconnecting...");
    const Url = "http://localhost:3000/autonomousEnd";
    $.post(Url,function(data,status){
        console.log(`${data} and Status is ${status}`);
        $("#autonomousStatus").text("Closed");
        $("#autonomousEnd").attr('value','End');
        $("#autonomousStart").attr("disabled", false);
    });
    event.preventDefault();
});

$(document).ready(function() {
    $('#switchTask').change(function() {
        if ($(this).is(':checked')) {
            enableManualControl();
        } else {
            disableManualControl();
        }
    });
});

function enableManualControl() {
    $('#autonomousStart, #autonomousEnd, #lat, #long, #autonomousReset, #enter').prop('disabled', false);
    $('#manual input').prop('disabled', true);
}

function disableManualControl() {
    $('#autonomousStart, #autonomousEnd, #lat, #long, #autonomousReset, #enter').prop('disabled', true);
    $('#manual input').prop('disabled', false);
}


