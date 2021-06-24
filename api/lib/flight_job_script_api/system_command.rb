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

require 'securerandom'
require 'pathname'

module FlightJobScriptAPI
  class CommandError < Sinja::ServiceUnavailable; end

  class SystemCommand
    # Used to ensure each user is only running a single command at at time
    # NOTE: These objects will be indefinitely cached in memory until the server
    #       is restarted. This may constitute a memory leak if an indefinite
    #       number of users access the service.
    #       Consider refactoring
    def self.mutexes
      @mutexes ||= Hash.new { |h, k| h[k] = Mutex.new }
    end

    def self.flight_list_templates(**opts)
      new(*FlightJobScriptAPI.config.flight_job, 'list-templates', '--json', **opts).run
    end

    def self.flight_info_template(id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'info-template', id, '--json', **opts).run
    end

    def self.flight_list_scripts(**opts)
      new(*FlightJobScriptAPI.config.flight_job, 'list-scripts', '--json', **opts).run
    end

    def self.flight_info_script(id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'info-script', id, '--json', **opts).run
    end

    def self.flight_create_script(template_id, name = nil, answers: nil, notes: nil, **opts)
      # Define the paths so they can be cleaned up
      # NOTE: Tempfile should not be used as the file permissions will be incorrect
      #       Instead the paths are defined with UUIDs and then created after the command forks
      answers_path = File.join('/tmp', "flight-job-script-api-#{SecureRandom.uuid}")
      notes_path = File.join('/tmp', "flight-job-script-api-#{SecureRandom.uuid}")
      args = name ? [template_id, name] : [template_id]
      args.push('--answers', "@#{answers_path}") if answers
      args.push('--notes', "@#{notes_path}") if notes
      sys = new(*FlightJobScriptAPI.config.flight_job, 'create-script', *args, '--json', **opts)
      sys.run do
        File.write answers_path, answers if answers
        File.write notes_path, notes if notes
      end
    ensure
      FileUtils.rm_f answers_path
      FileUtils.rm_f notes_path
    end

    def self.flight_edit_script_notes(script_id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'edit-script-notes', script_id, '--json', '--notes', '@-', **opts).run
    end

    def self.flight_edit_script(script_id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'edit-script', script_id, '--json', '--force', '--content', '@-', **opts).run
    end

    def self.flight_delete_script(id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'delete-script', id, '--json',**opts).run
    end

    def self.flight_list_jobs(**opts)
      new(*FlightJobScriptAPI.config.flight_job, 'list-jobs', '--json', **opts).run
    end

    def self.flight_info_job(id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'info-job', id, '--json', **opts).run
    end

    def self.flight_submit_job(script_id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'submit-job', script_id, '--json', **opts).run
    end

    def self.flight_view_job_stdout(job_id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'view-job-stdout', job_id, **opts).run
    end

    def self.flight_view_job_stderr(job_id, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'view-job-stderr', job_id, **opts).run
    end

    def self.flight_view_job_results(job_id, filename, **opts)
      new(*FlightJobScriptAPI.config.flight_job, 'view-job-results', job_id, filename, **opts).run
    end

    def self.recursive_glob_dir(dir, **opts)
      sys = new(:noop, 'recursively glob directory', **opts)
      sys.run do |stdout, stderr|
        exit 20 unless Dir.exists?(dir)
        json = Dir.glob(File.join(dir, '**/*'))
          .map { |p| Pathname.new(p) }
          .reject(&:directory?)
          .reject(&:symlink?)
          .select(&:readable?) # XXX: Non-readable files would be an odd occurrence
          .map { |p| { file: p.to_s, size: p.size } }
        stdout.puts(JSON.generate(json))
      end
    end

    def initialize(*cmd, user:, stdin: nil, env: {})
      @cmd = cmd
      @user = user
      @stdin = stdin
      @env = {
        'PATH' => FlightJobScriptAPI.app.config.command_path,
        'HOME' => passwd.dir,
        'USER' => @user,
        'LOGNAME' => @user
      }.merge(env)
    end

    def run(&block)
      result =
        self.class.mutexes[@user].synchronize do
          FlightJobScriptAPI.logger.debug("Running subprocess (#{@user}): #{stringified_cmd}")
          sp = Subprocess.new(
            dir: passwd.dir,
            env: @env,
            gid: passwd.gid,
            logger: FlightJobScriptAPI.logger,
            timeout: FlightJobScriptAPI.config.command_timeout,
            uid: passwd.uid,
          )
          sp.run(@cmd.first == :noop ? nil : @cmd, @stdin, &block)
        end
      log_command(result)
      result
    end

    private

    def passwd
      @passwd ||= Etc.getpwnam(@user)
    end

    def log_command(result)
      FlightJobScriptAPI.logger.info <<~INFO.chomp
        COMMAND: #{stringified_cmd}
        USER: #{@user}
        PID: #{result.pid}
        STATUS: #{result.exitstatus}
      INFO
      FlightJobScriptAPI.logger.debug <<~DEBUG

        STDIN:
        #{@stdin.to_s}
        STDOUT:
        #{result.stdout}
        STDERR:
        #{result.stderr}
      DEBUG
    end

    def stringified_cmd
      @stringified_cmd ||= (@cmd.first == :noop ? @cmd[1..-1] : @cmd)
        .map { |s| s.empty? ? '""' : s }.join(' ')
    end
  end
end
