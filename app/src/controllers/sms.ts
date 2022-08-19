import { Request, Response } from 'express';
import _ from 'lodash';
import aliyunSms from '@/api/aliyun-sms';
import tencentSms from '@/api/tencent-sms';
import SMSCode from '@/utils/code';
import logger from '@/utils/logger';
import config from '@/config'

const smsProviders = {
  aliyun: aliyunSms,
  tencent: tencentSms,
}

export default {
  async send (req: Request, res: Response) {
    if (config.SMS_DISABLED) {
      return res.status(500).json({errors: ['验证码服务暂停'], success: false});
    }

    if (!req.body.mobile?.startsWith('+') && !req.body.mobile?.match(/^1\d{10}$/)) {
      return res.status(400).json({errors: ['电话号码格式不对'], success: false});
    }

    if (config.SMS_MOCK_ACCOUNTS[req.body.mobile]) {
      // 测试账号不发送短信
      return res.status(200).json({success: true});
    }

    const smsProvider = _.get(smsProviders, req.query.provider as string, smsProviders[config.SMS_PROVIDER])
    if (!smsProvider && !config.SMS_SANDBOX) {
      return res.status(500).json({errors: ['短信服务无效'], success: false});
    }

    const code = await SMSCode.generateCode(req.body.mobile)
    logger.info(`[send] mobile ${req.body.mobile} code: ${code}`)
    await smsProvider?.sendSMS(req.body.mobile, code)
    return res.status(200).json({success: true});
  },
  async check (req: Request, res: Response) {
    if (!req.body.mobile?.startsWith('+') && !req.body.mobile?.match(/^1\d{10}$/)) {
       return res.status(400).json({errors: ['电话号码格式不对'], success: false});
    }
    if (!req.body.code) {
      return res.status(400).json({errors: ['验证码不能为空'], success: false})
    }

    if (config.SMS_MOCK_ACCOUNTS[req.body.mobile]) {
      // 测试账号验证
      if (config.SMS_MOCK_ACCOUNTS[req.body.mobile] === req.body.code) {
        return res.status(200).json({success: true});
      } else {
        return res.status(400).json({errors: ['验证码不正确'], success: false});
      }
    }

    if ( config.SMS_DISABLED && (config.SMS_TEMP_CODE === req.body.code)) {
      // 使用测试验证码
      return res.status(200).json({success: true});
    }

    const ret = await SMSCode.verifyCode(req.body.mobile, req.body.code)
    if (!ret) {
      // 验证码不正确
      return res.status(400).json({errors: ['验证码不正确'], success: false});
    }
    return res.status(200).json({success: true});
  },
}
