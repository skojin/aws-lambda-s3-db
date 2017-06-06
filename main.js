const https = require('https')
const querystring = require('querystring')

const BUCKET = process.env.BUCKET;
if (BUCKET) {
  AWS = require('aws-sdk');
  s3 = new AWS.S3();
}


function route(event, context, keyword_handler_map) {
  for (var keyword in keyword_handler_map) {
    if (event.path.indexOf(`/${keyword}/`) === 0) {
      var key = event.path.substring(keyword.length + 2);
      return keyword_handler_map[keyword](event, context, key)
    }
  }
  console.log("unknown route, event:", event);
  context.fail('unknown route')
}

function setValue(event, context, key) {
  var value = (event.queryStringParameters || {}).v || event.body
  s3.putObject({
    Bucket: BUCKET,
    Key: key,
    Body: value,
    ContentType: 'text/plain'
  }, function (err) {
    if (err) {
      console.log("Error SET object " + key + " from bucket " + BUCKET);
      context.fail('fail')
    } else {
      returnSucceed(context, 'ok')
    }
  });
}

function getValue(event, context, key) {
  s3.getObject({ Bucket: BUCKET, Key: key }, function (err, data) {
    if (err) {
      context.succeed({
        statusCode: 404,
        headers: { 'Content-Type': 'text/plain' },
        body: ''
      })
    } else {
      returnSucceed(context, data.Body.toString())
    }
  });
}

function deleteObj(event, context, key) {
  s3.deleteObject({ Bucket: BUCKET, Key: key }, function (err, data) {
    if (err) {
      context.fail('fail')
    } else {
      returnSucceed(context, 'ok')
    }
  });
}

function addValue(event, context, key) {
  var value = (event.queryStringParameters || {}).v || event.body
  var itemKey = key + '/' + (new Date()).getTime()
  s3.putObject({
    Bucket: BUCKET,
    Key: itemKey,
    Body: value,
    ContentType: 'text/plain'
  }, function (err) {
    if (err) {
      console.log("Error SET object " + key + " from bucket " + BUCKET);
      context.fail('fail')
    } else {
      returnSucceed(context, 'ok')
    }
  });
}

function getListKeys(event, context, key) {
  s3.listObjectsV2({ Bucket: BUCKET, Prefix: key }, function (err, data) {
    if (err) {
      context.fail(err)
    } else {
      var keys = data.Contents.map(i => i.Key)
      returnSucceed(context, JSON.stringify(keys))
    }
  })
}

function getList(event, context, key) {
  s3.listObjectsV2({ Bucket: BUCKET, Prefix: key }, function (err, data) {
    if (err) {
      context.fail(err)
    } else {
      var resultHash = {}
      var left = data.Contents.length
      if( left === 0 ){
        return returnSucceed(context, JSON.stringify([]))
      }
      data.Contents.forEach(function (obj) {
        s3.getObject({ Bucket: BUCKET, Key: obj.Key }, function (err, data) {
          left--;
          if (!err) {
            resultHash[obj.Key] = data.Body.toString()
            if (left === 0) {
              var result = []
              for (var kk in resultHash) {
                result.push({ "k": kk, "v": resultHash[kk] })
              }
              returnSucceed(context, JSON.stringify(result))
            }
          }
        })
      })
    }
  })
}


function returnSucceed(context, body, code = 200) {
  context.succeed({
    statusCode: code,
    headers: { 'Content-Type': 'text/plain' },
    body: body
  })
}


exports.handler = function (event, context) {

  var err, body = route(event, context, {
    'SET': setValue,
    'GET': getValue,
    'DEL': deleteObj,
    'ADD': addValue,
    'KEYS': getListKeys,
    'LIST': getList
  })

};