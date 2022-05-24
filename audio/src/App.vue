<template>
  <v-app>
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
