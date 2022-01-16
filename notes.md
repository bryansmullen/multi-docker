deploy:
provider: elasticbeanstalk
region: 'eu-west-1'
app: 'docker-react'
env: 'Dockerreact-env'
bucket_name: 'elasticbeanstalk-eu-west-1-707263635374'
bucket_path: 'docker-react'
on:
branch: main
access_key_id: $AWS_ACCESS_KEY
secret_access_key: $AWS_SECRET_ACCESS_KEY