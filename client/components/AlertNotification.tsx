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
  Droplets,
  Bell
} from "lucide-react";

interface AlertNotification {
  id: string;
  type: string;
  severity: "Minor" | "Moderate" | "Severe" | "Extreme";
  headline: string;
  description: string;
  instruction: string;
  timestamp: string;
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

interface AlertNotificationProps {
  onClose: () => void;
  alert: AlertNotification;
}

export default function AlertNotification({ onClose, alert }: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Alert className={`${alert.color} border-2 shadow-lg animate-in slide-in-from-right-2`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">{alert.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 animate-pulse" />
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
                <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Your Location</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}

// Hook for managing alert notifications
export function useAlertNotifications() {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  const createAlert = (type: keyof typeof alertTypes): AlertNotification => {
    const alertConfig = alertTypes[type];
    const now = new Date();

    return {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: alertConfig.severity,
      headline: alertConfig.headline,
      description: alertConfig.description,
      instruction: alertConfig.instruction,
      timestamp: now.toISOString(),
      icon: alertConfig.icon,
      color: alertConfig.color,
    };
  };

  const addNotification = (type: keyof typeof alertTypes) => {
    const newAlert = createAlert(type);
    setNotifications(prev => [newAlert, ...prev]);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      removeNotification(newAlert.id);
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
}
