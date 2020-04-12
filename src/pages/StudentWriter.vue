<template>
  <div>
    <writer-component v-if="loaded==true" ref="writer" :enablePaste="this.enablePaste" />
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
      userTypeId: "",
      enablePaste: false
    };
  },

  props: {
    username: String,
    userType: String,
    assignmentId: String
  },

  async created() {
    await this.checkCorrectUser();
    this.loaded = true;
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
      }
    },
    setUserTypeIdAndPaste() {
      if (this.userType == "teacher" || this.userType == "t") {
        this.userTypeId = "t";
        this.enablePaste = true;
      } else {
        this.userTypeId = "s";
        this.enablePaste = false;
      }
      return;
    }
  }
};
</script>