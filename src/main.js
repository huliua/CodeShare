import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from '@/router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import VueCodemirror from 'vue-codemirror';
import { basicSetup } from "codemirror";

const pinia = createPinia();
const app = createApp(App);
app.use(VueCodemirror, {
    // optional default global options
    autofocus: true,
    lineNumbers: true,
    tabSize: 4,
    extensions: [basicSetup],
});
app.use(router).use(ElementPlus).use(pinia).mount('#app');
