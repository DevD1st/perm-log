# Perm-Log

> ##### This is a microservice project I just decided to develop for hubby sake ✌️😎. I created a dedicated library for this project on [npm](https://www.npmjs.com/package/perm-log-library) for the sake of reusability.

## Services

The project consists of 2 services

- **The Perm Service**- The major work of this service is to compute the permutation of a number as requested by an end user. A user can also optionally specify a delay in their request, this adds a delay before the computation is performed (managed using redis pub/sub and Bullmq). The resulting value after calculation is stored in mondodb. There is also endpoint that can be used in fetching the calculated perms. Events are published for various activities, these are being listened to by the Log service

- **The Log Service**- This service listens fo events to log and save them to db. It has endpoint(s) to fetch logs.

In the middle of these services is a rabbitmq cluster handling message routing, this cluster is defined [./infra/k8/rabbitmq](./infra/k8/rabbitmq).cluster.yaml. Other k8s objects are also defined in ./infra/k8s/. The development environment uses skallfold, the config can be find in [./infra/skaffold.yaml](./infra/skaffold.yaml) The project is TDD hence it is heavily tested using jest, supertest and REST Client (\*\*/\_.http). Enjoy 🥂
