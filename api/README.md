# Flight Job Script API

API server providing web access to [Flight Job](https://github.com/openflighthpc/flight-job).

## Overview

Flight Job facilitates the creation of complex job scripts from predefined
templates, helps manage the submission of the job script to the HPC
scheduler and helps manage the jobs life-cycle.

Flight Job Script API along with [Flight Job Script
Webapp](https://github.com/openflighthpc/flight-job-script-service/tree/master/client)
provide browser access to Flight Job reducing the HPC and Linux knowledge
required to use a HPC cluster.

## Installation

### Installing with the OpenFlight package repos

Flight Job Script API is available as part of the *Flight Web Suite*.  This is
the easiest method for installing Flight Job Script API and all its
dependencies.  It is documented in [the OpenFlight
Documentation](https://use.openflighthpc.org/installing-web-suite/install.html#installing-flight-web-suite).


### Manual Installation

#### Prerequisites

Flight Job Script API is developed and tested with Ruby version `2.7.1` and
`bundler` `2.1.4`.  Other versions may work but currently are not officially
supported.

Flight Job Script API requires Flight Job which can be installed by following
the [Flight Job installation
instructions](https://github.com/openflighthpc/flight-job/blob/master/README.md#installation)

#### Install Flight Job Script API

The following will install from source using `git`.  The `master` branch is
the current development version and may not be appropriate for a production
installation. Instead a tagged version should be checked out.

```
git clone https://github.com/alces-flight/flight-job-script-service.git
cd flight-job-script-service/api
git checkout <tag>
bundle config set --local with default
bundle config set --local without development
bundle install
```

The manual installation of Flight Job Script API comes preconfigured to run in
development mode.  If installing Flight Job Script API manually for production
usage you will want to follow the instructions to [set the environment
mode](docs/environment-modes.md) to `standalone`.


## Configuration

Flight Job Script API comes preconfigured to work out of the box without
further configuration.  However, it is likely that you will want to change its
`bind_address` and `base_url`.  Please refer to the [configuration
file](etc/job-script-api.yaml) for more details and a full list of
configuration options.

### Environment Modes

If Flight Job Script API has been installed manually for production usage you
will want to follow the instructions to [set the environment
mode](docs/environment-modes.md) to `standalone`.


## Operation

The service can be started by running:

```
bin/puma
```

See `bin/puma --help` for more help including how to set a pid file and how to
redirect logs.

Typically, the Flight Job Script Webapp is used in conjunction with this API.
However, if you wish to use this API directly, you will want to see the full
[route documentation](docs/routes.md).


# Contributing

Fork the project. Make your feature addition or bug fix. Send a pull
request. Bonus points for topic branches.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

# Copyright and License

Eclipse Public License 2.0, see [LICENSE.txt](LICENSE.txt) for details.

Copyright (C) 2021-present Alces Flight Ltd.

This program and the accompanying materials are made available under
the terms of the Eclipse Public License 2.0 which is available at
[https://www.eclipse.org/legal/epl-2.0](https://www.eclipse.org/legal/epl-2.0),
or alternative license terms made available by Alces Flight Ltd -
please direct inquiries about licensing to
[licensing@alces-flight.com](mailto:licensing@alces-flight.com).

Flight Job Script API is distributed in the hope that it will be
useful, but WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER
EXPRESS OR IMPLIED INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR
CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR
A PARTICULAR PURPOSE. See the [Eclipse Public License 2.0](https://opensource.org/licenses/EPL-2.0) for more
details.
