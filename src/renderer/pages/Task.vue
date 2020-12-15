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
        <a-list-item-meta :description="`定时：${formatDate(item.startTime)} , 购买数量：${item.buyNum}`">
          <a slot="title">{{ item.detail.name }}</a>
          <a-avatar slot="avatar" :src="`//img13.360buyimg.com/n1/${item.detail.imageSrc}`" />
        </a-list-item-meta>
        <a slot="actions" @click="createOrders(item)">开抢</a>
        <a slot="actions" @click="deleteTask(item.skuId)">删除</a>
      </a-list-item>
    </a-list>
    <AddTask ref="addTask" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import AddTask from './modal/AddTask'
import log from 'electron-log'
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
    ...mapGetters('user', ['accountList']),
    ...mapGetters('task', ['taskList'])
  },
  activated() {
    this.$store.dispatch('task/checkTaskList')
  },
  methods: {
    showAddTask() {
      this.$refs.addTask.show()
    },
    async createOrders({ skuId, buyNum, taskType, isSetTime, startTime }) {
      if (!taskType) {
        this.$Message.info('商品类型有误')
        return
      }
      const description =
        taskType === 1
          ? '该商品是预约抢购商品，需要自行加入到购物车，并确保购物车里不含其他可提交商品'
          : '该商品是秒杀商品，会自动提交订单'
      this.$notification.open({
        message: '开始抢购',
        description
      })
      // 所有账号都加入抢购
      this.accountList.map((account) => {
        let task = setInterval(() => {
          if (!isSetTime || (isSetTime && +Date.now() >= +new Date(startTime))) {
            this.createOrder(account, skuId, buyNum, taskType)
          } else {
            log.info(`账号${account.name}抢购中...，还未到抢购时间`)
            this.$message.info(`账号${account.name}抢购中...，还未到抢购时间`)
          }
        }, 1000)
        this.timers.push({
          pinId: account.pinId,
          task
        })
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
        log.info(`账号${account.name}已抢到，此账号不再参与本轮抢购`)
        this.$notification.open({
          message: `恭喜,账号「${account.name}」已抢到`,
          description: '此账号不再参与本轮抢购~'
        })
      } else if (submitResult && submitResult.resultCode === 600158) {
        this.$message.info(submitResult.message)
        this.stopTask(account.pinId)
      } else {
        this.$message.info(submitResult.message)
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
