import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const SplitText = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete
}) => {
  const containerRef = useRef(null);
  const hasAnimated = useRef(false);

  useGSAP(() => {
    if (!containerRef.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animateText();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const animateText = () => {
    const elements = containerRef.current.querySelectorAll('.split-char, .split-word');
    
    gsap.set(elements, from);
    
    gsap.to(elements, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      onComplete: () => {
        if (onLetterAnimationComplete) {
          onLetterAnimationComplete();
        }
      }
    });
  };

  const renderText = () => {
    if (splitType === 'chars') {
      return text.split('').map((char, i) => (
        <span key={i} className="split-char" style={{ display: 'inline-block' }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else {
      return text.split(' ').map((word, i) => (
        <span key={i} className="split-word" style={{ display: 'inline-block', marginRight: '0.3em' }}>
          {word}
        </span>
      ));
    }
  };

  return (
    <div ref={containerRef} className={className} style={{ textAlign }}>
      {renderText()}
    </div>
  );
};

export default SplitText;
