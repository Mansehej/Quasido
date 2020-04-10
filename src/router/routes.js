const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      { path: "/write", component: () => import("components/Writer.vue") },
      { path: "/auth", component: () => import("pages/Auth.vue") },
      {
        path: "/auth/teacher",
        component: () => import("pages/AuthTeacher.vue")
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
