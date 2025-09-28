import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  MapPin, 
  Calendar, 
  Phone, 
  Edit3, 
  Save, 
  X,
  User,
  Mail,
  Building,
  Shield,
  Heart,
  RefreshCw
} from "lucide-react";

interface MockData {
  user: any;
  home: any;
  contacts: any[];
  tasks: any[];
  alerts: any[];
  attomSnapshots: any[];
}

const editSchema = z.object({
  name: z.string().min(1, "Required"),
  phone: z.string().min(7, "Enter a valid phone"),
  email: z.string().email("Enter a valid email"),
  address: z.object({
    street: z.string().min(1, "Required"),
    city: z.string().min(1, "Required"),
    state: z.string().min(2, "Required"),
    postalCode: z.string().min(3, "Required"),
  }),
  householdMembers: z.coerce.number().min(0).default(0),
  hasPets: z.boolean().default(false),
  laundryInUnit: z.boolean().default(false),
  hasDishwasher: z.boolean().default(false),
  buildingType: z.enum(["apartment", "condo", "house", "townhome", "other"]),
  yearBuilt: z.coerce.number().min(1800).max(new Date().getFullYear()),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    isPrimary: z.boolean().default(true),
  }),
});

type EditForm = z.infer<typeof editSchema>;

export default function Profile() {
  const [mockData, setMockData] = useState<MockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
      },
      householdMembers: 0,
      hasPets: false,
      laundryInUnit: false,
      hasDishwasher: false,
      buildingType: "apartment",
      yearBuilt: new Date().getFullYear(),
      emergencyContact: {
        name: "",
        phone: "",
        isPrimary: true,
      },
    },
  });

  useEffect(() => {
    const loadMockData = async () => {
      try {
        const response = await fetch("/api/mock/data");
        const result = await response.json();
        
        if (result.success && result.data.users.length > 0) {
          const user = result.data.users[0];
          const home = result.data.homes.find((h: any) => h.user_id === user.id);
          const contacts = result.data.contacts.filter((c: any) => c.user_id === user.id);
          const tasks = home ? result.data.tasks.filter((t: any) => t.home_id === home.id) : [];
          const alerts = home ? result.data.alerts.filter((a: any) => a.home_id === home.id) : [];
          const attomSnapshots = home ? result.data.attom_snapshots.filter((s: any) => s.home_id === home.id) : [];

          setMockData({
            user,
            home,
            contacts,
            tasks,
            alerts,
            attomSnapshots,
          });

          // Populate form with existing data
          if (home) {
            const addressParts = home.address_text.split(', ');
            form.reset({
              name: user.display_name || "",
              phone: user.phone_e164 || "",
              email: user.email || "",
              address: {
                street: addressParts[0] || "",
                city: addressParts[1] || "",
                state: addressParts[2]?.split(' ')[0] || "",
                postalCode: addressParts[2]?.split(' ')[1] || "",
              },
              householdMembers: home.bedrooms || 0,
              hasPets: home.pets === 1,
              laundryInUnit: home.has_central_ac === true,
              hasDishwasher: false, // Not in mock data
              buildingType: home.building_type || "apartment",
              yearBuilt: home.year_built || new Date().getFullYear(),
              emergencyContact: {
                name: contacts[0]?.name || "",
                phone: contacts[0]?.phone_e164 || "",
                isPrimary: contacts[0]?.is_primary || true,
              },
            });
          }
        }
      } catch (err) {
        console.error("Error loading mock data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMockData();
  }, [form]);

  const onSubmit = async (values: EditForm) => {
    setIsSubmitting(true);
    try {
      // Here you would normally save the updated data
      // For now, just show success
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mockData) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Profile Found</h2>
          <p className="text-muted-foreground mb-4">No profile data available.</p>
        </div>
      </div>
    );
  }

  const { user, home, contacts, tasks, alerts, attomSnapshots } = mockData;

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Your Profile</h1>
            <p className="text-muted-foreground">
              View and edit your personal and home information
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Home Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Home Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Chicago" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="IL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="60601" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="buildingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select building type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="townhome">Townhome</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearBuilt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Built</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="householdMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Household Members</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasPets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Has Pets</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="laundryInUnit"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Laundry in Unit</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 987-6543" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.display_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone_e164}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Home Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Home Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {home ? (
                <>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{home.address_text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{home.building_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Built in {home.year_built}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{home.bedrooms} bed, {home.bathrooms} bath</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{home.pets ? "Has Pets" : "No Pets"}</Badge>
                    <Badge variant="outline">{home.has_central_ac ? "Central AC" : "No Central AC"}</Badge>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No home information available</p>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone_e164}</p>
                    </div>
                    {contact.is_primary && (
                      <Badge variant="default" className="text-xs">Primary</Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No emergency contacts</p>
              )}
            </CardContent>
          </Card>

          {/* Property Data */}
          {attomSnapshots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Property Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attomSnapshots.map((snapshot) => (
                  <div key={snapshot.id} className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Property Type:</span>
                      <p className="text-muted-foreground">{snapshot.property_type}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Building Size:</span>
                      <p className="text-muted-foreground">{snapshot.building_sqft} sq ft</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Match Quality:</span>
                      <p className="text-muted-foreground">{(snapshot.match_quality * 100).toFixed(1)}%</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Last Updated:</span>
                      <p className="text-muted-foreground">
                        {new Date(snapshot.fetched_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}