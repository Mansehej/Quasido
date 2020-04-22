<template>
  <q-page class="flex flex-center">
    <!-- <q-img
      src="../assets/logo.svg"
      spinner-color="white"
      class="fixed-bottom-left"
      style="height:90vh; width:90vh; margin-left:30vh; opacity:0.8"
    />-->

    <q-card style="width:50hh">
      <q-card-section>
        <div class="text-h6 text-capitalize text-center">{{userType}} Login</div>
      </q-card-section>

      <q-separator inset />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="login">
          <login-register :tab="tab" :type="userType" />
        </q-tab-panel>
        <q-tab-panel name="register">
          <login-register :tab="tab" />
        </q-tab-panel>
      </q-tab-panels>

      <q-separator inset />

      <q-card-section class="q-pa-xs">
        <q-btn flat class="text-capitalize full-width" @click="changeAuth()">Login as {{otherType}}</q-btn>
      </q-card-section>
      <!-- <div
        style="margin-top:1vh"
        class="text-subtitle text-center text-weight-light v"
        v-if="tab=='login'"
      >Don't have an account?</div>
      <div
        style="margin-top:1vh"
        class="text-subtitle text-center text-weight-light v"
        v-if="tab=='register'"
      >Already have an account?</div>-->
      <!-- <q-tabs v-model="tab" dense class="bg-white-3" align="justify" narrow-indicator>
        <q-tab name="login" label="Login" v-if="tab=='register'" />
        <q-tab name="register" label="Register" v-if="tab=='login'" />
      </q-tabs>-->
      <!-- <q-card-section align="justify-around">
        <google-login/>
      </q-card-section>-->
    </q-card>
  </q-page>
</template>

<script>
export default {
  data() {
    let otherType
    if (this.userType == "student") {
      otherType = "teacher";
    } else {
      otherType = "student";
    }
    return {
      tab: "login",
      type: "student",
      otherType: otherType
    };
  },
  props: {
    userType: {
      type: String,
      default: "student"
    }
  },
  components: {
    "login-register": require("../components/LoginRegister.vue").default
    // "google-login": require("../components/GoogleLogin.vue").default
  },
  methods: {
    changeAuth() {
      this.$router.push("/auth/" + this.otherType).catch(err => {
        console.log(err);
      });
      this.$router.go().catch(err => {
        console.log(err);
      });
    }
  }
};
</script>

<style>
</style>