import log from 'electron-log'

export const getRandomArbitrary = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

export const handleResponse = (resp) => {
  const { body, statusCode, request } = resp
  log.info(`接口 ${request.href} 请求结果：${statusCode}`)
  let result = parseJson(body)
  try {
    result = JSON.parse(result)
    if (result && result.sortedWebCartResult) {
      result = result.sortedWebCartResult.success
    }
    log.info('response result:', result)
  } catch (error) {
    log.info('response body is not JSON.')
    return body
  }
  return result
}

function parseJson(body) {
  if (typeof body === 'string') {
    const match = body.match(/\{(.*)\}/)
    return match.length ? match[0] : body
  }
  return body
}
