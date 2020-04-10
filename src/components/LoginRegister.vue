<template>
  <q-form @submit="submitForm">
    <q-input v-if="tab=='register'" class="q-mb-md" outlined v-model="formData.name" label="Name" />
    <q-input class="q-mb-md" outlined v-model="formData.roll" type="text" :label="label" />
    <q-input class="q-mb-md" outlined v-model="formData.password" type="password" label="Password" />
    <div class="text-negative text-center">{{formData.errorText}}</div>
    <br />
    <div class="row justify-center">
      <q-btn color="primary" type="submit" :label="tab" />
    </div>
  </q-form>
</template>

<script>
let COLLEGE_NAME = "msit";

import { firebaseAuth, firebaseDb } from "boot/firebase";

import Store from "../store/store.js";
let appStore = new Store("app");

export default {
  props: ["tab", "type"],

  data() {
    return {
      formData: {
        name: "",
        roll: "",
        username: "",
        password: "",
        errorText: "",
        label: null,
        docType: null
      }
    };
  },
  methods: {
    submitForm() {
      // if (this.tab == "login") {
      this.login();
      // } else if (this.tab == "register") {
      //   this.register();
      // }
    },
    async login() {
      await firebaseDb
        .collection(COLLEGE_NAME)
        .doc(`${this.docType}`)
        .collection(this.formData.roll)
        .doc("info")
        .get()
        .then(async doc => {
          try {
            this.authenticate(doc.data());
          } catch (error) {
            console.log(error);
          }
        })
        .catch(err => {
          this.errorText = err.message;
        });
    },

    async authenticate(rollData) {
      firebaseAuth
        .signInWithEmailAndPassword(rollData.email, this.formData.password)
        .then(async response => {
          let user = response.user;
          user.updateProfile({
            displayName: rollData.name
          });
          await this.setAppStore(rollData, user);
          console.log(await appStore.getKeyValuePair());
          this.$router.push(`/teacher/${this.formData.roll}`);
        })
        .catch(error => {
          console.log(error.code);
          if (error.code == "auth/user-not-found") {
            this.formData.errorText = "User does not exist!";
          } else if (error.code == "auth/wrong-password") {
            this.formData.errorText = "Incorrect password!";
          } else {
            console.log(error);
          }
        });
    },

    async setAppStore(rollData, user) {
      await appStore.setValue("signedInStatus", true);
      await appStore.setValue("displayName", rollData.name);
      await appStore.setValue("uid", user.uid);
      await appStore.setValue("displayPicture", user.photoURL);
      await appStore.setValue("studentDetails", rollData);
      return true;
    }

    // register() {
    //   firebaseAuth
    //     .createUserWithEmailAndPassword(
    //       this.formData.roll,
    //       this.formData.password
    //     )
    //     .then(response => {
    //       response.user.updateProfile({
    //         displayName: this.formData.name
    //       });
    //     })
    //     .catch(error => {
    //       this.formData.errorText = error.message;
    //     });
    // }
  },
  created: function() {
    if (this.$props.type == "student") {
      this.label = "Enrollment Number";
      this.docType = "students";
    } else {
      this.label = "Username";
      this.docType = "teachers";
    }
  }
};
</script>