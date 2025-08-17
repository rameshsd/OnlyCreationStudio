
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

const teamMembers = [
    { name: "Alexa Rodriguez", role: "Lead Influencer", avatar: "https://placehold.co/150x150.png" },
    { name: "John Doe", role: "Videographer", avatar: "https://placehold.co/150x150.png?text=JD" },
    { name: "Jane Smith", role: "Copywriter", avatar: "https://placehold.co/150x150.png?text=JS" },
];

const suggestedMembers = [
    { name: "Digital Nomad", role: "Travel Content", avatar: "https://placehold.co/100x100.png?text=DN" },
    { name: "Gamer's Galaxy", role: "Gaming Influencer", avatar: "https://placehold.co/100x100.png?text=GG" },
]

export default function TeamBuilderPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dream Team Builder</h1>
        <p className="text-muted-foreground">Assemble the perfect team for your next big project.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Project: "Eco-Friendly Product Launch"</CardTitle>
                    <CardDescription>Manage your creative team for this project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {teamMembers.map(member => (
                        <div key={member.name} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="creator avatar"/>
                                    <AvatarFallback>{member.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="border-t pt-6">
                     <Button className="w-full">Save Team</Button>
                </CardFooter>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Add Members</CardTitle>
                     <CardDescription>Find and add members to your team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <Input placeholder="Search for creators or providers..." />
                   <h3 className="text-sm font-medium text-muted-foreground pt-4">Suggestions</h3>
                   <div className="space-y-3">
                    {suggestedMembers.map(member => (
                         <div key={member.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="creator avatar"/>
                                    <AvatarFallback>{member.name.substring(0,2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="icon">
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                   </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
