### Deployment with ansible

To test on local:

```shell
pip3 install ansible

# dev 
ansible-playbook -i infra/hosts -l dev --user dropbase --private-key=${HOME}/.ssh/dropbase-ssh-deployment.pem --extra-vars="ecr_repo=890697794097.dkr.ecr.us-east-1.amazonaws.com" --extra-vars="aws_region=us-east-1" --extra-vars="env=dev" infra/api-deployment.yml
```
