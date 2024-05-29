import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Button = styled.button`
  background-color: rgba(0, 0, 0, 0);
  color: var(--mild-blue);
  border-radius: var(--medium-border-radius);
  border: none;
  height: 5vh;
  width: 6vw;
  position: absolute;
  transition: all var(--animation-speed) ease-out;

  &:hover {
    color: var(--mild-dark-blue);
    text-shadow: 0px 0px 1px var(--mild-dark-blue);

    transition: all var(--animation-speed) ease-in;
    cursor: pointer;
  }
`;

export default function BackButton() {
  const navigate = useNavigate();

  function goBack() {
    navigate("/menu");
  }

  return <Button onClick={goBack}>&larr; Back</Button>;
}
