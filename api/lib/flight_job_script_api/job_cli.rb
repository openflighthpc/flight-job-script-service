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

require 'etc'
require 'pathname'
require 'securerandom'

module FlightJobScriptAPI
  class CommandError < Sinja::ServiceUnavailable; end

  class JobCLI
    class << self
      # Used to ensure each user is only running a single command at at time
      # NOTE: These objects will be indefinitely cached in memory until the server
      #       is restarted. This may constitute a memory leak if an indefinite
      #       number of users access the service.
      #       Consider refactoring
      def mutexes
        @mutexes ||= Hash.new { |h, k| h[k] = Mutex.new }
      end

      def list_templates(**opts)
        new(*flight_job, 'list-templates', '--json', **opts).run
      end

      def info_template(id, **opts)
        new(*flight_job, 'info-template', id, '--json', **opts).run
      end

      def list_scripts(**opts)
        new(*flight_job, 'list-scripts', '--json', **opts).run
      end

      def info_script(id, **opts)
        new(*flight_job, 'info-script', id, '--json', **opts).run
      end

      def create_script(template_id, name = nil, answers: nil, notes: nil, **opts)
        # Tempfile is not suitable here as we need to 1) delay creation of the
        # files until after the subprocess is running, so that they are
        # created with the correct permissions; and 2) ensure that file are
        # removed once this method exits.
        answers_path = File.join('/tmp', "flight-job-script-api-#{SecureRandom.uuid}")
        notes_path = File.join('/tmp', "flight-job-script-api-#{SecureRandom.uuid}")

        args = [].tap do |a|
          a << template_id
          a << name if name
          a << "--json"
          a << "--answers" << "@#{answers_path}" if answers
          a << "--notes" << "@#{notes_path}" if notes
        end
        new(*flight_job, 'create-script', *args, **opts).run do
          File.write answers_path, answers if answers
          File.write notes_path, notes if notes
        end
      ensure
        FileUtils.rm_f answers_path
        FileUtils.rm_f notes_path
      end

      def edit_script_notes(script_id, **opts)
        new(*flight_job, 'edit-script-notes', script_id, '--json', '--notes', '@-', **opts).run
      end

      def edit_script(script_id, **opts)
        new(*flight_job, 'edit-script', script_id, '--json', '--force', '--content', '@-', **opts).run
      end

      def delete_script(id, **opts)
        new(*flight_job, 'delete-script', id, '--json', **opts).run
      end

      def list_jobs(**opts)
        new(*flight_job, 'list-jobs', '--json', **opts).run
      end

      def info_job(id, **opts)
        new(*flight_job, 'info-job', id, '--json', **opts).run
      end

      def submit_job(script_id, answers: nil, **opts)
        # Tempfile is not suitable here as we need to 1) delay creation of the
        # files until after the subprocess is running, so that they are
        # created with the correct permissions; and 2) ensure that file are
        # removed once this method exits.
        answers_path = File.join('/tmp', "flight-job-script-api-#{SecureRandom.uuid}")

        args = [].tap do |a|
          a << script_id
          a << "--json"
          a << "--answers" << "@#{answers_path}" if answers
        end
        new(*flight_job, 'submit-job', *args, **opts).run do
          File.write(answers_path, answers.to_json) if answers
        end
      ensure
        FileUtils.rm_f answers_path
      end

      def cancel_job(id, **opts)
        new(*flight_job, 'cancel-job', id, '--json', **opts).run
      end

      def delete_job(id, **opts)
        new(*flight_job, 'delete-job', id, **opts).run
      end

      private

      def flight_job
        Flight.config.flight_job
      end
    end

    def initialize(*cmd, user:, stdin: nil, timeout: nil, env: {}, include: nil)
      @timeout = timeout || Flight.config.command_timeout
      @include = include
      @cmd = cmd
      @user = user
      @stdin = stdin
      @env = {
        'PATH' => Flight.config.command_path,
        'HOME' => passwd.dir,
        'USER' => @user,
        'LOGNAME' => @user
      }.merge(env)
      if @include
        @env['flight_JOB_includes'] = @include
      end
    end

    def run(&block)
      result =
        self.class.mutexes[@user].synchronize do
          Flight.logger.debug("Running subprocess (#{@user}): #{stringified_cmd}")
          sp = Subprocess.new(
            env: @env,
            logger: Flight.logger,
            timeout: @timeout,
            username: @user,
          )
          sp.run(@cmd, @stdin, &block)
        end
      parse_result(result)
      log_command(result)
      result
    end

    private

    def passwd
      @passwd ||= Etc.getpwnam(@user)
    end

    def parse_result(result)
      if result.exitstatus == 0 && expect_json_response?
        begin
          unless result.stdout.nil? || result.stdout.strip == ''
            result.stdout = JSON.parse(result.stdout)
          end
        rescue JSON::ParserError
          result.exitstatus = 128
        end
      end
    end

    def expect_json_response?
      @cmd.any? {|i| i.strip == '--json'}
    end

    def log_command(result)
      Flight.logger.info <<~INFO.chomp
        COMMAND: #{stringified_cmd}
        INCLUDE: #{@include || '(none)'}
        USER: #{@user}
        PID: #{result.pid}
        STATUS: #{result.exitstatus}
      INFO
      Flight.logger.debug <<~DEBUG
        ENV:
        #{JSON.pretty_generate @env}
        STDIN:
        #{@stdin.to_s}
        STDOUT:
        #{result.stdout}
        STDERR:
        #{result.stderr}
      DEBUG
    end

    def stringified_cmd
      @stringified_cmd ||= @cmd
        .map { |s| s.empty? ? '""' : s }.join(' ')
    end
  end
end
