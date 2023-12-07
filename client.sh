cd client
yarn build
docker build -t dropbase/client .
docker push dropbase/client