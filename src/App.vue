<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
#app {
  height: calc(100vh);
  background-color: $bg-color-grey;
  div:first-child {
    padding: 0 get-vw(30px);
  }
}
</style>
