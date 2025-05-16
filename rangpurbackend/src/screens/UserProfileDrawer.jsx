import React, { useState, useEffect } from "react";
import {
  updateUser,
  createUser,
  markAttendance,
  uploadImage,
  getAttendance,
  getAttendanceLog,
} from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

export default function UserProfileDrawer({ selectedUser, onClose, onSave }) {
  const [editableUser, setEditableUser] = useState({ ...selectedUser });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [attendance, setAttendance] = useState({ morning: 0, evening: 0 });
  const [attendanceLog, setAttendanceLog] = useState([]);

  useEffect(() => {
    setEditableUser({ ...selectedUser });
    loadAttendanceData();
  }, [selectedUser]);

  const loadAttendanceData = async () => {
    try {
      const [countRes, logRes] = await Promise.all([
        getAttendance(selectedUser.id),
        getAttendanceLog(selectedUser.id),
      ]);
      setAttendance(countRes.data || {});
      setAttendanceLog(logRes.data || []);
    } catch (err) {
      console.error("Failed to load attendance info", err);
    }
  };

  const groupByDate = (data) => {
    const grouped = {};
    data.forEach(({ slot, timestamp }) => {
      if (!timestamp) return; // 🛡️ skip null or undefined timestamps
      const date = timestamp.split("T")[0];
      if (!grouped[date]) grouped[date] = { date, Morning: 0, Evening: 0 };
      if (slot === "Morning_presentation") grouped[date].Morning += 1;
      if (slot === "evening_presentation") grouped[date].Evening += 1;
    });
    return Object.values(grouped).slice(-14); // last 14 days
  };
  const validate = () => {
    const newErrors = {};
    if (!editableUser.FIRST_NAME) newErrors.FIRST_NAME = "First name required";
    if (!editableUser.Sevakcode) newErrors.Sevakcode = "Sevakcode required";
    if (!editableUser.MOBILE_NO) newErrors.MOBILE_NO = "Mobile number required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const img = e.target.files[0];
    if (img) setFile(img);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      let imageUrl = editableUser.image_url;
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await uploadImage(formData);
        imageUrl = res.data.imageUrl;
      }

      if (editableUser.id) {
        await updateUser(editableUser.id, {
          ...editableUser,
          image_url: imageUrl,
        });
      } else {
        const res = await createUser({ ...editableUser, image_url: imageUrl });
        setEditableUser({ ...editableUser, id: res.data.id });
      }

      if (onSave) onSave({ ...editableUser, image_url: imageUrl });
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const markedToday = (slot) =>
    attendanceLog.some(
      (log) =>
        log.slot === slot &&
        log.timestamp &&
        log.timestamp.split("T")[0] === today
    );

  const handleAttendance = async (slot) => {
    if (!editableUser?.id)
      return alert("Please save the user first before marking attendance.");
    try {
      await markAttendance(editableUser.id, slot);
      await loadAttendanceData();
      // Refetch summary after marking attendance
      fetchSummary();
    } catch (err) {
      console.error("Attendance failed:", err);
    }
  };
  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `http://192.168.29.87:5000/api/attendance/summary?date=${
          new Date().toISOString().split("T")[0]
        }`
      );
      // Handle summary update here if necessary
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };
  return (
    <div className="fixed top-0 right-0 w-full md:w-[700px] h-full bg-white shadow-lg z-50 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Sevak Details</h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-red-500 text-xl"
        >
          &times;
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-[62px] h-[62px] rounded-full overflow-hidden">
            <img
              src={
                editableUser?.image_url && editableUser.image_url !== "null"
                  ? editableUser.image_url.startsWith("/upload")
                    ? `http://192.168.29.87:5000${editableUser.image_url}`
                    : editableUser.image_url
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      editableUser?.FIRST_NAME?.charAt(0) || "S"
                    )}&background=0D8ABC&color=fff`
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h3 className="text-lg font-bold">
              {editableUser.FIRST_NAME} {editableUser.LAST_NAME}
            </h3>
            <p className="text-gray-500">
              @{editableUser.FIRST_NAME?.toLowerCase()}
            </p>
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            ✎ Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ✅ Update
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["Sevakcode", "Sevakcode"],
          ["First Name", "FIRST_NAME"],
          ["Last Name", "LAST_NAME"],
          ["Address", "ADDRESS"],
          ["City", "CITY_AREA_VILLAGE"],
          ["PIN Code", "PIN_CODE"],
          ["Taluka", "TALUKA"],
          ["District", "DISTRICT"],
          ["State", "STATE"],
          ["Country", "COUNTRY"],
          ["Mobile No", "MOBILE_NO"],
          ["Contact No", "CONTACT_NO"],
        ].map(([label, field]) => (
          <div key={field}>
            <label className="font-semibold text-sm text-gray-700">
              {label}
            </label>
            {isEditing ? (
              <input
                name={field}
                value={editableUser[field] || ""}
                onChange={handleChange}
                className="w-full mt-1 border rounded px-3 py-2"
              />
            ) : (
              <p className="text-gray-800 mt-1">{editableUser[field] || "—"}</p>
            )}
            {errors[field] && (
              <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
            )}
          </div>
        ))}

        <div>
          <label className="font-semibold text-sm text-gray-700">DOB</label>
          {isEditing ? (
            <input
              type="date"
              name="DOB"
              value={editableUser.DOB || ""}
              onChange={handleChange}
              className="w-full mt-1 border rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-800 mt-1">{editableUser.DOB || "—"}</p>
          )}
        </div>

        {isEditing && (
          <div>
            <label className="font-semibold text-sm text-gray-700">
              Profile Image
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full mt-1 border rounded px-3 py-2"
            />
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            label: "Morning",
            slot: "Morning_presentation",
            color: "bg-blue-600",
          },
          {
            label: "Evening",
            slot: "evening_presentation",
            color: "bg-green-600",
          },
        ].map(({ label, slot, color }) => (
          <div key={slot} className="bg-gray-50 p-4 rounded-md border">
            <button
              onClick={() => handleAttendance(slot)}
              disabled={markedToday(slot)}
              className={`${color} text-white px-4 py-2 rounded w-full disabled:opacity-50`}
            >
              {label} Present
            </button>
            <p className="text-sm mt-2 text-gray-700">
              Total:{" "}
              {slot.includes("Morning")
                ? attendance.morning
                : attendance.evening}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-md font-semibold mb-2">📊 Attendance History</h3>
        <div className="w-full h-64 bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupByDate(attendanceLog)}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Morning" fill="#3B82F6" />
              <Bar dataKey="Evening" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
