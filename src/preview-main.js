import {createApp} from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './assets/app.scss';
import PreviewApp from 'pages/preview/PreviewApp';

const app = createApp(PreviewApp);
app.use(Antd);
app.mount('#preview-app');
