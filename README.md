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

* import the SQL table data from `./sql/records.sql`
* update `./config.yml` with any required changes to things such as database credentials or ports

# Running the services

* startup the microservices using `npm start` or `yarn start`
* logs for each microservice are located in the `./log` folder
* `POST` the `./resources/input.json` to `http://servername:port/api/v1/collector` remembering to make sure that
  your `content-type` is set to `application/json`
  
  ![set your content-type](https://github.com/erikyuzwa/microservice-bonanza/blob/master/screenshot.png)

# Running the unit tests

* `npm test`

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
