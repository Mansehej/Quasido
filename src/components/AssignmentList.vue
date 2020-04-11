<template>
  <div class="q-pa-md" style="min-width: 70vh; height:70vh;">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Assignments</q-toolbar-title>
    </q-toolbar>

    <q-list bordered>
      <q-item
        v-for="assignment in assignments"
        :key="assignment.id"
        class="q-my-sm"
        clickable
        v-ripple
      >
        <q-item-section @click="openassignment()">
          <q-item-label>{{ assignment.name }}</q-item-label>
          <q-item-label caption lines="1" class="text-capitalize">{{ assignment.subject}}</q-item-label>
          <q-item-label caption lines="1" class="text-secondary">
            Due date:
            {{assignment.due.toDate().toDateString()}}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
export default {
  props: {
    userType: String,
    assignments: Array
  }
};
</script>