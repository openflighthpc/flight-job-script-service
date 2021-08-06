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

# Ensure the working directory is correct, this is applied immediately
working_directory File.dirname(__dir__)

# NOTE: boot.rb essentially "preloads" the app into memory. IIUC unicorn is
# expecting the app to be loaded by the 'config.ru', not here.
#
# This doesn't make a big difference, as the app should be preloaded regardless
require_relative 'boot.rb'
preload_app true

listen FlightJobScriptAPI.config.bind_address

# NOTE: Unicorn does not have --redirect-std* flags like puma. They will need to
# be specified here
logger FlightJobScriptAPI.logger
# stdout_path ...
# stderr_path ...

worker_processes 1
timeout FlightJobScriptAPI.config.hard_timeout

if FlightJobScriptAPI.config.log_path
  stdout_path FlightJobScriptAPI.config.log_path
  stderr_path FlightJobScriptAPI.config.log_path
end

# NOTE: Unicorn does not appear to have an equivalent config option to puma's tag
# IIRC this isn't hard to implement manually
# tag FlightJobScriptAPI.config.class.application_name
