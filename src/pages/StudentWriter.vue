<template>
  <div>
    <br />
    <h5 class="text-center text-red" v-if="isSubmitted">Assignment already submitted</h5>
    <br />
    <writer-component
      v-if="loaded==true"
      ref="writer"
      :enablePaste="false"
      :initialContent="this.assignmentQuestion"
      :isReadOnly="true"
    />
    <q-btn v-if="loaded && !isSubmitted" flat label="Save Assignment" @click="saveAssignment()" />
    <q-btn
      v-if="loaded && !isSubmitted"
      flat
      label="Submit Assignment"
      @click="confirmSubmit = true"
    />

    <q-dialog v-model="confirmSubmit" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6 text-negative">Confirm Submission</div>
        </q-card-section>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">You will not be able to make any more changes after submitting.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Submit Assignment"
            color="negative"
            v-close-popup
            @click="submitAssignment()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="pasteAlert">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-warning">Warning</div>
        </q-card-section>

        <q-card-section class="q-pt-none">Pasting in the editor is not allowed.</q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <writer-component
      v-if="loaded==true"
      ref="writer"
      :enablePaste="this.enablePaste"
      :initialContent="this.initialContent"
      :isReadOnly="this.isSubmitted"
      :enableCheatDetection="true"
      @paste="pasteEvent()"
      @cheated="cheatEvent()"
    />
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
      userId: "",
      responseId: "",
      userTypeId: "",
      enablePaste: false,
      pasteAlert: false,
      isSubmitted: false,
      confirmSubmit: false,
      initialContent: {},
      studentAssignmentStore: {},
      submitAssignmentStore: {},
      classroomAssignmentStore: {},
      studentDetails: {},
      assignmentQuestion: {}
    };
  },

  props: {
    username: String,
    assignmentId: String
  },

  async created() {
    await this.checkCorrectUser();
    // await this.setStores();
    this.loadQuestion();
    this.loadContentAndStatus();
  },

  async mounted() {
    if (this.loaded == true) await this.loadContent();
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
      } else {
        this.studentDetails = await appStore.getValue("userDetails");
        this.studentId = await appStore.getValue("userId");
      }
    },

    pasteEvent() {
      this.pasteAlert = true;
    },

    cheatEvent() {
      if (!this.responseId) {
        this.setAssignment("draft", true);
        return;
      }

      this.saveAssignment("draft", true);
    },

    loadQuestion() {
      let vm = this;
      firebaseDb
        .collection("assignment")
        .doc(this.assignmentId)
        .get()
        .then(assignment => {
          vm.assignmentQuestion = assignment.data().question;
        });
    },

    setUserTypeIdAndPaste() {
      this.userTypeId = "s";
      this.enablePaste = false;
      return;
    },

    loadContentAndStatus() {
      let vm = this;

      firebaseDb
        .collection("assignment_response")
        .where("assignment_id", "==", this.assignmentId)
        .where("student_id", "==", this.studentId)
        .get()
        .then(function(responses) {
          if (!responses.empty) {
            responses.forEach(response => {
              vm.responseId = response.id;
              if (response.data().status == "submitted") {
                vm.isSubmitted = true;
              }
              vm.initialContent = response.data().response;
            });
          } else {
            vm.initialContent = {
              type: "doc",
              content: [
                {
                  type: "paragraph"
                }
              ]
            };
          }
          vm.loaded = true;
        });
    },

    clearEditorContent() {
      this.setEditorContent("");
    },

    setEditorContent(content) {
      this.$refs.writer.setContent(content);
    },

    async submitAssignment() {
      this.saveAssignment("submitted");

      firebaseDb
        .collection("assignment")
        .doc(this.assignmentId)
        .update({
          submissions: firebase.firestore.FieldValue.arrayUnion(this.studentId)
        })
        .then(function() {
          console.log("Assignment submitted.");
        })
        .catch(function(error) {
          console.error("Error submiting document: ", error);
        });

      this.$router.push("/s/" + this.username).catch(err => {
        console.log(err);
      });
    },

    saveAssignment(status = "draft", cheated = false) {
      let vm = this;

      if (!this.responseId) {
        this.setAssignment();
        return;
      }

      if (cheated) {
        firebaseDb
          .collection("assignment_response")
          .doc(this.responseId)
          .update({
            response: this.getEditorContent(),
            status: status,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            cheated: cheated
          })
          .then(function() {
            console.log("Update " + status + " succesfull");
          })
          .catch(error => {
            this.setAssignment();
          });
      } else {
        firebaseDb
          .collection("assignment_response")
          .doc(this.responseId)
          .update({
            response: this.getEditorContent(),
            status: status,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          })
          .then(function() {
            console.log("Update " + status + " succesfull");
          })
          .catch(error => {
            this.setAssignment();
          });
      }
    },

    setAssignment(status = "draft", cheated = false) {
      let vm = this;
      firebaseDb
        .collection("assignment_response")
        .add({
          response: this.getEditorContent(),
          status: status,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          student_id: this.studentId,
          student_name:this.studentDetails.name ,
          student_roll:this.studentDetails.roll,
          assignment_id: this.assignmentId,
          cheated: cheated
        })
        .then(function(doc) {
          vm.responseId = doc.id;
          console.log(status + " writing succesfull");
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