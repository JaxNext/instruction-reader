<template>
  <button
    :class="`opt-btn inline-flex items-center gap-x-2 rounded-lg px-3.5 py-2.5 text-center text-sm font-medium text-slate-50 focus:outline-none focus:ring w-[60vw] justify-center bg-indigo-600`"
    :style="`background-color: ${bg}`"
  >
    <div>{{ text }}</div>
    
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  text: String,
  bg: String
})
</script>

<style scoped>
.opt-btn {
  user-select: none;
}
</style>