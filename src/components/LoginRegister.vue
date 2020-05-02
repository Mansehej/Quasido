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
        userType: null
      }
    };
  },

  created() {
    if (this.$props.type == "student") {
      this.label = "Enrollment Number";
      this.userType = "student";
    } else {
      this.label = "Username";
      this.userType = "teacher";
    }
  },

  methods: {
    submitForm() {
      this.login();
    },
    async login() {
      let vm = this;
      await firebaseDb
        .collection(this.userType)
        .where("roll", "==", this.formData.roll)
        .get()
        .then(async userList => {
          if (userList.empty) {
            vm.errorText = "No such user found.";
            return;
          }
          try {
            userList.forEach(user => {
              this.authenticate(user.id, user.data());
            });
          } catch (error) {
            this.errorText = err.message;
          }
        })
        .catch(err => {
          this.errorText = err.message;
        });
    },

    async authenticate(userId, userData) {
      firebaseAuth
        .signInWithEmailAndPassword(userData.email, this.formData.password)
        .then(async response => {
          let user = response.user;
          user.updateProfile({
            displayName: userData.name
          });
          await this.setAppStore(userId, userData, user);
          this.$router.push(
            `/${this.$props.type.charAt(0)}/${this.formData.roll}`
          );
        })
        .catch(error => {
          if (error.code == "auth/user-not-found") {
            this.formData.errorText = "User does not exist!";
          } else if (error.code == "auth/wrong-password") {
            this.formData.errorText = "Incorrect password!";
          } else {
            this.formData.errorText = error.message;
          }
        });
    },

    async setAppStore(userId, userData, user) {
      await appStore.setValue("username", this.formData.roll);
      await appStore.setValue("signedInStatus", true);
      await appStore.setValue("displayName", userData.name);
      await appStore.setValue("authUid", user.uid);
      await appStore.setValue("userId", userId);
      await appStore.setValue("displayPicture", user.photoURL);
      await appStore.setValue("userDetails", userData);
      await appStore.setValue("userType", this.$props.type.charAt(0));
      return true;
    }
  }
};
</script>