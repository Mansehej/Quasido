<template>
  <div>
    <q-btn v-if="loaded==true" flat label="Save Assignment" @click="saveAssignment()" />
    <q-btn v-if="loaded==true" flat label="Submit Assignment" @click="submitAssignment()" />
    <writer-component v-if="loaded==true" ref="writer" :enablePaste="this.enablePaste" />
  </div>
</template>

<script>
let COLLEGE_NAME = "msit";

import Store from "../store/store.js";
import { firebaseApp, firebaseDb } from "boot/firebase";
import * as firebase from "firebase/app";

let appStore = new Store("app");
let userStore;
let ownerStore;

let SCRIPT_ID_LENGTH = 11;

export default {
  components: {
    "writer-component": require("../components/Writer.vue").default
  },
  data() {
    return {
      loaded: false,
      userTypeId: "",
      enablePaste: false,
      studentAssignmentStore: {},
      submitAssignmentStore: {}
    };
  },

  props: {
    username: String,
    userType: String,
    assignmentId: String
  },

  async created() {
    await this.checkCorrectUser();
    await this.setStores();
    this.loaded = true;
  },

  methods: {
    async checkCorrectUser() {
      await this.setUserTypeIdAndPaste();
      let signedInUser = await appStore.getValue("username");
      if (!signedInUser) {
        this.$router.push("/auth").catch(err => {
          console.log(err);
        });
      }
      if (signedInUser != this.username) {
        this.$router
          .push("/" + this.userTypeId + "/" + signedInUser)
          .catch(err => {
            console.log(err);
          });
      }
    },

    setUserTypeIdAndPaste() {
      if (this.userType == "teacher" || this.userType == "t") {
        this.userTypeId = "t";
        this.enablePaste = true;
      } else {
        this.userTypeId = "s";
        this.enablePaste = false;
      }
      return;
    },

    setStores() {
      this.studentAssignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("students")
        .collection(this.username)
        .doc("assignments")
        .collection(this.assignmentId);

      this.submitAssignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("assignments")
        .collection(this.assignmentId)
        .doc("submissions")
        .collection(this.username);
    },

    submitAssignment() {
      this.submitAssignmentStore
        .doc("content")
        .set(this.getEditorContent())
        .then(function() {
          console.log("Document successfully submitted!");
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });

      this.studentAssignmentStore
        .doc("status")
        .set({
          submitted: true,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function() {
          console.log("Set submitted status");
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
    },

    saveAssignment() {
      this.studentAssignmentStore
        .doc("content")
        .set(this.getEditorContent())
        .then(function() {
          console.log("Document successfully saved!");
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });

      this.studentAssignmentStore
        .doc("status")
        .set({
          submitted: false,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function() {
          console.log("Document successfully saved!");
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
    },

    getEditorContent() {
      return this.$refs.writer.getContent();
    }
  }
};
</script>