<template>
  <OperateBtn
    ref="audioBtn"
    text="Press to ask"
    bg="rgb(34 197 94)" />
</template>

<script setup lang="ts">
import Recorder from 'recorder-core/recorder.mp3.min'
import { useMousePressed } from '@vueuse/core'

const emit = defineEmits(['change', 'tts'])

const storeId = inject('storeId')
const audioBtn = ref<HTMLElement | null>(null)
const { pressed } = useMousePressed({
  target: audioBtn
})

const recorder = ref<typeof Recorder | null>(null)
const localUrl = ref('')
const recording = ref(false)
const resAudio = ref('')

watchEffect(() => {
  if (!pressed.value) {
    if (!recording.value) return
    stopRecord()
  } else {
    if (recording.value) return
    
    startRecord()
  }
})
async function initRecorder() {
  recorder.value = Recorder({
    type: 'mp3',
    sampleRate: 16000,
    bitRate:16,
    onProcess: function(buffers: any, powerLevel: number, bufferDuration: number, bufferSampleRate: number, newBufferIdx: number, asyncEnd: boolean) {}
  })
  return new Promise((resolve, reject) => {
    recorder.value.open(resolve, function (msg: string, isUserNotAllow: boolean) {
      reject(new Error(msg))
    })
  })
}

async function uploadAudio(blob: Blob) {
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  await new Promise((resolve) => {
    reader.onload = async () => {
      const res = await $fetch('/api/chatV2/audio', {
        method: 'POST',
        body: {
          audioBase64: reader.result,
          storeId: storeId.value
        }
      })
      const resBase64 = res.ttsRes
      if (!resBase64) return
      resAudio.value = `data:audio/mp3;base64,${resBase64}`
      emit('tts', {
        audio: resAudio.value,
        asrText: res.asrRes,
        answerText: res.answerText
      })
    }
  })
}

async function startRecord() {
  recording.value = true

  if (!recorder.value) {
    try {
      await initRecorder()
    } catch (error) {
      console.log('Recording Error', error);
      return
    }
  }

  recorder.value.start()
}

function stopRecord() {
  recording.value = false
  recorder.value.stop(function(blob: Blob, duration: number) {
    localUrl.value = (window.URL || webkitURL).createObjectURL(blob)
    emit('change', localUrl.value)
    uploadAudio(blob)
    recorder.value.close()
    recorder.value = null
  }, function (msg: string) {
    recorder.value.close()
    recorder.value = null
  })
}


</script>

<style scoped>

</style>