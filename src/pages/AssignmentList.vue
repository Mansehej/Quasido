<template>
  <q-page class="flex flex-center">
    <assignment-list v-if="loaded==true" :assignments="assignments"/>
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
  components: {
    "assignment-list": require("../components/AssignmentList.vue").default
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
      if(!signedInUser) {
        this.$router.push("/auth").catch(err => {
          console.log(err);
        });
      }
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
            console.log(this.assignments);
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