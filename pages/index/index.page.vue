<template>
  <h1>Hello from Vercel</h1>
  This page is:
  <ul>
    <li>Rendered to HTML.</li>
    <li>Interactive. <Counter /></li>
  </ul>
  <button @click="callTelefunc">Say hello to my little friend</button>
  <div>{{ messageFromServer }}</div>
</template>

<script setup>
import { ref } from 'vue'
import Counter from './Counter.vue'
import { helloWorld } from './index.telefunc';

const messageFromServer = ref('')

const callTelefunc = async () => {
  messageFromServer.value = await helloWorld('My little friend')
}
</script>
