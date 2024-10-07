import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@radix-ui/react-navigation-menu";

export default function Navbar() {
  return (
    <div className="flex flex-col w-full">
      <div className="bg-black text-white py-2">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl px-4 italic">
             <span className="text-green-400">green</span>line
        </h1>
        </div>
      </div>

      <NavigationMenu className="bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto">
          <NavigationMenuList className="flex">

            <NavigationMenuItem className="group">
              <NavigationMenuTrigger className="flex items-center space-x-2 hover:bg-zinc-800 text-sm font-semibold py-2 px-4 group-hover:bg-zinc-800">
                <span>Glossary</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Chevron Down" role="img"><title>Chevron Down</title><path d="M11.9954 15.0785L19.5387 7.54001L21 9.00226L11.9945 18.002L3 9.00179L4.46225 7.54047L11.9954 15.0785Z" fill="currentColor"></path></svg>
              </NavigationMenuTrigger>

              

              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="group">
              <NavigationMenuTrigger className="flex items-center space-x-2 hover:bg-zinc-800 text-sm font-semibold py-2 px-4 group-hover:bg-zinc-800">
                <span>Resources</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Chevron Down" role="img"><title>Chevron Down</title><path d="M11.9954 15.0785L19.5387 7.54001L21 9.00226L11.9945 18.002L3 9.00179L4.46225 7.54047L11.9954 15.0785Z" fill="currentColor"></path></svg>
              </NavigationMenuTrigger>

            

              <NavigationMenuContent>
                <NavigationMenuLink>Link</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

          </NavigationMenuList>
        </div>
      </NavigationMenu>
    </div>
  );
}
