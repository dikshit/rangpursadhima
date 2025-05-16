import HeaderLayout from '../common/HeaderLayout';
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Mudatmarked() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (date) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://192.168.29.87:5000/api/attendance/summary?date=${date}`
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    if (date) setSelectedDate(date);
  };

  const calculateTotalAttendance = () => {
    const userIds = new Set();
    summary?.breakdown?.forEach(row => {
      if (row.morning === "Y" || row.evening === "Y") {
        userIds.add(row.user_id);
      }
    });
    return userIds.size;
  };

  const calculateBreakdownByLocation = () => {
    const map = {};
    let grandTotal = 0;

    summary?.breakdown?.forEach(row => {
      const key = `${row.CITY_AREA_VILLAGE}||${row.DISTRICT}||${row.STATE}`;
      if (!map[key]) {
        map[key] = {
          CITY_AREA_VILLAGE: row.CITY_AREA_VILLAGE,
          DISTRICT: row.DISTRICT,
          STATE: row.STATE,
          morning: 0,
          evening: 0,
          users: new Set(),
        };
      }
      if (row.morning === "Y") {
        map[key].morning += 1;
        map[key].users.add(row.user_id);
      }
      if (row.evening === "Y") {
        map[key].evening += 1;
        map[key].users.add(row.user_id);
      }
    });

    const breakdown = Object.values(map).map(loc => {
      const total = loc.users.size;
      grandTotal += total;
      return { ...loc, total };
    });

    return { breakdown, grandTotal };
  };

  return (
    <HeaderLayout title="">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mudat Summary</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border px-4 py-2 rounded-md shadow-sm"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : summary ? (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-100 text-blue-900 p-4 rounded-lg shadow">
                <h2 className="font-semibold text-lg">Morning Present</h2>
                <p className="text-3xl font-bold">{Number(summary.morningCount) || 0}</p>
              </div>
              <div className="bg-green-100 text-green-900 p-4 rounded-lg shadow">
                <h2 className="font-semibold text-lg">Evening Present</h2>
                <p className="text-3xl font-bold">{Number(summary.eveningCount) || 0}</p>
              </div>
              <div className="bg-purple-100 text-purple-900 p-4 rounded-lg shadow">
                <h2 className="font-semibold text-lg">Both Present</h2>
                <p className="text-3xl font-bold">{Number(summary.bothCount) || 0}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-yellow-100 text-yellow-900 p-4 rounded-lg shadow">
                <h2 className="font-semibold text-lg">Total Attendance</h2>
                <p className="text-3xl font-bold">{calculateTotalAttendance()}</p>
              </div>
            </div>

            <h3 className="font-semibold text-xl mb-2">Breakdown by Location</h3>
            <div className="overflow-x-auto rounded-lg shadow mb-10">
              <table className="w-full table-auto border border-red-600 text-sm">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="p-3 border">City</th>
                    <th className="p-3 border">District</th>
                    <th className="p-3 border">State</th>
                    <th className="p-3 border">Morning Present</th>
                    <th className="p-3 border">Evening Present</th>
                    <th className="p-3 border">Total (Unique)</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {calculateBreakdownByLocation().breakdown.map((loc, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border text-gray-800">{loc.CITY_AREA_VILLAGE}</td>
                      <td className="p-3 border text-gray-800">{loc.DISTRICT}</td>
                      <td className="p-3 border text-gray-800">{loc.STATE}</td>
                      <td className="p-3 border text-center text-blue-700 font-medium">{loc.morning}</td>
                      <td className="p-3 border text-center text-green-700 font-medium">{loc.evening}</td>
                      <td className="p-3 border text-center font-semibold">{loc.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-red-600 font-semibold text-white">
                    <td colSpan="5" className="p-3 text-right">Grand Total (Unique):</td>
                    <td className="p-3 text-center">{calculateBreakdownByLocation().grandTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="font-semibold text-xl mb-2">Users Who Marked Attendance</h3>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="w-full table-auto border border-red-600 text-sm">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="p-3 border">Sevakcode</th>
                    <th className="p-3 border">First Name</th>
                    <th className="p-3 border">Last Name</th>
                    <th className="p-3 border">City</th>
                    <th className="p-3 border">Morning</th>
                    <th className="p-3 border">Evening</th>
                    <th className="p-3 border">Both</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {summary?.breakdown?.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border text-gray-800">{user.Sevakcode}</td>
                      <td className="p-3 border text-gray-800">{user.FIRST_NAME}</td>
                      <td className="p-3 border text-gray-800">{user.LAST_NAME}</td>
                      <td className="p-3 border text-gray-800">{user.CITY_AREA_VILLAGE}</td>
                      <td className="p-3 border text-center text-blue-700 font-medium">{user.morning}</td>
                      <td className="p-3 border text-center text-green-700 font-medium">{user.evening}</td>
                      <td className="p-3 border text-center font-semibold">{user.both}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No data available for selected date.</p>
        )}
      </div>
    </HeaderLayout>
  );
}
