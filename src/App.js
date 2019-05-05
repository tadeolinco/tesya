import React from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import AddBudget from './pages/AddBudget';
import AddTranscation from './pages/AddTransaction';
import Budget from './pages/Budget';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/budget/:id" component={Budget} />
        <Route exact path="/add-budget" component={AddBudget} />
        <Route exact path="/add-transaction" component={AddTranscation} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};

export default App;
