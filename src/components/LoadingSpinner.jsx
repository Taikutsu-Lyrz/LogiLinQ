import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = () => (
    <div className="loading-container">
        <div className="loop-wrapper">
            <div className="mountain"></div>
            <div className="hill"></div>
            <div className="tree"></div>
            <div className="tree"></div>
            <div className="tree"></div>
            <div className="rock"></div>
            <div className="truck"></div>
            <div className="wheels"></div>
        </div>
        <p className="loading-text">Loading...</p>
    </div>
);

export default LoadingSpinner;
