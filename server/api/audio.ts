import { SpeechClient } from '@google-cloud/speech'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const audioBase64 = body.audioBase64
  const storeId = body.storeId

  const asrClient = new SpeechClient()
  
  const request = {
    config: {
      encoding: 'MP3',
      sampleRateHertz: 16000,
      languageCode: 'cmn-CN',
    },
    audio: {
      content: audioBase64.replace(/^data:audio\/mp3;base64,/, ''),
    },
  }
  
  // Detects speech in the audio file
  const [response] = await asrClient.recognize(request)
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  
  const answerRes = await getAnswer(transcription, storeId)

  
  return {
    asrRes: transcription,
    ttsRes: answerRes?.answer || '',
    answerText: answerRes?.answerText || '',
  }
})
async function getAnswer(question: string, storeId: string) {
  return $fetch('/api/ask', {
    method: 'POST',
    body: {
      question,
      storeId,
    }
  })
}
