import React from "react";
import Usercard from "./Usercard";
import HeaderLayout from "../common/HeaderLayout";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <HeaderLayout title="Sevak List">
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-7xl mx-auto">
          <Usercard />
        </div>
      </HeaderLayout>
    </div>
  );
}
