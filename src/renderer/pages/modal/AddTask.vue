<template>
  <a-modal title="添加任务" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel">
    <a-form-model ref="form" :model="formParams" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item label="抢购类型">
        <a-select v-model="formParams.taskType">
          <a-select-option :value="1">预约抢购</a-select-option>
          <a-select-option :value="2">秒杀商品</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-item label="定时">
        <a-switch v-model="formParams.isSetTime" />
      </a-form-item>
      <a-form-item v-if="formParams.isSetTime" label="抢购时间">
        <a-date-picker
          v-model="formParams.startTime"
          show-time
          type="date"
          placeholder="选择抢购时间"
          style="width: 100%;"
        />
      </a-form-item>
      <a-form-item label="商品ID">
        <a-input v-model="formParams.skuId" />
      </a-form-item>
      <a-form-item label="购买数量">
        <a-input-number :min="1" v-model="formParams.buyNum" />
      </a-form-item>
    </a-form-model>
  </a-modal>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'AddTask',
  data() {
    return {
      visible: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      formParams: {
        taskType: 1,
        isSetTime: true,
        startTime: null,
        skuId: '',
        buyNum: 1
      },
      formRules: {
        taskType: [{ required: true, message: '必填' }],
        skuId: [{ required: true, message: '必填' }]
      },
      confirmLoading: false
    }
  },
  computed: {
    ...mapGetters('user', ['accountList'])
  },
  methods: {
    handleOk() {
      this.confirmLoading = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$store.dispatch('task/addTask', this.formParams)
          this.$message.success('任务已添加！')
          this.handleCancel()
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.$refs.form.resetFields()
      this.hide()
    },
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    }
  }
}
</script>
