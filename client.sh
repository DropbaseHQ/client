cd client
yarn build
docker build -t dropbase/client:0.0.2 .
docker push dropbase/client:0.0.2