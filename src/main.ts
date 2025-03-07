// 引入 Vue、Pinia 及根组件 App.vue
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);

// 注册 Pinia 插件，用于状态管理
app.use(createPinia());

// 挂载应用到 index.html 中的 #app 节点
app.mount("#app");
