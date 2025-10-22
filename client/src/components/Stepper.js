import React, { useState, Children, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Stepper.css';

const Stepper = React.forwardRef(function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}, ref) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  // Expose goToStep method via ref for validation
  React.useImperativeHandle(ref, () => ({
    goToStep: (step) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
        onStepChange(step);
      }
    }
  }));

  const updateStep = newStep => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div className={`outer-container ${stepCircleContainerClassName}`} {...rest}>
      <div className="step-circle-container">
        <div className="step-indicator-row">
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isComplete = currentStep > stepNumber;

            return (
              <React.Fragment key={stepNumber}>
                <div
                  className={`step-indicator ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                  onClick={() => !disableStepIndicators && updateStep(stepNumber)}
                >
                  {renderStepIndicator ? (
                    renderStepIndicator(stepNumber, isActive, isComplete)
                  ) : (
                    <div
                      className="step-indicator-inner"
                      style={{
                        backgroundColor: isComplete || isActive ? '#5227FF' : '#374151',
                      }}
                    >
                      {isComplete ? (
                        <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isActive ? (
                        <div className="active-dot" />
                      ) : (
                        <span className="step-number">{stepNumber}</span>
                      )}
                    </div>
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div className="step-connector">
                    <div
                      className="step-connector-inner"
                      style={{
                        width: isComplete ? '100%' : '0%',
                        backgroundColor: '#5227FF',
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className={`step-content-default ${contentClassName}`}>
          <AnimatePresence mode="wait" custom={direction}>
            {!isCompleted && (
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                transition={{ duration: 0.3 }}
                className={`step-default ${stepContainerClassName}`}
              >
                {stepsArray[currentStep - 1]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isCompleted && (
          <div className={`footer-container ${footerClassName}`}>
            <div className={`footer-nav ${currentStep !== 1 ? 'spread' : 'end'}`}>
              {currentStep !== 1 && (
                <button
                  onClick={handleBack}
                  className="stepper-back-button"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button onClick={isLastStep ? handleComplete : handleNext} className="next-button" {...nextButtonProps}>
                {isLastStep ? 'Complete' : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export function Step({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export default Stepper;
