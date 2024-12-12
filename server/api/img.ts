import { ImageAnnotatorClient } from '@google-cloud/vision'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const imgBase64 = body.imgBase64
  let ocrResText = ''
  let storeId = ''
  let errorMsg = ''
  try {
    const imgPath = await base64ToImg(imgBase64)
    const client = new ImageAnnotatorClient()
    
    const [result] = await client.textDetection(imgPath)
    
    const detections = result.textAnnotations

    const ocrResArray: string[] = []
    detections?.forEach(text => {
      console.log(text.description);
      ocrResArray.push(text.description ?? '')
    })
    ocrResText = ocrResArray.join('\n')
    
    const vecRes = await vectorizeDoc(ocrResText)
    storeId = vecRes.storeId
  } catch (error) {
    errorMsg = JSON.stringify(error)
  }

  return {
    ocrRes: ocrResText,
    storeId,
    errorMsg,
  }
})
function base64ToImg(imgBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const imgType = imgBase64.split(';')[0].split('/')[1]
    const imgData = imgBase64.split(';base64,').pop()
    const imgName = `img_${Date.now()}.${imgType}`
    const dirPath = `OCR`
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    const imgPath = path.resolve(`${dirPath}/${imgName}`)
    
    fs.writeFileSync(imgPath, imgData, {encoding: 'base64'})
    resolve(imgPath)
  })
}

async function vectorizeDoc(text:string) {
  return $fetch('/api/vector', {
    method: 'POST',
    body: {
      text
    }
  })
}