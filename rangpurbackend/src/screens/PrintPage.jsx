import React, { useEffect, useState } from 'react';
import UserPrintFormat from './UserPrintFormat';
import { languageData } from './languageData';

const PrintPage = () => {
  const [users, setUsers] = useState([]);
  const [language, setLanguage] = useState('english');

  useEffect(() => {
    const storedUsers = localStorage.getItem('printUsers');
    const storedLanguage = localStorage.getItem('language') || 'english';

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    setLanguage(storedLanguage);
  }, []);

  const currentLanguageData = languageData.hasOwnProperty(language)
    ? languageData[language]
    : languageData.english;

  return (
    <div className="px-4 py-6">
      <h2 className="text-center text-2xl font-bold mb-6">Print User Information</h2>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users found for printing.</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {users.map((user, idx) => (
            <UserPrintFormat
              key={user.Sevakcode || idx}
              user={user}
              language={currentLanguageData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PrintPage;
