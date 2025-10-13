import * as React from "react";
import { Link, NavLink } from "react-router";
import { gsap } from "gsap";

export function Nav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    console.log("clicked");
    setIsOpen((prevState) => !prevState);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  React.useEffect(() => {
    // Mobile menu animation
    if (menuRef.current) {
      if (isOpen) {
        gsap.to(menuRef.current, {
          display: "block",
          opacity: 1,
          y: 0,
          duration: 0.2,
          ease: "power1.out",
        });
      } else {
        gsap.to(menuRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          ease: "power1.in",
          onComplete: () => {
            if (menuRef.current) {
              gsap.set(menuRef.current, { display: "none" });
            }
          },
        });
      }
    }

    // Mobile overlay animation
    if (overlayRef.current) {
      if (isOpen) {
        gsap.to(overlayRef.current, {
          display: "block",
          opacity: 1,
          duration: 0.2,
          ease: "power1.out",
        });
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power1.in",
          onComplete: () => {
            if (overlayRef.current) {
              gsap.set(overlayRef.current, { display: "none" });
            }
          },
        });
      }
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        onClick={handleToggle}
        className='fixed inset-0 bg-gray-50/25 backdrop-blur-sm z-40 lg:hidden'
        style={{ opacity: 0, display: "none" }}
      />
      <nav className='w-[calc(100%-2rem)] container top-4 left-1/2 -translate-x-1/2 fixed z-50 right-0 '>
        <div className='flex justify-between ring-2 ring-neutral-100 items-center bg-neutral-0 px-3 relative py-4 rounded max-h-11'>
          {/* Logo */}
          <div className='relative z-50'>
            <Link to='/' onClick={closeMenu}>
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
          </div>
          {/* Desktop Navigation */}
          <div className='hidden lg:flex space-x-8 items-center *:list-none relative'>
            <NavItem href='/about'>About</NavItem>
            <NavItem href='/works'>Works</NavItem>
          </div>
          {/* Mobile Navigation */}
          <div className='lg:hidden '>
            <button
              onClick={handleToggle}
              type='button'
              className='block text-neutral-1000 font-semibold p-1 pointer-events-auto z-50 relative'
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? "Close" : "Menu"}
            </button>
            <ul
              ref={menuRef}
              style={{
                display: "none",
                opacity: 0,
                transform: "translateY(-10px)",
              }}
              className='space-y-2 absolute w-full top-[calc(100%+12px)] rounded ring-1 ring-neutral-100 left-0 p-4 font-semibold bg-neutral-0'
            >
              <NavItem href='/about' onClick={closeMenu}>
                About
              </NavItem>
              <NavItem href='/works' onClick={closeMenu}>
                Works
              </NavItem>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, onClick }) => {
  return (
    <li className='text-base text-neutral-1000 w-full'>
      <NavLink
        className='block py-1 w-full hover:text-neutral-700 transition-colors'
        to={href}
        onClick={onClick}
      >
        {children}
      </NavLink>
    </li>
  );
};
