import React, { useContext, useState } from 'react';
import uuid from 'uuid/v1';
import DBContext from '../../context/DBContext';
import './AddBudget.scss';

const AddBudget = ({ history }) => {
  const {
    data: { budgets },
    updateData,
  } = useContext(DBContext);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('D');

  const handleSubmit = async () => {
    const err = [];
    if (name.length === 0) err.push('Must have a name.');
    const sameBudgetName = budgets.find(
      budget => budget.name.toLowerCase() === name.toLowerCase()
    );
    if (sameBudgetName) err.push(`${name} is already taken.`);

    if (+amount <= 0) err.push('Budget must be a postive number.');

    if (!!err.length) {
      window.alert(err.join('\n'));
    } else {
      const newBudgets = [
        ...budgets,
        {
          _id: uuid(),
          name,
          amount: +amount,
          frequency,
          createdAt: new Date().toJSON(),
          transactions: [],
        },
      ];
      await updateData({ budgets: newBudgets });
      history.push('/dashboard');
    }
  };

  return (
    <section className="add-budget">
      <div style={{ flex: 1 }}>
        <h2>Add Budget</h2>
        <form>
          <div className="form-item">
            <label htmlFor="budget-name">Name:</label>
            <input
              type="text"
              name="budget-name"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-item">
            <label htmlFor="budget-amount">Budget:</label>
            <input
              type="number"
              name="budget-amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="form-item">
            <label htmlFor="budget-frequency">Frequency:</label>
            <div
              className="radio-container"
              onClick={() => {
                setFrequency('D');
              }}
            >
              <input
                type="radio"
                name="budget-frequency"
                value="D"
                checked={frequency === 'D'}
                onChange={e => setFrequency(e.target.value)}
              />
              Day
            </div>
            <div
              className="radio-container"
              onClick={() => {
                setFrequency('M');
              }}
            >
              <input
                type="radio"
                name="budget-frequency"
                value="M"
                checked={frequency === 'M'}
                onChange={e => setFrequency(e.target.value)}
              />
              Month
            </div>
          </div>
        </form>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={() => {
            history.push('/dashboard');
          }}
        >
          Cancel
        </button>
        <button type="button" onClick={handleSubmit}>
          Add
        </button>
      </div>
    </section>
  );
};

export default AddBudget;
