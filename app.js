const express = require('express')
const Promise = require('bluebird')
const redis = require('./util/redis')
const constants = require('./util/constants')

const app = express()
const port = 3000

app.use((req, res, next) => {
  const ip = req.ip
  const now = new Date()
  const pre = new Date(now - 60000)
  const keyGen = (d) => `${ip}-${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${d.getUTCHours()}-${d.getUTCMinutes()}`
  const curKey = keyGen(now)
  const preKey = keyGen(pre)
  const ratio = now.getUTCSeconds() / 60

  return Promise.all([
    redis.incrAsync(curKey),
    redis.getAsync(preKey)
  ])
    .spread((curVal, preVal) => {
      const curCount = parseInt(curVal || '0')
      const preCount = parseInt(preVal || '0')
      res.json((curCount * ratio + preCount * (1 - ratio) > constants.RATE_LIMIT) ? 'Error' : curCount)
      if (curCount === 1) redis.expireAsync(curKey, constants.REDIS_TTL)
      next()
    })
    .tapCatch((err) => {
      console.log(err)
    })
})

app.use((err, req, res, next) => {
  res.status(400).send(err.message)
})

app.get('/', (req, res) => {
})

module.exports = app
