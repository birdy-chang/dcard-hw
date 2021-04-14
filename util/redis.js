const Promise = require('bluebird')

const env = process.env.NODE_ENV || 'dev'
const host = process.env.REDIS_HOST || '127.0.0.1'

const redis = Promise.promisifyAll(require('redis'))
const client = redis.createClient({host})
client.on('error', function(error) {
  console.error(error);
})
if (env === 'test') client.end(true) // disconnect with server since we will mock redis functions for UT

module.exports = client
