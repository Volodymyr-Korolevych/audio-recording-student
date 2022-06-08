import express from 'express'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { unlinkSync, promises as pfs } from 'fs'
import multer from 'multer'

const __dirname = dirname(fileURLToPath(import.meta.url))

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/')
    },
    filename(req, file, cb) {
      cb(null, `${file.originalname}.mp3`)
    }
  })
})
const app = express()
app.use(express.json())
app.use(express.static('audio/dist'))
app.use(express.static('uploads'))

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(200)
})

app.post('/save', upload.single('audio'), (req, res) => {
  res.sendStatus(201)
})

app.get('/records', async (req, res) => {
  try {
    console.log('/records')
    let files = await pfs.readdir(`${__dirname}/uploads`)
    res.status(200).json(files)
  } catch (e) {
    console.log(e)
  }
})

app.post('/remove', async (req, res) => {
  const file = req.body.file
  console.log('server/remove', file)
  const filePath = `${__dirname}/uploads/${file}`
  await unlinkSync(filePath)
  res.sendStatus(201)
})


const port = process.env.PORT || 8082
const host = '0.0.0.0'
app.listen(port, host, () => {
  console.log('🚀')
})
