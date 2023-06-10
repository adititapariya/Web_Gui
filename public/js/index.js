window.onbeforeunload = function () { return 'Are you sure?' };

var ros;
var twist;
var cmdVel;
var cmdVelAuto;
var module_control_msg;
var module_control_pub;

var lat=[];
var long=[];

$("#webSocketStart").click(function () {
    var url = "http://localhost:3000/webSocketStart";
    $.post(url, function (data, status) {
        console.log(`Data : ${data} and Status : ${status}`);
        $("#webSocketStart").attr('disabled', true);
        $("#webSocketEnd").attr('disabled', false);
        setTimeout(rosConnect(),2000);
    })

});

$("#webSocketEnd").click(function () {
    $("#socketStatus").text("Disconnecting...");
    $("#webSocketEnd").attr('disabled', true);
    $("#webSocketEnd").attr('value', 'Disconnecting');
    var url = "http://localhost:3000/webSocketEnd";
    $.post(url, function (data, status) {
        console.log(`Data : ${data} and Status : ${status}`);
        $("#webSocketStart").attr('disabled', false);
        $("#webSocketEnd").attr('value', 'End');
    })

});

function rosConnect() {
    ros = new ROSLIB.Ros({
        url: 'ws://localhost:9090'
    });

    ros.on('connection', function () {
        $("#socketStatus").text("Connected");
        initVelocityPublisher();
        initVelocitySubscriber();
        initmodulevelocityPublisher();
        console.log('Connected to websocket server.');
    });

    ros.on('error', function (error) {
        $("#socketStatus").text("Connecting...");
        console.log('Error connecting to websocket server');
    });

    ros.on('close', function () {
        if(! $("#webSocketEnd").attr('disabled')){
            setTimeout(rosConnect(),1000);
        }
        else{
            $("#socketStatus").text("Closed");
            $("#start").attr('disabled', false);
            console.log('Connection to websocket server closed.');
        }
    });
};


var imuSub;
$("#switchImu").change(function(){
    let check = $("#switchImu").prop("checked");
    if(check){
        imuSub = new ROSLIB.Topic({
            ros: ros,
            name: '/imu',
            messageType: 'sensor_msgs/Imu'
        });
    
        imuSub.subscribe(function(msg) {
            let q = msg.orientation;
            let angle = Math.atan2(2.0*(q.w*q.z + q.x*q.y), 1 - 2.0*(q.y*q.y +q.z*q.z));
            angle = angle*180/Math.PI +90;
            if(angle < 0 ){
                angle += 360;
            }
            angle = Math.round(angle*100)/100;
            $("#imuData").text(angle);
        });
    }
    else{
        imuSub.unsubscribe();
        $("#imuData").text(0.00);
    }
})

var gpsSub;
$("#switchGPS").change(function(){
    let check = $("#switchGPS").prop("checked");
    if(check){
        gpsSub = new ROSLIB.Topic({
            ros: ros,
            name: 'sensor_msgs/NavSatFix',
            messageType: 'sensor_msgs/NavSatFix'
        });
    
        gpsSub.subscribe(function(msg) {
            $("#gpsLat").text(msg.latitude);
            $("#gpsLong").text(msg.longitude);
        });
    }
    else{
        gpsSub.unsubscribe();
        $("#gpsLat").text(0);
        $("#gpsLong").text(0);
    }
})

var autoStatusSub;
$("#switchAuto").change(function(){
    let check = $("#switchAuto").prop("checked");
    if(check){
        autoStatusSub = new ROSLIB.Topic({
            ros: ros,
            name: '/gui_msg_topic',
            messageType: 'custom_msg/gui_msg'
        });
    
        autoStatusSub.subscribe(function(msg) {
            console.log(msg)
            $("#goalDistance").text(msg.distance);
            $("#liveGoal").text(msg.goal_no);
            $("#gpsX").text(msg.location_x);
            $("#gpsY").text(msg.location_y);
            if(msg.flag_ob_avoid_or_g2g ==1 ){
                $("#g2gTask").addClass("auto-status-btn-active");
                $("#obaTask").removeClass("auto-status-btn-active")
            }
            else{
                $("#obaTask").addClass("auto-status-btn-active");
                $("#g2gTask").removeClass("auto-status-btn-active")
            }
        });
    }
    else{
        autoStatusSub.unsubscribe();
        $("#goalDistance").text(0);
        $("#liveGoal").text(0);
        $("#gpsX").text(0);
        $("#gpsY").text(0);
        $("#g2gTask").removeClass("auto-status-btn-active");
        $("#obaTask").removeClass("auto-status-btn-active")
    }
})


$("#switchTask").change(function(){
    let check = $("#switchTask").prop("checked");
    if(check){
        $(".controller").attr('disabled',true);
        $(".arm_controller").attr('disabled',true);
        navigator.keyboard.lock();
    }
    else{
        $(".controller").attr('disabled',false);
        $(".arm_controller").attr('disabled',false);
        navigator.keyboard.unlock();
    }
});

function initVelocityPublisher() {
    twist = new ROSLIB.Message({
        linear: {
            x: 0.0,
            y: 0.0,
            z: 0.0
        },
        angular: {
            x: 0.0,
            y: 0.0,
            z: 0.0
        }
    });

    cmdVel = new ROSLIB.Topic({
        ros: ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist',
        latch : true
    });
    // cmdVel.advertise();
}

function initVelocitySubscriber() {
    cmdVelAuto = new ROSLIB.Topic({
        ros: ros,
        name: '/cmd_vel_auto',
        messageType: 'geometry_msgs/Twist',
        latch : true
    });
    
    cmdVelAuto.subscribe(function(msg) {
        if($("#switchTask").prop("checked")){
            twist.linear.x = Math.round(msg.linear.x*10000)/10000;
            twist.angular.z = Math.round(msg.angular.z*10000)/10000;
            if($("#switchSpeed").prop("checked")){
                $("#cmdVelX").text(twist.linear.x);
                $("#cmdVelZ").text(twist.angular.z);
            }
            cmdVel.publish(twist);
        }
    });
}


$("#switchSpeed").change(function(){
    let check = $("#switchSpeed").prop("checked");
    if(!check){
        $("#cmdVelX").text(0);
        $("#cmdVelZ").text(0);
    }
});

function speedPub(key) {
    if (key == "up" || key == "w" || key == "W") {
        animate("#up");
        twist.linear.x = 1;
        twist.angular.z = 0;
    }
    else if (key == "down" || key == "s" || key == "S") {
        animate("#down");
        twist.linear.x = -1;
        twist.angular.z = 0;
    }
    else if (key == "left" || key == "a" || key == "A") {
        animate("#left");
        twist.angular.z = 1;
        twist.linear.x = 0;
    }
    else if (key == "right" || key == "d" || key == "D") {
        animate("#right");
        twist.angular.z = -1;
        twist.linear.x = 0;
    }
    else if (key == "stop" || key == " ") {
        animate("#stop");
        twist.linear.x = 0.0;
        twist.angular.z = 0.0;
    }
    twist.linear.x = Math.round(twist.linear.x*10000)/10000;
    twist.angular.z = Math.round(twist.angular.z*10000)/10000;
    if($("#switchSpeed").prop("checked")){
        $("#cmdVelX").text(twist.linear.x);
        $("#cmdVelZ").text(twist.angular.z);
    }
    cmdVel.publish(twist);
}

$(document).on('keypress', function (event) {
    if($("#switchTask").prop("checked")==false){
        speedPub(event.key);
    }    
});

$(".controller").click(function (event) {
    speedPub(this.id);
});

function animate(currentBtn){
    $(currentBtn).addClass("pressed");
    setTimeout(function() {$(currentBtn).removeClass("pressed")},100);
}


$("#goalNumber").on('input',function (){
    let num = $("#goalNumber").val();
    if(num){
        $("#goalBtn").attr('disabled',false);
    }
    else{
        $("#goalBtn").attr('disabled',true);
    }
});

$(".cordinates").on('input',function(){
    let _lat = $("#lat").val();
    let _long =$('#long').val();

    if(_lat && _long){
        $("#enter").attr('disabled',false);
    }
    else{
        $("#enter").attr('disabled',true);
    }
});

$("#enter").click(function(){
    let currGoal = $('#currGoal').text();
    let totalGoal = $("#goalNumber").val();
    if(currGoal < totalGoal){
        lat.push(parseFloat($("#lat").val()));
        long.push(parseFloat($('#long').val()));
        $("#lat").val('');
        $('#long').val('');
        $('#currGoal').text(parseInt(currGoal)+1);
    }
    else{
        lat.push(parseFloat($("#lat").val()));
        long.push(parseFloat($('#long').val()));
        $("#lat").attr('disabled',true);
        $('#long').attr('disabled',true);
        $("#enter").attr('disabled',true);

        initLatPublisher(lat);
        initLongPublisher(long);
        $("#autonomousStart").attr("disabled",false);
    }
    
});

function initLatPublisher(lat) {
    var latCord = new ROSLIB.Message({
        data : [ ]
    });

    var latPub = new ROSLIB.Topic({
        ros: ros,
        name: '/goal_latitude',
        messageType: 'std_msgs/Float64MultiArray',
        latch : true
    });
    latCord.data = lat;
    latPub.publish(latCord);
}

function initLongPublisher(long) {
    var longCord = new ROSLIB.Message({
        data : [ ]
    });

    var longPub = new ROSLIB.Topic({
        ros: ros,
        name: '/goal_longitude',
        messageType: 'std_msgs/Float64MultiArray',
        latch : true
    });
    longCord.data = long;
    longPub.publish(longCord);
}


$("#goalBtn").click(function(event){
    event.preventDefault();
    let num = $("#goalNumber").val();
    $("#goalBtn").attr('disabled',true);
    $("#goalNumber").attr('disabled',true);
    $("#lat").attr('disabled',false);
    $('#long').attr('disabled',false);
    $('#currGoal').text(1);
});


$("#autonomousReset").click(function(){
    lat=[];
    long=[];
    $("#lat").val('');
    $('#long').val('');
    $('#currGoal').text(0);
    $("#goalNumber").attr('disabled',false);
    $("#goalNumber").val('');
});


function initmodulevelocityPublisher() {
    module_control_msg = new ROSLIB.Message({
        layout:{
            dim:[{},{},{}],
            data_offset:0
        },data:[0,0,0]
    });

    module_control_pub= new ROSLIB.Topic({
        ros: ros,
        name: '/Don',
        messageType: 'std_msgs/Int32MultiArray',
        latch : true
    });
    // cmdVel.advertise();
}
//--------------------------------------------------------robotic arm control
function arm_movement(key){
    if (key == "up_r" || key == "U" || key == "u") {
        animate("#up_r");

        module_control_msg.data = [7,0,255];
    }
    else if (key == "left_r" || key == "V" || key == "v") {
        animate("#left_r");
        module_control_msg.data = [8,1,255];
    }
    else if (key == "down_r" || key == "X" || key == "x") {
        animate("#down_r");
        module_control_msg.data = [7,1,255];
    }
    else if (key == "right_r" || key == "Y" || key == "y") {
        animate("#right_r");
        module_control_msg.data = [8,0,255];
    }
    else if (key == "stop_r") {
        animate("#stop_r");
        module_control_msg.data =[7,0,0];
        module_control_pub.publish(module_control_msg);
        module_control_msg.data =[8,0,0];
    }
    module_control_pub.publish(module_control_msg);
}

$(document).on('keypress', function (event) {
    if($("#switchTask").prop("checked")==false){
        arm_movement(event.key);
    }    
});

$(".arm_controller").click(function (event) {
    arm_movement(this.id);
});

function gripper_movement(key){
    if (key == "open_r") {
        animate("#open_r");

        module_control_msg.data = [9,1,255];
    }
    else if (key == "stop_rg") {
        animate("#stop_rg");
        module_control_msg.data = [9,0,0];
    }
    else if (key == "close_r") {
        animate("#close_r");
        module_control_msg.data = [9,0,255];
    }
    module_control_pub.publish(module_control_msg);
}

$(".gripper_controller").click(function (event) {
    gripper_movement(this.id);
});

//--------------------------------------------------------protection
function shield_movement(key){
    if (key == "open_s") {
        animate("#open_s");

        module_control_msg.data = [4,1,255];
    }
    else if (key == "stop_s") {
        animate("#stop_s");
        module_control_msg.data = [4,0,0];
    }
    else if (key == "close_s") {
        animate("#close_s");
        module_control_msg.data = [4,0,255];
    }
    module_control_pub.publish(module_control_msg);
}

$(".shield_controller").click(function (event) {
    shield_movement(this.id);
});

//-------------------------------------------------------fire extinguisher
function fe_movement(key){
    if (key == "pull_fr") {
        animate("#pull_fr");

        module_control_msg.data = [6,1,100];
    }
    else if (key == "stop_fr") {
        animate("#stop_fr");
        module_control_msg.data = [6,0,0];
    }
    else if (key == "push_fr") {
        animate("#push_fr");
        module_control_msg.data = [6,0,100];
    }
    module_control_pub.publish(module_control_msg);
}

$(".fe_controller").click(function (event) {
    fe_movement(this.id);
});

function load_movement(key){
    if (key == "run_l") {
        animate("#run_l");

        module_control_msg.data = [5,1,255];
    }
    else if (key == "stop_l") {
        animate("#stop_l");
        module_control_msg.data = [5,0,0];
    }
    else if (key == "reverse_l") {
        animate("#reverse_l");
        module_control_msg.data = [5,0,255];
    }
    module_control_pub.publish(module_control_msg);
}

$(".load_controller").click(function (event) {
    load_movement(this.id);
});

//-------------------------------------------------------equipment transfer
function d0_movement(key){
    if (key == "d0_o") {
        animate("#d0_o");

        module_control_msg.data = [0,1,50];
    }
    else if (key == "stop_d0") {
        animate("#stop_d0");
        module_control_msg.data = [0,0,0];
    }
    else if (key == "d0_c") {
        animate("#d0_c");
        module_control_msg.data = [0,0,50];
    }
    module_control_pub.publish(module_control_msg);
}

$(".d0_controller").click(function (event) {
    d0_movement(this.id);
});
//--------------------------------
function d1_movement(key){
    if (key == "d1_o") {
        animate("#d1_o");

        module_control_msg.data = [1,1,50];
    }
    else if (key == "stop_d1") {
        animate("#stop_d1");
        module_control_msg.data = [1,0,0];
    }
    else if (key == "d1_c") {
        animate("#d1_c");
        module_control_msg.data = [1,0,50];
    }
    module_control_pub.publish(module_control_msg);
}

$(".d1_controller").click(function (event) {
    d1_movement(this.id);
});
//------------------------------------
function d2_movement(key){
    if (key == "d2_o") {
        animate("#d2_o");

        module_control_msg.data = [2,1,50];
    }
    else if (key == "stop_d2") {
        animate("#stop_d2");
        module_control_msg.data = [2,0,0];
    }
    else if (key == "d2_c") {
        animate("#d2_c");
        module_control_msg.data = [2,0,50];
    }
    module_control_pub.publish(module_control_msg);
}

$(".d2_controller").click(function (event) {
    d2_movement(this.id);
});
//----------------------------------
function d3_movement(key){
    if (key == "d3_o") {
        animate("#d3_o");

        module_control_msg.data = [3,1,50];
    }
    else if (key == "stop_d3") {
        animate("#stop_d3");
        module_control_msg.data = [3,0,0];
    }
    else if (key == "d3_c") {
        animate("#d3_c");
        module_control_msg.data = [3,0,50];
    }
    module_control_pub.publish(module_control_msg);
}

$(".d3_controller").click(function (event) {
    d3_movement(this.id);
});