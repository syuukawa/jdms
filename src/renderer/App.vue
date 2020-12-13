<template>
  <router-view />
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Source Sans Pro', sans-serif;
  height: 100%;
}

#app {
  background: radial-gradient(ellipse at center, rgba(229, 229, 229, 1) 40%, rgba(200, 200, 200, 0.9) 100%);
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}
</style>
