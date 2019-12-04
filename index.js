

//libraries an extensions

var admin = require("firebase-admin");

//var https = require('https');
var http = require('http');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

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
//var portHttps = process.env.PORT || 8443;
var port = process.env.PORT || 8080;


var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


//End points
/*
app.delete('/deletedb', function (req, res) {
  console.log('DELETE="/deletedb"');
  var ref = db.ref("usuarios/");
  ref.remove();
  res.status(200).send("success")
});
*/

app.put('/ayuda/peticion', function (req, res) {

  //validar data me falta
  console.log("PUT=/ayuda/peticion");

  var ref = db.ref('ayuda/');
  var count = 0;

  ref.once("value", function (snapshot) {

    count = snapshot.numChildren();
    ref = db.ref('ayuda/' + count);
    ref.set(req.body);
    res.status(200).send('success');

  });

});

app.delete('/ayuda/borrar', function (req, res) {
  console.log("DELETE=/ayuda/borrar");
  res.status(200).send(req.body)
});

app.post('/monitoreo', function (req, res) {
  console.log("POST=/monitoreo");

  var body = req.body;
  var id = body.id;
  var pulso = body.pulso;
  var ecg = body.ecg;

  if (id != undefined && id != '') {
    if (pulso == "true") {
      ref = db.ref('pacientes/' + id + '/monitoreo/pulso');

      ref.once("value", function (snapshot) {
        var values = snapshot.val();
        if (values != null) {
          values = { 'pulso': values };
          res.status(200).send(values)
        } else {
          res.status(401).send("Bad request - user doesnt exist");
        }
      });
    } else {
      res.status(402).send("Bad request - params ");
    }
  }

});

app.post('/perfil', function (req, res) {

  console.log("POST=/perfil");

  var body = req.body;

  var device = body.device

  if (device == "0") {

    var id = body.id;
    var type = body.type;

    if (id != undefined && id != '' && type != undefined && type != '') {
      var ref = undefined

      if (type == "1") {
        ref = db.ref('doctores/' + id + '/informacion');
      } else if (type == "0") {
        ref = db.ref('pacientes/' + id + '/informacion');
      }

      ref.once("value", function (snapshot) {
        var values = snapshot.val();
        if (values != null) {
          res.status(200).send(values)
        } else {
          res.status(401).send("Bad request - user doesnt exist");
        }
      });

    } else {
      res.status(402).send("Bad request - params ");
    }
  } else if(device == "1") {

    var email = body.email;
    var password = body.password

    console.log('email :'+email);
    console.log('password :'+password);
    
    admin.auth().signInWithEmailAndPassword(email, password).catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

    });
  }
});

app.post('/pacientes', function (req, res) {

  console.log('POST="/pacientes"');

  var body = req.body;
  var id = body.id;

  if (id != undefined && id != '') {
    var ref = db.ref('doctores/' + id + '/pacientes');

    ref.once("value", function (snapshot) {
      var values = snapshot.val();
      if (values != null) {
        values = { 'pacientes': values };
        res.status(200).send(values)
      } else {
        res.status(400).send("Bad request")
      }

    });
  } else {
    res.status(400).send("Bad request")
  }

});

app.get('/hello', function (req, res) {
  console.log('GET="/hello"');
  res.status(200).send("Hello REQUEST-GET");
});

/*
app.get('/readb', function (req, res) {
  console.log('GET="/readb"');
  var ref = db.ref("usuarios/");
  ref.once("value", function (snapshot) {
    var values = snapshot.val()
    if (values != null) {
      res.status(200).send(values)
    } else {
      res.status(400).send("Bad request")
    }
  });
});
*/

app.get('/', function (req, res) {
  console.log('GET="/"');
  fs.readFile("./principal.html", "UTF-8", function (err, html) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });

});


// run server

http.createServer(app).listen(port);

/*
var server = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app);

server.on('listening', function () {
  console.log('SERVER HTTPS STARTED WITH PORT: ' + port)
});

server.listen(port);
*/