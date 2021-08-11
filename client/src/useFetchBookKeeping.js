import { useEffect, useState } from 'react';

// A poorman's replacement for `useFetch`. 
//
// It has the following advantages:
//
// 1. The bookkeeping is decoupled from the fetch promise.  This allows
//    multiple fetches to be combined into a single promise to be tracked by
//    this bookkeeping.
//
// It has the following disadvantages:
//
// 1. Most all of the features are lacking.
//   * Request is made exactly once when the component is mounted.
//   * Request cancellation.
//   * Caching.
//   * Interceptors.
//   * More...
// 2. Performance has not been tested.
export default function useFetchBookKeeping(promise) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  async function makeRequest() {
    try {
      setLoading(true);
      const response = await promise();
      setResponse(response);
      if (response.ok) {
        setData(await response.json());
        setError(null);
        setLoading(false);
      } else {
        setData(null);
        setLoading(false);
        try {
          // XXX Perhaps we need more intelligence here.  Perhaps we set the
          // error according to the response status?
          const err = await response.json();
          setError(err);
        } catch(e) {
          setError(e);
        }
      }
    } catch (e) {
      setData(null);
      setError(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    makeRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, error, loading, response, get: makeRequest };
}
