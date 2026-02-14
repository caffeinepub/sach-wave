import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { markOnboardingComplete } from '../../utils/onboarding';

interface OnboardingPageProps {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Share Your Moments',
    description: 'Post photos, videos, and updates to connect with your classmates and share your school life.',
    image: '/assets/generated/onboarding-illustration-posting.dim_1200x800.png',
  },
  {
    title: 'Stories That Disappear',
    description: 'Share quick moments with 24-hour stories. Express yourself freely with content that vanishes after a day.',
    image: '/assets/generated/onboarding-illustration-stories.dim_1200x800.png',
  },
  {
    title: 'Stay Connected',
    description: 'Chat with friends, get notifications, and never miss what matters in your school community.',
    image: '/assets/generated/onboarding-illustration-chat.dim_1200x800.png',
  },
];

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGetStarted = () => {
    markOnboardingComplete();
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-neon-blue via-neon-violet to-neon-purple overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent" />
      
      <div className="relative h-full flex flex-col items-center justify-center px-4 py-8">
        {/* Slide content */}
        <div className="w-full max-w-2xl mx-auto text-center animate-slide-in">
          {/* Image */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-neon-cyan to-neon-violet opacity-30 animate-pulse-glow" />
            <img
              src={slide.image}
              alt={slide.title}
              className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl"
            />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-in">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg mx-auto animate-fade-in animation-delay-100">
            {slide.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="text-white hover:bg-white/10 disabled:opacity-0"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </Button>

            {currentSlide === slides.length - 1 ? (
              <Button
                onClick={handleGetStarted}
                className="flex-1 bg-white text-neon-violet hover:bg-white/90 font-semibold py-6 text-lg rounded-xl shadow-xl press-feedback"
              >
                Get Started
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex-1 bg-white text-neon-violet hover:bg-white/90 font-semibold py-6 text-lg rounded-xl shadow-xl press-feedback"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={handleGetStarted}
          className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors text-sm font-medium"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
