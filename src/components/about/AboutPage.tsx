import React from "react";
import MainLayout from "../layout/MainLayout";
import PageTitle from "../common/PageTitle";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SEOHead from "../common/SEOHead";

const teamMembers = [
  {
    name: "John Mokgwathi",
    role: "Project Director",
    bio: "John has over 15 years of experience in public administration and civic engagement projects.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
  {
    name: "Sarah Molefe",
    role: "Community Liaison",
    bio: "Sarah specializes in community outreach and ensuring citizen voices are heard in governance.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  },
  {
    name: "David Kgosi",
    role: "Technical Lead",
    bio: "David brings extensive experience in developing digital solutions for government services.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
  },
  {
    name: "Lesedi Tau",
    role: "Data Analyst",
    bio: "Lesedi specializes in analyzing civic data to identify trends and improve service delivery.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lesedi",
  },
];

const AboutPage = () => {
  return (
    <MainLayout>
      <SEOHead
        title="About Us"
        description="Learn about the Civic Portal team and our mission to improve community engagement with government."
      />

      <PageTitle
        title="About Us"
        description="Learn about our mission and the team behind Civic Portal"
        breadcrumbs={[{ label: "About Us" }]}
      />

      <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12">
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-lg">
                Civic Portal was created with a simple but powerful mission: to
                bridge the gap between citizens and government through
                technology.
              </p>
              <p>
                We believe that effective governance requires active citizen
                participation, and that technology can make this participation
                more accessible, transparent, and impactful.
              </p>
              <p>
                By providing a platform where citizens can report issues, track
                progress, and collaborate on solutions, we aim to foster a more
                responsive and accountable relationship between communities and
                their government representatives.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&h=400&fit=crop"
                alt="Community meeting"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {member.role}
                  </p>
                  <p className="text-sm">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Our Approach</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Citizen-Centered</h3>
                <p>
                  We design all our features with citizens' needs at the
                  forefront, ensuring the platform is accessible and useful for
                  everyone regardless of technical expertise.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Transparent</h3>
                <p>
                  We believe in full transparency in the issue resolution
                  process, allowing citizens to track progress and hold
                  officials accountable.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Collaborative</h3>
                <p>
                  Our platform encourages collaboration between citizens,
                  community organizations, and government officials to find
                  effective solutions to civic issues.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
