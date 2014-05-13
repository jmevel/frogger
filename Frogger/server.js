
  var fs = require("fs"),
    express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    controllers = require("./controllers"),
    sessionStore = new express.session.MemoryStore({ reapInterval: 60000 * 10 }),
    sessionSecret = "secret_key";

playerData = [];
playerPseudo = "";

app.configure(function()
{
    this.use(express.cookieParser());
    this.use(express.static(__dirname + '/Views'));
    this.use(express.static(__dirname + '/public'));
    this.set('views', __dirname + '/Views');
    this.set('view engine', 'ejs');
    this.use(express.session({ secret: sessionSecret, store: sessionStore }));

    this.use(express.bodyParser());
    this.use(app.router);
});

server = require('http').createServer(app);
server.listen(4444);
/*console.log('server listening at 127.0.0.1:4444'); */
server.on ("listening", function ()
{
    console.log('Server running at http://127.0.0.1:4444');
})

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {

    socket.on('getData', function(pseudo){
        var user = controllers.UserController;
        user.GetData(pseudo, function(response){
            playerData = response;
            socket.emit('playerData', data = {
                pseudo: playerData.pseudo,
                victories : playerData.victories,
                bestTimeVictory: playerData.bestTimeVictory,
                bestTimeWaterLillyCapture : playerData.bestTimeWaterLillyCapture,
                defeats : playerData.defeats
            });
        });
    });

    socket.on('getRecords', function(){
        var user = controllers.UserController;
        user.GetRecords(function(response){
            socket.emit('recordsData', data = {
                victories : response.victories,
                bestTimeVictory : response.bestTimeVictory,
                bestTimeWaterLillyCapture : response.bestTimeWaterLillyCapture
            });
        });
    });

    socket.on('updateData', function (data) {
        console.log("emit from "+data.pseudo+" best time to capture water lilly : "+data.bestTimeWaterLillyCapture+" seconds!!!");
        var user = controllers.UserController;
        user.UpdateData(data, function(){
            user.GetData(data.pseudo, function(response){
                playerData = response;
                socket.emit('playerData', data = {
                    pseudo: playerData.pseudo,
                    victories : playerData.victories,
                    bestTimeVictory: playerData.bestTimeVictory,
                    bestTimeWaterLillyCapture : playerData.bestTimeWaterLillyCapture,
                    defeats : playerData.defeats
                });
            });

            user.GetRecords(function(response){
                io.sockets.emit('recordsData', data = {
                    victories : response.victories,
                    bestTimeVictory : response.bestTimeVictory,
                    bestTimeWaterLillyCapture : response.bestTimeWaterLillyCapture
                });
            });
        });
    });
});

function authenticate(req, res, next){
    if(req.session.username!=null){
        console.log('session not null');
        res.redirect('/game');
    }
    else{
        next();
    }
}

app.get('/game',function(req,res,next){
    if(req.session.username!=null){
        var user = controllers.UserController;
        user.GetData(req.session.username, function(response){
            console.log("render data");
            res.render('game.ejs', {
                'username': req.session.username,
                'victories':response.victories,
                'bestTimeVictory' : response.bestTimeVictory,
                'bestTimeWaterLillyCapture' : response.bestTimeWaterLillyCapture,
                'defeats' : response.defeats
            });
        });
    }
    else{
        res.redirect('/');
    }

});

app.get('/', [authenticate],function(req,res,next){
    res.render('index.ejs');
});

app.get('/user/disconnect', function(req,res){
    console.log('get disconnect');
    req.session.destroy(function() {});
    console.log('regenerate session');
    res.redirect('/');
});

app.get('/user/restart', function(req,res){
     res.redirect('/game');
});

app.post('/user/create', function(req, res) {

    console.log("player with pseudo "+req.body.pseudo+" try to register");
    if (req.body.pseudo != '' && req.body.password != '' && req.body.repeatPassword != '' && req.body.password == req.body.repeatPassword ) {
        var user = controllers.UserController;
        user.CreateUser(req.body.pseudo, req.body.password, function(err){
            if(err == true)
            {
                console.log(err.message);
                res.redirect('/');
            }
            else
            {
                console.log("player registered");
                req.session.username = req.body.pseudo;
                res.redirect('/game');
            }
        });


    }else{
        console.log("error in some field(s) with registration");
        console.log(req.body.pseudo);
        console.log(req.body.password);
        console.log(req.body.repeatPassword);
        res.redirect('/');
    }

});


app.post('/user/login', function(req, res) {

    if (req.body.pseudo != '' && req.body.password != '' ) {
        console.log("user "+req.body.pseudo+" try to login");
        var user = controllers.UserController;
        user.Exists(req.body.pseudo, req.body.password, function(response){

            if(response == true){
                req.session.username = req.body.pseudo;
                res.redirect('/game');
            }
            else {

                res.redirect('/');
            }
        });


    }else{
        res.redirect('/');
    }
});



