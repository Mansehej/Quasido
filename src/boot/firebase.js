import * as firebase from "firebase"

//import firebase config
const firebaseConfig=require('../../firebaseConfig.json')

// Initialize Firebase
let firebaseApp = firebase.initializeApp(firebaseConfig);
let firebaseAuth = firebaseApp.auth()
let   firebaseDb = firebaseApp.firestore();

//Enable analytics
firebase.analytics();

export {firebaseAuth, firebaseDb, firebase}