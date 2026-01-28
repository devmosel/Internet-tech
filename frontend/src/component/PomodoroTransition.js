import { gsap } from 'gsap';

/**
 * Animate the exit transition for the Pomodoro page
 * @param {Object} refs - Object containing refs for animated elements
 * @param {Function} onComplete - Callback function to execute after animation
 */
export const animatePomodoroExit = (refs, onComplete) => {
  const timeline = gsap.timeline({
    onComplete: onComplete
  });

  // Fade out all elements
  timeline.to([refs.containerRef?.current, refs.timeRef?.current, refs.controlsRef?.current], {
    opacity: 0,
    y: 20,
    duration: 0.3,
    stagger: 0.05,
    ease: 'power2.in'
  });

  return timeline;
};
