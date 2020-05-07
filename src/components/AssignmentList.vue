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
            <q-input outlined v-model="newAssignment.title" type="text" label="Assignment Title" />
            <q-select
              outlined
              v-model="newAssignment.course"
              :options="newAssignmentOptions.courseList"
              label="Course"
              required
            />
            <q-select
              outlined
              v-model="newAssignment.branch"
              :options="newAssignmentOptions.branchList"
              label="Branch"
              required
            />
            <q-select
              outlined
              v-model="newAssignment.batch"
              :options="newAssignmentOptions.batchList"
              label="Batch"
              required
            />
            <q-select
              outlined
              v-model="newAssignment.subject"
              :options="newAssignmentOptions.subjectList"
              label="Subject"
              required
            />
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Next" @click="duePrompt = true " />
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
            :options="DateOptions"
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
    <q-tabs v-model="tab" align="justify" no-caps class="bg-light-blue-3 text-white shadow-2">
      <q-tab name="submitted" label="Submitted" />
      <q-tab name="draft" label="Drafts" />
    </q-tabs>
    <q-separator />
    <q-card>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="submitted">
          <q-list bordered>
            <q-item
              v-for="assignment in submittedAssignments"
              :key="assignment.id"
              class="q-my-sm"
              clickable
              v-ripple
            >
              <q-item-section @click="openAssignment(assignment.id)">
                <q-item-label class="text-capitalize">{{ assignment.title }}</q-item-label>
                <q-item-label caption lines="1" class="text-capitalize">{{ assignment.subject_name}}</q-item-label>
                <q-item-label v-if="!assignment.submitted" caption lines="1" class="text-negative">
                  Due Date:
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
                  class="text-positive text-capitalize"
                >{{assignment.batch.toUpperCase()}} {{assignment.shift}} | {{assignment.year}} Batch</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
        <q-tab-panel name="draft">
          <q-list bordered>
            <p v-if="draftAssignments.length==0">There's nothing here</p>
            <q-item
              v-for="assignment in draftAssignments"
              :key="assignment.id"
              class="q-my-sm"
              clickable
              v-ripple
            >
              <q-item-section @click="openAssignment(assignment.id)">
                <q-item-label class="text-capitalize">{{ assignment.title }}</q-item-label>
                <q-item-label caption lines="1" class="text-capitalize">{{ assignment.subject_name}}</q-item-label>
                <q-item-label v-if="!assignment.submitted" caption lines="1" class="text-negative">
                  Due Date:
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
                  class="text-positive text-capitalize"
                >{{assignment.batch.toUpperCase()}} {{assignment.shift}} | {{assignment.year}} Batch</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script>
import Store from "../store/store.js";
let appStore = new Store("app");

import { firebaseDb } from "boot/firebase";
import * as firebase from "firebase";
import { date } from "quasar";
export default {
  props: {
    userType: String,
    username: String,
    submittedAssignments: Array,
    draftAssignments: Array
  },
  data() {
    return {
      tab: "submitted",
      prompt: false,
      duePrompt: false,
      newAssignment: {
        course: null,
        branch: null,
        batch: null,
        subject: null,
        due: null,
        title: null
      },
      newAssignmentOptions: {
        courseList: ["BTech"],
        branchList: ["CSE-1", "CSE-2", "IT-1", "IT-2", "CSE-E", "IT-E"],
        batchList: ["2021"],
        subjectList: [
          "Artificial Intelligence",
          "Compiler Design",
          "Web Engineering",
          "Operating Systems"
        ]
      }
    };
  },
  methods: {
    openAssignment(id) {
      if (this.userType == "s") {
        this.$router.push("/s/" + this.username + "/" + id).catch(err => {
          console.log(err);
        });
      } else if (this.userType == "t") {
        this.$router.push("/t/" + this.username + "/" + id).catch(err => {
          console.log(err);
        });
      }
    },
    async testFx() {},
    async createAssignment() {
      this.$q.loading.show();
      Object.keys(this.newAssignment).forEach(property => {
        if (typeof this.newAssignment[property] == "string") {
          this.newAssignment[property] = this.newAssignment[
            property
          ].toLowerCase();
        }
      });

      console.log(this.newAssignment);

      let vm = this;
      let date = new Date(this.newAssignment.due);
      date.setHours(23);
      date.setMinutes(59);
      date.setSeconds(59);
      this.newAssignment.due = firebase.firestore.Timestamp.fromDate(date);
      console.log(this.newAssignment.due);
      let teacherId = await appStore.getValue("userId");
      let batchName =
        this.newAssignment.batch + "-" + this.newAssignment.branch;
      console.log(
        this.newAssignment.due,
        this.newAssignment.subject,
        this.newAssignment.title,
        batchName
      );
      const getBatchId = new Promise((resolve, reject) =>
        firebaseDb
          .collection("batch")
          .where("name", "==", batchName)
          .get()
          .then(snapshot => {
            if (snapshot.empty) {
              reject("UNKNOWN BATCH");
            }
            snapshot.forEach(doc => {
              resolve(doc.id);
            });
          })
      );

      const getSubjectId = new Promise((resolve, reject) => {
        firebaseDb
          .collection("subject")
          .where("name", "==", this.newAssignment.subject)
          .get()
          .then(snapshot => {
            if (snapshot.empty) {
              reject("UNKNOWN SUBJECT");
            }
            snapshot.forEach(doc => {
              resolve(doc.id);
            });
          });
      });

      Promise.all([getBatchId, getSubjectId]).then(values => {
        console.log(values);
        firebaseDb
          .collection("assignment")
          .add({
            batch_id: values[0],
            batch_name: batchName,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            due: this.newAssignment.due,
            status: "draft",
            subject: values[0],
            subject_name: this.newAssignment.subject,
            title: this.newAssignment.title,
            teacher_id: teacherId
          })
          .then(assignment => {
            this.$q.loading.hide();
            vm.openAssignment(assignment.id);
          })
          .catch(error => {
            console.log(error);
          });
      });
    },
    EmptyFieldsCheck() {
      //enter field check code here
    },

    CurrentDateGenerator() {
      var x = new Date();
      var y = x.getFullYear().toString();
      var m = (x.getMonth() + 1).toString();
      var d = x.getDate().toString();
      d.length == 1 && (d = "0" + d);
      m.length == 1 && (m = "0" + m);
      var yyyymmdd = y + "/" + m + "/" + d;
      return yyyymmdd;
    },
    DateOptions(date) {
      return date >= this.CurrentDateGenerator();
    }
  }
};
</script>