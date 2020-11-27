import { createApp } from 'vue'
import App from './App.vue'
import './index.less'
import { useRouter } from 'vue-router'
import router from './router/index.js'
import Vant from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
app.use(router)
app.use(Vant)
app.mount('#app')

window.$vm = app
