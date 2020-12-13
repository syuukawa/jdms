<template>
  <div>
    <a-button type="primary" @click="showAddTask">
      添加任务
    </a-button>
    <a-button type="primary" class="mg-l10" @click="stopAll">
      停止所有任务
    </a-button>
    <a-list item-layout="horizontal" :data-source="taskList">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-list-item-meta
          :description="`${item.account.name}, $${item.buyInfo.skuPrice}, 定时：${formatDate(item.startTime)}`"
        >
          <a slot="title">{{ item.buyInfo.skuName }}</a>
          <a-avatar slot="avatar" :src="`http://img13.360buyimg.com/n5/${item.buyInfo.skuImgUrl}`" />
        </a-list-item-meta>
        <a slot="actions" @click="createOrders(item)">开抢</a>
        <a slot="actions" @click="stopTask(item.pinId)">停止</a>
        <a slot="actions" @click="deleteTask(item.taskId)">删除</a>
      </a-list-item>
    </a-list>
    <AddTask ref="addTask" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import AddTask from './modal/AddTask'

const jd = window.preload.jd

export default {
  name: 'Task',
  components: {
    AddTask
  },
  data() {
    return {
      timers: []
    }
  },
  computed: {
    ...mapGetters('task', ['taskList'])
  },
  activated() {
    this.$store.dispatch('task/checkTaskList')
  },
  methods: {
    showAddTask() {
      this.$refs.addTask.show()
    },
    async createOrders({ account, skuId, buyNum, taskType, isSetTime, startTime }) {
      if (!taskType) {
        this.$Message.info('商品类型有误')
        return
      }
      this.$notification.open({
        message: '开始抢购',
        description: `账号${account.name}已开始抢购`,
        duration: 1
      })
      try {
        await jd.clearCart(account.cookie)
        await jd.addGoodsToCart(account.cookie, skuId, buyNum)
      } catch (error) {
        this.$message.info(error.message)
        return
      }
      let task = setInterval(() => {
        if (!isSetTime || (isSetTime && +Date.now() >= +startTime)) {
          this.createOrder(account, skuId, buyNum, taskType)
        } else {
          this.$message.info('定时执行中，还未到时间')
        }
      }, 1000)
      this.timers.push({
        pinId: account.pinId,
        task
      })
    },
    async createOrder(account, skuId, buyNum, taskType) {
      let submitResult = ''
      if (taskType === 1) {
        submitResult = await jd.orderSubmit(account.cookie)
      } else {
        const buyInfo = await jd.getBuyInfo(account.cookie, skuId, buyNum)
        submitResult = await jd.killOrderSubmit(account.cookie, skuId, buyNum, buyInfo)
      }
      if (submitResult && submitResult.success) {
        this.stopTask(account.pinId)
        this.$notification.open({
          message: `恭喜,账号「${account.name}」已抢到`,
          description: '此账号不再参与本轮抢购~',
          duration: 1
        })
      } else if (submitResult && submitResult.message) {
        this.$message.info(submitResult.message)
      } else {
        this.$message.info('抢购失败，还未到时间')
      }
    },
    stopAll() {
      for (let i = 0; i < this.timers.length; i++) {
        let task = this.timers[i].task
        clearInterval(task)
      }
      this.timers = []
    },
    stopTask(pinId) {
      for (let i = 0; i < this.timers.length; i++) {
        if (this.timers[i].pinId === pinId) {
          clearInterval(this.timers[i].task)
          this.timers.splice(i, 1)
          break
        }
      }
    },
    deleteTask(id) {
      this.$store.commit('task/REMOVE', id)
    },
    formatDate(value) {
      if (!value) {
        return '-'
      }
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  destroyed() {
    this.stopAll()
    this.$message.info('定时器已全部清空')
  }
}
</script>
