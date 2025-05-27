import React from 'react';
import MainLayout from '../layout/MainLayout';
import PageTitle from '../common/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import SEOHead from '../common/SEOHead';
import { Mail, Phone, MapPin } from 'lucide-react';

const teamMembers = [
  {
    name: 'Kealeboga Eugene Ratshipa',
    role: 'Developer',
    bio: 'John has over 15 years of experience in public administration and civic engagement projects.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
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
        breadcrumbs={[{ label: 'About Us' }]}
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

        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Have questions about the Civic Portal or need technical
                  support? We're here to help! Contact us through any of the
                  following channels:
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp Support</p>
                      <a
                        href="https://wa.me/26772977535"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        +267 72977535
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-muted-foreground">
                        contact@civicportal.gov.bw
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Office Location</p>
                      <p className="text-muted-foreground">
                        Government Enclave, Gaborone, Botswana
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button asChild className="w-full">
                    <a
                      href="https://wa.me/26772977535"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                      </svg>
                      Contact via WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our support team is available to assist you during the
                  following hours:
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-muted-foreground">
                      8:00 AM - 5:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Saturday</span>
                    <span className="text-muted-foreground">
                      9:00 AM - 1:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Emergency Issues:</strong> For urgent civic issues
                    that require immediate attention, please contact the
                    relevant emergency services directly. The Civic Portal is
                    for non-emergency civic matters.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
