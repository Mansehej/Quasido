<template>
  <div>
    <br />
    <h5
      class="text-center text-red"
      v-if="isSubmitted && userTypeId=='s'"
    >Assignment already submitted</h5>
    <q-btn
      class="flex flex-top"
      v-if="loaded && isSubmitted && userTypeId=='t'"
      filled
      label="View Submissions"
      @click="viewSubmissions()"
    />
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

    <writer-component
      v-if="loaded==true"
      ref="writer"
      :enablePaste="true"
      :initialContent="this.initialContent"
      :isReadOnly="this.isSubmitted"
    />
  </div>
</template>

<script>
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
      userTypeId: "t",
      teacherDetails: {},
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
    this.loadContentAndStatus();
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
        this.teacherDetails = await appStore.getValue("userDetails");
      }
    },

    viewSubmissions() {
      this.$router
        .push("/t/" + this.username + "/" + this.assignmentId + "/submissions")
        .catch(err => {
          console.log(err);
        });
    },

    loadContentAndStatus() {
      let vm = this;
      firebaseDb
        .collection("assignment")
        .doc(this.assignmentId)
        .get()
        .then(function(doc) {
          if (doc.exists) {
            if (doc.data().status == "submitted") {
              console.log("Is submitted");
              vm.isSubmitted = true;
            }
            if (doc.data().question) {
              vm.initialContent = doc.data().question;
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
            console.log(vm.initialContent);
          } else {
            console.log("Invalid ID");
            // Redirect to assignment list page
          }
          vm.loaded = true;

          console.log("loaded");
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
      this.$router.push("/t/" + this.username).catch(err => {
        console.log(err);
      });
    },

    saveAssignment(status = "draft") {
      let vm = this;
      firebaseDb
        .collection("assignment")
        .doc(this.assignmentId)
        .update({
          question: this.getEditorContent(),
          status: status,
          created: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function() {
          console.log(status + " writing succesfull");
          vm.$router.push("/t/" + vm.username).catch(err => {
            console.log(err);
          });
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