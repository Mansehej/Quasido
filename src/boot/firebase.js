import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'

//import firebase config
import * as firebaseConfig from "../../firebaseConfig.json";

// Initialize Firebase
let firebaseApp = firebase.initializeApp(firebaseConfig.default);
let firebaseAuth = firebaseApp.auth()
let firebaseDb = firebaseApp.firestore();

export {firebaseAuth, firebaseDb, firebaseApp}