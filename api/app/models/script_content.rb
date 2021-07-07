#==============================================================================
# Copyright (C) 2021-present Alces Flight Ltd.
#
# This file is part of Flight Job.
#
# This program and the accompanying materials are made available under
# the terms of the Eclipse Public License 2.0 which is available at
# <https://www.eclipse.org/legal/epl-2.0>, or alternative license
# terms made available by Alces Flight Ltd - please direct inquiries
# about licensing to licensing@alces-flight.com.
#
# Flight Job is distributed in the hope that it will be useful, but
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR
# IMPLIED INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR CONDITIONS
# OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR A
# PARTICULAR PURPOSE. See the Eclipse Public License 2.0 for more
# details.
#
# You should have received a copy of the Eclipse Public License 2.0
# along with Flight Job. If not, see:
#
#  https://opensource.org/licenses/EPL-2.0
#
# For more information on Flight Job, please visit:
# https://github.com/openflighthpc/flight-job
#==============================================================================

class ScriptContent
  class << self
    prepend FlightJobScriptAPI::ModelCache

    def find(script_id, **opts)
      new Script.find(script_id, **opts)
    end
  end

  attr_reader :script

  def initialize(script)
    @script = script
  end

  def id
    script.id
  end

  def payload
    @payload ||= File.read(script.metadata['path'])
  end

  def save_payload(content)
    FlightJobScriptAPI::SystemCommand.edit_script(
      id, user: script.user, stdin: content
    ).tap do |cmd|
      next if cmd.exitstatus == 0
      raise FlightJobScriptAPI::CommandError, "Unexpectedly failed to update the script's content: #{id}"
    end
    @payload = content
  end
end
