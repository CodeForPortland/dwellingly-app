import React, { useState, useEffect, useContext } from 'react';
import { SearchPanel, SearchPanelVariant } from 'react-search-panel';
import UserContext from '../../UserContext';
import * as axios from 'axios';
import RoleEnum from '../../Enums/RoleEnum';
import Toast from '../../utils/toast';


function ManagerSearchPanel(props) {
  const userContext = useContext(UserContext);
  const [managerOptions, setManagerOptions] = useState([]);
  const [managerSelection, setManagerSelection] = useState([]);
  const [managerSearch, setManagerSearch] = useState('');
  const [assignedPropertyManagers] = useState(props.assignedPropertyManagers)

  const handleSearchChange = async ({ target }) => {
    await setManagerSearch(target.value);
  }

  const handleSelectionChange = (selectedManager) => {
    props.addPropertyManager(selectedManager[0].key);
  }

  useEffect(() => {

    let updatedManagerOptions = managerOptions.filter(
      manager => manager.description.toLowerCase().includes(managerSearch.toLowerCase())
    )
    setManagerSelection(updatedManagerOptions);
  }, [managerSearch])

  useEffect(() => {
    const getManagers = () => {
      axios.get(`${process.env.REACT_APP_PROXY}/api/user?r=${RoleEnum.PROPERTY_MANAGER}`, { headers: { 'Authorization': `Bearer ${userContext.user.accessJwt}` } })
        .then((response) => {
          let updatedManagerOptions = response.data.users.map(({ id, firstName, lastName }) => {
            return ({
              key: id,
              description: `${firstName} ${lastName}`
            });
          });

          updatedManagerOptions = updatedManagerOptions.filter(manager => !assignedPropertyManagers.includes(manager.key));

          setManagerOptions(updatedManagerOptions)
          setManagerSelection(updatedManagerOptions);
        })
        .catch((error) => {
          Toast(error, "error");
          return Promise.reject(error)
        });
    };
    getManagers();
  }, [])

  return (

    <div className='typeahead-section'>
      <SearchPanel
        choices={managerSelection}
        onChange={handleSearchChange}
        onSelectionChange={handleSelectionChange}
        placeholder='Search Property Managers'
        selectedChoices={assignedPropertyManagers}
        value={managerSearch}
        variant={SearchPanelVariant.link}
      />
    </div>
  )
}

export default ManagerSearchPanel;