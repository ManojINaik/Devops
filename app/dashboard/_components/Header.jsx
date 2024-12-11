"use client";
import React, { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Home, User, Settings, BarChart2, Brain } from "lucide-react";

const Header = () => {
  const [isUserButtonLoaded, setUserButtonLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    // { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-16">
          {/* Fixed Logo */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AI-Cruit
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-1 mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = path === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'text-primary font-medium bg-primary/10'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {!isUserButtonLoaded && <SkeletonLoader />}
            <div className={`${!isUserButtonLoaded && 'hidden'}`}>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
                  }
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors duration-300"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden absolute w-full bg-white border-b transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 shadow-sm' : 'max-h-0 overflow-hidden'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = path === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'text-primary font-medium bg-primary/10'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Header;