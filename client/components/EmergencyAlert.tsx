import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  X, 
  Phone, 
  MapPin, 
  Clock,
  Shield,
  Zap,
  Flame,
  Wind,
  Droplets
} from "lucide-react";
import AlertNotification, { useAlertNotifications } from "./AlertNotification";

interface EmergencyAlert {
  id: string;
  type: string;
  severity: "Minor" | "Moderate" | "Severe" | "Extreme";
  headline: string;
  description: string;
  instruction: string;
  expiresAt: string;
  icon: string;
  color: string;
}

const alertTypes = {
  tornado: {
    icon: "🌪️",
    color: "bg-red-100 border-red-500 text-red-900",
    severity: "Extreme" as const,
    headline: "Tornado Warning",
    description: "A tornado has been spotted in your area. Take immediate shelter.",
    instruction: "Go to the lowest floor, center room, away from windows. Cover your head with a mattress or heavy blankets."
  },
  fire: {
    icon: "🔥",
    color: "bg-orange-100 border-orange-500 text-orange-900",
    severity: "Severe" as const,
    headline: "Fire Emergency",
    description: "Fire reported in your building. Evacuate immediately.",
    instruction: "Use stairs, not elevators. Feel doors before opening. If hot, use alternate route. Meet at designated assembly point."
  },
  flood: {
    icon: "🌊",
    color: "bg-blue-100 border-blue-500 text-blue-900",
    severity: "Moderate" as const,
    headline: "Flood Warning",
    description: "Heavy rainfall causing flooding in your area.",
    instruction: "Avoid driving through flooded areas. Move to higher ground if in a flood-prone area. Stay tuned for updates."
  },
  power: {
    icon: "⚡",
    color: "bg-yellow-100 border-yellow-500 text-yellow-900",
    severity: "Minor" as const,
    headline: "Power Outage Alert",
    description: "Power outage reported in your neighborhood.",
    instruction: "Use flashlights, not candles. Keep refrigerator closed. Unplug sensitive electronics. Check with neighbors."
  },
  gas: {
    icon: "💨",
    color: "bg-red-100 border-red-500 text-red-900",
    severity: "Severe" as const,
    headline: "Gas Leak Alert",
    description: "Natural gas leak detected in your building.",
    instruction: "Evacuate immediately. Do not use phones, lights, or anything that could create a spark. Call 911 from outside."
  }
};

export default function EmergencyAlert() {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const { notifications, addNotification, removeNotification } = useAlertNotifications();

  const createAlert = (type: keyof typeof alertTypes): EmergencyAlert => {
    const alertConfig = alertTypes[type];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: alertConfig.severity,
      headline: alertConfig.headline,
      description: alertConfig.description,
      instruction: alertConfig.instruction,
      expiresAt: expiresAt.toISOString(),
      icon: alertConfig.icon,
      color: alertConfig.color,
    };
  };

  const addAlert = (type: keyof typeof alertTypes) => {
    const newAlert = createAlert(type);
    setActiveAlerts(prev => [newAlert, ...prev]);
    // Also trigger a popup notification
    addNotification(type);
  };

  const removeAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const startSimulation = () => {
    setIsSimulating(true);
    // Simulate different alerts over time
    setTimeout(() => addAlert('power'), 2000);
    setTimeout(() => addAlert('flood'), 8000);
    setTimeout(() => addAlert('fire'), 15000);
    setTimeout(() => addAlert('tornado'), 25000);
    setTimeout(() => setIsSimulating(false), 35000);
  };

  const clearAllAlerts = () => {
    setActiveAlerts([]);
    setIsSimulating(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Extreme": return <Zap className="h-5 w-5" />;
      case "Severe": return <Flame className="h-5 w-5" />;
      case "Moderate": return <Wind className="h-5 w-5" />;
      case "Minor": return <Droplets className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "Extreme": return "bg-red-100 text-red-800 border-red-200";
      case "Severe": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Moderate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Minor": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (activeAlerts.length === 0) {
  return (
    <>
      {/* Popup Notifications */}
      {notifications.map((notification) => (
        <AlertNotification
          key={notification.id}
          alert={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <div className="space-y-4">
        <div className="text-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
          <p className="text-muted-foreground mb-4">
            Your area is currently safe. Use the demo controls below to simulate emergency alerts.
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={startSimulation}
              disabled={isSimulating}
              variant="outline"
              size="sm"
            >
              {isSimulating ? "Simulating..." : "Start Demo Simulation"}
            </Button>
            <Button
              onClick={() => addAlert('tornado')}
              variant="destructive"
              size="sm"
            >
              🌪️ Tornado
            </Button>
            <Button
              onClick={() => addAlert('fire')}
              variant="destructive"
              size="sm"
            >
              🔥 Fire
            </Button>
            <Button
              onClick={() => addAlert('flood')}
              variant="default"
              size="sm"
            >
              🌊 Flood
            </Button>
            <Button
              onClick={() => addAlert('power')}
              variant="secondary"
              size="sm"
            >
              ⚡ Power Outage
            </Button>
            <Button
              onClick={() => addAlert('gas')}
              variant="destructive"
              size="sm"
            >
              💨 Gas Leak
            </Button>
          </div>
        </div>
      </div>
    </>
  );
  }

  return (
    <>
      {/* Popup Notifications */}
      {notifications.map((notification) => (
        <AlertNotification
          key={notification.id}
          alert={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Active Emergency Alerts ({activeAlerts.length})
          </h3>
          <Button
            onClick={clearAllAlerts}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

      {activeAlerts.map((alert) => (
        <Alert key={alert.id} className={`${alert.color} border-2 animate-in slide-in-from-top-2`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{alert.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-lg">{alert.headline}</h4>
                <Badge className={getSeverityBadgeColor(alert.severity)}>
                  {getSeverityIcon(alert.severity)}
                  <span className="ml-1">{alert.severity}</span>
                </Badge>
              </div>
              
              <AlertDescription className="text-base mb-3">
                {alert.description}
              </AlertDescription>
              
              <div className="bg-white/50 rounded-lg p-3 mb-3">
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  What to do:
                </h5>
                <p className="text-sm">{alert.instruction}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Expires: {new Date(alert.expiresAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Your Location</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => removeAlert(alert.id)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
      
        <div className="text-center">
          <Button
            onClick={() => addAlert('tornado')}
            variant="outline"
            size="sm"
            className="mr-2"
          >
            Add More Alerts
          </Button>
        </div>
      </div>
    </>
  );
}
