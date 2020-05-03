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
import * as firebase from "firebase";
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
      let studentId = await appStore.getValue("userId")
      await firebaseDb
        .collection("assignment")
        .where("batch_id", "==", studentDetails.batch_id)
        .where("due", ">=", firebase.firestore.Timestamp.now())
        .where("status", "==", "submitted")
        .orderBy("due")
        .get()
        .then(async assignmentList => {
          if (assignmentList.empty) {
            return;
          }
          assignmentList.forEach(async assignment => {
            let assignmentObj = assignment.data();
            if (assignmentObj.submissions.includes(studentId)) {
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