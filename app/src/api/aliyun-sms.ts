import Core from '@alicloud/pop-core';
import _ from 'lodash';
import config from "@/config";

let client: Core

let extraParam
try {
  extraParam = JSON.parse(config.ALI_SMS_TEMPLATE_PARAM)
} catch (error) {
}
if (!_.isObject(extraParam)) {
  extraParam = {}
}

let extraParam2
try {
  extraParam2 = JSON.parse(config.ALI_SMS_TEMPLATE_PARAM2)
} catch (error) {
}
if (!_.isObject(extraParam2)) {
  extraParam2 = {}
}

/*
 * https://next.api.aliyun.com/api/Dysmsapi/2017-05-25/SendSms?params=%7B%22RegionId%22%3A%22cn-hangzhou%22%2C%22PhoneNumbers%22%3A%22%22%2C%22SignName%22%3A%22%22%2C%22TemplateCode%22%3A%22%22%7D&lang=NODEJS&sdkStyle=old
 * 手机号码格式：
 *  国内短信：+/+86/0086/86或无任何前缀的11位手机号码，例如1590000****。
 *  国际/港澳台消息：国际区号+号码，例如852000012****。
 */
const sendSMS = async (mobile: string, code: string, OutId?: string) => {
  if (config.SMS_SANDBOX) { return true }

  if (!_.startsWith(mobile, '+')) {
    // 默认为国内的号码
    mobile = `+86${mobile}`
  }

  let accessKeyId
  let accessKeySecret
  let SignName
  let TemplateCode
  let extra
  if (mobile.startsWith('+86')) {
    // 国内短信
    mobile = mobile.slice(3)
    accessKeyId = config.ALI_API_KEY
    accessKeySecret = config.ALI_API_SECRET
    SignName = config.ALI_SMS_SIGN
    TemplateCode = config.ALI_SMS_TEMPLATE
    extra = extraParam
  } else {
    // 国际/港澳台短信
    mobile = mobile.slice(1)
    accessKeyId = config.ALI_API_KEY2 || config.ALI_API_KEY
    accessKeySecret = config.ALI_API_SECRET2 || config.ALI_API_SECRET
    SignName = config.ALI_SMS_SIGN2
    TemplateCode = config.ALI_SMS_TEMPLATE2
    extra = extraParam2
  }

  const client = new Core({
    accessKeyId,
    accessKeySecret,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
  });
  const params = {
    PhoneNumbers: mobile,
    SignName,
    TemplateCode,
    TemplateParam: JSON.stringify(_.assign({}, extra, {
      code: code
    })),
    OutId,
  }

  console.log('params:', params)

  const ret = await client.request('SendSms', params, { method: 'POST' })
  return ret
}

export default {
  sendSMS,
}
