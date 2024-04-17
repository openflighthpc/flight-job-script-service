import classNames from 'classnames';

import styles from './index.module.css';

function MetadataEntry({ format, hide=false, hideWhenNull=false, name, value, valueTitle="raw" }) {
  if (hide || (hideWhenNull && value == null)) {
    return null;
  }
  const formatted = typeof format === "function" ? format(value) : value;

  let titleForValue = null;
  switch (valueTitle) {
    case "raw":
      titleForValue = value;
      break;
    case "formatted":
      titleForValue = formatted;
      break;
    case false:
      break
    default:
      titleForValue = valueTitle;
  }

  return (
    <>
      <dt
        className={classNames("text-truncate text-right mr-3", styles.MetadataEntryDT)}
        title={name}
      >
        {name}
      </dt>
      <dd
        className={classNames("text-truncate text-left", styles.MetadataEntryDD)}
        title={titleForValue}
      >
        {formatted}
      </dd>
    </>
  );
}

export default MetadataEntry;
