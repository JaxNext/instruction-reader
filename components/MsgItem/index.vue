<template>
  <div :class="['flex items-start my-[26px]', { 'flex-row-reverse': me }]">
    <img
      :class="['h-[48px] w-[48px] rounded-full', me ? 'ml-2' : 'mr-2']"
      :src="avtImg"
    />
    <div
      :class="['flex flex-col rounded-b-xl w-full max-w-[425px] text-white', me ? 'rounded-tl-xl items-end' : 'rounded-tr-xl items-start']"
    >
      <div :class="['audio-bar w-full flex', me ? 'justify-end' : '']">
        <audio
          class="w-[85%] h-[48px]"
          :src="info.audio"
          controls></audio>
      </div>
      <div
        v-if="info.audioText"
        :class="['mt-[8px] flex w-[85%] rounded-b-xl bg-slate-50 p-4 bg-slate-800 sm:min-h-0 sm:max-w-md md:max-w-2xl', me ? 'rounded-tl-xl' : 'rounded-tr-xl']"
      >
        <p>{{ info.audioText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
})
const me = computed(() => props.info.me)
const avtImg = computed(() => {
  return me.value ? './images/me.jpg' : './images/tong.jpeg'
})
watchEffect(() => {
  if (props.info.audio && !props.info.me) {
    const audio = new Audio(props.info.audio)
    audio.play()
  }
})
</script>

<style scoped>

</style>