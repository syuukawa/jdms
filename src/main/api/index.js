/**
 * 京东相关接口
 */
import request from 'request-promise'
import log from 'electron-log'
import URLS from './url'

const UserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
const ContentType = 'application/x-www-form-urlencoded'

/**
 * 查询登录状态及是否为京东plus会员
 * @param Cookie
 * @returns {Promise<{isLogin: boolean}|{isLogin: boolean, isPlusMember: boolean}>}
 */
async function cookieCheck(Cookie) {
  try {
    const data = await request({
      uri: URLS.checkAccount,
      headers: {
        Cookie,
        'User-Agent': UserAgent
      },
      json: true
    })
    log.info(`cookieCheck --> response:${data}`)
    return {
      isLogin: !!(data === true || data === false),
      isPlusMember: data === true
    }
  } catch (e) {
    return {
      isLogin: false
    }
  }
}

/**
 * 获取下单地址
 * @param Cookie
 * @param skuId
 * @returns {Promise<string>}
 */
async function getBuyUrl(Cookie, skuId) {
  const data = await request({
    uri: URLS.getBuyUrl,
    qs: {
      skuId,
      callback: 'callback',
      from: 'pc',
      _: Date.now()
    },
    headers: {
      Cookie,
      'User-Agent': UserAgent
    },
    json: true
  })
  log.info(`getBuyUrl --> response:${JSON.stringify(data)}`)
  return data
}

/**
 * 获取下单信息
 * @param Cookie
 * @param sku
 * @param num
 * @returns {Promise<any>}
 */
async function getBuyInfo(Cookie, sku, num) {
  const params = {
    sku,
    num,
    isModifyAddress: false
  }
  const data = await request({
    method: 'POST',
    uri: URLS.getBuyInfo,
    form: params,
    headers: {
      Cookie,
      'User-Agent': UserAgent
    }
  })
  log.info(`getBuyInfo --> sendParams:${JSON.stringify(params)}  response:${data}`)
  return JSON.parse(data)
}

async function killOrderSubmit(Cookie, skuId, num, buyInfo) {
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
  const data = await request({
    method: 'POST',
    uri: URLS.killOrderSubmit,
    body: params,
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      'Content-Type': ContentType
    },
    json: true
  })
  log.info(`orderSubmit --> sendParams:${JSON.stringify(params)}  response:${JSON.stringify(data)}`)
  return data
}

/**
 * 清空购物车
 * @param Cookie
 * @returns {Promise<any>}
 */
async function clearCart(Cookie) {
  const headers = {
    Cookie,
    'User-Agent': UserAgent
  }
  // 商品全选
  try {
    let selectResp = await request({
      uri: URLS.selectAll,
      headers
    })
    selectResp = JSON.parse(selectResp)
    if (!selectResp || !selectResp.sortedWebCartResult.success) {
      throw new Error('商品全选失败')
    }
    // 清空购物车
    let clearResp = await request({
      uri: URLS.clearAll,
      headers
    })
    clearResp = JSON.parse(clearResp)
    if (!clearResp || !clearResp.sortedWebCartResult.success) {
      throw new Error('清空购物车失败')
    }
  } catch (error) {
    throw new Error('清空购物车失败')
  }
}
/**
 * 添加商品到购物车
 * @param Cookie
 * @param sku
 * @param num
 * @returns {Promise<any>}
 */
async function addGoodsToCart(Cookie, skuId, num) {
  try {
    const params = {
      pid: skuId,
      pcount: num,
      ptype: 1
    }
    const data = await request({
      uri: URLS.addItem,
      qs: params,
      headers: {
        Cookie,
        'User-Agent': UserAgent,
        'Content-Type': ContentType
      },
      json: true
    })
    if (JSON.stringify(data).indexOf('商品已成功加入购物车') < 0) {
      throw new Error('加入购物车失败')
    }
    log.info(`addGoodsToCart --> sendParams:${JSON.stringify(params)}`)
  } catch (error) {
    log.info(`addGoodsToCart --> ${error.message}`)
  }
}

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
  // 提交订单
  await request({
    uri: URLS.getOrder,
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      'Content-Type': ContentType
    }
  })
  const data = await request({
    method: 'POST',
    uri: URLS.submitOrder,
    form: params,
    headers: {
      Cookie,
      'User-Agent': UserAgent,
      Host: 'trade.jd.com',
      Referer: 'http://trade.jd.com/shopping/order/getOrderInfo.action'
    }
  })
  log.info(`orderSubmit --> sendParams:${JSON.stringify(params)}  response:${data}`)
  return JSON.parse(data)
}

export default {
  cookieCheck,
  getBuyUrl,
  getBuyInfo,
  killOrderSubmit,
  clearCart,
  addGoodsToCart,
  orderSubmit
}
