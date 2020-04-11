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
        path: "/:userType/:username",
        component: () => import("pages/AssignmentList.vue"),
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
