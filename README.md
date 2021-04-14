# dcard-hw
### Use the Sliding Window and Redis to implement the reate limiting.
We can create a record for every ip and time slot(every minutes) in Redis. After we receive a request, we increase the count of the current time slot by Redis INCR command. Then we calcuate both current and previous time slot with a weight to smooth out the bursts of traffic. For example, we have 10 requests in time slot for 10:00 and 20 requests in time slot for 10:01. Next, we receive a request at 10:01:20. We consider that the request count would be 10 * (40/60) + 20 * (20/60). We can set the TTL to every Redis records to delete the expired records automatically.

### How to run the UT
```
npm install
npm test
```

### How to run the service
```
npm install --only=prod
REDIS_HOST=[address to Redis] npm start
```
