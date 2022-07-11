import moment from "moment"
moment.locale("uk")

// this module is responsible for audio files naming on the server side:
// part 1 - dateTime
// part 2 - duration (in secs)
// part 3 - given name (if name is ommitted, it will substituted by 'аудіозапис')
// Parts are split by ' - '  

export const displayNames = (fileList) => {
  return fileList.map((fileName) => {
    const [date, duration, audioName] = fileName.replace(".mp3", "").split("-")
    const audioDate = new Date(+date);
    const dayTime = moment(audioDate.toISOString()).format("D MMM HH:mm")
    const minutes = Math.floor(duration / 60)
    const seconds = duration - 60 * minutes
    return {
        src: fileName,
        name: `${audioDate}${audioName ? ` - ${audioName}` : ""}`,
        audioName,
        dayTime,
        dur: minutes + ":" + seconds
    }
  })
}

export const formatName = (fileName, duration) => {
  return fileName
    ? Date.now() + "-" + duration + "-" + fileName.replaceAll('-', '_')
    : Date.now() + "-" + duration + " - аудіозапис"
}
