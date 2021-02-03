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

require 'spec_helper'

RSpec.describe '/render' do
  context 'with an authenicated user' do
    before do
      allow(Rpam).to receive(:auth).and_return(true)
      header 'Authorization', "Basic #{Base64.encode64('foo:bar')}"
    end

    describe 'POST - application/json' do
      before do
        header 'Content-Type', 'application/json'
      end

      it 'returns 404 for unknown ids' do
        post "/render/missing"
        expect(last_response).to be_not_found
      end

      it 'downloads the rendered file' do
        template = build(:template)
        post "/render/#{template.id}", "{}"
        expect(last_response).to be_ok
        expect(last_response.headers['Content-Disposition']).to eq("attachment; filename=\"#{template.name}\"")
        expect(last_response.headers['Content-Type']).to eq('text/plain')
        expect(last_response.body).to eq(File.read template.template_path)
      end

      it 'returns 422 on a render error' do
        template = build(:template)
        mock_context = FlightJobScriptAPI::RenderContext.new(template: template, answers: {})

        allow(mock_context).to receive(:render) { raise 'A render error has occurred!' }
        allow(FlightJobScriptAPI::RenderContext).to receive(:new).and_return(mock_context)

        post "/render/#{template.id}", '{}'
        expect(last_response.status).to be(422)
      end

      it 'renders the answers and default' do
        # Define the question, answer, default, and id
        default = 'the-default'
        answer = 'the-answer'
        question = build(:question_hash, default: default)
        id = question['id']

        # Define the input and output scripts
        builder = ->(default, answer, missing) do
          <<~SCRIPT
            #!/bin/bash
            echo And the answer is #{answer}!
            echo And the default is #{default}!
            echo The missing question is here ->#{missing}<-
          SCRIPT
        end
        input = builder.call("<%= questions.#{id}.default -%>",
                             "<%= questions.#{id}.answer -%>",
                             "<%= questions.missing.answer -%>")
        output = builder.call(default, answer, '')

        # Define the template
        template = build(:template, save_generation_questions: [question], save_script: input)

        # Check it renders correctly
        post "/render/#{template.id}", { id => answer }.to_json
        expect(last_response).to be_ok
        expect(last_response.body).to eq(output)
      end
    end
  end

  describe '/render/foo' do
    def make_request
      post '/render/foo'
    end
    include_examples 'shared_auth_spec'
  end
end
