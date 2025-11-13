import React from 'react';

// This component applies a global reset style to input fields of type text, password, email, and number.

const GlobalInputReset = () => (
    <style>
        {`
      input[type="text"],
      input[type="password"],
      input[type="email"],
      input[type="number"] {
        all: unset;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        outline: none;
        box-sizing: border-box;

        /* CUSTOM DESIGN */
        border-bottom: 2px solid var(--color-border);
        padding: 14px 2px;
        font-size: 1rem;
        color: var(--color-text-primary);
      }
    `}
    </style>
);


export default GlobalInputReset;
