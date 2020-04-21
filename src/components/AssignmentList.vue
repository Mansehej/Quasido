<template>
  <div class="q-pa-md" style="min-width: 70vh; height:70vh;">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Assignments</q-toolbar-title>
      <q-btn v-if="userType=='t'" label="New Assignment" color="secondary" @click="prompt=true" />
    </q-toolbar>

    <q-dialog v-model="prompt">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="q-gutter-md no-wrap items-center" style="min-width: 18vw">
            <q-input outlined v-model="newAssignment.name" type="text" label="Assignment Name" />
            <q-select
              outlined
              v-model="newAssignment.course"
              :options="newAssignmentOptions.courseList"
              label="Course"
            />
            <q-select
              outlined
              v-model="newAssignment.batch"
              :options="newAssignmentOptions.batchList"
              label="Batch"
            />
            <q-select
              outlined
              v-model="newAssignment.shift"
              :options="newAssignmentOptions.shiftList"
              label="Shift"
            />
            <q-select
              outlined
              v-model="newAssignment.semester"
              :options="newAssignmentOptions.semesterList"
              label="Semester"
            />
            <q-select
              outlined
              v-model="newAssignment.subject"
              :options="newAssignmentOptions.subjectList"
              label="Subject"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Next" @click="duePrompt = true" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="duePrompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <q-date
            v-model="newAssignment.due"
            title="Due Date"
            subtitle="Please don't give a short one :)"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            color="primary"
            label="Create Assignment"
            @click="createAssignment()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-list bordered>
      <q-item
        v-for="assignment in assignments"
        :key="assignment.id"
        class="q-my-sm"
        clickable
        v-ripple
      >
        <q-item-section @click="openAssignment(assignment.subject, assignment.id)">
          <q-item-label>{{ assignment.name }}</q-item-label>
          <q-item-label caption lines="1" class="text-capitalize">{{ assignment.subject}}</q-item-label>
          <q-item-label v-if="!assignment.submitted" caption lines="1" class="text-secondary">
            Due date:
            {{assignment.due.toDate().toDateString()}}
          </q-item-label>
          <q-item-label
            v-if="assignment.submitted"
            caption
            lines="1"
            class="text-positive"
          >Submitted</q-item-label>
          <q-item-label
            v-if="userType=='t'"
            caption
            lines="1"
            class="text-positive"
          >{{assignment.batch}}-{{assignment.shift}} | Semester {{assignment.semester}}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
let COLLEGE_NAME = "msit";
let SCRIPT_ID_LENGTH = 11;

import { firebaseDb } from "boot/firebase";
import * as firebase from "firebase";

export default {
  props: {
    userType: String,
    assignments: Array,
    username: String
  },
  data() {
    return {
      prompt: false,
      duePrompt: false,
      newAssignment: {
        course: "",
        batch: "",
        shift: "",
        semester: "",
        subject: "",
        due: "",
        name
      },
      newAssignmentOptions: {
        courseList: ["B.Tech"],
        batchList: ["CSE", "IT"],
        shiftList: ["Evening"],
        semesterList: ["6"],
        subjectList: [
          "Artifcial Intelligence",
          "Compiler Design",
          "Web Engineering, Operating Systems"
        ]
      }
    };
  },
  methods: {
    openAssignment(subject, id) {
      console.log("user type; " + this.userType);
      if (this.userType == "s") {
        // let dashedId = this.getDashedId(subject, id);
        this.$router.push("/s/" + this.username + "/" + id).catch(err => {
          console.log(err);
        });
      } else if (this.userType == "t") {
        this.$router.push("/t/" + this.username + "/" + id).catch(err => {
          console.log(err);
        });
      }
    },
    getDashedId(subject, id) {
      let dashedSubject = subject.replace(/\s+/g, "-");
      let dashedId = dashedSubject + "-" + id;
      return dashedId;
    },
    async createAssignment() {
      let vm = this;
      let date = new Date(this.newAssignment.due);
      date.setHours(23);
      date.setMinutes(59);
      date.setSeconds(59);
      this.newAssignment.due = firebase.firestore.Timestamp.fromDate(date);

      let assignmentId = await this.generateId();
      this.teacherAssignmentStore = firebaseDb
        .collection(COLLEGE_NAME)
        .doc("teachers")
        .collection(this.username)
        .doc("assignments")
        .collection("list")
        .doc(assignmentId)
        .set(this.newAssignment)
        .then(function() {
          vm.openAssignment(vm.newAssignment.subject, assignmentId);
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
    },
    async generateId() {
      var text = "";
      var char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      for (var i = 0; i < SCRIPT_ID_LENGTH; i++) {
        text += char_list.charAt(Math.floor(Math.random() * char_list.length));
      }
      return text;
    },
    openWriter(assignmentId) {}
  }
};
</script>