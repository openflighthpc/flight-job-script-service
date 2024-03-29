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
require 'active_support/core_ext/hash/keys'

FactoryBot.define do
  # NOTE: The template object intentionally uses save_* attributes on build
  # This is because they cannot be considered "valid" before saving
  # This can be disabled by passing in false
  factory :template do
    sequence(:id) { |n| "demo-template-#{n}" }

    transient do
      save_generation_questions { [] }
      save_metadata do
        YAML.dump({
          'name' => "#{id}-name",
          'synopsis' => "What is the answer for #{id}?",
          'version' => 0,
          'generation_questions' => save_generation_questions
        })
      end
      save_script do
        <<~SCRIPT
          #! /bin/bash
          echo I am the #{id} script
        SCRIPT
      end
    end

    skip_create
    initialize_with do
      new(**attributes).tap do |template|
        if (save_metadata || save_script) && !FakeFS.activated?
          raise 'Refusing to write mocked factory data to the file system'
        end
        if save_metadata
          FileUtils.mkdir_p File.dirname(template.metadata_path)
          File.write(template.metadata_path, save_metadata)
        end
        if save_script
          FileUtils.mkdir_p File.dirname(template.template_path)
          File.write(template.template_path, save_script)
        end
      end
    end
  end

  factory(:script) do
    template
    user { ENV['USER'] }

    to_create do |instance|
      instance.render_and_save
    end
  end

  factory(:question_hash, class: Hash) do
    sequence(:id) { |n| "builder_question#{n}" }
    text { "What is the answer for #{id}?" }

    initialize_with do
      attributes.transform_keys(&:to_s)
    end
  end

  factory(:jwt, class: String) do
    username { ENV['USER'] }
    iat { Time.now.to_i }
    nbf { iat }
    exp { iat + 60 }

    transient do
      shared_secret { Flight.config.auth_decoder.shared_secret }
    end

    initialize_with do
      JWT.encode(attributes, shared_secret, 'HS256')
    end
  end
end
