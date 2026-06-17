import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration: number = 800) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        // If target is 0, just set it immediately
        if (target === 0) {
            // Note: Setting state in effect is okay here as we are synchronizing with a new target
            setCount(0);
            return;
        }

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            // Calculate percentage completed
            const percentage = Math.min(progress / duration, 1);
            
            // Ease-out cubic function for smooth deceleration
            const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
            
            setCount(Math.floor(target * easeOutCubic));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(target); // Ensure we land exactly on target
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [target, duration]);

    return count;
}
