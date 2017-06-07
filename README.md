# Lambda-S3-DB

Simple Key-Value database with HTTP endpoints. Build on AWS Lambda and AWS S3 as storage. Main goal to have ability to store value visit browser link.

## API

```
GET /ADD/folder-key-name?v=value-text - add to S3 folder with timestamp as name
POST /ADD/folder-key-name - value from request body

GET /KEYS/folder-key-name - return ["object-key1", "object-key2"] in JSON format

GET /LIST/folder-key-name - return [{"k": "object-key1", "v": "value-text1"}, ..] in JSON format

GET /GET/object-key - get value
Status code 404 if key not found

GET /SET/object-key?v=value-text - create or update value (Key-Value)
POST /SET/object-key - value from request body

GET /DEL/object-key - delete 
```

## Install

- Get source
- Configure [claudia.js](https://claudiajs.com/tutorials/installing.html)
- do ```npm run create```
- copy URL like https://RANDOM.execute-api.us-east-1.amazonaws.com/latest
- create AWS Bucket
- Open in browser [AWS Console / IAM / Roles](https://console.aws.amazon.com/iam/home?#/roles/s3_db-executor) and add custom policy to s3_db-executor role
```
{
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:ListAllMyBuckets",
            "Resource": "arn:aws:s3:::*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::MY-BUCKET-NAME",
                "arn:aws:s3:::MY-BUCKET-NAME/*"
            ]
        }
    ]
}
```

- Open [AWS Console / Lambda / Functions / s3_db ](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/s3_db?tab=code), scroll down and add Enviroment variable ```BUCKET = MY-BUCKET-NAME``` 
- try it

```
curl -s https://RANDOM.execute-api.us-east-1.amazonaws.com/latest/SET/test?v=hello
# ok
curl -s https://RANDOM.execute-api.us-east-1.amazonaws.com/latest/GET/test
# hello
```