import Vue from 'vue'

const jd = window.preload.jd

const state = {
  /**
   * 任务列表
   * @property taskId
   * @property pinId
   * @property skuId
   * @property taskType
   * @property isSetTime
   * @property startTime
   * @property buyNum
   * @property buyInfo
   * @property account
   */
  task: {}
}
const getters = {
  taskList: (state) => {
    let result = []
    for (const key in state.task) {
      // eslint-disable-next-line no-prototype-builtins
      if (state.task.hasOwnProperty(key)) {
        result.push(state.task[key])
      }
    }
    return result
  }
}
const mutations = {
  SAVE_OR_UPDATE(state, { taskId, pinId, skuId, taskType, isSetTime, startTime, buyNum, buyInfo, account }) {
    const origin = state.task[taskId]
    let params = { taskId, pinId, skuId, taskType, isSetTime, buyNum, buyInfo, account }
    params.pinId = pinId || origin.pinId
    params.skuId = skuId || origin.skuId
    params.taskType = taskType || origin.taskType
    params.buyNum = buyNum || origin.buyNum
    params.buyInfo = buyInfo || origin.buyInfo
    params.account = account || origin.account
    if (isSetTime === undefined) {
      params.isSetTime = origin.isSetTime
    }
    if (params.isSetTime) {
      params.startTime = startTime || origin.startTime
    }
    Vue.set(state.task, taskId, params)
  },
  REMOVE(state, taskId) {
    Vue.delete(state.task, taskId)
  },
  CLEAR_ALL(state) {
    state.task = {}
  }
}

const actions = {
  /**
   * 添加任务
   * @param commit
   * @param form
   * @returns {Promise<void>}
   */
  async addTask({ commit, rootGetters }, { pinId, skuId, taskType, isSetTime, startTime, buyNum }) {
    const account = rootGetters['user/accountList'].find((item) => item.pinId === pinId)
    let res = await jd.getBuyInfo(account.cookie, skuId, buyNum)
    if (res.seckillSkuVO) {
      const taskId = `${pinId}-${skuId}`
      commit('SAVE_OR_UPDATE', {
        taskId,
        pinId,
        skuId,
        taskType,
        isSetTime,
        startTime,
        buyNum,
        buyInfo: res.seckillSkuVO,
        account
      })
    }
  },
  /**
   * 更新商品信息
   * @param state
   * @param commit
   * @returns {Promise<void>}
   */
  async checkTaskList({ state, commit, rootGetters }) {
    for (const key in state.task) {
      // eslint-disable-next-line no-prototype-builtins
      if (state.task.hasOwnProperty(key)) {
        const task = state.task[key]
        const account = rootGetters['user/accountList'].find((item) => item.pinId === task.pinId)
        let res = await jd.getBuyInfo(account.cookie, task.skuId, task.buyNum)
        if (res.seckillSkuVO) {
          commit('SAVE_OR_UPDATE', {
            taskId: key,
            buyInfo: res.seckillSkuVO,
            account
          })
        }
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
