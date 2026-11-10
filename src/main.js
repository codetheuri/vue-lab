import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
// Bootstrap 5 Framework
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

// Application Global Stylesheet
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.mount('#app')
