#!/usr/bin/env sh

GIT_SHA=$(git rev-parse HEAD)

# build production docker images
docker build -t chejll/multi-client:latest -t chejll/multi-client:$GIT_SHA -f ./client/Dockerfile ./client
docker build -t chejll/multi-server:latest -t chejll/multi-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t chejll/multi-worker:latest -t chejll/multi-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

# push production docker images to docker hub
docker push chejll/multi-client:latest
docker push chejll/multi-server:latest
docker push chejll/multi-worker:latest

docker push chejll/multi-client:$GIT_SHA
docker push chejll/multi-server:$GIT_SHA
docker push chejll/multi-worker:$GIT_SHA

# apply k8s configs
kubectl apply -f k8s

# update k8s to latest docker images
kubectl set image deployments/client-deployment client=chejll/multi-client:$GIT_SHA
kubectl set image deployments/server-deployment server=chejll/multi-server:$GIT_SHA
kubectl set image deployments/worker-deployment worker=chejll/multi-worker:$GIT_SHA
