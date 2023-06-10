const express = require('express');
const {exec,execFile} = require('child_process');

const app = express();
app.set('view engine','ejs'); 
app.use(express.static("public"));  
app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res){
    res.render('index');
})

app.get('/about',function(req, res){
    res.render('about');
});

app.get('/contact',function(req, res){
    res.render('contact');
});

var websocket;
app.post("/webSocket:id",function(req,res){
    var id = req.params.id;
    if(id=="Start"){
        websocket = execFile('roslaunch',['rosbridge_server','rosbridge_websocket.launch'],function(err,stdout,stderr){
            if(err){
                console.log(err);
            }
        })
        console.log("Websocket started");
        res.send("Connected");
        
    }
    else if(id=="End"){
        websocket.kill();

        websocket.on('exit',function(code){
            console.log(`Websocket exited with ${code}.`);
            res.send("Disconnected");
        })
    }

});

var roscore;
app.post('/roscore:id', function(req,res){
    var id =  req.params.id;
    if(id=="Start"){
        
        roscore = execFile('roscore',function (err,stdout,stderr){
            if(err){
                console.log(err);
            }
        });
        console.log("Roscore Started");        
        res.send("Connected");
    }
    else if(id=="End"){
        roscore.kill();
        roscore.on('exit',function(code){
            console.log(`Roscore exit with ${code}`);
            res.send("Disconnected");
        });
    }
});

var gazebo;
app.post('/gazebo:id',function(req,res){
    var id =  req.params.id;
    if(id=="Start"){
        gazebo= execFile('roslaunch',['bot','simple_gazebo.launch'],function(err,stdout,stderr){
            if (err) {
                console.log(err);
            }
        });
        console.log("Gazebo Started");
        res.send("Connected");
    }
    else if(id=="End"){
        gazebo.kill();
        gazebo.on('exit',function(code){
            console.log(`Gazebo exit with ${code}`);
            res.send("Disconnected");
        });
        
    }
});

// var mapviz;
// app.post('/mapviz:id',function(req,res){
//     var id =  req.params.id;
//     if(id=="Start"){
//         mapviz= execFile('roslaunch',['mapviz','mapviz.launch'],function(err,stdout,stderr){
//             if (err) {
//                 console.log(err);
//             }
//         });
//         console.log("Mapviz Started");
//         res.send("Connected");
        
//     }
//     else if(id=="End"){
//         mapviz.kill();

//         mapviz.on('exit',function(code){
//             console.log(`Mapviz exit with ${code}`);
//             res.send("Disconnected");
//         });
//     }
// });

var cam;
app.post('/cam:id',function(req,res){
    var id =  req.params.id;
    if(id=="Start"){
        cam= execFile('roslaunch',['usb_cam','usb_cam-test.launch'],function(err,stdout,stderr){
            if (err) {
                console.log(err);
            }
        });
        
        console.log("Camera Started");
        res.send("Connected");
    }
    else if(id=="End"){
        cam.kill();
        cam.on('exit',function(code){
            console.log(`Camera exit with ${code}`);
            res.send("Disconnected");
        });
    }
});

var autonomous;
app.post('/autonomous:id',function(req,res){
    var id =  req.params.id;
    if(id=="Start"){
        autonomous= execFile('roslaunch',['bot','autonomous.launch'],function(err,stdout,stderr){
            if (err) {
                console.log(err);
            }
        });
        console.log("Autonomous Task Started");
        res.send("Connected");
    }
    else if(id=="End"){
        autonomous.kill();
        autonomous.on('exit',function(code){
            console.log(`Autonomous Task exit with ${code}`);
            res.send("Disconnected");
        });
        
    }
});



app.listen(3000,function(){
    console.log("Server running on 3000");
})

