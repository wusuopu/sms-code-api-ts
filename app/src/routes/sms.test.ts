import sinon from 'sinon'
import supertest from 'supertest';
import app from '../app';
import config from '@/config'
import SMSCode from '@/utils/code'
import cache from '@/utils/cache'
import aliyunSms from '@/api/aliyun-sms';
import tencentSms from '@/api/tencent-sms';

describe('sms endpoint', () => {
  let request: supertest.SuperTest<any>;
  const test_mobile = '13112345678'
  const mobile1 = '13112345679'
  const mobile2 = '13212345679'
  beforeAll(async () => {
    request = supertest(app);
    config.SMS_MOCK_ACCOUNTS = {[test_mobile]: '123456'}
    config.SMS_SANDBOX = true
    await SMSCode.clearTimestamp(mobile1)
    await SMSCode.clearTimestamp(mobile2)
  });

  describe('POST /v1/sms/send', () => {
    beforeEach(async () => {
      await cache.del(mobile1)
    })

    it('禁止发送短信时返回 500 ', async () => {
      const oldValue = config.SMS_DISABLED
      config.SMS_DISABLED = true
      await request.post('/v1/sms/send').expect(500)
      config.SMS_DISABLED = oldValue
    })
    it('手机号码无效时返回 400', async () => {
      await request.post('/v1/sms/send').expect(400)
    })
    it('provider 参数无效时返回 500', async () => {
      const oldValue = config.SMS_PROVIDER
      config.SMS_PROVIDER = ''
      config.SMS_SANDBOX = false

      await request.post('/v1/sms/send?provider=abcd')
        .send({mobile: mobile1})
        .expect(500)

      config.SMS_PROVIDER = oldValue
      config.SMS_SANDBOX = true
    })
    it('测试账号不发送短信，返回 200', async () => {
      const oldValue = config.SMS_PROVIDER
      config.SMS_PROVIDER = 'aliyun'
      const spy = sinon.spy(aliyunSms, 'sendSMS')

      await request.post('/v1/sms/send')
        .send({mobile: test_mobile})
        .expect(200)

      expect(spy.called).toBeFalsy()    // 没有发送短信
      config.SMS_PROVIDER = oldValue
      spy.restore()
    })
    it('发送太频繁时返回 500', async () => {
      const oldValue = config.SMS_PROVIDER
      config.SMS_PROVIDER = 'aliyun'
      const spy = sinon.spy(aliyunSms, 'sendSMS')

      await SMSCode.clearTimestamp(mobile2)
      await SMSCode.generateCode(mobile2)
      await request.post('/v1/sms/send')
        .send({mobile: mobile2})
        .expect(500)

      expect(spy.called).toBeFalsy()    // 没有发送短信
      config.SMS_PROVIDER = oldValue
      spy.restore()
    })
    it('发送失败时返回 500', async () => {
      const stub = sinon.stub(aliyunSms, 'sendSMS')
      stub.rejects()      // 发送出错

      await SMSCode.clearTimestamp(mobile1)
      await request.post('/v1/sms/send')
        .send({mobile: mobile1})
        .expect(500)

      expect(stub.called).toBeTruthy()    // 有调用发送有函数
      stub.restore()
    })
    it('使用指定的短信服务', async () => {
      const stub = sinon.stub(tencentSms, 'sendSMS')
      stub.resolves()       // 发送成功

      await SMSCode.clearTimestamp(mobile1)
      await request.post('/v1/sms/send?provider=tencent')
        .send({mobile: mobile1})
        .expect(200)

      expect(stub.called).toBeTruthy()    // 有调用发送有函数
      stub.restore()
    })
    it('发送成功时返回 200', async () => {
      const stub = sinon.stub(aliyunSms, 'sendSMS')
      stub.resolves()       // 发送成功

      await SMSCode.clearTimestamp(mobile1)
      await request.post('/v1/sms/send')
        .send({mobile: mobile1})
        .expect(200)

      expect(stub.called).toBeTruthy()    // 有调用发送有函数
      stub.restore()
    })
  })

  describe('POST /v1/sms/check', () => {
    beforeEach(async () => {
      await cache.del(mobile1)
    })

    it('手机号码无效时返回 400', async () => {
      await request.post('/v1/sms/check').expect(400)
    })
    it('验证码为空时返回 400', async () => {
      await request.post('/v1/sms/check')
        .send({mobile: mobile1})
        .expect(400)
    })
    it('测试账号验证码不正确时返回 400', async () => {
      await request.post('/v1/sms/check')
        .send({mobile: test_mobile, code: 'abcd'})
        .expect(400)
    })
    it('使用测试账号验证', async () => {
      await request.post('/v1/sms/check')
        .send({mobile: test_mobile, code: '123456'})
        .expect(200)

      // 验证码不正确
      await request.post('/v1/sms/check')
        .send({mobile: test_mobile, code: 'abcdef'})
        .expect(400)
    })
    it('禁止发送短信时使用测试验证码', async () => {
      const oldValue = config.SMS_DISABLED
      config.SMS_DISABLED = true
      config.SMS_TEMP_CODE = '321654'
      await request.post('/v1/sms/check')
        .send({mobile: mobile1, code: config.SMS_TEMP_CODE})
        .expect(200)
      config.SMS_DISABLED = oldValue
    })
    it('验证码不正确时返回 400', async () => {
      await request.post('/v1/sms/check')
        .send({mobile: mobile1, code: 'abcdefg'})
        .expect(400)
    })
    it('验证码正确时返回 200', async () => {
      await SMSCode.clearTimestamp(mobile2)
      const code = await SMSCode.generateCode(mobile2)
      await request.post('/v1/sms/check')
        .send({mobile: mobile2, code})
        .expect(200)
    })
  })
})
