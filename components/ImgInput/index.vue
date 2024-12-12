<template>
  <label for="img-input" class="inline-flex items-center gap-x-2 rounded-lg px-3.5 py-2.5 text-center text-sm font-medium text-slate-50 focus:outline-none focus:ring w-[60vw] justify-center bg-indigo-600">
    Send an image
  </label>
  <input
    id="img-input"
    type="file"
    accept="image/*"
    class="opacity-0 w-0 h-0"
    @change="handleImgChange" />
</template>

<script setup lang="ts">
const emit = defineEmits(['change', 'ocr'])

function fileToBase64(file: File) {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  return new Promise((resolve) => {
    reader.onload = () => {
      resolve(reader.result)
    }
  })
}
async function handleImgChange(e: Event) {
  const files = (e.target as HTMLInputElement).files as FileList
  if (!files?.[0]) return
  
  const imgBase64 = await fileToBase64(files[0])
  
  uploadImg(imgBase64 as string)
}
async function uploadImg(imgBase64: string) {
  emit('change', imgBase64)
  const res = await $fetch('/api/chatV2/img', {
    method: 'POST',
    body: {
      imgBase64
    }
  })
  emit('ocr', res)
}
</script>

<style scoped>

</style>