<template>
  <v-card outlined="false">
    <v-card-title flat class="ma-3 text-h4 text-center d-block">
      Запис звуку
    </v-card-title>
    <v-card-title class="ma-3 text-center d-block">
      {{ recordMode }}
    </v-card-title>
    <v-card-text>
      <v-btn @click="startRecording" dark outlined height="120">
        <v-img :src="recordImg" max-height="100" max-width="100" alt="record" />
      </v-btn>
      <v-card
        v-show="showRecDialog"
        elevation="4"
        class="mx-auto mt-7"
        max-width="400"
      >
        <v-card-title class="d-block my-4">Блок відтворення</v-card-title>
        <v-card-text>
          <audio ref="abox" src="" controls></audio>
          <v-text-field
            label="Вкажіть назву файлу"
            v-model="fileName"
            class="mt-7 px-10"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="action_box -mt-4 pb-6 px-10">
          <v-btn @click="saveRecord" light> Зберегти </v-btn>
          <v-spacer />
          <v-btn @click="showRecDialog = false"> Вилучити </v-btn>
        </v-card-actions>
      </v-card>
    </v-card-text>
  </v-card>
</template>
<script>
import { eventBus } from "../main.js"
import * as names from "../utils/audioNames.js"
import * as fetch from "../utils/jsFetch.js"
export default {
  data: () => ({
    isRecording: false,
    recorder: null,
    stream: null,
    chunks: [],
    audioBlob: null,
    fileName: "",
    showRecDialog: false
  }),
  computed: {
    recordMode() {
      return this.isRecording
        ? "Йде запис!"
        : this.showRecDialog
        ? "Збережіть аудіозапис"
        : "Натисніть кнопку, щоб розпочати"
    },
    recordImg() {
      return `img/${this.isRecording ? "stop" : "microphone"}.png`
    }
  },
  methods: {
    startRecording() {
      if (this.showRecDialog) {
        return
      }
      const constraints = {
        video: false,
        audio: {
          channelCount: 1,
          echoCancellation: false
        },
      }
      if (this.isRecording) {
        this.recorder.stop()
        this.showRecDialog = true
        this.isRecording = false
      } else {
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(this.gotMedia.bind(this))
          .catch(this.gotMediaError.bind(this))
        this.isRecording = true
      }
    },

    gotMedia(stream) {
      console.log("gotMedia isRecording:", this.isRecording)
      this.chunks = []
      this.recorder = new MediaRecorder(stream)

      this.stream = stream;
      this.recorder.ondataavailable = (e) => {
        console.log("ondataavailable", this.chunks.length)

        this.chunks.push(e.data);
      };
      (this.recorder.onstart = () => {
        console.log("onstart", "STARTED")
      }),
        (this.recorder.onstop = () => {
          this.audioBlob = new Blob(this.chunks, { type: "audio/mp3" })
          this.$refs.abox.src = URL.createObjectURL(this.audioBlob)
        });
      this.recorder.start(500)
    },
    gotMediaError() {
      console.error("ERROR gotMedia REC ")
    },
    async saveRecord() {
      const formData = new FormData()
      const duration = Math.round(this.$refs.abox.duration)
      const audioName = names.formatName(this.fileName, duration)
      formData.append("audio", this.audioBlob, audioName)

      const fileList = await fetch.saveAudioRecord(formData)
      eventBus.$emit("files", fileList)

      this.showRecDialog = false
      this.fileName = ""
    }
  }
}
</script>
<style lang="scss">
@import "../styles/app.scss";
</style>
