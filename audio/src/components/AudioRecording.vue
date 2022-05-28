<template>
  <v-container fluid style="width: 90vw">
    <v-row>
      <v-col cols="7">
        <v-card style="background: #1b347c">
          <v-card-title
            flat
            class="ma-3 text-h4 text-center"
            style="display: block"
            >Запис звуку</v-card-title
          >
          <v-card-title class="ma-3 text-center" style="display: block"
            >Натисніть кнопку, щоб розпочати</v-card-title
          >
          <v-card-text>
            <button class="btn" id="record_btn">
              <img src="/img/microphone.png" alt="record" />
            </button>
            <v-row id="record_box">
              <v-col>
                <v-card
                  elevation="4"
                  class="mx-auto"
                  max-width="344"
                  outlined
                  style="background: #1b347c"
                >
                  <v-card-title>Блок відтворення</v-card-title>
                  <v-card-text>
                    <div id="audio_box" ref="abox" height="800"></div>
                  </v-card-text>
                  <v-card-actions class="action_box flex-wrap">
                    <v-text-field
                      label="Вкажіть назву файлу"
                      style="width: 20vw"
                      id="fileName"
                    ></v-text-field>
                    <v-spacer />
                    <v-btn
                      class="btn_success mx-4"
                      id="save_btn"
                      style="background: white; color: black; font-weight: 600"
                      >Зберегти</v-btn
                    >
                    <v-btn class="btn_danger mx-4" id="remove_btn"
                      >Вилучити</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="5">
        <v-card style="background: #1b347c">
          <v-card-title
            flat
            class="ma-3 text-h4 text-center"
            style="display: block"
            >Мої записи</v-card-title
          >
          <div id="records_box" ref="rbox" style="align-items: center">
            <template v-if="files.length">
              <v-simple-table style="background: #1b347c; width: 100%">
                <template v-slot:default>
                  <tbody>
                    <tr v-for="(item, index) in files" :key="item.audioName">
                      <td style="width: 89px; font-size: small; padding: 0">
                        {{ item.day }}
                      </td>
                      <td style="width: 43%; text-align: left">
                        {{ item.audioName }}
                      </td>
                      <td style="width: 5%">{{ item.dur }}</td>
                      <td class="audio_item">
                        <audio
                          :src="item.src"
                          @ended="
                            ({ currentTarget }) => {
                              currentTarget.parentElement.querySelector(
                                'img'
                              ).src = 'img/play.png';
                            }
                          "
                        />
                        <button
                          class="btn"
                          @click="playRecord"
                          title="Програвання файлу"
                        >
                          <img src="/img/play.png" />
                        </button>
                        <button
                          class="btn"
                          @click="removeFile(index)"
                          title="Вилучення файлу"
                        >
                          <img src="/img/remove.png" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </template>
            <template v-else>
              <v-card-title class="ma-3 text-center"
                >У вас немає збережених записів</v-card-title
              >
            </template>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <footer />
  </v-container>
</template>
<script>
import moment from "moment";
moment.locale("uk");
export default {
  data: () => ({
    files_list: ["1653329498185-15-запис.mp3", "1653419329141-80-ще запис.mp3"],
    reload_needed: 1234,
  }),
  async mounted() {
    this.files_list = await this.fetchRecords();
    console.log("mounted", this.files_list);
    this.script(this);
  },
  computed: {
    files() {
      if (this.files_list.length) {
        return this.files_list.map((src) => {
          const [date, duration, audioName] = src
            .replace(".mp3", "")
            .split("-");
          const audioDate = new Date(+date).toLocaleString();
          const day = moment(audioDate).format("D MMM HH:mm");
          // const time = moment(audioDate).format("");
          const minutes = Math.floor(duration / 60);
          const seconds = duration - 60 * minutes;
          return {
            src,
            name: `${audioDate}${audioName ? ` - ${audioName}` : ""}`,
            audioName,
            day,
            // time,
            dur: minutes + ":" + seconds,
          };
        });
      } else return [];
    },
  },
  watch: {
    async reload_needed(o, n) {
      console.log("RELOAD NEEDED", o, n);
      this.reload_needed = 1;
      this.files_list = await this.fetchRecords();
      console.log(this.files_list);
    },
  },
  methods: {
    script(vm) {
      let chunks = [];
      let mediaRecorder = null;
      let audioBlob = null;
      const record_btn = document.querySelector("#record_btn");
      const remove_btn = document.querySelector("#remove_btn");
      const save_btn = document.querySelector("#save_btn");
      const audio_box = document.querySelector("#audio_box");
      const record_box = document.querySelector("#record_box");
      const fileName = document.querySelector("#fileName");
      let _vm = vm;

      console.log(_vm);

      const createEl = ({ tag = "div", children, ...attrs }) => {
        const el = document.createElement(tag);

        if (Object.keys(attrs).length > 0) {
          Object.entries(attrs).forEach(([attr, val]) => {
            el[attr] = val;
          });
        }
        if (children) {
          children.forEach((_el) => {
            el.append(createEl(_el));
          });
        }
        return el;
      };

      const toggleClass = (el, oldC, newC) => {
        el.classList.remove(oldC);
        el.classList.add(newC);
      };

      async function startRecord(event) {
        const recImg = event.target;

        console.log("startRecord:", event, _vm.$refs);

        if (!navigator.mediaDevices && !navigator.mediaDevices.getUserMedia) {
          return console.warn("Not supported");
        }
        // console.log("startRecord button pressed", mediaRecorder, mediaRecorder?.state)

        recImg.src = `img/${
          mediaRecorder && mediaRecorder.state === "recording"
            ? "microphone"
            : "stop"
        }.png`;

        if (!mediaRecorder) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            mediaRecorder.ondataavailable = (e) => {
              chunks.push(e.data);
            };
            mediaRecorder.onstop = mediaRecorderStop;
          } catch (e) {
            console.error(e);
            recImg.src = " img/microphone.png";
          }
        } else {
          mediaRecorder.stop();
        }
      }

      function mediaRecorderStop() {
        if (audio_box.children[0]?.localName === "audio") {
          audio_box.children[0].remove();
        }

        audioBlob = new Blob(chunks, { type: "audio/mp3" });
        const src = URL.createObjectURL(audioBlob);

        const audioEl = createEl({ tag: "audio", src, controls: true });

        audio_box.append(audioEl);
        toggleClass(record_box, "hide", "show");

        mediaRecorder = null;
        chunks = [];
      }

      async function saveRecord() {
        const formData = new FormData();
        const duration = Math.round(audio_box.children[0].duration);
        let audioName = fileName.value;
        audioName = audioName
          ? Date.now() + "-" + duration + "-" + audioName
          : Date.now() + "-" + duration + -+"аудіозапис";
        formData.append("audio", audioBlob, audioName);

        try {
          await fetch("/save", {
            method: "POST",
            body: formData,
          });
          console.log("Saved", _vm.reload_needed);
          _vm.reload_needed = 1000;
          console.log("Saved2", _vm.reload_needed);

          resetRecord();
        } catch (e) {
          console.error(e);
        }
      }

      function resetRecord() {
        toggleClass(record_box, "show", "hide");
        audioBlob = null;
      }

      function removeRecord() {
        if (confirm("Sure?")) {
          resetRecord();
        }
      }
      record_btn.onclick = startRecord;
      save_btn.onclick = saveRecord;
      remove_btn.onclick = removeRecord;
    },
    //--------------------------------------------------------
    async fetchRecords() {
      try {
        const files = await (await fetch("/records")).json();
        return files;
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    //--------------------------------------------------------
    playRecord({ currentTarget: playBtn }) {
      console.log("playRecord", playBtn);
      const audioEl = playBtn.previousElementSibling;

      if (audioEl.paused) {
        audioEl.play();
        playBtn.firstElementChild.src = "img/pause.png";
      } else {
        audioEl.pause();
        playBtn.firstElementChild.src = "img/play.png";
      }
    },
    async removeFile(ind) {
      const file_name = this.files_list[ind];
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: file_name }),
      };
      await fetch("/remove", requestOptions);
      console.log("removeFile done-1");
      // this.files_list = await this.fetchRecords();
      // console.log('removeFile done-2')
      this.reload_needed = 2000;
    },
  },
};
</script>
<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");

@mixin flex-center {
  display: flex;
  justify-content: left;
  align-items: center;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
}

body {
  @include flex-center;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;
}

main {
  flex: 1;
}

h1 {
  margin: 1rem 0;
  font-size: 1.8rem;
}

h2 {
  margin: 0.75rem 0;
  font-size: 1.4rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  outline: none;
  border-radius: 4px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  user-select: none;
  transition: 0.2s ease-in-out;

  &_success {
    background-color: #5cb85c;
  }
  &_danger {
    background-color: #d9534f;
  }
  &:hover {
    background-color: #5bc0de;
    color: #292b2c;
  }
}

#record_btn {
  width: 100px;
  border-radius: 15%;
}

img {
  width: 100%;
}

@keyframes show {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes hide {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

#record_box {
  opacity: 0;
}

.show {
  animation: show 0.4s linear forwards;
}

.hide {
  animation: hide 0.4s linear forwards;
}

.action_box {
  margin: 1rem 0;
}

#records_box {
  @include flex-center;
  flex-direction: column;
  align-items: flex-end;
}

.audio_item {
  margin: 0.5rem;
  justify-content: left;
  height: 40px;
  @include flex-center;

  .btn {
    @include flex-center;
    width: 50px;
    background-color: #0275d8;
    margin-right: 0.5rem;
  }
}

footer {
  margin: 0.5rem 0;
}
</style>