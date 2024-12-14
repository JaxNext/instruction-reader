import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import fs from 'fs'
import util from 'util'
import path from 'path'

const speecher = new TextToSpeechClient()
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const text = body.text

  const request = {
    input: { text },
    voice: {
      languageCode: 'cmn-CN',
      ssmlGender: 'FEMALE',
      name: 'cmn-CN-Standard-A',
    },
    audioConfig: { audioEncoding: 'MP3' },
  }
  
  const [response] = await speecher.synthesizeSpeech(request);

  const dirPath = `TTS`
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const fileName = `tts_${Date.now()}.mp3`
  const filePath = path.resolve(`${dirPath}/${fileName}`)
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(filePath, response.audioContent, 'binary');
  
  const fileBuffer = fs.readFileSync(filePath)
  const audio = Buffer.from(fileBuffer).toString('base64')

  return audio
})
