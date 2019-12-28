

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

//Firebase clients configuration
const firebase = require("firebase");
require('firebase/auth');

const config = {
  apiKey: "AIzaSyBVWFwS-0t075-VcTpM1B-6MLeFrICYpW0",
  authDomain: "grade-project-pdg.firebaseapp.com",
  databaseURL: "https://grade-project-pdg.firebaseio.com",
  projectId: "grade-project-pdg",
  storageBucket: "grade-project-pdg.appspot.com",
  messagingSenderId: "812811423805",
  appId: "1:812811423805:web:309f51cc8fd486933ada54",
  measurementId: "G-84JQ4LMSXR"
};

firebase.initializeApp(config);

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

app.put('/ayuda', function (req, res) {

  //validar data me falta
  console.log("PUT=/ayuda/peticion");

  var ref = db.ref('ayuda/');
  var count = 0;

  ref.push(req.body);
  res.status(200).send('success');

});

app.delete('/ayuda', function (req, res) {
  console.log("DELETE=/ayuda");
  var ref = db.ref('ayuda/' + req.body.id);
  ref.remove();
  res.status(200).send('success');

});

app.get('/ayuda', function (req, res) {

  //validar data me falta
  console.log("GET=/ayuda");

  var ref = db.ref('ayuda/');

  ref.once("value", function (snapshot) {
    var values = snapshot.val();
    if (values != null) {
      res.status(200).send({ "peticiones": values })
    } else {
      res.status(401).send("Bad request - user doesnt exist");
    }
  });

});

app.post('/finish-session', function (req, res) {

  console.log("POST=/finish-session");

  var body = req.body
  var id = body.id
  var dat = body.sesion

  var ref = db.ref('pacientes/' + id + '/informacion');
  ref.once("value", async function (snapshot) {

    var snap = snapshot.val();

    if (snap != null) {
      var tokenUser = snap.token;

      var message = {
        to: tokenUser,
        collapse_key: '',
        data: dat,
        notification: {
          title: 'Nueva sesión terminada',
          body: '¡Felicidades! has terminado exitosamente tu sesión de entreno, puedes ver los detalles ahora.',
          icon: 'notification_icon',
          sound: "default"
        }
      };

      //promise style
      await fcm.send(message)
        .then(function (response) {
          console.log("Successfully sent with response: ", response);
        })
        .catch(function (err) {
          console.error(err);
        });

      var idDoctor = snap.profesional
      var ref = db.ref('profesional/' + idDoctor + '/informacion');
      ref.once("value", function (snapshot2) {
        var snap2 = snapshot2.val();
        if (snap2 != null) {

          var tokenDoctor = snap2.token;
          var messagePatient = 'El paciente ' + snap.nombre + ' ha finalizado una nueva sesión de entreno. Revisa los detalles'

          var message = {
            to: tokenDoctor,
            collapse_key: '',
            data: dat,
            notification: {
              title: 'Nueva sesión terminada',
              body: messagePatient,
              icon: 'notification_icon',
              sound: "default"
            }
          };

          //promise style
          fcm.send(message)
            .then(function (response) {
              res.status(200).send("sucess");
              console.log("Successfully sent with response: ", response);
            })
            .catch(function (err) {
              res.status(401).send("Bad request");
              console.log("Something has gone wrong!");
              console.error(err);
            });

        } else {
          res.status(401).send("Bad request - Profesional doesnt exist");
        }
      });
    } else {
      res.status(401).send("Bad request - user doesnt exist");
    }
  });

});


app.put('/perfil', function (req, res) {

  //validar data me falta
  console.log("PUT=/perfil");

  var type = req.body.type

  if (type != undefined && type != '')
    admin.auth().createUser({
      email: req.body.informacion.email,
      password: req.body.informacion.password,
      disabled: false
    })
      .then(function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.

        var branch = '';
        if (type == "1")
          branch = 'profesional/'
        else if (type == "0")
          branch = 'pacientes/'

        ref = db.ref(branch + 'lista/');
        var refPost = ref.push({ 'id': userRecord.uid, 'nombre': req.body.informacion.nombre })

        ref = db.ref(branch + userRecord.uid + '/informacion');
        req.body.informacion.id = userRecord.uid;
        req.body.informacion.ref = refPost.key;
        ref.set(req.body.informacion)

        console.log('Successfully created new user:', userRecord.uid);
        res.status(200).send('success');
      })
      .catch(function (error) {
        console.log('Error creating new user:', error);
        res.status(401).send(error);
      });
  else
    res.status(400).send("bad request");

});

app.delete('/perfil', function (req, res) {

  //validar data me falta
  console.log("DELETE=/perfil");

  var type = req.body.type

  if (type != undefined && type != '') {

    var uid = req.body.id;
    admin.auth().deleteUser(uid).then(function () {

      var branch = '';
      var branch2 = '';
      if (type == "1") {
        branch = 'doctores/'
        branch2 = 'pacientes/'
      } else if (type == "0") {
        branch = 'pacientes/'
        branch2 = 'doctores/';
      }

      //Elimina los doctores o pacientes asignados
      var info = '';
      ref = db.ref(branch + id + '/' + branch2);
      ref.once("value", function (snapshot) {
        info = snapshot.val();
      });

      for (i in info.doctores) {
        var objeto = Object.keys(arr);
        ref = db.ref(branch2 + objeto.id + '/' + branch + uid);
        ref.remove();
      }

      ref = db.ref(branch + uid + '/');
      ref.remove();

      ref = db.ref(branch + 'lista/' + req.body.ref);
      ref.remove();

      res.status(200).send('success');
      console.log('Successfully deleted user');

    }).catch(function (error) {
      res.status(400).send(error);
      console.log('Error deleting user:', error);

    });
  } else
    res.status(400).send("bad request");

});

app.post('/perfil', function (req, res) {

  console.log("POST=/perfil");

  var body = req.body;

  var id = body.id;
  var token = body.token;
  var type = body.type;

  if (id != undefined && id != '' && type != undefined && type != '') {
    var ref = undefined

    if (type == "1") {
      ref = db.ref('profesional/' + id + '/informacion');
    } else if (type == "0") {
      ref = db.ref('pacientes/' + id + '/informacion');
    }

    ref.once("value", function (snapshot) {
      var values = snapshot.val();
      if (values != null) {

        ref = db.ref(branch + id + '/informacion/token');
        if (token != undefined && token != '') {
          ref.set(token);
          values.token = token;
        }

        res.status(200).send(values)
      } else {
        res.status(401).send("Bad request - user doesnt exist");
      }
    });

  } else {
    res.status(402).send("Bad request - params ");
  }
});

app.post('/update-token', function (req, res) {

  var body = req.body;

  var id = body.id;
  var token = body.token;
  var type = body.type;

  if (id != undefined && id != '' && type != undefined && type != '' && token != undefined && token != '') {
    var ref = undefined
    var branch = ''

    if (type == "1")
      branch = 'profesional/'
    else if (type == "0")
      branch = 'pacientes/'

    ref = db.ref(branch + id + '/informacion');
    ref.once("value", function (snapshot) {

      var values = snapshot.val();
      if (values != null) {

        ref = db.ref(branch + id + '/informacion/token');
        ref.set(token);

        res.status(200).send({ sucess: true })
      } else {
        res.status(401).send("Bad request - user doesnt exist");
      }
    });

  } else {
    res.status(402).send("Bad request - params ");
  }
});

app.post('/sesion', function (req, res) {

  console.log("POST=/sesion");

  var body = req.body;
  const email = body.email;
  const password = body.password
  var type = body.type;

  if (type != undefined && type != '')
    firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
      console.log("FIREBASE : signIn sucess")
      var id = firebase.auth().currentUser.uid;
      // opcion 1 para doctores y opcion 2 para pacientes
      if (type == "1")
        ref = db.ref('doctores/' + id + '/informacion');
      else if (type == "0")
        ref = db.ref('pacientes/' + id + '/informacion');

      if (type == "0" || type == "1")
        ref.once("value", function (snapshot) {
          var values = snapshot.val();
          if (values != null) {
            res.status(200).send(values)
          } else {
            res.status(401).send("Bad request - user doesnt exist");
          }
        });
      else
        res.status(401).send("Bad request - params");

      firebase.auth().signOut().then(function () {
        // Sign-out successful.
        console.log("FIREBASE : signOut sucess")
      }).catch(function (error) {
        // An error happened
        var errorCode = error.code;
        var errorMessage = error.message;
        res.status(500).send(error);
      });


    }).catch(function (error) {
      // Handle Errors here.`enter code here`
      var errorCode = error.code;
      var errorMessage = error.message;
      res.status(403).send(error);
    });
  else
    res.status(402).send("Bad request - params ");
});


app.post('/monitoreo/lista', function (req, res) {

  console.log("POST=/monitoreo/lista");

  var body = req.body;
  var id = body.id;
  var type = body.type;
  if (type == "0") {
    ref = db.ref('pacientes/' + id + '/monitoreo/pulso/tomas');

    ref.once("value", function (snapshot) {
      var values = snapshot.val();
      if (values != null) {
        res.status(200).send({ "tomas": values })
      } else {
        res.status(401).send("Bad request - user doesnt exist");
      }
    });
  } else {
    ref = db.ref('pacientes/' + id + '/monitoreo/ecg/tomas');

    ref.once("value", function (snapshot) {
      var values = snapshot.val();
      if (values != null) {
        res.status(200).send({ "tomas": values })
      } else {
        res.status(401).send("Bad request - user doesnt exist");
      }
    });
  }
});

app.post('/monitoreo', function (req, res) {
  console.log("POST=/monitoreo");

  var body = req.body;
  var id = body.id;
  var type = body.type;
  // var ecg = body.ecg;
  var fecha = body.date

  if (id != undefined && id != '') {
    if (type == "0") {
      ref = db.ref('pacientes/' + id + '/monitoreo/pulso/' + fecha + '/');

      ref.once("value", function (snapshot) {
        var values = snapshot.val();
        if (values != null) {
//          const arr = Object.keys(values).map((key) => [key, values[key]]);
          values = { 'pulso': values };
          res.status(200).send(values)
        } else {
          res.status(401).send("Bad request");
        }
      });
    } else {
      ref = db.ref('pacientes/' + id + '/monitoreo/ecg/' + fecha + '/');

      ref.once("value", function (snapshot) {
        var values = snapshot.val();
        if (values != null) {
          const arr = Object.keys(values).map((key) => [key, values[key]]);
          values = { 'ecg': arr };
          res.status(200).send(values)
        } else {
          res.status(401).send("Bad request");
        }
      });
    }
  }
});


app.post('/pacientes-lista', function (req, res) {

  console.log('POST="/pacientes-lista"');

  var body = req.body;
  var id = body.id;

  if (id != undefined && id != '') {
    var ref = db.ref('profesional/' + id + '/pacientes');

    ref.once("value", async function (snapshot) {
      var values = snapshot.val();
      values = Object.values(values);
      var aux = {"pacientes":[]};
      for (i in values) {
        patientID = values[i];
        ref = db.ref('pacientes/' + patientID + '/informacion');
        await ref.once("value").then(function (snapshot2) {
          var print = snapshot2.val();
          aux.pacientes[i] = { "informacion": print };  
          return "sucess";
        });
      }
      res.status(200).send(aux);
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