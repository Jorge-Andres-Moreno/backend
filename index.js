
//libraries an extensions

var admin = require("firebase-admin");
var https = require('https');
var express = require('express');
var body_parser = require('body-parser');
var fs = require('fs');



//Key- services
var serviceAccount = require("./serviceAccountKey.json");



//init service firebase

admin.initializeApp({

  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://grade-project-pdg.firebaseio.com"

});



// firebase config

var db = admin.database();



//Server configuration

var port = process.env.PORT || 8080;
var app = express();
app.use(body_parser.urlencoded({ extended: true }));




//End points

app.delete('/deletedb', function (req, res) {

  console.log('DELETE="/deletedb"');

  var ref = db.ref("usuarios/");
  ref.remove();
  res.status(200).send("success")

});



app.get('/readb', function (req, res) {

  console.log('GET="/readb"');

  var ref = db.ref("usuarios/");
  ref.once("value", function (snapshot) {

    var values = snapshot.val()
    if (values != null) {
      console.log('Data fetched successfully')
      res.status(200).send(values)
    } else {
      console.log('Failed to fetch the data')
      res.status(400).send("Bad request")
    }

  });

});





app.get('/', function (req, res) {
  console.log('GET="/"');

  fs.readFile("./principal.html", "UTF-8", function (err, html) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });

});



app.put('/add', function (req, res) {

  console.log('PUT="/add"');

  var ref = db.ref("usuarios/");

  ref.set({

    estela: {
      date_of_birth: "June 23, 1912",
      full_name: "Alan Turing"
    },

    gracehop: {
      date_of_birth: "December 9, 1906",
      full_name: "Grace Hopper"
    }

  });

  res.status(200).send("success");

});

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(port, function () {
  console.log('SERVER HTTPS STARTED WITH PORT: ' + port)
})

