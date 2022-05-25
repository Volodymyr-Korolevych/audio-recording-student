<template>
  <v-container fluid style="width: 90vw">
    <header>
      <h1>Record App</h1>
    </header>
    <v-row>
      <v-col cols="6">
        <button class="btn" id="record_btn">
          <img src="/img/microphone.png" alt="record" />
        </button>
        <section id="record_box">
          <h2>My Record</h2>
          <div id="audio_box" ref="abox"></div>
          <div class="action_box">
            <button class="btn btn_success" id="save_btn">Save</button>
            <button class="btn btn_danger" id="remove_btn">Remove</button>
          </div>
        </section>
      </v-col>

      <v-col cols="6">
        <section>
          <h2>My Records</h2>
          <div id="records_box" ref="rbox">
            <template v-if="files.length">
              <div
                v-for="(file, index) in files"
                :key="index"
                style="display: flex; width: max-content; flex-wrap: wrap"
              >
                <div class="audio_item">
                  <p>{{ file.name }}</p>

                  <audio
                    :src="file.src"
                    @ended="
                      ({ currentTarget }) => {
                        currentTarget.parentElement.querySelector('img').src =
                          'img/play.png';
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
                </div>
              </div>
            </template>
            <div v-else>
              <p>No records. Create one</p>
            </div>
          </div>
        </section>
      </v-col>
    </v-row>
    <footer />
  </v-container>
</template>
<script>
export default {
  data: () => ({
    files_list: ["1653329498185-запис.mp3", "1653419329141-ще запис.mp3"],
    reload_needed: 1234,
  }),
  async mounted() {
    this.files_list = await this.fetchRecords();
    console.log(this.files_list);
    this.script(this);
  },
  computed: {
    files() {
      if (this.files_list.length) {
        return this.files_list.map((src) => {
          const [date, audioName] = src.replace(".mp3", "").split("-");
          const audioDate = new Date(+date).toLocaleString();
          return {
            src,
            name: `${audioDate}${audioName ? ` - ${audioName}` : ""}`,
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
        let audioName = prompt("Name?");
        audioName = audioName ? Date.now() + "-" + audioName : Date.now();
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
      await fetch("/remove", requestOptions)
      console.log('removeFile done-1')
      // this.files_list = await this.fetchRecords();
      // console.log('removeFile done-2')
      this.reload_needed = 2000
    },
  },
};
</script>
<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");

$primary: #0275d8;
$success: #5cb85c;
$info: #5bc0de;
$danger: #d9534f;
$dark: #292b2c;
$light: #f7f7f7;

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
  color: $dark;
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
    background-color: $success;
  }
  &_danger {
    background-color: $danger;
  }
  &:hover {
    background-color: $info;
    color: $dark;
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
    background-color: $primary;
    margin-right: 0.5rem;
  }
}

footer {
  margin: 0.5rem 0;
}
</style>