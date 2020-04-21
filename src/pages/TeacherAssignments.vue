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
    this.userTypeId = "t";
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
      this.userType = "t";
    },
    async getAssignmentList() {
      let teacherDetails = await appStore.getValue("userDetails");
      let vm = this
      this.teacherAssignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("teachers")
        .collection(this.username)
        .doc("assignments")
        .collection("list")
        .get()
        .then(async assignmentList => {
          assignmentList.forEach(assignment => {
            let assignmentObj = assignment.data();
            assignmentObj["id"] = assignment.id;
            vm.assignments.push(assignmentObj);
          });
          vm.loaded=true
          vm.$q.loading.hide();
        })
      
        .catch(err => {
          this.errorText = err.message;
        });
    }
  }
};
</script>