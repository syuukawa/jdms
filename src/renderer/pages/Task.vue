<template>
  <div>
    <a-button type="primary" @click="showAddTask">
      添加任务
    </a-button>
    <a-button type="primary" class="mg-l10" @click="clearAll">
      删除所有任务
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
        <a-button
          v-if="isTaskRunning(item.skuId)"
          type="link"
          size="small"
          slot="actions"
          @click="stopTaskBySku(item.skuId)"
        >
          停止
        </a-button>
        <a-button v-else type="link" size="small" slot="actions" @click="createOrders(item)">
          开抢
        </a-button>
        <a-button type="link" size="small" slot="actions" @click="deleteTask(item.skuId)">删除</a-button>
      </a-list-item>
    </a-list>
    <AddTask ref="addTask" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import AddTask from './modal/AddTask'
// import log from 'electron-log'
const jd = window.preload.jd
// 抢购提示语
const NOTIFIACTION = {
  1: '该商品是预约抢购商品，需要自行加入到购物车，并确保购物车里不含其他可提交商品',
  2: '该商品是秒杀商品，会自动提交订单'
}

export default {
  name: 'Task',
  components: {
    AddTask
  },
  data() {
    return {
      timers: [],
      actions: new Map([
        [1, 'orderSubmit'],
        [2, 'killOrderSubmit']
      ])
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
      this.$notification.open({
        message: '开始抢购',
        description: NOTIFIACTION[taskType],
        placement: 'bottomRight'
      })
      // 所有账号都加入抢购
      this.accountList.map((account) => {
        let task = setInterval(() => {
          if (!isSetTime || (isSetTime && +Date.now() >= +new Date(startTime))) {
            this.createOrder(account, skuId, buyNum, taskType)
            return
          }
          this.$message.info(`账号${account.name}抢购中，还未到抢购时间`)
        }, 1000)
        this.timers.push({
          pinId: account.pinId,
          skuId,
          task
        })
      })
    },
    async createOrder(account, skuId, buyNum, taskType) {
      const buyInfo = await jd.getBuyInfo(account.cookie, skuId, buyNum)
      const submitResult = await jd[this.actions.get(taskType)](account.cookie, skuId, buyNum, buyInfo)
      if (submitResult && submitResult.success) {
        this.stopTaskByAccount(account.pinId, skuId)
        this.$notification.open({
          message: `恭喜,账号「${account.name}」已抢到`,
          description: '此账号不再参与本轮抢购~',
          placement: 'bottomRight'
        })
      } else if (submitResult && submitResult.resultCode === 600158) {
        this.stopTaskBySku(skuId)
        this.$notification.open({
          message: `商品库存已空，无法继续抢购`,
          description: '已清除当前任务相关的定时器',
          placement: 'bottomRight'
        })
      } else {
        this.$message.info(submitResult.message)
      }
    },
    stopAll() {
      this.timers.map((timer) => {
        clearInterval(timer.task)
      })
      this.timers = []
    },
    stopTaskByAccount(pinId, skuId) {
      this.timers = this.timers.filter((timer) => {
        if (timer.pinId === pinId && timer.skuId === skuId) {
          clearInterval(timer.task)
          return false
        }
        return true
      })
    },
    stopTaskBySku(skuId) {
      this.timers = this.timers.filter((timer) => {
        if (timer.skuId === skuId) {
          clearInterval(timer.task)
          return false
        }
        return true
      })
    },
    deleteTask(skuId) {
      this.stopTaskBySku(skuId)
      this.$store.commit('task/REMOVE', skuId)
    },
    clearAll() {
      this.$store.commit('task/CLEAR_ALL')
    },
    formatDate(value) {
      if (!value) {
        return '-'
      }
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    },
    isTaskRunning(skuId) {
      return this.timers.some((timer) => timer.skuId === skuId)
    }
  },
  destroyed() {
    this.stopAll()
    this.$message.info('定时器已全部清空')
  }
}
</script>
