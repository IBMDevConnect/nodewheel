require('dotenv').config();
var cloudant = require('cloudant');
var express = require('express');
var bodyParser = require('body-parser');
let secureEnv = require('secure-env');
const fs = require('fs');
global.env = secureEnv({secret:'mySecretPassword'});

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res){
  res.sendFile("views/index.html", {"root": __dirname});
});
var cloudant = cloudant({account:global.env.cloudantusername, password:global.env.cloudantpassword});

luckydrawdb = cloudant.db.use(global.env.dbname);

let rawdata = fs.readFileSync('config.json');  
let value = JSON.parse(rawdata);

app.post('/luckydraw', function(req,res){
    var doc={
        _id:req.body.cloudemail,
        time: new Date().toISOString(),
        url: req.headers.host + req.url
        //goodies: req.body.goodies
        };
    
luckydrawdb.insert(doc,function(err,body,header){
    if(err){
    res.sendFile(__dirname + "/views/error.html");
        console.log('Error:'+err.message);
        return;
    }
    else{
        cloudant.db.get('luckydraw',function(err,data){
        console.log(data);
    
    if(data.doc_count%value['limit']==0 && value['itemsover']!='y'){
        return res.sendFile(__dirname + "/views/success.html"); }
    else{
        return res.sendFile(__dirname + "/views/failure.html");
    }
    });
    }
});
    
});

const port = 3001;
app.listen(port, function () {
    console.log("Server running on port: %d", port);
});
module.exports = app;