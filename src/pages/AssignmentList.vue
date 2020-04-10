<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="min-width: 70vh; height:70vh;">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Assignments</q-toolbar-title>
      </q-toolbar>

      <q-list bordered v-if="loaded==true">
        <q-item
          v-for="assignment in assignments"
          :key="assignment.id"
          class="q-my-sm"
          clickable
          v-ripple
        >
          <q-item-section
            @click="openassignment(assignment.id, assignment.name, assignment.type, assignment.collab, assignment.requester)"
          >
            <q-item-label>{{ assignment.name }}</q-item-label>
            <q-item-label caption lines="1" class="text-capitalize">{{ assignment.subject}}</q-item-label>
            <q-item-label caption lines="1" class="text-secondary">
              Due date:
              {{assignment.due.toDate().toDateString()}}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
let COLLEGE_NAME = "msit";

// IMPLEMENT OPENING PARTICULAR SCRIPT FROM LIST.
import { firebaseDb } from "boot/firebase";
import Store from "../store/store.js";

let appStore = new Store("app");

export default {
  props: {
    username: String
  },

  data() {
    return {
      prompt: false,
      loaded: false,
      assignments: [],
      errorText: ""
    };
  },

  async mounted() {
    // Check if the user is accessing his/her own page
    await this.checkCorrectUser();

    // Initialise store and get list of all scripts
    await this.getAssignmentList();
  },

  methods: {
    async checkCorrectUser() {
      let signedInUser = await appStore.getValue("username");
      if (signedInUser != this.username) {
        this.$router.push("/s/" + signedInUser).catch(err => {
          console.log(err);
        });
      }
    },

    async getAssignmentList() {
      let studentDetails = await appStore.getValue("studentDetails");

      await firebaseDb
        .collection(COLLEGE_NAME)
        .doc("classrooms")
        .collection(studentDetails.stream)
        .doc(studentDetails.batch)
        .collection("shift_" + studentDetails.shift)
        .doc("semester_" + studentDetails.semester)
        .collection("assignments")
        .get()
        .then(async assignmentList => {
          assignmentList.forEach(assignment => {
            let assignmentObj = assignment.data();
            assignmentObj["id"] = assignment.id;
            this.assignments.push(assignmentObj);
            console.log();
          });
          this.loaded = true;
        })

        .catch(err => {
          this.errorText = err.message;
        });
    }
  }
};
</script>