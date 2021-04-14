const request = require('supertest')
const faker = require('faker')
jest.mock('../util/redis')
const redis = require('../util/redis')

const app = require('../app')

test('Should get the request count if the request is not over the limitation', async () => {
  const count = faker.datatype.number(59)
  redis.incrAsync.mockResolvedValue(count)
  redis.getAsync.mockResolvedValue(undefined)
  const res = await request(app).get('/')
  expect(res.statusCode).toBe(200)
  expect(res.body).toBe(count)
})

test('Should get the request count if the request is over the limitation but the current slot has a smaller portion', async () => {
  const count = 70
  redis.incrAsync.mockResolvedValue(count)
  redis.getAsync.mockResolvedValue(undefined)
  jest.spyOn(Date.prototype, 'getUTCSeconds').mockReturnValue(faker.datatype.number(6))
  const res = await request(app).get('/')
  expect(res.statusCode).toBe(200)
  expect(res.body).toBe(count)
})

test('Should return error if the request is over the limitation in current time slot and current slot has a larger portion', async () => {
  const count = 70
  redis.incrAsync.mockResolvedValue(count)
  redis.getAsync.mockResolvedValue(undefined)
  jest.spyOn(Date.prototype, 'getUTCSeconds').mockReturnValue(60 - faker.datatype.number(6))
  const res = await request(app).get('/')
  expect(res.statusCode).toBe(200)
  expect(res.body).toBe('Error')
})

test('Should return error if the request is over the limitation in previous time slot and previous slot has a larger portion', async () => {
  const count = 70
  redis.incrAsync.mockResolvedValue(1)
  redis.getAsync.mockResolvedValue(count)
  jest.spyOn(Date.prototype, 'getUTCSeconds').mockReturnValue(faker.datatype.number(6))
  const res = await request(app).get('/')
  expect(res.statusCode).toBe(200)
  expect(res.body).toBe('Error')
})

test('Should return error if the request is over the limitation in both current and previous time slot', async () => {
  const curCount = faker.datatype.number() + 60
  const preCount = curCount
  redis.incrAsync.mockResolvedValue(curCount)
  redis.getAsync.mockResolvedValue(preCount)
  const res = await request(app).get('/')
  expect(res.statusCode).toBe(200)
  expect(res.body).toBe('Error')
})
