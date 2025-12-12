import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, Camera, Users, Award, ArrowRight, ArrowLeft, Calendar as CalendarIcon, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/lib/api-service';
import { trackBookingIntent } from '@/components/Analytics';
import { format } from 'date-fns';

interface BookingData {
  // Step 1: Service Selection
  serviceType: string;
  packageType: string;
  
  // Step 2: Date & Time
  selectedDate: Date | undefined;
  selectedTime: string;
  
  // Step 3: Location
  location: string;
  locationType: 'studio' | 'on-location' | 'both';
  
  // Step 4: Client Info
  fullName: string;
  email: string;
  phone: string;
  message: string;
  budget: string;
}

const BOOKING_STEPS = [
  { id: 1, title: 'Choose Service', icon: Camera },
  { id: 2, title: 'Select Date & Time', icon: CalendarIcon },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Your Details', icon: Users },
  { id: 5, title: 'Confirmation', icon: CheckCircle },
];

const SERVICE_TYPES = [
  {
    id: 'fashion',
    name: 'Luxury Fashion Photography',
    description: 'High-end fashion photography for luxury brands, fashion weeks, and celebrity campaigns',
    icon: Camera,
    duration: '4-8 hours',
    startingPrice: '$5,000'
  },
  {
    id: 'beauty',
    name: 'Beauty & Cosmetic Photography',
    description: 'Premium beauty and cosmetic photography for luxury brands',
    icon: Award,
    duration: '3-6 hours',
    startingPrice: '$4,000'
  },
  {
    id: 'editorial',
    name: 'Editorial Photography',
    description: 'Magazine-quality editorial photography for publications and brands',
    icon: Camera,
    duration: '4-8 hours',
    startingPrice: '$5,000'
  },
  {
    id: 'portrait',
    name: 'Celebrity & Portrait Photography',
    description: 'Exclusive celebrity and luxury lifestyle photography',
    icon: Users,
    duration: '2-4 hours',
    startingPrice: '$3,000'
  },
  {
    id: 'brand',
    name: 'Brand Campaign Photography',
    description: 'Custom brand campaign photography tailored to your vision',
    icon: Award,
    duration: '6-10 hours',
    startingPrice: '$7,000'
  },
];

const PACKAGE_TYPES = [
  { id: 'essential', name: 'Essential', price: 'Starting at $2,000', features: ['2-3 hour session', '20 edited images', 'Basic retouching'] },
  { id: 'premium', name: 'Premium', price: 'Starting at $5,000', features: ['4-6 hour session', '50 edited images', 'Advanced retouching', 'Hair & makeup included'] },
  { id: 'luxury', name: 'Luxury', price: 'Starting at $10,000', features: ['Full day session', '100+ edited images', 'Premium retouching', 'Full team included', 'Location scouting'] },
];

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
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

  const updateBookingData = (field: keyof BookingData, value: any) => {
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
      // Track analytics
      trackBookingIntent('booking_system', bookingData.location);
      
      // Send booking request
      const result = await apiService.sendContactEmail({
        full_name: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone,
        message: `Booking Request:
Service: ${bookingData.serviceType}
Package: ${bookingData.packageType}
Date: ${bookingData.selectedDate ? format(bookingData.selectedDate, 'MMMM dd, yyyy') : 'Not selected'}
Time: ${bookingData.selectedTime}
Location: ${bookingData.location}
Location Type: ${bookingData.locationType}
Budget: ${bookingData.budget}

${bookingData.message}`,
        service_type: bookingData.serviceType,
        budget_range: bookingData.budget,
        event_date: bookingData.selectedDate ? format(bookingData.selectedDate, 'yyyy-MM-dd') : '',
        location: bookingData.location
      });

      if (result.success) {
        nextStep(); // Move to confirmation step
        toast({
          title: "Booking Request Submitted!",
          description: "We'll confirm your booking within 24 hours.",
        });
      } else {
        throw new Error('Failed to submit booking');
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Error",
        description: "There was an issue submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.serviceType && bookingData.packageType;
      case 2:
        return bookingData.selectedDate && bookingData.selectedTime;
      case 3:
        return bookingData.location.length > 0;
      case 4:
        return bookingData.fullName && bookingData.email && bookingData.message;
      default:
        return true;
    }
  };

  // Step 1: Service Selection
  const renderServiceSelection = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Service</h2>
        <p className="text-gray-300 text-lg">Select the type of photography session you need</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {SERVICE_TYPES.map((service) => {
          const Icon = service.icon;
          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                bookingData.serviceType === service.id
                  ? 'border-photo-red bg-photo-red/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => updateBookingData('serviceType', service.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-6 h-6 text-photo-red" />
                  <CardTitle className="text-white">{service.name}</CardTitle>
                </div>
                <CardDescription className="text-gray-300">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
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
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">Select Package</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {PACKAGE_TYPES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all duration-300 ${
                  bookingData.packageType === pkg.id
                    ? 'border-photo-red bg-photo-red/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => updateBookingData('packageType', pkg.id)}
              >
                <CardHeader>
                  <CardTitle className="text-white">{pkg.name}</CardTitle>
                  <CardDescription className="text-photo-red font-semibold">{pkg.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-photo-red" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: Date & Time Selection
  const renderDateTimeSelection = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Select Date & Time</h2>
        <p className="text-gray-300 text-lg">Choose your preferred date and time slot</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Label className="text-white mb-4 block">Select Date</Label>
          <Calendar
            mode="single"
            selected={bookingData.selectedDate}
            onSelect={(date) => updateBookingData('selectedDate', date)}
            disabled={(date) => date < new Date()}
            className="bg-gray-900 rounded-lg border border-gray-700"
          />
        </div>

        <div>
          <Label className="text-white mb-4 block">Select Time</Label>
          <div className="grid grid-cols-3 gap-3">
            {TIME_SLOTS.map((time) => (
              <Button
                key={time}
                variant={bookingData.selectedTime === time ? 'default' : 'outline'}
                className={`${
                  bookingData.selectedTime === time
                    ? 'bg-photo-red text-white'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
                onClick={() => updateBookingData('selectedTime', time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Location
  const renderLocationSelection = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Location Details</h2>
        <p className="text-gray-300 text-lg">Where would you like the photoshoot to take place?</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-white mb-2 block">Location Type</Label>
          <div className="grid grid-cols-3 gap-4">
            {(['studio', 'on-location', 'both'] as const).map((type) => (
              <Button
                key={type}
                variant={bookingData.locationType === type ? 'default' : 'outline'}
                className={`capitalize ${
                  bookingData.locationType === type
                    ? 'bg-photo-red text-white'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
                onClick={() => updateBookingData('locationType', type)}
              >
                {type.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="location" className="text-white mb-2 block">Location</Label>
          <Input
            id="location"
            placeholder="e.g., New York City, Los Angeles, Miami, or specific address"
            value={bookingData.location}
            onChange={(e) => updateBookingData('location', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  );

  // Step 4: Client Information
  const renderClientInfo = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Details</h2>
        <p className="text-gray-300 text-lg">Tell us about yourself and your vision</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName" className="text-white mb-2 block">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Your full name"
            value={bookingData.fullName}
            onChange={(e) => updateBookingData('fullName', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-white mb-2 block">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={bookingData.email}
            onChange={(e) => updateBookingData('email', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-white mb-2 block">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={bookingData.phone}
            onChange={(e) => updateBookingData('phone', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="budget" className="text-white mb-2 block">Budget Range</Label>
          <Select value={bookingData.budget} onValueChange={(value) => updateBookingData('budget', value)}>
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$2,000 - $5,000">$2,000 - $5,000</SelectItem>
              <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
              <SelectItem value="$10,000 - $25,000">$10,000 - $25,000</SelectItem>
              <SelectItem value="$25,000+">$25,000+</SelectItem>
              <SelectItem value="Discuss in consultation">Discuss in consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message" className="text-white mb-2 block">Tell us about your vision *</Label>
        <Textarea
          id="message"
          placeholder="Describe your project, goals, specific requirements, and any ideas you have in mind..."
          value={bookingData.message}
          onChange={(e) => updateBookingData('message', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[150px]"
          required
        />
      </div>
    </div>
  );

  // Step 5: Confirmation
  const renderConfirmation = () => {
    const selectedService = SERVICE_TYPES.find(s => s.id === bookingData.serviceType);
    const selectedPackage = PACKAGE_TYPES.find(p => p.id === bookingData.packageType);

    return (
      <div className="space-y-8 text-center">
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Booking Request Submitted!</h2>
          <p className="text-gray-300 text-lg">We'll confirm your booking within 24 hours</p>
        </div>

        <Card className="bg-white/5 border-white/10 text-left">
          <CardHeader>
            <CardTitle className="text-white">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div>
              <span className="font-semibold text-white">Service:</span> {selectedService?.name}
            </div>
            <div>
              <span className="font-semibold text-white">Package:</span> {selectedPackage?.name}
            </div>
            <div>
              <span className="font-semibold text-white">Date:</span>{' '}
              {bookingData.selectedDate ? format(bookingData.selectedDate, 'MMMM dd, yyyy') : 'Not selected'}
            </div>
            <div>
              <span className="font-semibold text-white">Time:</span> {bookingData.selectedTime || 'Not selected'}
            </div>
            <div>
              <span className="font-semibold text-white">Location:</span> {bookingData.location}
            </div>
            <div>
              <span className="font-semibold text-white">Contact:</span> {bookingData.email}
            </div>
          </CardContent>
        </Card>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <p className="text-gray-300 mb-4">
            You'll receive a confirmation email shortly with next steps. Our team will reach out within 24 hours to finalize the details.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Mail className="w-4 h-4" />
            <span>Check your email: {bookingData.email}</span>
          </div>
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
        return renderLocationSelection();
      case 4:
        return renderClientInfo();
      case 5:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {BOOKING_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-photo-red text-white scale-110'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <span
                    className={`mt-2 text-xs md:text-sm font-medium ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < BOOKING_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="bg-black/50 border-white/10 backdrop-blur-sm">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === 4 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-photo-red hover:bg-photo-red-hover text-white"
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
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSystem;
