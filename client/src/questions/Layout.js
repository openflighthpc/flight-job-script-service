import React from 'react';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import styles from "./question.module.css";
import { CardFooter } from "../CardParts";

function Layout({ flavour="card", ...props }) {
  if (flavour === "card") {
    return <CardLayout {...props} />;
  } else {
    return null;
  }
}

function CardLayout({
  children,
  leftButton,
  rightButton,
  title,
}) {
  return (
    <div className={`card border-primary ${styles.QuestionCard}`} >
      <h5
        className="card-header bg-primary text-light text-truncate"
        title={title}
      >
        {title}
      </h5>
      <div className="card-body">
        { children }
      </div>
      <CardFooter>
        <div className="btn-toolbar justify-content-end">
          {leftButton}
          {rightButton}
        </div>
      </CardFooter>
    </div>
  );
}

export default Layout;
