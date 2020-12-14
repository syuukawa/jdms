<template>
  <a-layout class="layout">
    <a-layout-header class="layout__header">
      <a-menu
        :selectedKeys="[currentMenu]"
        mode="horizontal"
        theme="dark"
        :style="{ lineHeight: '64px' }"
        @click="handleMenuClick"
      >
        <a-menu-item key="account">
          <a-icon type="user" />
          <span>账号管理</span>
        </a-menu-item>
        <a-menu-item key="task">
          <a-icon type="profile" />
          <span>任务管理</span>
        </a-menu-item>
        <a-menu-item key="test">
          <a-icon type="profile" />
          <span>接口测试</span>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content class="pd-30">
      <div class="layout__main">
        <keep-alive>
          <router-view />
        </keep-alive>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script>
export default {
  name: 'Main',
  computed: {
    currentMenu() {
      return this.$route.name
    }
  },
  methods: {
    handleMenuClick({ key }) {
      console.log(key)
      this.$router.push({ name: key })
    }
  }
}
</script>
<style lang="less" scoped>
.layout {
  width: 100%;
  height: 100%;

  &__main {
    background: #fff;
    padding: 15px;
    width: 100%;
    height: 100%;
  }
}
</style>
