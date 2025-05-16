import React from 'react';

const UserPrintFormat = ({ user, language }) => {
 // console.log("📦 Language Props Received in UserPrintFormat:", language);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>{user.FIRST_NAME} {user.LAST_NAME}</h3>
        <p style={styles.sevakcode}><strong>Sevakcode:</strong> {user.Sevakcode}</p>
      </div>

      <div style={styles.divider}></div>

      <div style={styles.body}>
        <div style={styles.row}>
          <p><strong>{language.address}:</strong> {user.ADDRESS}</p>
        </div>
        <div style={styles.row}>
          <p><strong>{language.city}:</strong> {user.CITY_AREA_VILLAGE}</p>
          <p><strong>{language.district}:</strong> {user.DISTRICT}</p>
        </div>
        <div style={styles.row}>
          <p><strong>{language.state}:</strong> {user.STATE}</p>
          <p><strong>{language.taluka}:</strong> {user.TALUKA}</p>
        </div>
        <div style={styles.row}>
          <p><strong>{language.pincode}:</strong> {user.PIN_CODE}</p>
          <p><strong>{language.mobile}:</strong> {user.MOBILE_NO}</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: 'calc(33% - 20px)',
    boxSizing: 'border-box',
    pageBreakInside: 'avoid',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px',
    marginBottom: '10px',
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  sevakcode: {
    fontSize: '14px',
    color: '#555',
  },
  body: {
    fontSize: '14px',
    color: '#333',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  divider: {
    borderTop: '2px solid #333',
    margin: '10px 0',
  },
};

export default UserPrintFormat;
