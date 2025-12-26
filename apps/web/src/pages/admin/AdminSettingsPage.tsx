import { useState } from 'react';
import { Save, Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Uzbek Ta\'lim',
    siteDescription: 'Professional ta\'lim markazi',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    maxUploadSize: 10,
    sessionTimeout: 30,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: API orqali sozlamalarni saqlash
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Sozlamalar saqlandi');
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const settingSections = [
    {
      title: 'Umumiy sozlamalar',
      icon: SettingsIcon,
      color: 'from-blue-500 to-blue-600',
      settings: [
        {
          label: 'Sayt nomi',
          value: settings.siteName,
          onChange: (value: string | boolean | number) => setSettings({ ...settings, siteName: value as string }),
          type: 'text' as const,
        },
        {
          label: 'Sayt tavsifi',
          value: settings.siteDescription,
          onChange: (value: string | boolean | number) => setSettings({ ...settings, siteDescription: value as string }),
          type: 'text' as const,
        },
      ],
    },
    {
      title: 'Xabarnomalar',
      icon: Bell,
      color: 'from-green-500 to-green-600',
      settings: [
        {
          label: 'Email xabarnomalari',
          value: settings.emailNotifications,
          onChange: (value: string | boolean | number) => setSettings({ ...settings, emailNotifications: value as boolean }),
          type: 'checkbox' as const,
        },
        {
          label: 'SMS xabarnomalari',
          value: settings.smsNotifications,
          onChange: (value: string | boolean | number) => setSettings({ ...settings, smsNotifications: value as boolean }),
          type: 'checkbox' as const,
        },
      ],
    },
    {
      title: 'Xavfsizlik',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      settings: [
        {
          label: 'Sessiya vaqti (daqiqa)',
          value: settings.sessionTimeout,
          onChange: (value: string | boolean | number) => setSettings({ ...settings, sessionTimeout: value as number }),
          type: 'number' as const,
        },
        {
          label: 'Texnik xizmat rejimi',
          value: settings.maintenanceMode,
          onChange: (value: string | boolean | number) => setSettings({ ...settings, maintenanceMode: value as boolean }),
          type: 'checkbox' as const,
        },
      ],
    },
    {
      title: 'Ma\'lumotlar bazasi',
      icon: Database,
      color: 'from-purple-500 to-purple-600',
      settings: [
        {
          label: 'Maksimal yuklash hajmi (MB)',
          value: settings.maxUploadSize,
          onChange: (value: string | boolean | number) => setSettings({ ...settings, maxUploadSize: value as number }),
          type: 'number' as const,
        },
      ],
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sozlamalar</h1>
        <p className="text-slate-400">Tizim sozlamalarini boshqarish</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                    <label className="text-slate-300 font-medium flex-1">
                      {setting.label}
                    </label>
                    <div className="flex-1 max-w-xs">
                      {setting.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={setting.value as boolean}
                          onChange={(e) => setting.onChange(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-red-500 focus:ring-red-500 focus:ring-2"
                        />
                      ) : setting.type === 'number' ? (
                        <input
                          type="number"
                          value={setting.value as number}
                          onChange={(e) => setting.onChange(Number(e.target.value))}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={setting.value as string}
                          onChange={(e) => setting.onChange(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Saqlanmoqda...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Saqlash
            </>
          )}
        </button>
      </div>
    </div>
  );
}

