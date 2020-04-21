<template>
  <q-page>
    <q-list bordered>
      <q-item
        v-for="submission in submissionList"
        :key="submission.student"
        class="q-my-sm"
        clickable
        v-ripple
      >
        <q-item-section @click="openAssignment()">
          <q-item-label>{{ submission.student }}</q-item-label>
          <q-item-label caption lines="1" class="text-capitalize">Submission date: {{ submission.date.toDate().toDateString()}}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
let COLLEGE_NAME = "msit";
let SCRIPT_ID_LENGTH = 11;
import Store from "../store/store.js";
import { firebaseDb } from "boot/firebase";
import * as firebase from "firebase";


let appStore = new Store("app");

export default {
  props: {
    assignmentId: Array,
    username: String
  },
  data() {
    return {
      submissionList : []
    };
  },
  async mounted() {    await this.checkCorrectUser();
    this.userTypeId = "t";
    await this.getSubmissionList();
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
      }
    },
    getSubmissionList() {
      let vm = this
      firebaseDb
      .collection(COLLEGE_NAME)
      .doc("assignments")
      .collection(this.assignmentId)
      .get()
      .then(submissionList => {
        submissionList.forEach(submission => {
          vm.submissionList.push({
            student: submission.id,
            date: submission.data().timestamp
          })
        })
      })
    },
    openAssignment() {
      
    },
  }
};
</script>