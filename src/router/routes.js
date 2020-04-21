const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      { path: "/write", component: () => import("components/Writer.vue") },
      {
        path: "/auth/:userType",
        component: () => import("pages/Auth.vue"),
        props: true
      },
      { path: "/auth", redirect: "/auth/student" },
      {
        path: "/s/:username",
        component: () => import("pages/StudentAssignments.vue"),
        props: true
      },
      {
        path: "/t/:username",
        component: () => import("pages/TeacherAssignments.vue"),
        props: true
      },
      {
        path: "/s/:username/:assignmentId",
        component: () => import("pages/StudentWriter.vue"),
        props: true
      },
      {
        path: "/t/:username/:assignmentId",
        component: () => import("pages/TeacherWriter.vue"),
        props: true
      },
      {
        path: "/t/:username/:assignmentId/submissions",
        component: () => import("pages/SubmissionList.vue"),
        props: true
      }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
