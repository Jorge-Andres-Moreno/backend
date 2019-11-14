//libraries
var admin = require("firebase-admin");

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

var http = require('http');

var express = require('express');
var body_parser = require('body-parser');
var app = express();

app.use(body_parser.urlencoded({ extended: true }));

app.post('/nacimiento', function (req, res) {

  var edad = req.body.edad || '';
  var nacimiento = '';

  if (edad != '')
    nacimiento = 2019 - edad;

  res.send('<html><body>'
    + cabecera
    + '<p>' + nacimiento + '</p>'
    + formulario
    + '</html></body>'
  );

});

var formulario = '<form method="post" action="/nacimiento">'
  + '<label for="edad">¿Qué edad tienes?</label>'
  + '<input type="text" name="edad" id="edad">'
  + '<input type="submit" value="Enviar"/>'
  + '</form>';

var cabecera = '<h1>Naciste el año</h1>';

app.get('/nacimiento', function (req, res) {

  res.send('<html><body>'
    + cabecera
    + formulario
    + '</html></body>'
  );

});

app.delete('/deletedb', function (req, res) {
  ref = db.ref("PruebaTABLE/");
  ref.remove();
});

app.post('/add', function (req, res) {
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
  res.writeHead(200, { "Content-Type": "text/html" });
});


var server = app.listen(port, function () {
  console.log('Servidor ejecutandose en localhost:8080');
});

