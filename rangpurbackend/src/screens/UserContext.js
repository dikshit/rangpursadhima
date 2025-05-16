import { createContext, useContext, useState } from 'react';

// Create the UserContext
const UserContext = createContext();

// UserContext provider component
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  
  return (
    <UserContext.Provider value={{ users, setUsers }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);
