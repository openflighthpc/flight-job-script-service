import { useEffect, useRef } from 'react';

export const stateColourMap = {
  'PENDING':    'secondary',
  'RUNNING':    'primary',
  'COMPLETING': 'success',
  'COMPLETED':  'success',
  'FAILED':     'danger',
  'TERMINATED': 'danger',
  'SUSPENDED':  'info',
  'STOPPED':    'info',
  'UNKNOWN':    'warning',
};

export function useInterval(fn, interval, { immediate=false }={}) {
  const savedFn = useRef();
  savedFn.current = fn;

  useEffect(() => {
    savedFn.current = fn;
  }, [fn]);

  useEffect(() => {
    function tick() { savedFn.current(); }
    if (immediate) {
      tick();
    }
    if (interval !== null) {
      let id = setInterval(tick, interval);
      return () => clearInterval(id);
    }
  }, [immediate, interval]);
}

export const prettyDesktopName = {
  chrome: "Google Chrome browser session",
  gnome: "GNOME v3",
  kde: "KDE Plasma Desktop",
  terminal: "Terminal",
  xfce: "Xfce desktop",
  xterm: "xterm",
};

export function getTagValue(tags, name) {
  const tag = ( tags || [] ).find(tag => tag.split('=')[0] === name);
  if (tag == null) {
    return undefined;
  }
  return tag.split('=')[1];
}

