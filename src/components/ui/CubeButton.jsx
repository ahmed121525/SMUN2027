import React from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;

  .scene {
    display: inline-flex;
    width: 12.5em;
    height: 4em;
    perspective: 900px;
    color: inherit;
    text-decoration: none;
    outline-offset: 6px;
    -webkit-tap-highlight-color: transparent;
  }

  .cube {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    color: #fff0d5;
    cursor: pointer;
    font-family: 'Manrope', sans-serif;
    font-size: 12px;
    transition: transform 0.78s cubic-bezier(.17,.67,.14,.93);
    transform-style: preserve-3d;
    transform-origin: 100% 50%;
    will-change: transform;
  }

  .scene:hover .cube,
  .scene:focus-visible .cube {
    transform: rotateX(-90deg);
  }

  .side {
    box-sizing: border-box;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    text-transform: uppercase;
    padding: 0 12px;
    font-size: 0.76em;
    line-height: 1.2;
    letter-spacing: 0.12em;
    font-weight: 800;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .top {
    background: linear-gradient(115deg, #e6bd68, #ffe4a0);
    color: #211019;
    transform: rotateX(90deg) translate3d(0, 0, 2em);
    box-shadow: inset 0 0 0 1px rgba(255,240,213,.65), 0 10px 28px rgba(217,43,69,.16);
  }

  .front {
    background: linear-gradient(115deg, #3a0d1b, #74152c 70%, #a9233f);
    color: #fff0d5;
    transform: translate3d(0, 0, 2em);
    box-shadow: inset 0 0 0 1px rgba(230,189,104,.52), 0 8px 24px rgba(0,0,0,.18);
  }

  .scene:focus-visible {
    outline: 1px solid #ffe4a0;
  }

  .scene:active .cube {
    transform: rotateX(-90deg);
  }

  @media (hover: none), (pointer: coarse) {
    .scene:hover .cube {
      transform: none;
    }

    .scene:active .cube {
      transform: rotateX(-90deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cube {
      transition-duration: 0.01ms;
    }
  }
`;

const CubeButton = ({ href, front = "EXPLORE", top = "OPEN", onClick, ariaLabel, className = "" }) => {
  const content = (
    <span className="cube" aria-hidden="true">
      <span className="side top">{top}</span>
      <span className="side front">{front}</span>
    </span>
  );

  return (
    <StyledWrapper className={className}>
      {href ? (
        <a className="scene" href={href} aria-label={ariaLabel || `${front} - ${top}`}>
          {content}
        </a>
      ) : (
        <button className="scene" type="button" onClick={onClick} aria-label={ariaLabel || `${front} - ${top}`}>
          {content}
        </button>
      )}
    </StyledWrapper>
  );
};

export default CubeButton;
