<template>
  <v-app style="width:100%;background:#1b347c">
    <v-main>
      <audio-recording />
    </v-main>
  </v-app>
</template>

<script>
import AudioRecording from "./components/AudioRecording";

export default {
  name: "App",

  components: {
     AudioRecording,
  },

  data: () => ({
    //
  }),
};
</script>
