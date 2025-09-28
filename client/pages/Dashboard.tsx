import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  MapPin,
  Calendar,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Shield,
  Heart,
} from "lucide-react";
import EmergencyAlert from "@/components/EmergencyAlert";

interface MockData {
  user: any;
  home: any;
  contacts: any[];
  tasks: any[];
  alerts: any[];
  attomSnapshots: any[];
}

export default function Dashboard() {
  const [mockData, setMockData] = useState<MockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMockData = async () => {
      try {
        // Just load the mock data directly (no authentication needed)
        const response = await fetch("/api/mock/data");
        const result = await response.json();

        if (result.success && result.data.users.length > 0) {
          // Use the first user from the JSON data
          const user = result.data.users[0];
          const home = result.data.homes.find(
            (h: any) => h.user_id === user.id,
          );
          const contacts = result.data.contacts.filter(
            (c: any) => c.user_id === user.id,
          );
          const tasks = home
            ? result.data.tasks.filter((t: any) => t.home_id === home.id)
            : [];
          const alerts = home
            ? result.data.alerts.filter((a: any) => a.home_id === home.id)
            : [];
          const attomSnapshots = home
            ? result.data.attom_snapshots.filter(
                (s: any) => s.home_id === home.id,
              )
            : [];

          setMockData({
            user,
            home,
            contacts,
            tasks,
            alerts,
            attomSnapshots,
          });
        } else {
          setError("No data available");
        }
      } catch (err) {
        console.error("Error loading mock data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadMockData();
  }, []);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!mockData) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
          <p className="text-muted-foreground mb-4">
            No mock data available for this user.
          </p>
        </div>
      </div>
    );
  }

  const { user, home, contacts, tasks, alerts, attomSnapshots } = mockData;

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "snoozed":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "Minor":
        return "bg-blue-100 text-blue-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      case "Severe":
        return "bg-orange-100 text-orange-800";
      case "Extreme":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user.display_name}!
        </h1>
        <p className="text-muted-foreground">
          Here's your HouseKeep dashboard with your data
        </p>
      </div>

      {/* Emergency Alerts Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Emergency Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmergencyAlert />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Home Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Home Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {home ? (
              <>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{home.address_text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Built in {home.year_built}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {home.bedrooms} bed, {home.bathrooms} bath
                  </span>
                </div>
                <Badge variant="outline">{home.building_type}</Badge>
              </>
            ) : (
              <p className="text-muted-foreground">
                No home information available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contact.phone_e164}
                    </p>
                  </div>
                  {contact.is_primary && (
                    <Badge variant="default" className="text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No emergency contacts</p>
            )}
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getAlertSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{alert.headline}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.instruction}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No active alerts</p>
            )}
          </CardContent>
        </Card>

        {/* Tasks Overview */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Tasks Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>{task.category}</span>
                    </div>
                    {task.next_due && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Due: {new Date(task.next_due).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {task.priority > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Priority {task.priority}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No tasks available</p>
            )}
          </CardContent>
        </Card>

        {/* Attom Data Snapshot */}
        {attomSnapshots.length > 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Property Data (Attom API)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {attomSnapshots.map((snapshot) => (
                  <div key={snapshot.id} className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Property Type:</span>
                      <p className="text-muted-foreground">
                        {snapshot.property_type}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Building Size:</span>
                      <p className="text-muted-foreground">
                        {snapshot.building_sqft} sq ft
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Match Quality:</span>
                      <p className="text-muted-foreground">
                        {(snapshot.match_quality * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Last Updated:</span>
                      <p className="text-muted-foreground">
                        {new Date(snapshot.fetched_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
