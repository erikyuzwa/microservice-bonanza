# microservice-bonanza
microservice fun times.

These are seperate microservices written to demonstrate one possible way to structure your pipeline. 

* `collector-service` - this microservice accepts a JSON Object or Array via `POST`
* `parser-service` - this microservice subscribes to our RabbitMQ for the `collectedInvoice` message
* `persister-service` - this microservice subscribes to our RabbitMQ for the `parsedInvoice` message
* `reporter-service` - this microservice listens for a `GET` request and will produce a JSON response

# Getting Started

* `git clone https://github.com/erikyuzwa/microservice-bonanza.git`
* `npm install` or `yarn install`

# Prerequisites

* RabbitMQ
* MySQL

# Configuration

While "true" Microservices should require zero-configuration, there's always a case where your deployment network
might dictate some constraints around what's available -- especially when ports and databases are involved amirite?

* import the SQL table data from `./sql/invoices.sql` and `./sql/responses.sql`
* update `./config.yml` with any required changes to things such as database credentials or ports

# Running the services

* startup the microservices using `npm start` or `yarn start`
* logs for each microservice are located in the `./log` folder
* `POST` the `./resources/input.json` to `http://servername:port/api/v1/collector` remembering to make sure that
  your `content-type` is set to `application/json`
  
  ![set your content-type](https://github.com/erikyuzwa/microservice-bonanza/blob/master/screenshot.png)

# Running the unit tests

* `npm test`

# Running and launching the Docker container

**TODO still in progress**

## using docker-compose
* `docker-compose up` - should work at some point

## using docker-build
* `docker build -t <your_docker_username>/microservice .` - build the container
* `docker run -d <your_docker_username>/microservice` - run the Docker container in detached mode
* `docker stats` - to view the currently running Docker containers

# Architectural Questions

**How would you architect a continuous deployment of micro-services where different versions can co-exist without
breaking the data integrity?**

Due to the intention of creating a tiny, self-contained "apparatus", different versions of the same microservice
can co-exist within the same environment with the help of either port range management and/or endpoint url
management. You'll notice in our microservices that I've put together here, they are by default listening on
a `api/v1/*` type of route. This can be also managed between different versions of the same microservice.

**How would you architect auto-scalability of micro-services?**

Again due to the self-contained design and approach of a micro-service, common off-the-shelf software such as
**Docker** and **Ansible** can be used to setup the automated container management that is part of a auto-scalability
plan / design. 

**When 2 or more instances of same micro-service can co-exist in the same ecosystem, how would you architect the 
micro-service ecosystem so the data is only processed once?**

This is a tricky scenerio, but very possible given the self-contained and tiny design approach of our micro-services.
With RabbitMQ handling the messaging, and theoretically our multiple instances all binding/subscribing to the same
message, we want to ensure we preserve our data integrity. Multiple instances of the service will help ensure some
type of reliability that the messages we rely on will function despite network blips or interruptions to different
nodes.

To ensure that data is only updated once is very tough since it's possible that multiple updates on the same record
ARE actually valid updates intended by the User.

I would have to say that "it depends" on the architecture of the database and microservice. If we're only looking
at a minor number of similar micro-services (say < 10?) then I'd let each one update the database at will, and
look at configuring our data store processing to account for multiple similar updates to the same record, only 
taking in the latest one within a certain threshold of time.


# LICENSE

MIT License

Copyright (c) 2017 Erik Yuzwa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
