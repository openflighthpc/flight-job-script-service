# frozen_string_literal: true
#==============================================================================
# Copyright (C) 2021-present Alces Flight Ltd.
#
# This file is part of Flight Job Script Service.
#
# This program and the accompanying materials are made available under
# the terms of the Eclipse Public License 2.0 which is available at
# <https://www.eclipse.org/legal/epl-2.0>, or alternative license
# terms made available by Alces Flight Ltd - please direct inquiries
# about licensing to licensing@alces-flight.com.
#
# Flight Job Script Service is distributed in the hope that it will be useful, but
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR
# IMPLIED INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS
# OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR A
# PARTICULAR PURPOSE. See the Eclipse Public License 2.0 for more
# details.
#
# You should have received a copy of the Eclipse Public License 2.0
# along with Flight Job Script Service. If not, see:
#
#  https://opensource.org/licenses/EPL-2.0
#
# For more information on Flight Job Script Service, please visit:
# https://github.com/openflighthpc/flight-job-script-service
#==============================================================================

require_relative 'config/boot'

# Ensures the shared secret exists
FlightJobScriptAPI.config.auth_decoder

require_relative 'config/post_boot'
require_relative 'app'

require 'sinatra'

configure do
  LOGGER = FlightJobScriptAPI.logger
  use Rack::CommonLogger, LOGGER

  enable :logging, :dump_errors
  set :raise_errors, true
end

v = FlightJobScriptAPI::Configuration::API_VERSION
app = Rack::Builder.new do
  use RequestStore::Middleware
  map("/#{v}/render") { run RenderApp }
  map("/#{v}") { run App }
end

run app
