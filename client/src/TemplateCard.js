import ReactMarkdown from 'react-markdown'
import classNames from 'classnames';
import { Link } from "react-router-dom";

import { CardFooter } from './CardParts';

function TemplateCard({ className, template }) {

  return (
    <div className={classNames('card', className)}>
      <h5
        className="card-header text-truncate"
        title={template.attributes.name}
      >
        {template.attributes.name}
      </h5>
      <div className="card-body">
        <ReactMarkdown>
          {template.attributes.synopsis}
        </ReactMarkdown>
        <ReactMarkdown>
          {template.attributes.description}
        </ReactMarkdown>
      </div>
      <CardFooter>
        <div className="btn-toolbar justify-content-center">
          <Link
            className="button link white-text"
            to={`/scripts/new/${template.id}`}
          >
            <span>SELECT</span>
          </Link>
        </div>
      </CardFooter>
    </div>
  );
}

export default TemplateCard;
