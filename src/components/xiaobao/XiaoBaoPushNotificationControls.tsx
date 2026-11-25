import { Bell, BellOff, Loader2, Send, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useEnableXiaoBaoPush,
  useRevokeXiaoBaoPush,
  useTestXiaoBaoPush,
  useXiaoBaoPushCapability,
  useXiaoBaoPushSubscriptions,
} from "@/hooks/use-xiaobao-push";
import { getXiaoBaoPushDeviceId } from "@/services/xiaobao-push";

const displayDate = (value: string | null | undefined) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : null;

export function XiaoBaoPushNotificationControls() {
  const capability = useXiaoBaoPushCapability();
  const subscriptions = useXiaoBaoPushSubscriptions();
  const enable = useEnableXiaoBaoPush();
  const revoke = useRevokeXiaoBaoPush();
  const test = useTestXiaoBaoPush();
  const currentDeviceId = getXiaoBaoPushDeviceId();
  const currentDevice = subscriptions.data?.devices.find((device) => device.deviceId === currentDeviceId);
  const isPending = enable.isPending || revoke.isPending || test.isPending;

  if (capability.isLoading) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground">Checking notification support…</CardContent></Card>;
  }

  const currentCapability = capability.data;
  if (!currentCapability || currentCapability.status === "UNSUPPORTED") {
    return (
      <Card className="border-amber-200 bg-amber-50/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-950"><BellOff className="h-5 w-5" />Notifications aren’t available here</CardTitle>
          <CardDescription className="text-amber-900">Your private Xiao Bao inbox still works normally in this browser.</CardDescription>
        </CardHeader>
        {currentCapability?.needsIosHomeScreenInstall && <IosInstallGuidance />}
      </Card>
    );
  }

  if (currentCapability.needsIosHomeScreenInstall) {
    return (
      <Card className="border-amber-200 bg-amber-50/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-950"><Smartphone className="h-5 w-5" />Install BIBI Dairy first</CardTitle>
          <CardDescription className="text-amber-900">On iPhone and iPad, notifications work from the installed Home Screen app.</CardDescription>
        </CardHeader>
        <IosInstallGuidance />
      </Card>
    );
  }

  if (currentCapability.status === "INSECURE_CONTEXT") {
    return (
      <Card className="border-amber-200 bg-amber-50/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-950"><BellOff className="h-5 w-5" />Notifications need a secure connection</CardTitle>
          <CardDescription className="text-amber-900">Open BIBI Dairy over HTTPS to enable notifications. Your private inbox remains available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isDenied = currentCapability.permission === "denied";
  const isActive = Boolean(currentDevice);
  return (
    <Card className="border-rose-100 bg-white/85 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-950"><Bell className="h-5 w-5" />Notifications on your devices</CardTitle>
        <CardDescription>
          The private Xiao Bao inbox is always the source of truth. Alerts only say that a new private message is waiting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isDenied ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" role="status">
            Notifications are blocked in this browser. Re-enable them in browser or system settings, then return here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {!isActive && (
              <Button disabled={isPending} onClick={() => enable.mutate()}>
                {enable.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
                Enable on this device
              </Button>
            )}
            {isActive && (
              <>
                <Button variant="outline" disabled={isPending} onClick={() => test.mutate()}>
                  {test.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send test
                </Button>
                <Button variant="outline" disabled={isPending} onClick={() => revoke.mutate()}>
                  {revoke.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellOff className="mr-2 h-4 w-4" />}
                  Revoke this device
                </Button>
              </>
            )}
          </div>
        )}

        <p className="flex items-start gap-2 rounded-xl bg-rose-50/70 p-3 text-xs leading-5 text-slate-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          Lock-screen previews never include Xiao Bao message text, routine names, or relationship details. Opening an alert takes you to the matching private inbox message.
        </p>

        {subscriptions.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your devices…</p>
        ) : subscriptions.isError ? (
          <p className="text-sm text-muted-foreground">Your device list is temporarily unavailable. You can still use your private inbox.</p>
        ) : subscriptions.data?.devices.length ? (
          <ul className="space-y-2" aria-label="Notification devices">
            {subscriptions.data.devices.map((device) => {
              const isCurrent = device.deviceId === currentDeviceId;
              return (
                <li key={device.deviceId} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{isCurrent ? "This device" : device.deviceName || "Another device"}</p>
                    <p className="text-xs text-muted-foreground">
                      Notifications enabled
                      {displayDate(device.lastSuccessAt) ? ` · Last delivered ${displayDate(device.lastSuccessAt)}` : ""}
                    </p>
                  </div>
                  {isCurrent && <span className="text-xs font-medium text-emerald-700">Current</span>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No devices are enabled yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function IosInstallGuidance() {
  return (
    <CardContent className="space-y-3 text-sm text-amber-950">
      <ol className="list-decimal space-y-1 pl-5">
        <li>Tap Share in Safari.</li>
        <li>Choose <strong>Add to Home Screen</strong>.</li>
        <li>Open BIBI Dairy from its new Home Screen icon.</li>
        <li>Return here and choose “Enable on this device.”</li>
      </ol>
      <p className="text-xs text-amber-900">Permission is requested only when you choose to enable it.</p>
    </CardContent>
  );
}
