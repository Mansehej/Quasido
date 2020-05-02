<template>
  <q-page class="flex flex-center">
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