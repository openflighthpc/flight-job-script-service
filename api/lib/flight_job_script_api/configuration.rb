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

# XXX flight_configuration requires this library, but doesn't `require` it.
# That needs fixing.
require 'active_support/core_ext/hash/keys'
require 'active_model'

require 'flight_configuration'

module FlightJobScriptAPI
  class Configuration
    include FlightConfiguration::DSL
    include FlightConfiguration::RichActiveValidationErrorMessage
    include ActiveModel::Validations

    API_VERSION = 'v0'
    class ConfigError < StandardError; end

    application_name 'job-script-api'
    user_config_files false

    attribute :bind_address, default: 'tcp://127.0.0.1:921'
    validates :bind_address, presence: true

    attribute :base_url, default: '/'
    validates :base_url, presence: true

    attribute :shared_secret_path, default: 'etc/shared-secret.conf',
      transform: relative_to(root_path)
    validates :shared_secret_path, presence: true

    attribute :flight_job,
      default: File.join(ENV.fetch('flight_ROOT', '/opt/flight'), 'bin/flight job'),
      transform: ->(value) { value.split(' ') }
    validates :flight_job, presence: true

    attribute :command_path, default: '/usr/sbin:/usr/bin:/sbin:/bin'

    attribute :command_timeout, default: 5,
      transform: :to_f
    validates :command_timeout, numericality: true, allow_blank: false

    attribute :log_path, required: false,
              default: '/dev/stdout',
              transform: ->(path) do
                if path
                  relative_to(root_path).call(path).tap do |full_path|
                    FileUtils.mkdir_p File.dirname(full_path)
                  end
                else
                  $stderr
                end
              end

    attribute :log_level, default: 'info'
    validates :log_level, inclusion: {
      within: %w(fatal error warn info debug disabled),
      message: 'must be one of fatal, error, warn, info, debug or disabled'
    }

    attribute :sso_cookie_name, default: 'flight_login'

    def auth_decoder
      @auth_decoder ||= FlightAuth::Builder.new(shared_secret_path)
    end
  end
end
