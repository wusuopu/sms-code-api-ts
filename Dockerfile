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
    REDIS_UR =redis://redis:6379/1
    REDIS_KEY_PREFIX=sms-code-ts:
    ALI_API_KEY= \
    ALI_API_SECRET= \
    ALI_SMS_TEMPLATE= \
    ALI_SMS_SIGN= \
    ALI_API_KEY2= \
    ALI_API_SECRET2= \
    ALI_SMS_TEMPLATE2= \
    ALI_SMS_SIGN2= \
    TENCENT_API_KEY= \
    TENCENT_API_SECRET= \
    TENCENT_SMS_TEMPLATE= \
    TENCENT_SMS_SIGN= \
    TENCENT_API_KEY2= \
    TENCENT_API_SECRET2= \
    TENCENT_SMS_TEMPLATE2= \
    TENCENT_SMS_SIGN2= \
    SMS_PROVIDER= \
    SMS_MOCK_ACCOUNTS= \
    SMS_SANDBOX=false \
    SMS_TTL=600 \
    SMS_INTERVAL=60


CMD ["yarn", "start"]
