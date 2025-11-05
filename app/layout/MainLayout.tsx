import { Outlet } from "react-router";
import { Nav } from "../component/Nav";

export default function MainLayout() {
  return (
    <>
      <section className='container mx-auto overflow-x-hidden'>
        <Nav />
        <Outlet />
      </section>
    </>
  );
}
