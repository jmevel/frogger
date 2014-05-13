/*var utils = require("./../utils");
var mongoose = utils.    */
var	mongoose = require('./../utils/getMongoose.js').mongoose;

var models = require("./../models");
var playerModel = models.PlayerModel;

var UserController = {};

UserController.CreateUser = function(pseudo, password, callback)
{
    console.log("User creation with pseudo : " + pseudo  );
    this.Exists(pseudo, password, function(err,doc){
        if(err){
            callback(err);
        }
        else{
            var user = new playerModel(
                {
                    pseudo : pseudo,
                    password : password,
                    victories : 0,
                    bestTimeVictory:180,
                    bestTimeWaterLillyCapture:60,
                    defeats:0
                });

            user.save(function (err) {
                if (err)
                {
                    console.log ('error, cannot create user with pseudo : ' + pseudo + ' :' + err);

                    if(callback)
                        callback(err);
                }
                else
                {
                    console.log("User " + pseudo + " created");

                    if(callback)
                        callback(err);
                }
            });
        }
    });
}

UserController.Exists = function(pseudo, password, callback){

    console.log("checking if user : " + pseudo + " exists in database" );

    playerModel.findOne({pseudo:pseudo, password: password}, function(err,doc)
    {
        if(doc != null){
            console.log("User " + pseudo + " exists" );
            callback(true);
        }
        else{
            console.log("User : " + pseudo + " doesn't exist" );
            callback(false);
        }
    });
}

UserController.GetRecords = function(callback){
     playerModel.find(function(err, doc){
         var data = [];
         data.victories = 0;
         data.bestTimeWaterLillyCapture = 60;
         data.bestTimeVictory = 180;
         doc.forEach(function(value, index, array){
             if(value.victories>data.victories){
                 data.victories = value.victories;
             }
             if(value.bestTimeWaterLillyCapture<data.bestTimeWaterLillyCapture){
                  data.bestTimeWaterLillyCapture = value.bestTimeWaterLillyCapture;
              }
             if(value.bestTimeVictory<data.bestTimeVictory){
                 data.bestTimeVictory = value.bestTimeVictory;
             }
         });
         callback(data);
     });
}

UserController.GetData = function(pseudo, callback){
   playerModel.findOne({pseudo:pseudo}, function(err, doc){
      if(doc!=null){
          console.log("get data:"+doc.victories+" victories");
          data = [];
          data.pseudo = doc.pseudo;
          data.victories = doc.victories;
          data.bestTimeVictory = doc.bestTimeVictory;
          data.bestTimeWaterLillyCapture = doc.bestTimeWaterLillyCapture;
          data.defeats = doc.defeats;
          callback(data);
      }
       else{
          console.log("no user find with pseudo: "+pseudo);
      }
   });
}

UserController.UpdateData = function(data, callback){
    console.log("Update data from "+data.pseudo+" with "+data.victories+" victories");
    playerModel.findOne({pseudo:data.pseudo}, function(err, doc){
       if(doc!=null){
           if(data.victories!=null){
               console.log("updating victories: "+data.victories);
                doc.victories = data.victories;
           }
           if(data.bestTimeVictory!=null){
               doc.bestTimeVictory = data.bestTimeVictory;
           }
           if(data.bestTimeWaterLillyCapture!=null){
               doc.bestTimeWaterLillyCapture = data.bestTimeWaterLillyCapture;
           }
           if(data.defeats!=null){
               doc.defeats = data.defeats;
           }
           if(data.password!=null){
               doc.password = data.password;
           }
           doc.save(function (err) {
               if(err) {
                   console.error('ERROR!');
               }
               else{
                  callback();
               }
           });
       }
        else{
             console.log("no user found with pseudo:"+data.pseudo);
       }
    });
}

exports.UserController = UserController;