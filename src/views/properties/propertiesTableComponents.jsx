import React from 'react';
import { Link } from "react-router-dom";
export const columns = [{
  dataField: 'name',
  formatter: (cell, row, rowIndex, formatExtraData) => {
    return (
      <Link key={row.id} to={`/manage/properties/${row.id}`}>
        {row.name}
      </Link>
    );
  },
  text: 'Name',
  sort: true,
  headerStyle: () => {
    return { width: "20%" };
  }
}, {
  dataField: 'propertyManagerNames',
  text: 'Property Managers',
  sort: true,
  headerStyle: () => {
    return { width: "20%" };
  }
}, {
  dataField: 'address',
  text: 'Address',
  sort: true,
  headerStyle: () => {
    return { width: "20%" };
  }
}, {
  dataField: 'totalTenants',
  text: 'Tenants',
  sort: true,
  headerStyle: () => {
    return { width: "10%" };
  }
}, {
  dataField: 'created_at',
  text: 'Added On',
  sort: true,
  headerStyle: () => {
    return { width: "10%" };
  }
}];

export const mobileColumns = [{
  dataField: 'name',
  formatter: (cell, row, rowIndex, formatExtraData) => {
    return (
      <Link key={row.id} to={`/manage/properties/${row.id}`}>
        {row.name}
      </Link>
    );
  },
  text: 'Name',
  sort: true,
  headerStyle: () => {
    return { width: "45%" };
  }
}, {
  dataField: 'address',
  text: 'Address',
  sort: true,
  headerStyle: () => {
    return { width: "45%" };
  }
}, {
  dataField: 'totalTenants',
  text: 'Tenants',
  sort: true,
  headerStyle: () => {
    return { width: "10%" };
  }
}];
