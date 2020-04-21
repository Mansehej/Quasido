<template>
  <div>
    <br />
    <div class="text-center text-h5 text-primary">{{studentId}}</div>
    <div class="text-center text-subtitle2 text-accent">Submitted: {{submissionDate.toDate().toDateString()}}</div>
    <br />
    <writer-component
      v-if="loaded==true"
      ref="writer"
      :initialContent="this.initialContent"
      :isReadOnly="true"
      :enablePaste="true"
    />
  </div>
</template>

<script>
let COLLEGE_NAME = "msit";

import Store from "../store/store.js";
import { firebaseApp, firebaseDb } from "boot/firebase";
import * as firebase from "firebase/app";

let appStore = new Store("app");

let SCRIPT_ID_LENGTH = 11;

export default {
  components: {
    "writer-component": require("../components/Writer.vue").default
  },
  data() {
    return {
      loaded: false,
      initialContent: {}
    };
  },

  props: {
    username: String,
    assignmentId: String,
    studentId: String
  },

  async created() {
    await this.checkCorrectUser();
    this.loadContent();
  },

  methods: {
    async checkCorrectUser() {
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
      } else {
        this.studentDetails = await appStore.getValue("userDetails");
      }
    },

    loadContent() {
      let vm = this;

      firebaseDb
        .collection(COLLEGE_NAME)
        .doc("assignments")
        .collection(this.assignmentId)
        .doc(this.studentId)
        .get()
        .then(submission => {
          vm.submissionDate = submission.data().timestamp;
          vm.initialContent = submission.data().content;
          console.log(vm.initialContent)
          vm.loaded = true;
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>