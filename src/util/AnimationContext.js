import React, { createContext, useState } from "react";

// Creates an animation context to pass if the animation should be on or of to all the pages children

const AnimationContext = createContext();

export const AnimeProvider = ({ children }) => {
  const [animeBool, setAnimeBool] = useState(true);

  return (
    <AnimationContext.Provider value={{ animeBool, setAnimeBool }}>
      {children}
    </AnimationContext.Provider>
  );
};

export default AnimationContext;
