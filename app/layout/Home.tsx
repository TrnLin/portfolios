import { PageTransition } from "../layout/PageTransition";
import AnimatedBlob from "../component/AnimatedBlob";
import { Link } from "react-router";
import { HiArrowRight } from "react-icons/hi";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import ParticleSphere from "../component/ParticleSphere";
import { useEffect } from "react";

export function Home() {
  const color = "#000000"; // You can change this to any color you want
  const particleSize = 0.25; // Size of the particles
  const blurAmount = 0.3; // Amount of blur for the particles
  const sizeVariation = 0.9; // Variation in particle size
  const chaosAmount = 0.2; // Amount of chaos in particle movement
  const fluidViscosity = 0.4; // Viscosity of the fluid simulation
  const waveAmplitude = 0.5; // Amplitude of the wave effect
  const opacity = 0.7; // Opacity of the particles
  const particleCount = 5000; // Number of particles in the sphere
  // Factor for settling the particles

  useEffect(() => {
    // This effect runs once when the component mounts
    const handleResize = () => {
      // You can add any logic here that needs to run on resize
      console.log("Window resized");
    };
    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup the event listener on component unmount
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount
  return (
    <PageTransition>
      <section className='flex flex-col items-center justify-center min-h-lvh px-4 2xl:px-0 overflow-x-hidden '>
        <div className='p-4 rounded-sm border-2  border-neutral-100 h-[calc(100vh-6rem)] mt-14 grid grid-rows-12 grid-cols-1 md:grid-cols-12 relative test-bg xl:grid-rows-11'>
          <div className='absolute top-[40%] w-full left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden'>
            <ParticleSphere
              color={color}
              particleCount={particleCount}
              particleSize={particleSize}
              blurAmount={blurAmount}
              sizeVariation={sizeVariation}
              chaosAmount={chaosAmount}
              fluidViscosity={fluidViscosity}
              waveAmplitude={waveAmplitude}
              opacity={opacity}
            />
          </div>
          {/* <div className='absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 overflow test-bg'>
            <AnimatedBlob className='size-56 ' />
          </div> */}
          <div className='text-[clamp(1.25rem,0.879rem+1.524vw,2.25rem)] font-medium row-start-9 z-10 md:col-span-10 lg:col-span-8 xl:col-span-7'>
            A student who has goals and dreams to achieve, with a journey to
            finish, lessons to learn, and a drive to bring technology closer to
            everyone. Based in Hanoi, Vietnam. 🇻🇳
          </div>
          <div className='flex flex-col items-start text-base font-medium z-10 lg:row-start-9 lg:col-start-10 md:col-span-4'>
            <span>Software Engineer</span>
            <span>FE Developer </span>
            <span>UI & UX Design</span>
          </div>
          <div className='row-start-12 lg:col-start-10 lg:row-start-11 md:col-span-2  z-10 mt-2'>
            <div className='group flex flex-row items-center justify-center gap-2 w-fit '>
              <span>Scroll down</span>
              <span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='12'
                  height='20'
                  viewBox='0 0 12 20'
                  fill='none'
                >
                  <rect
                    x='0.5'
                    y='0.5'
                    width='10.4286'
                    height='19'
                    rx='5.21429'
                    className='stroke-neutral-1000'
                  />
                  <circle
                    cx='5.6001'
                    cy='5.19995'
                    r='2'
                    className='fill-neutral-1000 transition-transform duration-300 group-hover:translate-y-[9.60005px]'
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className='min-h-lvh px-4 overflow-x-hidden md:pb-8 2xl:px-0'>
        <div className='gap-3 flex flex-col mt-12 border-b-1 border-neutral-200 py-3 md:flex-row md:items-end md:gap-6'>
          <h1 className='font-body text-[clamp(2.25rem,1.971rem+1.143vw,3rem)] font-medium leading-[100%]'>
            Feature Works.
          </h1>
          <Link
            to='/'
            className='flex flex-row items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors duration-300 hover:underline hover:underline-offset-2'
          >
            <span>More work</span>
            <HiArrowRight />
          </Link>
        </div>
        <div>
          {worksList.map((work) => (
            <div key={work.title} className='mt-6 mb-8'>
              <Link
                to={work.link}
                className='flex flex-col items-start gap-4 md:flex-row md:gap-6'
              >
                <div className='h-ful w-full rounded-sm border-2 border-neutral-100 object-bottom  overflow-hidden max-w-[644px]'>
                  <img src={work.image} alt='' className='aspect-[1.61/1] ' />
                </div>
                <div className='md:w-[75%]'>
                  <div className='flex flex-row items-center gap-1 '>
                    <p className='font-semibold'>{work.title}</p>
                    <span>-</span>
                    <span className='text-neutral-700 font-medium'>
                      {work.projectType}
                    </span>
                  </div>
                  <p className='text-sm text-neutral-500'>{work.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
      <section className='min-h-lvh px-4 overflow-x-hidden py-16 2xl:px-0'>
        <div className='flex flex-col gap-6 lg:flex-row w-full md:justify-between'>
          <div>
            <h1 className='text-[clamp(2.25rem,1.971rem+1.143vw,3rem)] font-body font-medium text-nowrap'>
              Techniques & Skill.
            </h1>
          </div>
          <div className='w-full lg:w-[50%]'>
            {Object.entries(skillTree).map(([category, skills], index) => (
              <div
                key={category}
                className={`grid grid-cols-[25%_75%] gap-6 mb-8 lg:grid-cols-[30%_70%] ${
                  index !== Object.entries(skillTree).length - 1
                    ? "border-b border-neutral-200 pb-8"
                    : ""
                }`}
              >
                <h2 className='text-sm text-neutral-500 leading font-medium'>
                  {category}
                </h2>
                <div className='ml-6 border-l-[1px] border-neutral-200 pl-4 flex flex-col gap-2'>
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className='text-neutral-900 text-[clamp(1rem,0.814rem+0.762vw,1.5rem)] font-body font-medium leading-6'
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className='px-4 overflow-x-hidden py-8 2xl:px-0'>
        <div className='grid md:gap-8 lg:gap-16 items-center md:grid-cols-5 md:p-16 md:py-24 lg:px-24 lg:py-32 md:border-2 md:border-neutral-100 rounded-sm'>
          <div className='md:flex md:flex-col md:items-end md:col-span-2 '>
            <h1 className='text-[clamp(2.25rem,1.6rem+2.667vw,4rem)] font-medium'>
              Say Hi.
            </h1>
            <p className='font-normal text-sm leading-[120%] tracking-[0.6px] text-neutral-900 md:text-right lg:text-sm lg:w-[80%] max-w-[230px]'>
              Hey, my chat box is always open if you want to discuss about
              anything... literally anything.
            </p>
          </div>
          <div className='flex flex-col gap-4 md:gap-2 mt-4  w-full md:col-span-3'>
            <h2 className='text-[clamp(1.5rem,0.943rem+2.286vw,3rem)] font-body font-medium'>
              rintrnn@gmail.com
            </h2>
            <p className='text-sm font-medium text-neutral-500'>
              Or you can fine me at:
            </p>
            <div className='flex flex-col md:flex-row gap-4 mt-2 items-center '>
              <Link
                className='ring-1 rounded-sm ring-neutral-200 w-full flex flex-row gap-2 items-center justify-center p-3 lg:max-w-[200px] '
                to=''
              >
                <FaInstagram /> <span>Instagram</span>
              </Link>
              <span className='block'>-</span>
              <Link
                className='ring-1 rounded-sm ring-neutral-200 w-full flex flex-row gap-2 items-center justify-center p-3 lg:max-w-[200px]'
                to=''
              >
                <FaLinkedin /> <span>LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
        <div className='hidden lg:flex justify-between mt-2 *:font-medium'>
          <p>Hanoi, Vietnam</p>
          <p>2024</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className='cursor-pointer hover:underline'
          >
            Scroll to top
          </button>
        </div>
      </section>
    </PageTransition>
  );
}

const worksList = [
  {
    title: "KrunkerCSS",
    projectType: "Public Project",
    image: "images/krunkercss.png",
    description: "A CSS library that is used to style the Krunker.io game.",
    link: "/work1",
  },
  {
    title: "Muck",
    projectType: "School Project",
    image: "images/krunkercss.png",
    description: "A forum, e-commerce website for video games. ",
    link: "/work2",
  },
  {
    title: "SenMe",
    projectType: "Private Project",
    image: "images/krunkercss.png",
    description: "Description of work 3",
    link: "/work3",
  },
];

const skillTree = {
  Language: ["JavaScript", "TypeScript", "Python", "Java", "HTML5", "CSS3"],
  Frameworks: ["React", "Springboot", "NodeJs", "JavaFx"],
  Library: ["TailwindCSS", "Bootstrap", "ShadcnUI"],
  Skill: [
    "UI/UX Design",
    "Web Development",
    "Software Engineering",
    "Wireframing",
    "Prototyping",
  ],
  Tools: ["Figma", "Git", "VSCode", "Postman", "Docker"],
};
