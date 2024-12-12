<template>
    <div class="chat-page w-full h-full box-border p-[20px] bg-[#020617] pb-[0px] overflow-y-scroll">
      <div v-if="img" class="img-box h-auto w-full rounded-lg bg-slate-300 bg-cover bg-center shadow-md relative max-425 mx-auto">
        <img :src="img" class="w-full h-auto" />
        <div v-if="scanLoading" class="scaning-cover w-full h-full absolute top-0 left-0"></div>
        <div v-if="scanLoading" class="scaning-line w-full h-[6px] absolute top-0 left-0"></div>
      </div>
       <div class="msg-list max-425 mx-auto mt-[24px]">
        <MsgItem
          v-for="(item, index) in msgList"
          :key="index"
          :info="item"
          class="msg-item" />
        <div
          ref="msgLoadingRef"
          :class="['msg-loading pb-[240px]', { 'opacity-0': !msgLoading }]">
          <div class='flex space-x-2 justify-center items-center bg-transparent'>
            <span class='sr-only'>Loading...</span>
              <div class='h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
            <div class='h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
            <div class='h-2 w-2 bg-green-500 rounded-full animate-bounce'></div>
          </div>
        </div>
       </div>
    </div>
    <BottomFixBar>
      <div :class="['xxx', { 'hide-while-loading': scanLoading }]">
        <ImgInput
          v-if="!ocrText"
          @change="handleImgChange"
          @ocr="handleOcrRes" />
      </div>
      <AudioRecorder
        v-if="ocrText && !scanLoading"
        :class="[{ 'hide-while-loading': msgLoading }]"
        @change="handleAudioChange"
        @tts="handleTtsRes" />
    </BottomFixBar>
  </template>
  
  <script setup lang="ts">
  const img = ref('')
  const ocrText = ref('')
  const msgLoadingRef = ref<HTMLElement | null>(null)
  
  type MsgItem = {
    audio: string
    me: boolean
  }
  const msgList: Ref<MsgItem[]> = ref([])
  const msgRefs = ref<HTMLElement[]>([])
  const msgLoading = ref(false)
  const scanLoading = ref(false)
  const storeId = ref('')
  provide('storeId', storeId)
  function handleImgChange(imgBase64:string) {
    scanLoading.value = true
    img.value = imgBase64
  }
  function handleOcrRes(res) {
    const { ocrRes, storeId: sId } = res
    ocrText.value = ocrRes
    storeId.value = sId
    scanLoading.value = false
  }
  function handleTtsRes({ audio, asrText, answerText }) {
    if (asrText) {
      const lastMsg = msgList.value[msgList.value.length - 1]
      lastMsg.audioText = asrText
    }
    msgList.value.push({ audio, me: false, audioText: answerText })
    msgLoading.value = false
    scrollToTail()
  }
  function handleAudioChange(audio: string) {
    msgList.value.push({ audio, me: true })
    msgLoading.value = true
    scrollToTail()
  }
  function scrollToTail() {
    if (!msgLoadingRef.value) return
    msgLoadingRef.value.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
  </script>
  
  <style scoped>
  .max-425 {
    max-width: 425px;
  }
  .scaning-cover {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .scaning-line {
    background: linear-gradient(to bottom, transparent, rgba(34, 197, 94, 1));
    background: linear-gradient(0);
    animation: scaning 2s infinite;
  }
  .hide-while-loading {
    opacity: 0;
    z-index: -1;
  }
  @keyframes scaning {
    0% {
      top: 0;
    }
    100% {
      top: 100%;
    }
  }
  </style>