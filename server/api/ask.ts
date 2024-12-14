import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import path from 'path'
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables"
import { formatDocumentsAsString } from "langchain/util/document";

const config = useRuntimeConfig()
const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: config.GOOGLE_API_KEY
})
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash",
  temperature: 0,
  apiKey: config.GOOGLE_API_KEY
})
const parser = new StringOutputParser()

function genPrompt() {
  return ChatPromptTemplate.fromMessages([
    ['system', `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.`],
    ['placeholder', '{context}'],
    ['user', '{question}']
  ])
}

async function toSpeech(text: string) {
  return $fetch('/api/tts', {
    method: 'POST',
    body: {
      text,
    }
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { question, storeId } = body
  
  let errorMsg = ''
  let answer = ''
  let output = ''
  try {
    const dirPath = path.resolve(`vectorStore/${storeId}`)

    const store = await FaissStore.load(dirPath, embedder)
    const retriever = store.asRetriever({ k: 1, searchType: "similarity" });
    
    const prompt = genPrompt()
    const ragChain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      parser,
    ])
    output = await ragChain.invoke(question)

    answer = await toSpeech(output)

  } catch (error) {
    errorMsg = JSON.stringify(error)
  }

  return {
    answer,
    answerText: output,
    errorMsg,
  }
})