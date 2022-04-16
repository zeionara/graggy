<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> !-->
    <WorkSpace />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import WorkSpace from '@/components/WorkSpace/WorkSpace.vue'; // @ is an alias to /src

@Options({
  components: {
    WorkSpace
  }
})
export default class HomeView extends Vue {}
</script>
