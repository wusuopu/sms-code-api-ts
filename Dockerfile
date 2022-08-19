FROM node:16.13-alpine

COPY ./app/package.json ./app/yarn.lock /app/
RUN cd /app && yarn install && rm -rf /root/.cache /root/.npm /usr/local/share/.cache/yarn/

COPY ./app/ /app
WORKDIR /app

RUN yarn build

VOLUME ["/app/tmp"]

ENV NODE_ENV=production \
    PORT=80 \
    STORAGE_PROVIDER=leveldb \
    LEVELDB_PATH=tmp/data.db \
    REDIS_UR=redis://redis:6379/1
    REDIS_KEY_PREFIX=sms-code-ts:
    ALI_API_KEY= \
    ALI_API_SECRET= \
    ALI_SMS_TEMPLATE= \
    ALI_SMS_SIGN= \
    ALI_API_KEY2= \
    ALI_API_SECRET2= \
    ALI_SMS_TEMPLATE2= \
    ALI_SMS_SIGN2= \
    # 腾讯云配置
    # 国内短信
    TENCENT_SMS_APP_ID= \
    TENCENT_SECRET_ID= \
    TENCENT_SECRET_KEY= \
    TENCENT_SMS_TEMPLATE= \
    TENCENT_SMS_SIGN= \
    TENCENT_SMS_TEMPLATE_PARAM_SET= \
    # 国际/港澳台短信
    TENCENT_SMS_APP_ID2= \
    TENCENT_SECRET_ID2= \
    TENCENT_SECRET_KEY2= \
    TENCENT_SMS_TEMPLATE2= \
    TENCENT_SMS_SIGN2= \
    TENCENT_SMS_TEMPLATE_PARAM_SET2= \
    SMS_PROVIDER= \
    SMS_MOCK_ACCOUNTS= \
    SMS_SANDBOX=false \
    SMS_TEMP_CODE= \
    SMS_DISABLED=false \
    SMS_TTL=600 \
    SMS_INTERVAL=60


CMD ["yarn", "start"]
