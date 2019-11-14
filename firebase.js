//libraries
var admin = require("firebase-admin");

//Key- services
var serviceAccount = require("./serviceAccountKey.json");

// firebase config
var db = admin.database();
var ref = db.ref("PruebaTABLE/");

//init service firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://grade-project-pdg.firebaseio.com"
});

