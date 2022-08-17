import express from 'express';
import * as health from './health'

export default {
  init (app: express.Application) {
    app.get('/_health', health.check)
  },
}
