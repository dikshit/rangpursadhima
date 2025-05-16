import React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../screens/Authcontext";
import logo from "../images/sadhimalogo-desktop.png";
import profielimage from "../images/profile.jpg";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Mudat", href: "/mudatmarked" },
  { name: "Print", href: "/user-data" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function HeaderLayout({ children, title = "Dashboard" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-[#F5F5DC] shadow">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                <button
  onClick={() => {
    navigate("/dashboard", { replace: false });
    window.location.reload(); // force reload
  }}
  className="focus:outline-none"
>
  <img src={logo} alt="Logo" className="h-10 w-auto" />
</button>

                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex md:space-x-6">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          isActive
                            ? "bg-my-custom-color text-white"
                            : "text-black hover:bg-red-400 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Desktop Profile */}
                <div className="hidden md:flex items-center space-x-4">
                  <img
                    src={profielimage}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition"
                  >
                    Sign out
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden">
                  <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-gray-300">
                    {open ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <DisclosurePanel className="md:hidden bg-[#F5F5DC] px-4 pb-3 pt-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      isActive
                        ? "bg-my-custom-color text-white"
                        : "text-black hover:bg-red-400 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Profile and Logout */}
              <div className="border-t border-gray-300 pt-3 flex items-center space-x-4">
                <img
                  src={profielimage}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition"
                >
                  Sign out
                </button>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Page Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
