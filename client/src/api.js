import { useContext, useRef, useState } from 'react';
import useFetch from 'use-http';

import {
  ConfigContext,
  CurrentUserContext,
  utils,
} from 'flight-webapp-components';

import { useInterval } from './utils';
import useFetchBookKeeping from './useFetchBookKeeping';

export function useFetchTemplates() {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    "/templates",
    { headers: { Accept: 'application/vnd.api+json' } },
    [ currentUser.authToken ]);
}

export function useFetchTemplate(id) {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    `/templates/${id}`,
    {
      headers: { Accept: 'application/vnd.api+json' },
      interceptors: {
        response: async ({ response }) => {
          if (response.ok) {
            denormalizeResponse(response);
          }
          return response;
        }
      }
    },
    [ currentUser.authToken ]);
}

export function useFetchQuestions(templateId) {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    `/templates/${templateId}/questions`,
    { headers: { Accept: 'application/vnd.api+json' } },
    [ templateId, currentUser.authToken ]
  );
}

export function useGenerateScript(templateId, answers, scriptName) {
  const request = useFetch(
    `/render/${templateId}`,
    {
      method: 'post',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json',
      },
      body: {
        answers,
        name: scriptName,
      },
      cachePolicy: 'no-cache',
    },
  );
  return request;
}

export function useFetchScripts() {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    "/scripts?include=template",
    {
      headers: { Accept: 'application/vnd.api+json' },
      interceptors: {
        response: async ({ response }) => {
          if (response.ok) {
            denormalizeResponse(response, { isArray: true });
          }
          return response;
        }
      }
    },
    [ currentUser.authToken ]);
}

export function useFetchScript(id) {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    `/scripts/${id}?include=template,note,content`,
    {
      headers: { Accept: 'application/vnd.api+json' },
      interceptors: {
        response: async ({ response }) => {
          if (response.ok) {
            denormalizeResponse(response);
          }
          return response;
        }
      }
    },
    [ currentUser.authToken ]);
}

export function useSubmitScript(script) {
  const request = useFetch(
    '/jobs',
    {
      method: 'post',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: {
        "data": {
          "type": "jobs",
          "relationships": {
            "script": {
              "data": {
                "type": "scripts",
                "id": script.id,
              }
            }
          }
        }
      },
      cachePolicy: 'no-cache',
    },
  );
  return request;
}

export function useDeleteScript(script) {
  const request = useFetch(
    `/scripts/${script.id}`,
    {
      method: 'delete',
      headers: {
        Accept: 'application/vnd.api+json',
      //   'Content-Type': 'application/vnd.api+json',
      },
      cachePolicy: 'no-cache',
    },
  );
  return request;
}

export function useFetchScriptNotes(script) {
  const { currentUser } = useContext(CurrentUserContext);
  const scriptId = script == null ? undefined : script.id;
  return useFetch(
    `/scripts/${scriptId}/note`,
    {
      headers: {
        Accept: 'application/vnd.api+json',
      },
    },
    [ currentUser.authToken, scriptId ],
  );
}

export function useSaveScriptNotes(notes) {
  const id = notes == null ? undefined : notes.id;
  return useFetch(
    `/notes/${id}`,
    {
      method: 'put',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      cachePolicy: 'no-cache',
    },
  );
}

export function useFetchScriptContent(script) {
  const { currentUser } = useContext(CurrentUserContext);
  const scriptId = script == null ? undefined : script.id;
  return useFetch(
    `/scripts/${scriptId}/content`,
    {
      headers: {
        Accept: 'application/vnd.api+json',
      },
    },
    [ currentUser.authToken, scriptId ],
  );
}

export function useSaveScriptContent(contentResource) {
  const id = contentResource == null ? undefined : contentResource.id;
  return useFetch(
    `/contents/${id}`,
    {
      method: 'post',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      cachePolicy: 'no-cache',
    },
  );
}

function getResourceFromResponse(data) {
  if (!utils.isObject(data)) { return null; }
  return data.data;
}

function isSameResource(r1, r2) {
  return r1.type === r2.type && r1.id === r2.id;
}

function denormalizeResponse(response, { isArray=false }={}) {
  const data = response.data;
  let resources;
  if (isArray) {
    resources = utils.getResourcesFromResponse(data);
  } else {
    resources = [ getResourceFromResponse(data) ].filter(i => i != null);
  }
  if (resources == null) { return; }

  resources.forEach((resource) => {
    if (!resource.denormalized) {
      Object.defineProperty(resource, 'denormalized', { value: true, writable: false });

      Object.keys(resource.relationships || {}).forEach((relName) => {
        const relNeedle = resource.relationships[relName].data;
        Object.defineProperty(
          resource,
          relName,
          {
            get: function() {
              if (relNeedle == null) { return null; }
              const haystack = data.included || [];
              if (Array.isArray(relNeedle)) {
                return haystack.filter(
                  hay => relNeedle.find(needle => isSameResource(hay, needle))
                );
              } else {
                return haystack.find((hay) => isSameResource(hay, relNeedle));
              }
            },
          },
        );
      });
    }
  });
}

export function useFetchJobs() {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    "/jobs?include=script",
    {
      headers: { Accept: 'application/vnd.api+json' },
      interceptors: {
        response: async ({ response }) => {
          if (response.ok) {
            denormalizeResponse(response, { isArray: true });
          }
          return response;
        }
      }
    },
    [ currentUser.authToken ]);
}


export function useFetchJob(id) {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    `/jobs/${id}?include=script`,
    {
      headers: { Accept: 'application/vnd.api+json' },
      interceptors: {
        response: async ({ response }) => {
          if (response.ok) {
            denormalizeResponse(response);
          }
          return response;
        }
      }
    },
    [ currentUser.authToken ]);
}

export function useCancelJob(id) {
  const request = useFetch(
    `/jobs/${id}`,
    {
      method: 'patch',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: {
        "data": {
          "type": "jobs",
          "id": id,
          "attributes": {
            "state": "CANCELLED"
          }
        }
      },
      cachePolicy: 'no-cache',
    },
  );
  return request;
}

export function useFetchOutputFiles(id) {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    `/jobs/${id}/output-files`,
    {
      headers: { Accept: 'application/vnd.api+json' },
    },
    [ currentUser.authToken, id ]);
}

export function useFetchResultFiles(id) {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    `/jobs/${id}/result-files`,
    {
      headers: { Accept: 'application/vnd.api+json' },
    },
    [ currentUser.authToken, id ]);
}

export function useFetchFileContent(file) {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch(
    `/${file.type}/${file.id}?fields[files]=payload`,
    {
      headers: { Accept: 'application/vnd.api+json' },
    },
    [ currentUser.authToken, file.id ]);
}

const desktopApiUrl = new URL(
  process.env.REACT_APP_DESKTOP_API_BASE_URL,
  window.location.origin,
).toString();

export class SessionNotFound extends Error {}
export class SessionUnknown extends Error {}

export function useFetchDesktop(jobId) {
  const { apiRootUrl } = useContext(ConfigContext);

  return useFetchBookKeeping(
    async function() {
      const waitResponse = await fetch(
        `${apiRootUrl}/jobs/${jobId}/desktop`, {
          headers: {
            Accept: 'application/vnd.api+json',
          },
        },
      );
      if (waitResponse.ok) {
        const sessionId = (await waitResponse.json())?.data?.id;
        if (sessionId) {
          const sessionResponse = await fetch(`${desktopApiUrl}/sessions/${sessionId}`);
          if (sessionResponse.ok) {
            return sessionResponse;
          } else {
            throw new SessionNotFound();
          }
        } else {
          throw new SessionUnknown();
        }
      } else {
        return waitResponse;
      }
    }
  );
}

export function useFetchDesktopScreenshot(id, { reloadInterval=1*60*1000 }={}) {
  const { currentUser } = useContext(CurrentUserContext);
  const lastLoadedAt = useRef(null);
  const [image, setImage] = useState();

  const now = new Date();
  const reloadDue = lastLoadedAt.current == null ||
    now - lastLoadedAt.current < reloadInterval;
  if (reloadDue) {
    lastLoadedAt.current = now;
  }

  const { get, response } = useFetch(
    `${desktopApiUrl}/sessions/${id}/screenshot.png`,
    {
      headers: { Accept: 'image/*' },
    }, [currentUser.authToken, id, lastLoadedAt]
  );

  useInterval(get, reloadInterval, { immediate: false });

  if (response.ok) {
    response.blob()
      .then((blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .then((base64Image) => {
        if (image !== base64Image) {
          setImage(base64Image);
        }
      })
      .catch((e) => {
        console.log('Error base64 encoding screenshot:', e);  // eslint-disable-line no-console
      });
  }

  return { image };
}
