cd client
yarn build
docker build -t dropbase/client:latest .
docker push dropbase/client:latest