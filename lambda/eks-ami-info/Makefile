AWS_REGION ?= ap-northeast-1
S3BUCKET ?= pahud-tmp-$(AWS_REGION)
STACK_NAME ?= eks-ami-info

sam-build:
	sam build --use-container -t sam.yaml

sam-invoke:
	sam local invoke --event event.json --region $(AWS_REGION)
	
sam-package:
	sam package --template-file sam.yaml --output-template-file packaged.yaml --s3-bucket $(S3BUCKET)
	
sam-publish:
	sam publish -t packaged.yaml --region $(AWS_REGION)

sam-deploy:
	sam deploy --template-file packaged.yaml --stack-name $(STACK_NAME) --region $(AWS_REGION) --capabilities CAPABILITY_IAM