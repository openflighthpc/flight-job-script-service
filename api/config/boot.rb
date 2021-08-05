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

# Confirm flight-job has been symlinked in
job_root = File.expand_path('../flight-job', __dir__)
unless Dir.exists? job_root
  raise "Can not locate flight-job! Please symlink it to: \n#{job_root}"
end

ENV['RACK_ENV'] ||= 'development'
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

require 'rubygems'
require 'bundler'
require 'yaml'
require 'json'
require 'pathname'
require 'ostruct'
require 'etc'
require 'timeout'
require 'logger'

if ENV['RACK_ENV'] == 'development'
  Bundler.require(:default, :development)
else
  Bundler.require(:default)
end

# Shared activesupport libraries
require 'active_support/core_ext/hash/keys'

# Ensure ApplicationModel::ValidationError is defined in advance
require 'active_model/validations.rb'

lib = File.expand_path('../lib', __dir__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

# Patch ActiveModel::Serializers::JSON to use the v6 version
# NOTE: Sinja is versioned locked to v5 ActiveSupport, this
#       should probably be updated
module ActiveModel::Serializers::JSON
  def as_json(options = nil)
    root = if options && options.key?(:root)
      options[:root]
    else
      include_root_in_json
    end

    hash = serializable_hash(options).as_json
    if root
      root = model_name.element if root == true
      { root => hash }
    else
      hash
    end
  end
end

# Load flight-job
# NOTE: The 'flight' stub belongs to FlighJob
# Currently FlightJobScriptAPI does not use one
job_lib = File.join(job_root, 'lib')
$LOAD_PATH.unshift(job_lib) unless $LOAD_PATH.include?(job_lib)
require 'flight'
require 'flight_job'
require 'flight_job/cli'

# Eager load the entire library
[FlightJob, FlightJob::Commands, FlightJob::Outputs].each do |klass|
  klass.constants.each { |c| eval "::#{klass.to_s}::#{c.to_s}" }
end

# Reset flight-job config
Flight.instance_variable_set(:@config, nil)

require 'flight_job_script_api'

# Ensures the shared secret exists
FlightJobScriptAPI.config.auth_decoder

require_relative '../app'
