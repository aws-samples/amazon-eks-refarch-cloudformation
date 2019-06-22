#!/usr/bin/env python

import json
import boto3, os
from dateutil import parser
from botocore.endpoint import BotocoreHTTPSession
from botocore.awsrequest import AWSRequest

if 'ClusterVersion' in os.environ and os.environ['ClusterVersion'] == 'latest':
    ClusterVersion = '1.13'
else:
    ClusterVersion = os.environ['ClusterVersion']

def http_resp(statusCode, resp_body):
  return {
          "statusCode": statusCode,
          "headers": {
              "content-type": "application/json"
          },
          "body": json.dumps(resp_body)
       }
       
def get_latest_ami(ver=ClusterVersion):
    client = boto3.client('ec2')
    response = client.describe_images(
        ExecutableUsers=[
            'all',
        ],
        Filters=[
            {
                'Name': 'name',
                'Values': [
                    'amazon-eks-node-%s-*' % ver,
                ]
            },
        ],
        Owners=[
            '602401143452',
        ],
        DryRun=False
    )  
    get_created_date = lambda obj: int( parser.parse(obj['CreationDate']).strftime('%s'))
    found = [ (x['ImageId'], x['ImageLocation'], x['CreationDate']) for x in sorted(response['Images'], key=get_created_date, reverse=True)]
    return found


def send_response(event, context, response_status, response_data):
  '''Send a resource manipulation status response to CloudFormation'''
  response_body = json.dumps({
      "Status": response_status,
      "Reason": "See the details in CloudWatch Log Stream: " + context.log_stream_name,
      "PhysicalResourceId": context.log_stream_name,
      "StackId": event['StackId'],
      "RequestId": event['RequestId'],
      "LogicalResourceId": event['LogicalResourceId'],
      "Data": response_data
  })
  # params = '{"name": "hello"}'
  headers = {
      'Content-Type': '',
      'Content-Length': len(response_data)
  }
  print('[INFO] - sending request to %s' % event['ResponseURL'] )
  request = AWSRequest(method="PUT", url=event['ResponseURL'], data=response_body, headers=headers)
  session = BotocoreHTTPSession()
  r = session.send(request.prepare())
  print('[INFO] - got status_code=%s' % r.status_code)


def lambda_handler(event, context):
  print(event)
  responseStatus = "FAILED";
  response_data = {};
  # For Delete requests, immediately send a SUCCESS response.
  if event['RequestType'] == 'Delete':
      send_response(event, context, "SUCCESS", response_data);   
      return
  
  found = get_latest_ami()
  if len(found) > 0:
      (ImageId, ImageLocation, CreationDate) = found[0]
      print('[INFO] - got ImageId=%s' % ImageId)
      responseStatus = "SUCCESS";
      response_data["Id"] = ImageId
      send_response(event, context, responseStatus, response_data);     
  else:
      responseStatus = "SUCCESS";
      response_data["Id"] = ""
      send_response(event, context, responseStatus, response_data);     
  return
