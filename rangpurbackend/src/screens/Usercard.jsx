import React, { useState, useEffect, useMemo } from "react";
import {
  getUsers,
  markAttendance,
  deleteUser,
  getAttendance,
} from "../services/api";
import UserProfileDrawer from "../screens/UserProfileDrawer";
import axios from "axios";
import { debounce } from "lodash";

export default function Usercard() {
  const [userList, setUserList] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearchTerm(searchTerm), 300);
    handler();
    return () => handler.cancel();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUserList(res.data);
      setVisibleUsers(res.data.slice(0, 30));
      await Promise.all(res.data.slice(0, 30).map((user) => loadAttendance(user.id)));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const loadAttendance = async (userId) => {
    try {
      const res = await getAttendance(userId);
      setAttendanceMap((prev) => ({ ...prev, [userId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  const handleAttendance = async (id, slot) => {
    const slotMap = {
      morning: "Morning_presentation",
      evening: "evening_presentation",
    };
    try {
      await markAttendance(id, slotMap[slot]);
      await loadAttendance(id);
      fetchSummary();
    } catch (err) {
      console.error("Attendance failed", err);
    }
  };

  const fetchSummary = async () => {
    try {
      await axios.get(`http://192.168.29.87:5000/api/attendance/summary?date=${today}`);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;
    try {
      await deleteUser(id);
      setUserList((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const filteredUsers = useMemo(() => {
    return (debouncedSearchTerm ? userList : visibleUsers).filter((user) =>
      (
        user.FIRST_NAME +
        user.LAST_NAME +
        user.CITY_AREA_VILLAGE +
        user.Sevakcode +
        user.MOBILE_NO
      )
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, userList, visibleUsers]);

  // ✅ Debounced & batched attendance loading for filtered users
  useEffect(() => {
    const usersToLoad = filteredUsers.filter((user) => !attendanceMap[user.id]);

    if (usersToLoad.length === 0) return;

    const timeoutId = setTimeout(() => {
      usersToLoad.slice(0, 15).forEach((user) => {
        loadAttendance(user.id);
      });
    }, 300); // Adjust delay as needed

    return () => clearTimeout(timeoutId);
  }, [filteredUsers]);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 w-full">
          <input
            type="text"
            placeholder="Search by name, city, code or mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md w-full sm:w-2/3"
          />
          <button
            onClick={() => setSelectedUser({})}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full sm:w-auto"
          >
            + Add Sevak
          </button>
        </div>

        <div className="overflow-auto w-full">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No users to display.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filteredUsers.map((user) => {
                const attendance = attendanceMap[user.id] || {};
                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between relative w-full"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-base font-bold mb-1">
                          {user.FIRST_NAME} {user.LAST_NAME}
                        </h2>
                        <p className="text-blue-600 font-bold text-sm">
                          {user.CITY_AREA_VILLAGE}
                        </p>
                      </div>
                      <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                        <img
                          src={
                            user.image_url && user.image_url !== "null"
                              ? user.image_url.startsWith("/upload")
                                ? `http://192.168.29.87:5000${user.image_url}`
                                : user.image_url
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.FIRST_NAME?.charAt(0) || "S"
                                )}&background=0D8ABC&color=fff`
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center text-sm text-gray-700 my-3 border-b border-red-800 pb-2 gap-y-2">
                      <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-3 py-1 rounded-full">
                        SEVAK
                      </span>
                      <p className="text-sm font-semibold">📞 {user.MOBILE_NO || "N/A"}</p>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="grid grid-cols-2 text-sm mt-3 border-2 border-gray-300 rounded-md overflow-hidden">
                      <div className="text-center border-r py-2">
                        <div className="text-gray-500 font-medium">Sevakcode</div>
                        <div className="text-gray-700 font-semibold">{user.Sevakcode}</div>
                      </div>
                      <div className="text-center bg-gray-300 flex items-center justify-center w-full py-2">
                        <button
                          onClick={() => {
                            loadAttendance(user.id);
                            setSelectedUser(user);
                          }}
                          className="text-gray-700 font-semibold hover:text-red-900 w-full"
                        >
                          View
                        </button>
                      </div>
                    </div>

                    {attendance?.lastMarked && (
                      <div className="text-center text-xs text-green-700 font-semibold mt-2 animate-pulse">
                        Last Mudat: {new Date(attendance.lastMarked).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button
                        onClick={() => handleAttendance(user.id, "morning")}
                        disabled={
                          !!attendance?.lastMorningMarked &&
                          attendance.lastMorningMarked.startsWith(today)
                        }
                        className={`w-full py-2 rounded text-white font-medium ${
                          attendance?.lastMorningMarked?.startsWith(today)
                            ? "bg-blue-200 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        Morning Present
                      </button>

                      <button
                        onClick={() => handleAttendance(user.id, "evening")}
                        disabled={
                          !!attendance?.lastEveningMarked &&
                          attendance.lastEveningMarked.startsWith(today)
                        }
                        className={`w-full py-2 rounded text-white font-medium ${
                          attendance?.lastEveningMarked?.startsWith(today)
                            ? "bg-green-200 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        Evening Present
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {searchTerm === "" && visibleUsers.length < userList.length && (
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                const moreUsers = userList.slice(
                  visibleUsers.length,
                  visibleUsers.length + 30
                );
                await Promise.all(moreUsers.map((u) => loadAttendance(u.id)));
                setVisibleUsers((prev) => [...prev, ...moreUsers]);
              }}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {selectedUser !== null && (
        <UserProfileDrawer
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={() => {
            fetchUsers();
            if (selectedUser?.id) loadAttendance(selectedUser.id);
          }}
        />
      )}
    </div>
  );
}
