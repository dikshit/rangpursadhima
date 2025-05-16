import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderLayout from '../common/HeaderLayout';
import { languageData } from './languageData';
import { languageMapping } from './languageMapping';

const UserDataPage = () => {
  const [state, setState] = useState('');
  const [users, setUsers] = useState([]);
  const [states, setStates] = useState([]);
  const [language, setLanguage] = useState('english');
  const navigate = useNavigate();

  const fetchStates = async () => {
    try {
      const res = await fetch('http://192.168.29.87:5000/api/users/states');
      const data = await res.json();
      const validStates = data.filter(stateItem => stateItem.STATE && stateItem.STATE.trim() !== '');
      setStates(validStates);
    } catch (err) {
      console.error('Failed to fetch states', err);
    }
  };

  const fetchUserData = async () => {
    if (!state) return;
    try {
      const encodedState = encodeURIComponent(state);
      const res = await fetch(`http://192.168.29.87:5000/api/users/state?state=${encodedState}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [state]);

  const handleStateChange = (selectedState) => {
    setState(selectedState);
    if (languageMapping.gujarati.includes(selectedState)) {
      setLanguage('gujarati');
    } else if (languageMapping.hindi.includes(selectedState)) {
      setLanguage('hindi');
    } else {
      setLanguage('english');
    }
  };

  const handlePrint = () => {
    if (users.length > 0) {
      localStorage.setItem('printUsers', JSON.stringify(users));
      localStorage.setItem('language', language);
      navigate('/print-page');
    } else {
      alert('No users found for the selected state!');
    }
  };

  return (
    <HeaderLayout>
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">Select State to Fetch Users</h2>

        <div className="flex flex-col sm:flex-row sm:space-x-4 gap-4 mb-6">
          <select
            onChange={(e) => handleStateChange(e.target.value)}
            value={state}
            className="p-3 border border-gray-300 rounded-md w-full sm:w-1/3"
          >
            <option value="">Select State</option>
            {states.map((stateItem, index) => (
              <option key={index} value={stateItem.STATE}>
                {stateItem.STATE}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 w-full sm:w-auto"
          >
            Print Users
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.Sevakcode}
                className="bg-white p-5 rounded-lg shadow border border-gray-200 text-[14px] leading-snug"
              >
                <div className="mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">{user.FIRST_NAME} {user.LAST_NAME}</h4>
                  <p className="text-sm text-gray-600">Sevakcode: {user.Sevakcode}</p>
                </div>

                <hr className="border-t border-gray-300 my-2" />

                <div className="space-y-1 text-gray-700">
                  <p><strong>{languageData[language].address}:</strong> {user.ADDRESS}</p>
                  <div className="flex justify-between gap-2">
                    <p><strong>{languageData[language].city}:</strong> {user.CITY_AREA_VILLAGE}</p>
                    <p><strong>{languageData[language].district}:</strong> {user.DISTRICT}</p>
                  </div>
                  <div className="flex justify-between gap-2">
                    <p><strong>{languageData[language].state}:</strong> {user.STATE}</p>
                    <p><strong>{languageData[language].taluka}:</strong> {user.TALUKA}</p>
                  </div>
                  <div className="flex justify-between gap-2">
                    <p><strong>{languageData[language].pincode}:</strong> {user.PIN_CODE}</p>
                    <p><strong>{languageData[language].mobile}:</strong> {user.MOBILE_NO}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No users found for the selected state.</p>
          )}
        </div>
      </div>
    </HeaderLayout>
  );
};

export default UserDataPage;
