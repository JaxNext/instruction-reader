import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import fs from 'fs'
import path from 'path'

const config = useRuntimeConfig()
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 100,
})
// embedding
const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: config.GOOGLE_API_KEY
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const text = body.text
  let storeId = ''
  let errorMsg = ''
  try {
    const doc = await splitter.splitText(text)

    const store = await FaissStore.fromTexts(doc, [], embedder)

    const dirPath = `vectorStore`
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    const timestamp = Date.now()
    storeId = `store-${timestamp}`
    const storePath = path.resolve(`${dirPath}/${storeId}`)
    await store.save(storePath)
  } catch (error) {
    errorMsg = JSON.stringify(error)
  }

  return {
    storeId,
    errorMsg,
  }
})