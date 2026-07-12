import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { User, Shield, Mail, MapPin, Camera, Save, X, Phone, Navigation } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Profile: React.FC = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [latitude, setLatitude] = useState<number | null>(user?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(user?.longitude || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      await updateProfile(name, password, phone, location, latitude, longitude);
      setIsEditing(false);
    } catch (e) {
      // Error handled in context
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
      },
      (error) => {
        alert('Unable to retrieve your location');
      }
    );
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
      } catch (err) {
        // Error handled in context
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="My Profile"
        description="View your corporate directory credentials, access permissions and active workspace location."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* User Card - Left Column */}
        <Card className="text-center py-8">
          <div className="relative inline-block select-none group">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#ced4da] mx-auto shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#6c757d] flex items-center justify-center text-white font-bold text-4xl border-2 border-[#ced4da] mx-auto shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-[#dee2e6] rounded-full flex items-center justify-center text-[#495057] shadow-sm hover:text-[#0d6efd] hover:border-[#0d6efd] transition-colors"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          {isEditing ? (
            <div className="mt-6 space-y-4 text-left px-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
              <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#495057] uppercase tracking-wider mb-1">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 w-full px-3 py-2 bg-white border border-[#ced4da] rounded text-[15px] text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:border-[#0d6efd] focus:ring-1 focus:ring-[#0d6efd] transition-shadow"
                    placeholder="Enter location or use GPS"
                  />
                  <Button variant="secondary" onClick={handleGetLocation} className="shrink-0" title="Get GPS Location">
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>
                {(latitude && longitude) && (
                  <p className="text-[11px] text-[#6c757d] mt-1">GPS Coordinates saved.</p>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save</Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-[20px] font-bold text-[#212529] mt-4">{user?.name || '—'}</h3>
              <p className="text-xs text-[#6c757d] font-bold uppercase tracking-wider mt-1">{user?.role || '—'}</p>

              <div className="flex justify-center mt-4">
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  <Edit2Icon className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              </div>

              <div className="space-y-3.5 mt-6 border-t border-[#dee2e6] pt-6 text-left text-xs font-semibold text-[#495057]">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#6c757d]" />
                  <span>{user?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#6c757d]" />
                  <span>{user?.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#6c757d]" />
                  <span>{user?.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[#6c757d]" />
                  <span>{user?.role} Permissions</span>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Audit / Action Logs - Right 2 Columns */}
        <div className="lg:col-span-2 space-y-6 select-none">
          <Card title="Security Permissions Roster" subtitle="Verify your authenticated roles and action thresholds.">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-[14px] font-bold text-[#212529]">Asset Management</h4>
                  <p className="text-xs text-[#6c757d] mt-1 font-semibold leading-relaxed">Register new assets, modify values and declare depreciation timelines.</p>
                </div>
                {['Admin', 'Asset Manager'].includes(user?.role || '') ? (
                  <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded">Granted</span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">Denied</span>
                )}
              </div>

              <div className="flex items-start justify-between border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-[14px] font-bold text-[#212529]">Organization Setup</h4>
                  <p className="text-xs text-[#6c757d] mt-1 font-semibold leading-relaxed">Manage departments, users, and overall enterprise settings.</p>
                </div>
                {['Admin'].includes(user?.role || '') ? (
                  <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded">Granted</span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">Denied</span>
                )}
              </div>

              <div className="flex items-start justify-between border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-[14px] font-bold text-[#212529]">Asset Audit</h4>
                  <p className="text-xs text-[#6c757d] mt-1 font-semibold leading-relaxed">View and verify audit cycles globally or by department.</p>
                </div>
                {['Admin', 'Asset Manager', 'Department Head'].includes(user?.role || '') ? (
                  <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded">Granted</span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">Denied</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Edit2Icon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
