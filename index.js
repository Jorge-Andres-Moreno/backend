//libraries
var admin = require("firebase-admin");
var express = require('express');
var body_parser = require('body-parser');

//Key- services
var serviceAccount = require("./serviceAccountKey.json");

//init service firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://grade-project-pdg.firebaseio.com"
});

// firebase config
var db = admin.database();
var ref = db.ref("PruebaTABLE/");

//Server configuration

var port = process.env.PORT || 8080;
var app = express();
app.use(body_parser.urlencoded({ extended: true }));

//End points
app.delete('/deletedb', function (req, res) {
  console.log('DELETE="/deletedb"');
  ref = db.ref("PruebaTABLE/");
  ref.remove();
  res.status(200).send("success")
});

app.put('/add', function (req, res) {
  console.log('PUT="/add"');

  var usersRef = ref.child("users");
  usersRef.set({
    estela: {
      date_of_birth: "June 23, 1912",
      full_name: "Alan Turing"
    },
    gracehop: {
      date_of_birth: "December 9, 1906",
      full_name: "Grace Hopper"
    }
  });
  res.status(200).send("success")
});


//Run server
var server = app.listen(port, function () {
  console.log('Run Server at:');
  console.log('Servidor ejecutandose en localhost:8080');
});

