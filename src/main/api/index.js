/**
 * 京东相关接口
 */
import request from 'request-promise'
import URLS from './url'
import { handleResponse, getRandomArbitrary } from './utils'
import log from 'electron-log'

const UserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
const ContentType = 'application/x-www-form-urlencoded'

/**
 * 查询登录状态及是否为京东plus会员
 * @param Cookie
 * @returns {Promise<{isLogin: boolean}|{isLogin: boolean, isPlusMember: boolean}>}
 */
function cookieCheck(Cookie) {
  return request({
    uri: URLS.CHECK_ACCOUNT,
    headers: {
      Cookie,
      'User-Agent': UserAgent
    },
    json: true,
    resolveWithFullResponse: true
  }).then((resp) => {
    const body = handleResponse(resp)
    return {
      isLogin: !!(body === true || body === false),
      isPlusMember: body === true
    }
  })
}

/**
 * 获取下单信息
 * @param Cookie
 * @param sku
 * @param num
 * @returns {Promise<any>}
 */
function getBuyInfo(Cookie, sku, num) {
  const params = {
    sku,
    num,
    isModifyAddress: false
  }
  return request({
    method: 'POST',
    uri: URLS.GET_BUY_INFO,
    form: params,
    headers: {
      Cookie,
      'User-Agent': UserAgent
    },
    resolveWithFullResponse: true
  }).then((resp) => {
    return handleResponse(resp)
  })
}

/**
 * TODO: 没有试验成功过，需要修改
 * 提交秒杀订单
 * @param Cookie
 * @param skuId
 * @param num
 * @param buyInfo
 * @returns {Promise<any>}
 */
function killOrderSubmit(Cookie, skuId, num, buyInfo) {
  const params = {
    skuId,
    num,
    addressId: buyInfo['addressList'][0]['id'],
    yuShou: true,
    isModifyAddress: false,
    name: buyInfo['addressList'][0]['name'],
    provinceId: buyInfo['addressList'][0]['provinceId'],
    cityId: buyInfo['addressList'][0]['cityId'],
    countyId: buyInfo['addressList'][0]['countyId'],
    townId: buyInfo['addressList'][0]['townId'],
    addressDetail: buyInfo['addressList'][0]['addressDetail'],
    mobile: buyInfo['addressList'][0]['mobile'],
    mobileKey: buyInfo['addressList'][0]['mobileKey'],
    email: buyInfo['addressList'][0]['email'],
    postCode: buyInfo['addressList'][0]['postCode'],
    invoiceTitle: buyInfo['invoiceInfo']['invoiceTitle'],
    invoiceCompanyName: '',
    invoiceContent: buyInfo['invoiceInfo']['invoiceContentType'],
    invoiceTaxpayerNO: '',
    invoiceEmail: buyInfo['invoiceInfo']['invoiceEmail'],
    invoicePhone: buyInfo['invoiceInfo']['invoicePhone'],
    invoicePhoneKey: buyInfo['invoiceInfo']['invoicePhoneKey'],
    invoice: true,
    password: '',
    codTimeType: 3,
    paymentType: 4,
    areaCode: '',
    overseas: 0,
    phone: '',
    eid: '',
    fp: '',
    token: buyInfo['token'],
    pru: ''
  }
  return request({
    method: 'POST',
    uri: URLS.KILL_ORDER_SUBMIT,
    form: params,
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      'Content-Type': ContentType
    },
    resolveWithFullResponse: true
  }).then((resp) => {
    return handleResponse(resp)
  })
}

/**
 * 全选购物车中的商品
 * @param Cookie
 * @returns {Promise<any>}
 */
function selectAllCart(Cookie) {
  return request({
    uri: URLS.SELECT_ALL,
    headers: {
      Cookie,
      'User-Agent': UserAgent
    },
    resolveWithFullResponse: true
  }).then((resp) => {
    const result = handleResponse(resp)
    if (result && result.sortedWebCartResult) {
      return result.sortedWebCartResult.success
    }
    return false
  })
}

/**
 * 清空购物车
 * @param Cookie
 * @returns {Promise<any>}
 */
function clearCart(Cookie) {
  return request({
    uri: URLS.CLEAR_ALL,
    headers: {
      Cookie,
      'User-Agent': UserAgent
    },
    resolveWithFullResponse: true
  }).then((resp) => {
    const result = handleResponse(resp)
    if (result && result.sortedWebCartResult) {
      return result.sortedWebCartResult.success
    }
    return false
  })
}

/**
 * 添加商品到购物车
 * @param Cookie
 * @param skuId
 * @param num
 * @returns {Promise<any>}
 */
async function addGoodsToCart(Cookie, skuId, num) {
  return request({
    uri: URLS.ADD_ITEM,
    qs: {
      pid: skuId,
      pcount: num,
      ptype: 1
    },
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      'Content-Type': ContentType
    },
    json: true,
    resolveWithFullResponse: true
  }).then((resp) => {
    const html = handleResponse(resp)
    return html.indexOf('成功') > -1
  })
}

/**
 * 提交订单（当前购物车内所有商品）
 * @param Cookie
 * @returns {Promise<any>}
 */
async function orderSubmit(Cookie) {
  const params = {
    overseaPurchaseCookies: '',
    vendorRemarks: '[]',
    'submitOrderParam.sopNotPutInvoice': 'false',
    'submitOrderParam.trackID': 'TestTrackId',
    'submitOrderParam.ignorePriceChange': '0',
    'submitOrderParam.btSupport': '0',
    'submitOrderParam.jxj': '1'
  }
  // 请求结算页面
  await request({
    uri: URLS.GET_ORDER,
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      'Content-Type': ContentType
    },
    resolveWithFullResponse: true
  })
  // 提交订单
  return request({
    method: 'POST',
    uri: URLS.SUBMIT_ORDER,
    form: params,
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      Host: 'trade.jd.com',
      Referer: 'http://trade.jd.com/shopping/order/getOrderInfo.action'
    },
    resolveWithFullResponse: true
  }).then((resp) => {
    return handleResponse(resp)
  })
}

/**
 * 请求商品详情页
 * @param skuId
 * @returns {Promise<any>}
 */
function getItemInfo(skuId) {
  return request({
    uri: `https://item.jd.com/${skuId}.html`,
    headers: {
      'User-Agent': UserAgent
    },
    resolveWithFullResponse: true
  }).then((resp) => {
    const html = handleResponse(resp)
    const name = html.match(/name: '(.*)'/)[1]
    const imageSrc = html.match(/src: '(.*)'/)[1]
    const easyBuyUrl = html.match(/easyBuyUrl:"(.*)"/)[1]
    const cat = html.match(/cat: \[(.*)\]/)[1]
    const venderId = html.match(/venderId:(\d*)/)[1]
    log.info('name', name)
    log.info('imageSrc', imageSrc)
    log.info('easyBuyUrl', easyBuyUrl)
    log.info('cat', venderId)
    log.info('venderId', venderId)
    return {
      name,
      imageSrc,
      easyBuyUrl,
      cat,
      venderId
    }
  })
}

/**
 * 查询某个商品的库存
 * @param skuId
 * @param buyNum
 * @param buyInfo
 * @returns {Promise<any>}
 */
async function getItemStock(skuId, buyNum, buyInfo) {
  // 请求商品详情页
  const { cat, venderId } = await getItemInfo(skuId)
  const area = `${buyInfo['addressList'][0]['provinceId']}_${buyInfo['addressList'][0]['cityId']}_${buyInfo['addressList'][0]['countyId']}_${buyInfo['addressList'][0]['townId']}`
  return request({
    uri: URLS.GET_ITEM_STOCK,
    qs: {
      skuId,
      buyNum,
      area,
      ch: 1,
      callback: `jQuery${getRandomArbitrary(1000000, 9999999)}`,
      _: +new Date(),
      extraParam: '{"originid":"1"}',
      cat,
      venderId
    },
    headers: {
      'User-Agent': UserAgent,
      Referer: `https://item.jd.com/${skuId}.html`
    },
    resolveWithFullResponse: true
  }).then((resp) => {
    const result = handleResponse(resp)
    if (result && result.stock) {
      const skuState = result.stock.skuState // 商品是否上架
      const StockState = result.stock.StockState // 商品库存状态：33 -- 现货  0,34 -- 无货  36 -- 采购中  40 -- 可配货
      return skuState === 1 && [33, 40].includes(StockState)
    }
    return false
  })
}

/**
 * 查询京东服务器时间
 * @returns {Promise<any>}
 */
function getServerTime() {
  return request({
    uri: URLS.GET_SERVER_TIME,
    resolveWithFullResponse: true
  }).then((resp) => {
    return handleResponse(resp)
  })
}

export default {
  cookieCheck,
  getBuyInfo,
  killOrderSubmit,
  selectAllCart,
  clearCart,
  addGoodsToCart,
  orderSubmit,
  getItemInfo,
  getItemStock,
  getServerTime
}
