import React from 'react';

import placeholderImage from './placeholder.jpg';
import { useFetchDesktopScreenshot as useFetchScreenshot } from './api';

function Screenshot({ className, session }) {
  const { image: latestScreenshot } = useFetchScreenshot(session.id);

  let currentScreenshot;
  if (latestScreenshot != null) {
    currentScreenshot = latestScreenshot;
  // } else if (session.screenshot != null) {
  //   currentScreenshot = `data:image/png;base64,${session.screenshot}`;
  } else {
    currentScreenshot = placeholderImage;
  }

  return (
    <img
      className={className}
      src={currentScreenshot}
      alt="Session screenshot"
    />
  );
}

export default Screenshot;
