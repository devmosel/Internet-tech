import { gsap } from 'gsap';

/**
 * Haptic Click Animation
 * A tactile button press effect that scales down and bounces back
 * 
 * @param {HTMLElement} element - The DOM element to animate
 * @param {Function} callback - Optional callback to execute after animation
 */
export const hapticClick = (element, callback) => {
    if (!element) {
        callback?.();
        return;
    }

    gsap.to(element, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            // Clear all GSAP transforms so CSS hover can take over
            gsap.set(element, { clearProps: 'transform' });
            callback?.();
        }
    });
};
