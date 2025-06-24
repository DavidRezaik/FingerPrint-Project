// Settings tab data and logic
export const settingsData = {
  // Account settings configuration
  getAccountSettings: () => [
    {
      title: "Profile Information",
      description: "Update your personal information",
      action: "Edit",
    },
    {
      title: "Change Password",
      description: "Update your password regularly for security",
      action: "Change",
    },
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      type: "toggle",
      id: "twoFactor",
    },
  ],

  // Appearance settings
  getAppearanceSettings: () => [
    {
      title: "Dark Mode",
      description: "Switch between light and dark themes",
      type: "toggle",
      id: "darkMode",
    },
    {
      title: "Language",
      description: "Choose your preferred language",
      type: "select",
      options: [
        { value: "english", label: "English" },
        { value: "arabic", label: "العربية" },
      ],
    },
  ],

  // Notification settings
  getNotificationSettings: () => [
    {
      title: "Email Notifications",
      description: "Receive updates via email",
      type: "toggle",
      id: "emailNotif",
      defaultChecked: true,
    },
    {
      title: "SMS Notifications",
      description: "Receive updates via SMS",
      type: "toggle",
      id: "smsNotif",
    },
    {
      title: "Browser Notifications",
      description: "Receive updates via browser",
      type: "toggle",
      id: "browserNotif",
      defaultChecked: true,
    },
  ],
}
