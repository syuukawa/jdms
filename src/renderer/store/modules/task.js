import Vue from 'vue'

const jd = window.preload.jd

const state = {
  /**
   * 任务列表
   * @property skuId
   * @property taskType
   * @property isSetTime
   * @property startTime
   * @property buyNum
   * @property buyInfo
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
  SAVE_OR_UPDATE(state, { skuId, taskType, isSetTime, startTime, buyNum, detail }) {
    const origin = state.task[skuId]
    let params = { skuId, taskType, isSetTime, startTime, buyNum, detail }
    params.skuId = skuId || origin.skuId
    params.taskType = taskType || origin.taskType
    params.buyNum = buyNum || origin.buyNum
    params.detail = detail || origin.detail
    if (isSetTime === undefined) {
      params.isSetTime = origin.isSetTime
    }
    if (params.isSetTime) {
      params.startTime = startTime || origin.startTime
    }
    Vue.set(state.task, skuId, params)
  },
  REMOVE(state, skuId) {
    Vue.delete(state.task, skuId)
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
  async addTask({ commit }, { skuId, taskType, isSetTime, startTime, buyNum }) {
    const detail = await jd.getItemInfo(skuId)
    commit('SAVE_OR_UPDATE', {
      skuId,
      taskType,
      isSetTime,
      startTime,
      buyNum,
      detail
    })
  },
  /**
   * 更新商品信息
   * @param state
   * @param commit
   * @returns {Promise<void>}
   */
  async checkTaskList({ state, commit }) {
    for (const key in state.task) {
      // eslint-disable-next-line no-prototype-builtins
      if (state.task.hasOwnProperty(key)) {
        const detail = await jd.getItemInfo(key)
        if (res.seckillSkuVO) {
          commit('SAVE_OR_UPDATE', {
            skuId: key,
            detail
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
