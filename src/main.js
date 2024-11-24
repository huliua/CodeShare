import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from '@/router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import VueCodemirror from 'vue-codemirror';
import { basicSetup } from 'codemirror';

const pinia = createPinia();
const app = createApp(App);
app.use(VueCodemirror, {
    // optional default global options
    autofocus: true,
    lineNumbers: true,
    tabSize: 4,
    extensions: [basicSetup]
});
app.use(router).use(ElementPlus, { locale: zhCn }).use(pinia);
app.mount('#app');
