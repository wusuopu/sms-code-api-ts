import app from '../app';
import supertest from 'supertest';

describe('health check endpoint', () => {
  describe('GET /_health', () => {
    let request;
    beforeEach(() => {
      request = supertest(app);
    });
    it('should return ok', () => {
      return request.get('/_health')
        .expect(200)
        .then((res) => {
          const { result } = res.body
          expect(result).toEqual('ok')
        })
    })
  })
})
