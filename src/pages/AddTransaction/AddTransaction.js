import React, { useContext, useEffect, useState } from 'react';
import uuid from 'uuid/v1';
import DBContext from '../../context/DBContext';
import './AddTransaction.scss';

const AddTranscation = ({ history, location }) => {
  const {
    data: { budgets, cash },
    updateData,
  } = useContext(DBContext);

  const isCash = location.state && location.state.transaction === 'cash';
  const isBudget =
    location.state &&
    location.state.transaction &&
    location.state.transaction !== 'cash';

  const [type, setType] = useState(isCash ? 'cash' : 'budget');
  const [budgetId, setBudgetId] = useState(
    isBudget ? location.state.transaction : ''
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (budgets && !!budgets.length && !isBudget) {
      setBudgetId(budgets[0]._id);
    }
  }, [budgets, isBudget]);

  const handleSubmit = async () => {
    const err = [];

    if (type === 'cash') {
      const newCash = [
        ...cash,
        {
          _id: uuid(),
          amount: +amount,
          createdAt: new Date().toJSON(),
        },
      ];
      await updateData({ cash: newCash });
      history.push('/dashboard');
      return;
    }

    if (+amount <= 0) err.push('Budget must be a postive number.');
    if (budgetId === '') err.push('Must assign to budget.');
    if (!!err.length) {
      return window.alert(err.join('\n'));
    }

    const newBudgets = budgets.map(budget => {
      if (budget._id === budgetId) {
        return {
          ...budget,
          transactions: [
            ...budget.transactions,
            {
              _id: uuid(),
              amount: +amount,
              createdAt: new Date().toJSON(),
              note,
            },
          ],
        };
      }
      return budget;
    });
    await updateData({ budgets: newBudgets });
    history.push('/dashboard');
  };

  return (
    <section className="add-transaction">
      <div style={{ flex: 1 }}>
        <h2>Add Transaction</h2>
        <form>
          <div className="form-item">
            <label htmlFor="type">Type:</label>
            <div
              className="radio-container"
              onClick={() => {
                setType('budget');
              }}
            >
              <input
                type="radio"
                name="type"
                value="budget"
                checked={type === 'budget'}
                onChange={e => setType(e.target.value)}
              />
              Budget
            </div>
            <div
              className="radio-container"
              onClick={() => {
                setType('cash');
              }}
            >
              <input
                type="radio"
                name="type"
                value="cash"
                checked={type === 'cash'}
                onChange={e => setType(e.target.value)}
              />
              Cash
            </div>
          </div>

          {type === 'budget' && (
            <div className="form-item">
              <label htmlFor="budget-id">Budget:</label>
              <select
                name="budget-id"
                value={budgetId}
                onChange={event => {
                  setBudgetId(event.target.value);
                }}
              >
                {budgets &&
                  budgets.map(budget => (
                    <option key={budget._id} value={budget._id}>
                      {budget.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="form-item">
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              autoFocus={isCash || isBudget}
            />
          </div>

          {type === 'budget' && (
            <div className="form-item">
              <label htmlFor="note">Note:</label>
              <input
                type="text"
                value={note}
                onChange={event => setNote(event.target.value)}
              />
            </div>
          )}
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

export default AddTranscation;
