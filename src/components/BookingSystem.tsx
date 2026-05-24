import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, Camera, Users, Award, ArrowRight, ArrowLeft, Calendar as CalendarIcon, Mail, MapPin, Smartphone, Film } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/lib/api-service';
import { trackBookingIntent } from '@/components/Analytics';
import { format } from 'date-fns';

interface BookingData {
  serviceType: string;
  packageType: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  location: string;
  locationType: 'studio' | 'on-location' | 'both';
  fullName: string;
  email: string;
  phone: string;
  message: string;
  budget: string;
}

const BOOKING_STEPS = [
  { id: 1, title: 'Your Session', icon: Camera },
  { id: 2, title: 'Date & Time', icon: CalendarIcon },
  { id: 3, title: 'Your Details', icon: Users },
  { id: 4, title: 'Confirmed', icon: CheckCircle },
];

const SERVICE_TYPES = [
  {
    id: 'headshots',
    name: 'Headshots & Portraits',
    description: 'Studio or mobile — individuals, teams & LinkedIn. We come to your office across RI, MA, ME & CT.',
    icon: Smartphone,
    duration: '1–3 hours',
    startingPrice: 'From $499',
    isMobile: true,
  },
  {
    id: 'beauty',
    name: 'Beauty Photography',
    description: 'Elegant beauty portraits for personal brands and cosmetics',
    icon: Award,
    duration: '1–5 hours',
    startingPrice: 'From $499',
    isMobile: false,
  },
  {
    id: 'fashion',
    name: 'Fashion Photography',
    description: 'For aspiring models, influencers, designers & luxury brands',
    icon: Camera,
    duration: '1–8 hours',
    startingPrice: 'From $499',
    isMobile: false,
  },
  {
    id: 'glamour',
    name: 'Glamour Photography',
    description: 'Dramatic lighting, bold styling, unforgettable portraits',
    icon: Camera,
    duration: '1–4 hours',
    startingPrice: 'From $499',
    isMobile: false,
  },
  {
    id: 'editorial',
    name: 'Editorial Photography',
    description: 'Magazine-quality storytelling for publications & brands',
    icon: Camera,
    duration: '1–8 hours',
    startingPrice: 'From $499',
    isMobile: false,
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Photography',
    description: 'Authentic moments — individuals, couples & families',
    icon: Users,
    duration: '1–4 hours',
    startingPrice: 'From $499',
    isMobile: false,
  },
  {
    id: 'wedding',
    name: 'Wedding & Engagements',
    description: 'From intimate engagements to full-day celebrations across New England',
    icon: Award,
    duration: '1.5–10 hours',
    startingPrice: 'From $499',
    isMobile: false,
  },
  {
    id: 'events',
    name: 'Events & Celebrations',
    description: 'Sweet sixteens, galas, corporate events & milestones',
    icon: Users,
    duration: '2–8 hours',
    startingPrice: 'From $499',
    isMobile: false,
  },
  {
    id: 'real-estate',
    name: 'Real Estate Photography',
    description: 'Mobile shoots — we come to the property across RI, MA, ME & CT',
    icon: Smartphone,
    duration: '2–4 hours',
    startingPrice: 'From $499',
    isMobile: true,
  },
  {
    id: 'motion',
    name: 'Motion Video',
    description: 'Social reels to full brand productions — in partnership with urs79.com',
    icon: Film,
    duration: '1+ day',
    startingPrice: 'From $499',
    isMobile: false,
    isMotion: true,
  },
];

const PACKAGE_TYPES = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'From $499',
    features: ['1-hour session', '10–15 edited images', 'Online gallery delivery'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'From $799',
    features: ['2–3 hour session', '20–30 edited images', 'Advanced retouching', 'Multiple looks'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'From $1,500',
    features: ['4–6 hour session', '50+ edited images', 'Full retouching', 'Creative direction'],
  },
  {
    id: 'custom',
    name: 'Custom / Full Campaign',
    price: 'Quote on request',
    features: ['Full day+', '100+ images', 'Full production team', 'Location scouting', 'Motion video add-on available'],
  },
];

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

const BookingSystem: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceType: '',
    packageType: '',
    selectedDate: undefined,
    selectedTime: '',
    location: '',
    locationType: 'both',
    fullName: '',
    email: '',
    phone: '',
    message: '',
    budget: '',
  });

  const formatDate = (date: Date | undefined, formatStr: string): string => {
    if (!date) return 'Not selected';
    try {
      return format(date, formatStr);
    } catch {
      if (formatStr === 'MMMM dd, yyyy') {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } else if (formatStr === 'yyyy-MM-dd') {
        return date.toISOString().split('T')[0];
      }
      return date.toLocaleDateString();
    }
  };

  const updateBookingData = <K extends keyof BookingData>(field: K, value: BookingData[K]) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < BOOKING_STEPS.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      trackBookingIntent('booking_system', bookingData.location);

      const result = await apiService.sendContactEmail({
        full_name: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone,
        message: `Booking Request:
Service: ${bookingData.serviceType}
Package: ${bookingData.packageType}
Date: ${formatDate(bookingData.selectedDate, 'MMMM dd, yyyy')}
Time: ${bookingData.selectedTime}
Location: ${bookingData.location} (${bookingData.locationType})
Budget: ${bookingData.budget}

${bookingData.message}`,
        service_type: bookingData.serviceType,
        budget_range: bookingData.budget,
        event_date:
          formatDate(bookingData.selectedDate, 'yyyy-MM-dd') === 'Not selected'
            ? ''
            : formatDate(bookingData.selectedDate, 'yyyy-MM-dd'),
        location: bookingData.location,
      });

      if (result.success) {
        nextStep();
        toast({ title: 'Booking Request Submitted!', description: "We'll confirm within 24 hours." });
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'There was an issue submitting your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(bookingData.serviceType && bookingData.packageType);
      case 2:
        return !!(bookingData.selectedDate && bookingData.selectedTime);
      case 3:
        return !!(bookingData.fullName && bookingData.email && bookingData.message && bookingData.location);
      default:
        return true;
    }
  };

  // Step 1: Service + Package selection
  const renderServiceSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your Session</h2>
        <p className="text-gray-400">Select a service type, then pick your package</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICE_TYPES.map((service) => {
          const Icon = service.icon;
          const isSelected = bookingData.serviceType === service.id;
          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? 'border-photo-red bg-photo-red/10 ring-1 ring-photo-red'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
              onClick={() => updateBookingData('serviceType', service.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="w-5 h-5 text-photo-red flex-shrink-0" />
                    <CardTitle className="text-white text-base truncate">{service.name}</CardTitle>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-photo-red flex-shrink-0 ml-2" />}
                </div>
                <CardDescription className="text-gray-400 text-sm">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-2">
                  {service.isMobile && (
                    <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] px-2 py-0.5">
                      <Smartphone className="w-2.5 h-2.5" /> Mobile
                    </span>
                  )}
                  {service.isMotion && (
                    <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[10px] px-2 py-0.5">
                      <Film className="w-2.5 h-2.5" /> urs79.com
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration}
                  </span>
                  <span className="font-semibold text-photo-red">{service.startingPrice}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bookingData.serviceType && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Select Your Package</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {PACKAGE_TYPES.map((pkg) => {
              const isSelected = bookingData.packageType === pkg.id;
              return (
                <Card
                  key={pkg.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-photo-red bg-photo-red/10 ring-1 ring-photo-red'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                  onClick={() => updateBookingData('packageType', pkg.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base">{pkg.name}</CardTitle>
                      {isSelected && <CheckCircle className="w-4 h-4 text-photo-red" />}
                    </div>
                    <CardDescription className="text-photo-red font-semibold text-sm">{pkg.price}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle className="w-3 h-3 text-photo-red flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: Date & Time
  const renderDateTimeSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Pick a Date & Time</h2>
        <p className="text-gray-400">Choose when you'd like your session</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Label className="text-white mb-3 block font-medium">Select Date</Label>
          <Calendar
            mode="single"
            selected={bookingData.selectedDate}
            onSelect={(date) => updateBookingData('selectedDate', date)}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);
              return d < today;
            }}
            className="bg-gray-900 rounded-lg border border-gray-700 w-full"
          />
        </div>

        <div>
          <Label className="text-white mb-3 block font-medium">Select Time</Label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((time) => (
              <Button
                key={time}
                variant={bookingData.selectedTime === time ? 'default' : 'outline'}
                size="sm"
                className={
                  bookingData.selectedTime === time
                    ? 'bg-photo-red text-white border-photo-red'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }
                onClick={() => updateBookingData('selectedTime', time)}
              >
                {time}
              </Button>
            ))}
          </div>

          {bookingData.selectedDate && bookingData.selectedTime && (
            <div className="mt-6 p-4 bg-photo-red/10 border border-photo-red/30 rounded-lg">
              <p className="text-xs text-photo-red font-semibold uppercase tracking-wide mb-1">Selected</p>
              <p className="text-white font-medium">
                {formatDate(bookingData.selectedDate, 'MMMM dd, yyyy')}
              </p>
              <p className="text-gray-300 text-sm">{bookingData.selectedTime}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Step 3: Details (contact + location combined)
  const renderDetails = () => (
    <div className="space-y-7">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Your Details</h2>
        <p className="text-gray-400">Almost done — just a few details and we're set</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="fullName" className="text-white mb-2 block">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Your full name"
            value={bookingData.fullName}
            onChange={(e) => updateBookingData('fullName', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-white mb-2 block">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={bookingData.email}
            onChange={(e) => updateBookingData('email', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-white mb-2 block">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={bookingData.phone}
            onChange={(e) => updateBookingData('phone', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2 block">Budget Range</Label>
          <Select value={bookingData.budget} onValueChange={(value) => updateBookingData('budget', value)}>
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$499 - $799">$499 – $799 (Starter)</SelectItem>
              <SelectItem value="$800 - $1,500">$800 – $1,500 (Standard)</SelectItem>
              <SelectItem value="$1,500 - $3,000">$1,500 – $3,000 (Premium)</SelectItem>
              <SelectItem value="$3,000 - $7,000">$3,000 – $7,000 (Full Campaign)</SelectItem>
              <SelectItem value="$7,000+">$7,000+ (Luxury / Full Production)</SelectItem>
              <SelectItem value="Discuss in consultation">Let's talk — I have a budget in mind</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-white block">Location Type</Label>
        <div className="flex gap-3 flex-wrap">
          {(['studio', 'on-location', 'both'] as const).map((type) => (
            <Button
              key={type}
              variant={bookingData.locationType === type ? 'default' : 'outline'}
              size="sm"
              className={`capitalize ${
                bookingData.locationType === type
                  ? 'bg-photo-red text-white border-photo-red'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
              onClick={() => updateBookingData('locationType', type)}
            >
              <MapPin className="w-3 h-3 mr-1.5" />
              {type.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="location" className="text-white mb-2 block">City / Location *</Label>
        <Input
          id="location"
          placeholder="e.g., Providence RI · Boston MA · Portland ME · Hartford CT"
          value={bookingData.location}
          onChange={(e) => updateBookingData('location', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
        <p className="text-gray-500 text-xs mt-1.5">We serve RI · MA · ME · CT — mobile shoots available across all 4 states</p>
      </div>

      <div>
        <Label htmlFor="message" className="text-white mb-2 block">Tell us about your vision *</Label>
        <Textarea
          id="message"
          placeholder="Describe your project, goals, inspiration, and any ideas you have in mind..."
          value={bookingData.message}
          onChange={(e) => updateBookingData('message', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[130px]"
        />
      </div>
    </div>
  );

  // Step 4: Confirmation
  const renderConfirmation = () => {
    const selectedService = SERVICE_TYPES.find((s) => s.id === bookingData.serviceType);
    const selectedPackage = PACKAGE_TYPES.find((p) => p.id === bookingData.packageType);

    return (
      <div className="space-y-8 text-center">
        <div>
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">You're All Set!</h2>
          <p className="text-gray-300 text-lg">
            Your booking request has been submitted. We'll confirm within 24 hours.
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 text-left">
          <CardHeader>
            <CardTitle className="text-white text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="text-white">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Package</span>
              <span className="text-white">{selectedPackage?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="text-white">{formatDate(bookingData.selectedDate, 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="text-white">{bookingData.selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location</span>
              <span className="text-white">{bookingData.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Contact</span>
              <span className="text-white">{bookingData.email}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Mail className="w-4 h-4" />
          <span>Confirmation sent to {bookingData.email}</span>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderServiceSelection();
      case 2:
        return renderDateTimeSelection();
      case 3:
        return renderDetails();
      case 4:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {BOOKING_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-photo-red text-white scale-110'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium hidden md:block ${
                      isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < BOOKING_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {currentStep < 4 && (
          <p className="mt-4 text-center text-xs text-gray-500">Step {currentStep} of 3</p>
        )}
      </div>

      {/* Step Content */}
      <Card className="bg-black/50 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < 4 && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep === 3 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-photo-red hover:bg-photo-red-hover text-white min-w-[160px]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-photo-red hover:bg-photo-red-hover text-white"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSystem;
