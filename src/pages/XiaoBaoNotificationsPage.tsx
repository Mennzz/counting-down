import { XiaoBaoPushNotificationControls } from "@/components/xiaobao/XiaoBaoPushNotificationControls";
import { XiaoBaoSectionShell } from "@/components/xiaobao/XiaoBaoSectionShell";

export default function XiaoBaoNotificationsPage() {
  return (
    <XiaoBaoSectionShell
      title="Xiao Bao notifications"
      description="Choose which of your own devices may show a private Xiao Bao alert. Messages always remain in your private inbox."
    >
      <div className="mx-auto max-w-2xl">
        <XiaoBaoPushNotificationControls />
      </div>
    </XiaoBaoSectionShell>
  );
}
