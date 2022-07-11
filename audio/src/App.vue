<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <audio-recording />
          </v-col>
          <v-col cols="6">
            <audio-playback />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AudioPlayback from './components/AudioPlayback'
import AudioRecording from './components/AudioRecording'
export default {
  name: "App",
  components: {
    AudioRecording,
    AudioPlayback
  }
}
</script>
<style lang="scss">
@import './styles/app.scss';
</style>
