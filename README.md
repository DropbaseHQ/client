## platform

## troubleshooting

cannot login:

1. check in .env ENVIRONMENT=local

## deploy

cd client
yarn build
docker buildx build --platform linux/amd64,linux/arm64 --push -t dropbase/client:0.0.6 .
