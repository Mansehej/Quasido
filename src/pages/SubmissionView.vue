<template>
  <div v-if="loaded">
    <br />
    <div class="text-center text-h5 text-primary">{{submissionName}}</div>
    <div class="text-center text-h5 text-primary">({{submissionRoll}})</div>
    <div
      class="text-center text-subtitle2 text-accent"
      v-if="loaded==true"
    >Submitted: {{submissionDate.toDate().toDateString()}}</div>
    <div
      class="text-center text-subtitle2 text-negative"
      v-if="loaded==true && cheatStatus == true"
    >Student caught using unfair means of pasting content.</div>
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
      initialContent: {},
      cheatStatus: false,
      submissionName: "",
      submissionRoll: ""
    };
  },

  props: {
    username: String,
    assignmentId: String,
    submissionId: String
  },

  async created() {
    this.$q.loading.show();
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
        .collection("assignment_response")
        .doc(this.submissionId)
        .get()
        .then(submission => {
          vm.submissionName = submission.data().student_name;
          vm.submissionRoll = submission.data().student_roll;
          vm.submissionDate = submission.data().timestamp;
          vm.initialContent = submission.data().response;
          vm.cheatStatus = submission.data().cheated;
          console.log(vm.initialContent);
          vm.loaded = true;
          this.$q.loading.hide();
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>