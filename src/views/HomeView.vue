<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> !-->
    <HelloWorld msg = "Welcome to Your Vue.js + TypeScript App" :connector_size = 30 :relation_line_thickness = 4 :n_anchor_points_per_edge = 2 />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

@Options({
  components: {
    HelloWorld,
  },
})
export default class HomeView extends Vue {}
</script>
