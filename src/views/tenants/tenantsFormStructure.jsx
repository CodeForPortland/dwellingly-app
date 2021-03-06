import { Link } from "react-router-dom";
import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from "../../components/ToolTip/ToolTip"
import './tenants.scss'


export const columns = [
  {
    dataField: "fullName",
    formatter: (cell, row, rowIndex, formatExtraData) => {
      return (
        <div>
          {(!row.fullName || row.staff.length === 0 || !row.phone) ?
            <Tooltip
              content="Tenant profile not complete"
              direction="left"
            >
              <FontAwesomeIcon
                className="tenants bell-icon"
                icon={faExclamationTriangle}
              />
            </Tooltip>
            : null
          }
          <Link
            key={row.id}
            to={`/manage/tenants/${row.id}`}
            className="tenant-name"
          >
            {row.fullName}
          </Link>
        </div >
      );
    },
    text: "Name",
    sort: true,
  },
  {
    dataField: "propertyName",
    formatter: (cell, row, rowIndex, formatExtraData) => {
      return (
        <Link key={row.lease.id} to={`/manage/properties/${row.lease.propertyID}`}>
          {row.propertyName}
        </Link>
      )
    },
    text: "Property Name",
    sort: true,
  },
  {
    dataField: `staff`,
    formatter: (cell, row, rowIndex, formatExtraData) => {
      return (
        row.staff.map((staff, index) =>
          <p key={`${staff}-${index}`} >
            <Link key={row.id} to={`/staff`}>
              {staff}
            </Link>
          </p >
        ))
    },
    text: "JOIN Staff",
    sort: true,
  },
  {
    dataField: "phone",
    text: "Phone",
    sort: true,
  },
];


export const selectRow = {
  mode: "checkbox",
  clickToSelect: true,
  sort: true,
  headerColumnStyle: () => {
    return { width: "5%" };
  },
};
