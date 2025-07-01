import React from 'react';
import './App.scss';
import Layout from './components/Layout/Layout';
import StockTable from './components/StockTable/StockTable';

function App() {
  return (
    <div className="App">
      <Layout>
        <StockTable />
      </Layout>
    </div>
  );
}

export default App;