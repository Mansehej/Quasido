<template>
  <div>
    <br />
    <h5
      class="text-center text-red"
      v-if="isSubmitted && userTypeId=='s'"
    >Assignment already submitted</h5>
    <q-btn class = "flex flex-top" v-if="loaded && isSubmitted && userTypeId=='t'" filled label="View Submissions" @click="viewSubmissions()" />
    <br />
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
      @paste="pasteEvent()"
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
      enablePaste: true,
      assignmentDetails: {},
      pasteAlert: false,
      isSubmitted: false,
      confirmSubmit: false,
      initialContent: {},
      studentAssignmentStore: {},
      submitAssignmentStore: {},
      classroomAssignmentStore: {},
      studentDetails: {}
    };
  },

  props: {
    username: String,
    assignmentId: String
  },

  async created() {
    await this.checkCorrectUser();
    this.setTeacherStore();
    this.loadContentAndStatus();
  },

  async mounted() {
    if (this.loaded == true) await this.loadContent();
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
        await this.setUserTypeIdAndPaste();
        this.studentDetails = await appStore.getValue("userDetails");
      }
    },

    getAssignmentInfo() {
      this.teacherAssignmentStore
        .get()
        .then(doc => {
          this.assignmentDetails = doc.data();
          console.log(doc);
          this.setClassroomStore();
        })
        .catch(error => {
          console.log(error);
        });
    },

    pasteEvent() {
      this.pasteAlert = true;
    },

    setUserTypeIdAndPaste() {
      this.userTypeId = "t";
      this.enablePaste = true;
      return;
    },

    loadContentAndStatus() {
      let vm = this;
      this.teacherAssignmentStore.get().then(function(doc) {
        if (doc.exists) {
          if (doc.data().status == "submitted") {
            console.log("Is submitted");
            vm.isSubmitted = true;
          }
          vm.initialContent = doc.data().content;
          console.log(vm.initialContent);
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
      let content = this.teacherAssignmentStore.get().then(function(doc) {
        if (doc.exists) {
          console.log("exists");
          console.log("status" + doc.data().content);
          this.setEditorContent(doc.data().status);
          console.log("Setting " + doc.data().content);
        } else {
          console.log("deosn't");
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

    setTeacherStore() {
      this.teacherAssignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("teachers")
        .collection(this.username)
        .doc("assignments")
        .collection("list")
        .doc(this.assignmentId);

      this.getAssignmentInfo();

      // this.assignmentStore = firebaseDb
      //   .collection(COLLEGE_NAME)
      //   .doc("assignments")
      //   .collection(this.assignmentId)
      //   .doc(this.username);
    },

    setClassroomStore() {
      console.log(this.assignmentDetails);

      this.classroomAssignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("classrooms")
        .collection(this.assignmentDetails.course)
        .doc(this.assignmentDetails.batch)
        .collection("shift_" + this.assignmentDetails.shift)
        .doc("semester_" + this.assignmentDetails.semester)
        .collection("assignments");
    },

    async submitAssignment() {
      this.saveAssignment("submitted");

      let setObj = {
        due: this.assignmentDetails.due,
        name: this.assignmentDetails.name,
        subject: this.assignmentDetails.subject,
        content: this.getEditorContent(),
        submissions: []
      };

      console.log(setObj);
      this.classroomAssignmentStore
        .doc(this.assignmentId)
        .set(setObj)
        .then(function() {
          console.log("Document successfully saved!");
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
    },

    saveAssignment(status = "draft") {
      this.teacherAssignmentStore
        .update({
          content: this.getEditorContent(),
          status: status,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function() {
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