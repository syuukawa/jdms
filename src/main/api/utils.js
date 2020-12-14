import log from 'electron-log'

export const getRandomArbitrary = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

export const handleResponse = (resp) => {
  const { body, statusCode, request } = resp
  log.info(`接口 ${request.href} 请求结果：${statusCode}`)
  let result = handleHTMLString(body)
  try {
    result = JSON.parse(result)
    if (result && result.sortedWebCartResult) {
      result = result.sortedWebCartResult.success
    }
    log.info('response result:', result)
  } catch (error) {
    log.info('response body is not JSON.')
  }
  return result
}

function parseJson(body) {
  const match = body.match(/\{(.*)\}/)
  log.info('match', match)
  return match.length ? match[0] : body
}

function handleHTMLString(body) {
  if (typeof body === 'string') {
    if (body.indexOf('<!DOCTYPE html>') > -1) {
      if (body.indexOf('<div class="login-wrap">') > -1) {
        log.error('登录过期，请重新登录')
        return JSON.stringify({
          success: false,
          message: '登录过期，请重新登录'
        })
      }
      if (body.indexOf('<title>商品已成功加入购物车</title>' > -1)) {
        const success = body.indexOf('<b class="succ-icon"></b>') > -1
        return JSON.stringify({
          success,
          message: success ? '商品已成功加入购物车' : '添加购物车失败,请返回重试'
        })
      }
    }
    return parseJson(body)
  }
  return body
}
