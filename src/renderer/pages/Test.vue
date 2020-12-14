<template>
  <div>
    <a-button type="primary" @click="test">Test</a-button>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

const jd = window.preload.jd

export default {
  name: 'Test',
  data() {
    return {}
  },
  computed: {
    ...mapGetters('user', ['accountList'])
  },
  created() {},
  methods: {
    async test() {
      try {
        const account = this.accountList[0]
        const buyInfo = await jd.getBuyInfo(account.cookie, 100014568588, 1)
        const data = await jd.getItemStock(100014568588, 1, buyInfo)
        console.log(data)
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
