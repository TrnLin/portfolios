import React from "react";
import { gsap } from "gsap";

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const curtainRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
    });

    // Curtain animation: slide down first, then slide up
    tl.fromTo(
      curtainRefs.current,
      {
        scaleY: 0,
        transformOrigin: "top",
      },
      {
        scaleY: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      }
    ).to(
      curtainRefs.current,
      {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 0.8,
        stagger: 0.08,
        ease: "power4.inOut",
      },
      "+=0.2"
    );

    // Content fade in with slide
    tl.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 40,
        scale: 0.98,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.6"
    );

    // Overlay fade out
    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.pointerEvents = "none";
          }
        },
      },
      "-=0.3"
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      {/* Animated Curtains */}
      <div
        ref={overlayRef}
        className='fixed  inset-[-1px] z-50 pointer-events-none'
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 0,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              curtainRefs.current[i] = el;
            }}
            className='w-full h-full bg-black'
          />
        ))}
      </div>

      {/* Content Container */}
      <div ref={containerRef} style={{ willChange: "transform, opacity" }}>
        {children}
      </div>
    </>
  );
};
