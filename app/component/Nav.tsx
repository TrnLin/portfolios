import * as React from "react";
import { Link, NavLink } from "react-router";
import { gsap } from "gsap";

// Constants
const SCROLL_THRESHOLD = 100;
const SCROLL_TOP_THRESHOLD = 10;
const ANIMATION_DURATION = 0.3;
const MENU_ANIMATION_DURATION = 0.2;

// Types
interface NavItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// Custom Hooks
const useScrollDirection = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (
        currentScrollY < lastScrollY.current ||
        currentScrollY < SCROLL_TOP_THRESHOLD
      ) {
        setIsVisible(true);
      } else if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > SCROLL_THRESHOLD
      ) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isVisible;
};

const useNavbarAnimation = (
  navRef: React.RefObject<HTMLElement | null>,
  isVisible: boolean
) => {
  React.useEffect(() => {
    if (!navRef.current) return;

    gsap.to(navRef.current, {
      y: isVisible ? 0 : -100,
      opacity: isVisible ? 1 : 0,
      duration: ANIMATION_DURATION,
      ease: isVisible ? "power2.out" : "power2.in",
    });
  }, [isVisible, navRef]);
};

const useMobileMenuAnimation = (
  menuRef: React.RefObject<HTMLUListElement | null>,
  overlayRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean
) => {
  React.useEffect(() => {
    // Animate mobile menu
    if (menuRef.current) {
      if (isOpen) {
        gsap.to(menuRef.current, {
          display: "block",
          opacity: 1,
          y: 0,
          duration: MENU_ANIMATION_DURATION,
          ease: "power1.out",
        });
      } else {
        gsap.to(menuRef.current, {
          opacity: 0,
          y: -10,
          duration: MENU_ANIMATION_DURATION,
          ease: "power1.in",
          onComplete: () => {
            gsap.set(menuRef.current, { display: "none" });
          },
        });
      }
    }

    // Animate overlay
    if (overlayRef.current) {
      if (isOpen) {
        gsap.to(overlayRef.current, {
          display: "block",
          opacity: 1,
          duration: MENU_ANIMATION_DURATION,
          ease: "power1.out",
        });
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: MENU_ANIMATION_DURATION,
          ease: "power1.in",
          onComplete: () => {
            gsap.set(overlayRef.current, { display: "none" });
          },
        });
      }
    }
  }, [isOpen, menuRef, overlayRef]);
};

// Components
const Logo: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Link
    to='/'
    onClick={onClick}
    className='relative z-50 hover:opacity-70 transition-opacity'
    aria-label='Home'
  >
    <svg
      width='24'
      height='13'
      viewBox='0 0 24 13'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M0.312 9.236C0.312 7.65733 0.36 6.28133 0.456 5.108C0.552 3.924 0.712 2.65467 0.936 1.3H2.44C2.30133 2.196 2.184 3.08667 2.088 3.972C2.57867 3.044 3.16 2.32933 3.832 1.828C4.51467 1.32667 5.26133 1.076 6.072 1.076C6.89333 1.076 7.528 1.29467 7.976 1.732C8.424 2.16933 8.648 2.788 8.648 3.588C8.648 4.49467 8.32267 5.3 7.672 6.004C7.032 6.69733 6.2 7.21467 5.176 7.556C6.36 7.80133 7.26133 8.308 7.88 9.076C8.49867 9.844 8.904 10.9853 9.096 12.5H7.528C7.368 11.5187 7.10667 10.7347 6.744 10.148C6.392 9.55067 5.91733 9.108 5.32 8.82C4.73333 8.532 3.99733 8.356 3.112 8.292V7.012C3.77333 6.96933 4.408 6.788 5.016 6.468C5.63467 6.13733 6.13067 5.72667 6.504 5.236C6.888 4.73467 7.08 4.21733 7.08 3.684C7.08 2.89467 6.67467 2.5 5.864 2.5C5.128 2.5 4.45067 2.79333 3.832 3.38C3.21333 3.956 2.72267 4.772 2.36 5.828C1.99733 6.884 1.816 8.09467 1.816 9.46L1.848 12.5H0.344L0.312 9.236ZM10.9854 4.26H12.4734V12.5H10.9854V4.26ZM11.7214 2.996C11.444 2.996 11.204 2.9 11.0014 2.708C10.8094 2.50533 10.7134 2.26533 10.7134 1.988C10.7134 1.71067 10.8094 1.476 11.0014 1.284C11.204 1.08133 11.444 0.98 11.7214 0.98C11.9987 0.98 12.2334 1.08133 12.4254 1.284C12.628 1.476 12.7294 1.71067 12.7294 1.988C12.7294 2.26533 12.628 2.50533 12.4254 2.708C12.2334 2.9 11.9987 2.996 11.7214 2.996ZM15.2041 4.26H16.6921L16.5161 6.564H16.5481C16.7615 5.77467 17.1721 5.156 17.7801 4.708C18.3988 4.26 19.1348 4.036 19.9881 4.036C21.0868 4.036 21.9455 4.39333 22.5641 5.108C23.1828 5.82267 23.4921 6.81467 23.4921 8.084V12.5H22.0041V8.164C22.0041 7.3 21.7748 6.62267 21.3161 6.132C20.8575 5.64133 20.2335 5.396 19.4441 5.396C18.6228 5.396 17.9561 5.65733 17.4441 6.18C16.9428 6.70267 16.6921 7.39067 16.6921 8.244V12.5H15.2041V4.26Z'
        className='fill-neutral-1000'
      />
    </svg>
  </Link>
);

const NavItem: React.FC<NavItemProps> = ({ href, children, onClick }) => (
  <li className='text-base text-neutral-1000 w-full'>
    <NavLink
      className={({ isActive }) =>
        `block py-1 w-full transition-all duration-200 ${
          isActive
            ? "text-neutral-1000 font-semibold"
            : "text-neutral-600 hover:text-neutral-1000"
        }`
      }
      to={href}
      onClick={onClick}
    >
      {children}
    </NavLink>
  </li>
);

const DesktopMenu: React.FC = () => (
  <ul className='hidden lg:flex items-center gap-8'>
    <NavItem href='/about'>About</NavItem>
    <NavItem href='/works'>Works</NavItem>
  </ul>
);

const MobileMenuButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
}> = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    type='button'
    className='lg:hidden relative z-50 px-3 py-2 text-sm font-semibold text-neutral-1000 
               hover:text-neutral-700 transition-colors'
    aria-label={isOpen ? "Close menu" : "Open menu"}
    aria-expanded={isOpen}
  >
    {isOpen ? "Close" : "Menu"}
  </button>
);

const MobileMenu: React.FC<{
  menuRef: React.RefObject<HTMLUListElement | null>;
  onClose: () => void;
}> = ({ menuRef, onClose }) => (
  <ul
    ref={menuRef}
    style={{
      display: "none",
      opacity: 0,
      transform: "translateY(-10px)",
    }}
    className='lg:hidden absolute top-[calc(100%+0.75rem)] left-0 right-0 
               bg-neutral-0 rounded-sm shadow-lg ring-1 ring-neutral-200
               p-4 space-y-1'
  >
    <NavItem href='/about' onClick={onClose}>
      About
    </NavItem>
    <NavItem href='/works' onClick={onClose}>
      Works
    </NavItem>
  </ul>
);

const MobileOverlay: React.FC<{
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
}> = ({ overlayRef, onClick }) => (
  <div
    ref={overlayRef}
    onClick={onClick}
    className='lg:hidden fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-40'
    style={{ opacity: 0, display: "none" }}
    aria-hidden='true'
  />
);

// Main Component
export function Nav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const isVisible = useScrollDirection();

  useNavbarAnimation(navRef, isVisible);
  useMobileMenuAnimation(menuRef, overlayRef, isOpen);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Close menu when navbar hides
  React.useEffect(() => {
    if (!isVisible) {
      closeMenu();
    }
  }, [isVisible]);

  return (
    <>
      <MobileOverlay overlayRef={overlayRef} onClick={toggleMenu} />

      <nav
        ref={navRef}
        className='fixed top-4 px-4 lg:px-0 left-0 right-0 z-50 container mx-auto'
      >
        <div
          className='relative bg-neutral-0/80 backdrop-blur-md 
                        rounded-sm shadow-sm ring-1 ring-neutral-200/50
                         py-2 px-4
                        flex items-center justify-between'
        >
          <Logo onClick={closeMenu} />
          <DesktopMenu />
          <MobileMenuButton isOpen={isOpen} onClick={toggleMenu} />
          <MobileMenu menuRef={menuRef} onClose={closeMenu} />
        </div>
      </nav>
    </>
  );
}
