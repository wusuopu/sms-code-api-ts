// https://cloud.tencent.com/document/product/382/43197#.E5.8F.91.E9.80.81.E7.9F.AD.E4.BF.A1
import * as tencentcloud from 'tencentcloud-sdk-nodejs'
import _ from 'lodash'
import config from "@/config";

const SmsClient = tencentcloud.sms.v20210111.Client;

const client = new SmsClient({
  // SecretId、SecretKey 查询: https://console.cloud.tencent.com/cam/capi
  credential: {
    secretId: config.TENCENT_SECRET_ID,
    secretKey: config.TENCENT_SECRET_KEY,
  },
  /* 必填：地域信息，可以直接填写字符串ap-guangzhou，支持的地域列表参考 https://cloud.tencent.com/document/api/382/52071#.E5.9C.B0.E5.9F.9F.E5.88.97.E8.A1.A8 */
  region: "ap-guangzhou",
  profile: {
    /* SDK默认用TC3-HMAC-SHA256进行签名，非必要请不要修改这个字段 */
    signMethod: "HmacSHA256",
    httpProfile: {
      /* SDK默认使用POST方法。
       * 如果你一定要使用GET方法，可以在这里设置。GET方法无法处理一些较大的请求 */
      reqMethod: "POST",
      /* SDK有默认的超时时间，非必要请不要进行调整
       * 如有需要请在代码中查阅以获取最新的默认值 */
      reqTimeout: 30,
      /**
       * 指定接入地域域名，默认就近地域接入域名为 sms.tencentcloudapi.com ，也支持指定地域域名访问，例如广州地域的域名为 sms.ap-guangzhou.tencentcloudapi.com
       */
      endpoint: "sms.tencentcloudapi.com"
    },
  },
});


const sendSMS = (mobile: string, code: string, SessionContext = "") => {
  if (config.SMS_SANDBOX) { return true }

  if (!_.startsWith(mobile, '+')) {
    // 默认为国内的号码
    mobile = `+86${mobile}`
  }
  /* 帮助链接：
   * 短信控制台: https://console.cloud.tencent.com/smsv2
   * 腾讯云短信小助手: https://cloud.tencent.com/document/product/382/3773#.E6.8A.80.E6.9C.AF.E4.BA.A4.E6.B5.81 */
  const params = {
    /* 短信应用ID: 短信SmsSdkAppId在 [短信控制台] 添加应用后生成的实际SmsSdkAppId，示例如1400006666 */
    // 应用 ID 可前往 [短信控制台](https://console.cloud.tencent.com/smsv2/app-manage) 查看
    SmsSdkAppId: config.TENCENT_SMS_APP_ID,
    /* 短信签名内容: 使用 UTF-8 编码，必须填写已审核通过的签名 */
    // 签名信息可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-sign) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-sign) 的签名管理查看
    SignName: config.TENCENT_SMS_SIGN,
    /* 模板 ID: 必须填写已审核通过的模板 ID */
    // 模板 ID 可前往 [国内短信](https://console.cloud.tencent.com/smsv2/csms-template) 或 [国际/港澳台短信](https://console.cloud.tencent.com/smsv2/isms-template) 的正文模板管理查看
    TemplateId: config.TENCENT_SMS_TEMPLATE,
    /* 模板参数: 模板参数的个数需要与 TemplateId 对应模板的变量个数保持一致，若无模板参数，则设置为空 */
    TemplateParamSet: [code],
    /* 下发手机号码，采用 e.164 标准，+[国家或地区码][手机号]
     * 示例如：+8613711112222， 其中前面有一个+号 ，86为国家码，13711112222为手机号，最多不要超过200个手机号*/
    PhoneNumberSet: [mobile],
    /* 用户的 session 内容（无需要可忽略）: 可以携带用户侧 ID 等上下文信息，server 会原样返回 */
    SessionContext,
    /* 短信码号扩展号（无需要可忽略）: 默认未开通，如需开通请联系 [腾讯云短信小助手] */
    ExtendCode: "",
    /* 国际/港澳台短信 senderid（无需要可忽略）: 国内短信填空，默认未开通，如需开通请联系 [腾讯云短信小助手] */
    SenderId: "",
  }
  // 通过 client 对象调用想要访问的接口，需要传入请求对象以及响应回调函数
  return new Promise((resolve, reject) => {
    client.SendSms(params, function (err, response) {
      // 请求异常返回，打印异常信息
      if (err) {
        reject(err)
        return;
      }
      resolve(response)
    });
  })
}

export default {
  sendSMS,
}
