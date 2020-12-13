import jd from './main/api'

process.once('loaded', function() {
  // 这里 process 对象已经可用
  window.preload = {
    jd
  }
})
