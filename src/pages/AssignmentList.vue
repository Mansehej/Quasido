<template>
  <q-page class="fullscreen row justify-center items-center">
    <div class="q-pa-md" style="min-width: 70vh; height:70vh;">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Assignments</q-toolbar-title>
      </q-toolbar>

      <q-list bordered>
        <q-item v-for="assignment in assignments" :key="assignment.id" class="q-my-sm" clickable v-ripple>
          <q-item-section
            @click="openassignment(assignment.id, assignment.name, assignment.type, assignment.collab, assignment.requester)"
          >
            <q-item-label>{{ assignment.name }}</q-item-label>
            <q-item-label caption lines="1">{{ assignment.type }}</q-item-label>
            <q-item-label v-if="assignment.requester" caption lines="1" class="text-secondary">
              Invited by @
              <b>{{assignment.requester}}</b>
            </q-item-label>
            <q-item-label
              v-if="assignment.collab && !assignment.requester"
              caption
              lines="1"
              class="text-secondary"
            >
              <b>Collaboration Enabled</b>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
// IMPLEMENT OPENING PARTICULAR SCRIPT FROM LIST.
import { firebaseDb } from "boot/firebase";
import Store from "../store/store.js";

let SCRIPT_ID_LENGTH = 11;

let appStore = new Store("app");

export default {
  props: {
    username: String
  },

  data() {
    return {
      prompt: false,
      scriptName: "",
      scripts: [],
      invitedScripts: [],
      errorText: ""
    };
  },

  async mounted() {
    // Check if the user is accessing his/her own page

    await this.checkCorrectUser();

    // Initialise store and get list of all scripts
    await this.getInvitedScripts();
    this.scripts = await this.getScripts();
  },

  methods: {
    
    async checkCorrectUser() {
      let signedInUser = await appStore.getValue("username");
      if (signedInUser != this.username) {
        this.$router.push("/u/" + signedInUser).catch(err => {
          console.log(err);
        });
      }
    },

    async getScripts() {
      let allScripts = await userStore.getScriptList();
      if (!allScripts) {
        allScripts = [];
      }
      if (this.invitedScripts) {
        await this.invitedScripts.forEach(async script => {
          let pushedObject = {
            name: script.scriptName,
            id: script.scriptId,
            type: script.scriptType,
            requester: script.requester
          };
          allScripts.push(pushedObject);
        });
      }
      return allScripts;
    },

    async getInvitedScripts() {
      let invitedScripts;
      let ref = firebaseDb.collection("usernames").doc(this.username);
      try {
        let data = await ref.get();
        if (data.exists) {
          this.invitedScripts = await data.data().collabInvites;
          return true;
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log("Error getting document:", error);
      }
    },

    async makeScript(scriptType) {
      const scriptId = await this.generateId();
      await userStore.pushToScriptList(scriptId, this.scriptName, scriptType);
      this.prompt = false;
      this.openScript(scriptId, this.scriptName, scriptType);
    },

    async generateId() {
      var text = "";
      var char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      for (var i = 0; i < SCRIPT_ID_LENGTH; i++) {
        text += char_list.charAt(Math.floor(Math.random() * char_list.length));
      }
      return text;
    },

    getDashedId(scriptName, scriptId) {
      let dashedName = scriptName.replace(/\s+/g, "-");
      let dashedId = dashedName + "-" + scriptId;
      return dashedId;
    },

    openScript(
      scriptId,
      scriptName,
      scriptType,
      scriptCollab = false,
      scriptOwner = this.username
    ) {
      let dashedId = this.getDashedId(scriptName, scriptId);
      if (scriptOwner != this.username || scriptCollab) {
        this.$router
          .push("/u/collab/" + scriptOwner + "/" + scriptType + "/" + dashedId)
          .catch(err => {
            console.log(err);
          });
      } else {
        this.$router
          .push("/u/" + scriptOwner + "/" + scriptType + "/" + dashedId)
          .catch(err => {
            console.log(err);
          });
      }
    }
  }
};
</script>