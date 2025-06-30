import React from 'react';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Dashboard from './components/Dashboard/Dashboard';
import './App.scss';

function App() {
  return (
    <ErrorBoundary>
      <div className="app optimized">
        <Dashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;