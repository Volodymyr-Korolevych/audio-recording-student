<template>
        <v-card outlined="false">
          <v-card-title flat class="ma-3 text-h4 text-center d-block">
            Мої записи
          </v-card-title>
          <v-card-text v-if="files.length">
              <v-simple-table id="vtable">
                  <tbody>
                    <tr v-for="item in files" :key="item.audioName">
                      <td> {{ item.dayTime }} </td>
                      <td> {{ item.audioName }} </td>
                      <td> {{ item.dur }} </td>
                      <td>
                        <audio :src="item.src" @ended="endPlayback" />
                        <v-btn  @click="playRecord" title="Програвання файлу">
                          <img src="/img/play.png" alt="P" />
                        </v-btn>
                        <v-btn  @click="removeFile(item.src)" title="Вилучення файлу">
                          <img src="/img/remove.svg" alt="R" />
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
              </v-simple-table>
          </v-card-text>
          <v-card-title v-else class="ma-3 text-center d-block" >
            У вас немає збережених записів
          </v-card-title>
        </v-card>
</template>
<script>
import { eventBus } from  "../main.js"
import * as names from "../utils/audioNames.js"
import * as fetch from "../utils/jsFetch.js"

export default {
  data: () => ({
    files_list: [],
  }),
  async mounted() {
    this.files_list = await fetch.fetchRecords()
    eventBus.$on('files', (fileList) => { this.files_list = fileList })
  },
  computed: {
    files() {
      return this.files_list.length ? names.displayNames(this.files_list) : []
    }
  },
  methods: {
    async removeFile (fileName) {
      this.files_list = await fetch.removeAudioFile(fileName);
    },
    playRecord ({ currentTarget: btn }) {
      const audioEl = btn.previousElementSibling
      const img = btn.querySelector('img')
      if (audioEl.paused) {
        audioEl.play(), img.src = "img/pause.png"
      } else {
        audioEl.pause(), img.src = "img/play.png"
      }
    },
    endPlayback ({ currentTarget: audioEl }) {
      audioEl.nextElementSibling.querySelector('img').src = 'img/play.png'
    }
  }
}
</script>
<style lang="scss">
@import '../styles/app.scss';
</style>
