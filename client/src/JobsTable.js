import React from 'react';
import TimeAgo from 'react-timeago';
import { Badge, Table } from 'reactstrap';
import { Link, useHistory } from 'react-router-dom';
import { useTable, usePagination, useSortBy } from 'react-table';

import PaginationControls from './PaginationControls';
import styles from './JobsTable.module.css';
import JobStateBadges from './JobStateBadges';

function JobsTable({ reloadJobs, jobs }) {
  const data = React.useMemo(() => jobs, [jobs]);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Submitted',
        accessor: 'attributes.createdAt',
        Cell: ({ value }) => (
          <TimeAgo
            date={value}
            minPeriod={5}
            formatter={(_v, unit, suffix, _e, nextFormatter) => (
              unit === 'second' ?
                `A few seconds ${suffix}` :
                nextFormatter()
            )}
          />
        ),
      },
      {
        Header: 'ID',
        accessor: 'id',
        Cell: ({ value }) => <code>{value}</code>,
      },
      {
        Header: 'Scheduler ID',
        accessor: 'attributes.schedulerId',
        Cell: ({ value }) => (
          value == null ? <span>&mdash;</span> : <code>{value}</code>
        ),
      },
      {
        Header: 'Script',
        accessor: 'script.attributes.name',
        Cell: ({ row, value }) => (
          <ErrorHandledScript job={row.original} name={value} />
        ),
      },
      {
        Header: 'State / Type',
        accessor: 'attributes.state',
        Cell: ({ row }) => (
          <JobStateBadges job={row.original} />
        ),
      },
      {
        Header: 'Start time',
        accessor: (job) => [job.attributes.startTime, job.attributes.estimatedStartTime],
        Cell: TimeCell,
      },
      {
        Header: 'End time',
        accessor: (job) => [job.attributes.endTime, job.attributes.estimatedEndTime],
        Cell: TimeCell,
      },
    ],
    []
  );
  const initialState = {
    sortBy: [{ id: 'attributes.createdAt', desc: true }],
  };
  const tableInstance = useTable({ columns, data, initialState }, useSortBy, usePagination)
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,

    // Pagination functionality.
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex },

  } = tableInstance

  const paginationControls = (
    <PaginationControls
      canNextPage={canNextPage}
      canPreviousPage={canPreviousPage}
      gotoPage={gotoPage}
      nextPage={nextPage}
      pageIndex={pageIndex}
      pageCount={pageCount}
      previousPage={previousPage}
    />
  );

  return (
    <>
    {paginationControls}
    <Table
      {...getTableProps()}
      bordered
      className={styles.JobsTable}
      hover
      striped
    >
      <thead>
        {
          headerGroups.map((headerGroup, i) => (
            <TableHeaders key={i} headerGroup={headerGroup} />
          ))
        }
      </thead>
      <tbody {...getTableBodyProps()}>
        {
          page.map(row => (
            <TableRow
              key={row.original.id}
              prepareRow={prepareRow}
              reloadJobs={reloadJobs}
              row={row}
            />
          ))
        }
      </tbody>
    </Table>
    {paginationControls}
    </>
  );
}

function ErrorHandledScript({ job, name }) {
  const invalid = job.script == null;

  if (invalid) {
    return (
      <span className="text-muted" title="Script is unknown">
        {job.attributes.scriptId}
      </span>
    );
  } else {
    return (
      <Link
        onClick={(ev) => ev.stopPropagation() }
        title="View script"
        to={`/scripts/${job.script.id}`}
      >
        {name}
      </Link>
    );
  }
}

function TableHeaders({ headerGroup }) {
  return (
    <tr {...headerGroup.getHeaderGroupProps()}>
      {
        headerGroup.headers.map(column => (
          <th {...column.getHeaderProps(column.getSortByToggleProps())} >
            {
              column.render('Header')
            }
            <span className="ml-1 float-right" style={{minWidth: 50}}>
              {
                column.isSorted ?
                  column.isSortedDesc ?
                  <i className="fa fa-sort-amount-desc"></i> :
                  <i className="fa fa-sort-amount-asc"></i> :
                  ''
              }
            </span>
          </th>
        ))
      }
    </tr>
  );
}

function TableRow({ prepareRow, reloadJobs, row }) {
  const history = useHistory();
  prepareRow(row);
  const job = row.original;

  return (
    <tr
      {...row.getRowProps()}
      onClick={() => history.push(`/jobs/${job.id}`)}
    >
      {
        row.cells.map(cell => (
          <td {...cell.getCellProps()}>
            { cell.render('Cell') }
          </td>
        ))
      }
    </tr>
  );
}

function TimeCell({row, value, ...rest}) {
  const known = value[0];
  const estimated = value[1];

  if (known == null && estimated == null) {
    const jobState = row.original.attributes.state;
    if (jobState === 'FAILED' || jobState === 'UNKNOWN') {
      return <i>N/A</i>;
    }
    return <i>Unknown</i>;
  }
  return (
    <React.Fragment>
      <TimeAgo
        date={known != null ? known : estimated}
        minPeriod={5}
        formatter={(_v, unit, suffix, _e, nextFormatter) => (
          unit === 'second' ?
          `A few seconds ${suffix}` :
          nextFormatter()
        )}
      />
      {
        known != null ?
          null :
          <Badge className="ml-1" color="warning" pill>Estimated</Badge>
      }
    </React.Fragment>
  );
}

export default JobsTable;
