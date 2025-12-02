// import React, { useState } from 'react';
// import {
//   Menu, X, Search, Bell, User, Calendar,
//   MessageSquare, Settings, LogOut, ChevronDown, Heart
// } from 'lucide-react';

// const Header = ({
//   user = {
//     name: "Nguyễn Văn A",
//     avatar: "👤",
//     role: "Bệnh nhân"
//   },
//   notifications = 3,
//   onNavigate
// }) => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
//   const [notificationOpen, setNotificationOpen] = useState(false);

//   const navItems = [
//     { label: 'Trang chủ', href: '/' },
//     { label: 'Đặt lịch khám', href: '/booking' },
//     { label: 'Bác sĩ', href: '/doctors' },
//     { label: 'Cơ sở y tế', href: '/hospitals' },
//     { label: 'Liên hệ', href: '/contact' }
//   ];

//   const notificationItems = [
//     {
//       id: 1,
//       title: 'Nhắc nhở lịch khám',
//       message: 'Bạn có lịch khám vào 15/11/2025 lúc 9:00',
//       time: '5 phút trước',
//       unread: true
//     },
//     {
//       id: 2,
//       title: 'Xác nhận đặt lịch',
//       message: 'Lịch khám của bạn đã được xác nhận',
//       time: '1 giờ trước',
//       unread: true
//     },
//     {
//       id: 3,
//       title: 'Kết quả xét nghiệm',
//       message: 'Kết quả xét nghiệm đã sẵn sàng',
//       time: '2 giờ trước',
//       unread: false
//     }
//   ];

//   const profileMenuItems = [
//     { icon: User, label: 'Hồ sơ cá nhân', href: '/profile' },
//     { icon: Calendar, label: 'Lịch hẹn', href: '/appointments' },
//     { icon: Heart, label: 'Yêu thích', href: '/favorites' },
//     { icon: MessageSquare, label: 'Tin nhắn', href: '/messages' },
//     { icon: Settings, label: 'Cài đặt', href: '/settings' },
//     { icon: LogOut, label: 'Đăng xuất', href: '/logout', danger: true }
//   ];

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="text-2xl font-bold text-green-600">
//               🏥 <span className="hidden sm:inline">MedPro</span>
//             </div>
//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden lg:flex items-center gap-1">
//             {navItems.map((item, index) => (

//                 key={index}
//                 href={item.href}
//                 className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors"
//               >
//                 {item.label}
//               </a>
//             ))}
//           </nav>

//           {/* Right Section */}
//           <div className="flex items-center gap-2">
//             {/* Search Button */}
//             <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
//               <Search className="w-5 h-5" />
//             </button>

//             {/* Notifications */}
//             <div className="relative">
//               <button
//                 onClick={() => setNotificationOpen(!notificationOpen)}
//                 className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors relative"
//               >
//                 <Bell className="w-5 h-5" />
//                 {notifications > 0 && (
//                   <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
//                     {notifications}
//                   </span>
//                 )}
//               </button>

//               {/* Notification Dropdown */}
//               {notificationOpen && (
//                 <>
//                   <div
//                     className="fixed inset-0 z-10"
//                     onClick={() => setNotificationOpen(false)}
//                   />
//                   <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20">
//                     <div className="p-4 border-b border-gray-100">
//                       <h3 className="font-bold text-gray-800">Thông báo</h3>
//                     </div>
//                     <div className="max-h-96 overflow-y-auto">
//                       {notificationItems.map((item) => (
//                         <div
//                           key={item.id}
//                           className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
//                             item.unread ? 'bg-green-50' : ''
//                           }`}
//                         >
//                           <div className="flex justify-between items-start mb-1">
//                             <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
//                             {item.unread && (
//                               <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                             )}
//                           </div>
//                           <p className="text-sm text-gray-600 mb-1">{item.message}</p>
//                           <p className="text-xs text-gray-500">{item.time}</p>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="p-3 border-t border-gray-100">
//                       <button className="w-full text-green-600 hover:text-green-700 font-medium text-sm">
//                         Xem tất cả
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* Profile Menu */}
//             <div className="relative hidden md:block">
//               <button
//                 onClick={() => setProfileMenuOpen(!profileMenuOpen)}
//                 className="flex items-center gap-2 p-2 hover:bg-green-50 rounded-lg transition-colors"
//               >
//                 <div className="text-2xl">{user.avatar}</div>
//                 <div className="text-left hidden lg:block">
//                   <div className="text-sm font-medium text-gray-800">{user.name}</div>
//                   <div className="text-xs text-gray-500">{user.role}</div>
//                 </div>
//                 <ChevronDown className="w-4 h-4 text-gray-600" />
//               </button>

//               {/* Profile Dropdown */}
//               {profileMenuOpen && (
//                 <>
//                   <div
//                     className="fixed inset-0 z-10"
//                     onClick={() => setProfileMenuOpen(false)}
//                   />
//                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20">
//                     <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
//                       <div className="flex items-center gap-3">
//                         <div className="text-3xl">{user.avatar}</div>
//                         <div>
//                           <div className="font-semibold text-gray-800">{user.name}</div>
//                           <div className="text-xs text-gray-600">{user.role}</div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="py-2">
//                       {profileMenuItems.map((item, index) => {
//                         const Icon = item.icon;
