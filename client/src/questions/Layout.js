import React from 'react';

import { CardFooter } from "../CardParts";

function Layout({
  children,
  leftButton,
  rightButton,
  title,
}) {
  return (
    <div className={`card`} >
      <h5
        className="card-header text-truncate"
        title={title}
      >
        {title}
      </h5>
      <div className="card-body">
        { children }
      </div>
      <CardFooter>
        <div className="btn-toolbar justify-content-center">
          {leftButton}
          {rightButton}
        </div>
      </CardFooter>
    </div>
  );
}

export default Layout;
