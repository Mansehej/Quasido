<template>
  <q-btn flat @click="googleLogin()">
    <img src="../assets/googlelogin.png" />
  </q-btn>
</template>

<script>
import * as firebase from "firebase";

export default {
  methods: {
    googleLogin() {
      // Using a popup.
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      firebaseAuth.signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;
      });
    }
  }
};
</script>