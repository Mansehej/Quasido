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
    await this.setStores();
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
      }
    },

    pasteEvent() {
      this.pasteAlert = true;
    },

    cheatEvent() {
      this.assignmentStore
        .update({
          cheated: true
        })
        .then(function() {
          console.log(status + " writing succesfull");
        })
        .catch(error => {
          this.assignmentStore
            .set({
              cheated: true
            })
            .then(function() {
              console.log(status + " writing succesfull");
            })
            .catch(error => {
              console.log(error)
            });
        });
    },

    loadQuestion() {
      let vm = this;
      this.classroomAssignmentStore.get().then(assignment => {
        vm.assignmentQuestion = assignment.data().content;
      });
    },

    setUserTypeIdAndPaste() {
      this.userTypeId = "s";
      this.enablePaste = false;
      return;
    },

    loadContentAndStatus() {
      let vm = this;
      this.assignmentStore.get().then(function(doc) {
        if (doc.exists) {
          if (doc.data().status == "submitted") {
            console.log("Is submitted");
            vm.isSubmitted = true;
          }
          vm.initialContent = doc.data().content;
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

        console.log("loaded");
      });
    },

    async loadContent() {
      console.log("loading content");
      this.clearEditorContent();
      let content = this.assignmentStore.get().then(function(doc) {
        if (doc.exists) {
          this.setEditorContent(doc.data().content);
          console.log("Setting " + doc.data().content);
        } else {
          this.setEditorContent("Hello");
        }
      });
    },

    clearEditorContent() {
      this.setEditorContent("");
    },

    setEditorContent(content) {
      this.$refs.writer.setContent(content);
    },

    setStores() {
      this.studentAssignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("students")
        .collection(this.username)
        .doc("assignments")
        .collection(this.assignmentId);

      this.assignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("assignments")
        .collection(this.assignmentId)
        .doc(this.username);

      this.classroomAssignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("classrooms")
        .collection(this.studentDetails.stream)
        .doc(this.studentDetails.batch)
        .collection("shift_" + this.studentDetails.shift)
        .doc("semester_" + this.studentDetails.semester)
        .collection("assignments")
        .doc(this.assignmentId);
    },

    async submitAssignment() {
      this.saveAssignment("submitted");

      this.studentAssignmentStore
        .doc("info")
        .set({
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function() {
          console.log("Document successfully saved!");
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });

      this.classroomAssignmentStore.update({
        submissions: firebase.firestore.FieldValue.arrayUnion(this.username)
      });
    },

    saveAssignment(status = "draft") {
      let vm = this;
      this.assignmentStore
        .update({
          content: this.getEditorContent(),
          status: status,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function() {
          console.log(status + " writing succesfull");
        })
        .catch(error => {
          this.assignmentStore
            .set({
              content: vm.getEditorContent(),
              status: status,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(function() {
              console.log(status + " writing succesfull");
            })
            .catch(function(error) {
              console.error("Error writing document: ", error);
            });
        });
    },

    getEditorContent() {
      return this.$refs.writer.getContent();
    }
  }
};
</script>