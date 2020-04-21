<template>
  <q-page class="flex flex-center">
    <assignment-list
      v-if="loaded==true"
      :assignments="assignments"
      :userType="userTypeId"
      :username="username"
    />
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
    username: String,
    userType: String
  },
  components: {
    "assignment-list": require("../components/AssignmentList.vue").default
  },
  data() {
    return {
      assigmentPrompt: false,
      loaded: false,
      assignments: [],
      userTypeId: "",
      errorText: ""
    };
  },
  async mounted() {
    // Check if the user is accessing his/her own page
    this.$q.loading.show();
    await this.checkCorrectUser();
    // Initialise store and get list of all scripts
    await this.getAssignmentList();
  },
  methods: {
    async checkCorrectUser() {
      this.setUserTypeId();
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
    setUserTypeId() {
      if (this.userType == "teacher" || this.userType == "t") {
        this.userTypeId = "t";
      } else {
        this.userTypeId = "s";
      }
    },
    async getAssignmentList() {
      let studentDetails = await appStore.getValue("userDetails");
      await firebaseDb
        .collection(COLLEGE_NAME)
        .doc("classrooms")
        .collection(studentDetails.stream)
        .doc(studentDetails.batch)
        .collection("shift_" + studentDetails.shift)
        .doc("semester_" + studentDetails.semester)
        .collection("assignments")
        .orderBy("due")
        .get()
        .then(async assignmentList => {
          assignmentList.forEach(assignment => {
            let assignmentObj = assignment.data();
            if (assignmentObj.submissions.includes(this.username)) {
              assignmentObj["submitted"] = true;
            }
            assignmentObj["id"] = assignment.id;
            this.assignments.push(assignmentObj);
          });
          this.loaded = true;
          this.$q.loading.hide();
        })
        .catch(err => {
          this.errorText = err.message;
        });
    }
  }
};
</script>