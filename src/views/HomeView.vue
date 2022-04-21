<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> !-->
    <n-message-provider>
        <n-dialog-provider>
            <WorkSpace />
        </n-dialog-provider>
    </n-message-provider>
  </div>
</template>

<script lang="ts">
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import { Options, Vue } from 'vue-class-component';
import WorkSpace from '@/components/WorkSpace/WorkSpace.vue'; // @ is an alias to /src

@Options({
  components: {
    NDialogProvider, NMessageProvider, WorkSpace
  }
})
export default class HomeView extends Vue {}
</script>
