import Core from '@alicloud/pop-core';
import _ from 'lodash';
import config from "@/config";

let client: Core

let extraParam
try {
  extraParam = JSON.parse(process.env.ALIYUN_SMS_TEMPLATE_PARAM)
} catch (error) {
}
if (!_.isObject(extraParam)) {
  extraParam = {}
}

const sendSMS = async (mobile: string, code: string, OutId?: string) => {
  if (config.SMS_SANDBOX) { return true }

  if (!client) {
    client = new Core({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25'
    });
  }
  let params = {
    "PhoneNumbers": mobile,
    "SignName": process.env.ALIYUN_SMS_SIGN_NAME,
    "TemplateCode": process.env.ALIYUN_SMS_TEMPLATE_CODE,
    "TemplateParam": JSON.stringify(_.assign(extraParam, {
      code: code
    })),
    OutId,
  }

  let ret = await client.request('SendSms', params, { method: 'POST' })
  console.log(ret)
  return ret
}

export default {
  sendSMS,
}
