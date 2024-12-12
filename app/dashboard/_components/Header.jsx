"use client";
import React, { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Home, User, Settings, BarChart2, Brain, Code2, ShieldCheck } from "lucide-react";

const Header = () => {
  const [isUserButtonLoaded, setUserButtonLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const SkeletonLoader = () => (
    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserButtonLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const path = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Aptitude', href: '/dashboard/aptitude', icon: Brain },
    { name: 'Skills', href: '/dashboard/skills', icon: Code2 },
    // Only show admin link for admin users
    ...(user?.publicMetadata?.role === 'admin' ? [
      { name: 'Admin', href: '/dashboard/admin', icon: ShieldCheck }
    ] : []),
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-800">AI-Cruit</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      path === item.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-800 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isUserButtonLoaded ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SkeletonLoader />
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    path === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-800 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={toggleMenu}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              {isUserButtonLoaded ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SkeletonLoader />
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;