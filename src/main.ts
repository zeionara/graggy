import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import yaml from 'js-yaml'

fetch(process.env.BASE_URL + "config.yml")
.then((response) => {
    response.text().then(result => {
        App.config = yaml.load(result)
        createApp(App).use(store).use(router).mount('#app')
    })
})
//   .then((config) => {
//        App.yaml_config = config
//   })
// console.log(App)
// fetch(process.env.BASE_URL + "config.json")
//   .then((response) => response.json())
//   .then((config) => {
//        App.config = config
//        console.log(App)
//        createApp(App).use(store).use(router).mount('#app')
//   })
// createApp(App).use(store).use(router).mount('#app')
