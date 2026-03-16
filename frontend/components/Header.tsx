'use client';

import { useAuth } from '@/hooks/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end">
      {user ? (
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 text-gray-700 hover:text-indigo-600">
            <UserCircleIcon className="w-8 h-8" />
            <span>{user.name || user.email}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      ) : (
        <a href="/auth/login" className="text-indigo-600 hover:text-indigo-800">Sign in</a>
      )}
    </header>
  );
}
