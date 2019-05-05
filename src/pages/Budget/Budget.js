import format from 'date-fns/format';
import React, { useContext, useEffect, useState } from 'react';
import DBContext from '../../context/DBContext';
import commafy from '../../utils/commafy';
import './Budget.scss';

const Budget = ({ history, match }) => {
  const {
    data: { budgets },
    updateData,
  } = useContext(DBContext);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('D');
  const [found, setFound] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (budgets) {
      const selectedBudget = budgets.find(
        budget => budget._id === match.params.id
      );

      if (selectedBudget) {
        setName(selectedBudget.name);
        setAmount(selectedBudget.amount);
        setFrequency(selectedBudget.frequency);
        setTransactions(
          selectedBudget.transactions.reduce((transactionsMap, transaction) => {
            const formattedDate = format(transaction.createdAt, 'MM/DD/YY');
            if (!transactionsMap[formattedDate])
              transactionsMap[formattedDate] = [];
            transactionsMap[formattedDate].push(transaction);

            return transactionsMap;
          }, {})
        );

        setFound(true);
      } else {
        setFound(false);
      }
    }
  }, [budgets, match, match.params.id]);

  const handleSubmit = async () => {
    const err = [];
    if (name.length === 0) err.push('Must have a name.');
    const sameBudgetName = budgets.find(
      budget =>
        budget.name.toLowerCase() === name.toLowerCase() &&
        budget._id !== match.params.id
    );
    if (sameBudgetName) err.push(`${name} is already taken.`);

    if (amount <= 0) err.push('Budget must be a postive number.');

    if (!!err.length) {
      window.alert(err.join('\n'));
    } else {
      const newBudgets = budgets.map(budget => {
        if (budget._id === match.params.id) {
          return { ...budget, name, amount, frequency };
        } else return budget;
      });
      await updateData({ budgets: newBudgets });
      window.alert('Saved');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      const newBudgets = budgets.filter(
        budget => budget._id !== match.params.id
      );

      await updateData({ budgets: newBudgets });
      history.push('/dashboard');
      window.alert('Budget deleted.');
    }
  };

  const handleDeleteTransaction = async transaction => {
    if (
      window.confirm(`Are you sure you want to delete this transaction:
      Date: ${format(transaction.createdAt, 'ddd | MMM DD, YYYY HH:mm')}
      Note: ${transaction.note || '—'}
      Amount: ${commafy(transaction.amount)}
    `)
    ) {
      const newBudgets = budgets.map(budget => {
        if (budget._id === match.params.id) {
          return {
            ...budget,
            transactions: budget.transactions.filter(
              t => t._id !== transaction._id
            ),
          };
        } else return budget;
      });
      await updateData({ budgets: newBudgets });
      window.alert('Deleted.');
    }
  };

  if (found === null) return null;

  if (!found)
    return (
      <div>
        <h2>Budget with id: {match.params.id} does not exist.</h2>
        <button
          onClick={() => {
            history.push('/dashboard');
          }}
        >
          Back
        </button>
      </div>
    );

  return (
    <section className="add-budget">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>Budget</h2>
        <button onClick={() => history.push('/dashboard')}>Back</button>
      </div>
      <form>
        <div className="form-item">
          <label htmlFor="budget-name">Name:</label>
          <input
            type="text"
            name="budget-name"
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
            onChange={e => setAmount(+e.target.value)}
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
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button type="button" onClick={handleDelete}>
          Delete
        </button>

        <button type="button" onClick={handleSubmit}>
          Edit
        </button>
      </div>
      <h2>Transactions</h2>
      <div>
        {[...Object.keys(transactions)]
          .sort((a, b) => {
            a = new Date(a);
            b = new Date(b);
            return a > b ? -1 : a < b ? 1 : 0;
          })
          .map(date => (
            <table key={date} style={{ width: '100%', marginBottom: 10 }}>
              <thead>
                <tr>
                  <th colSpan={3}>
                    {format(new Date(date), 'ddd | MMM D, YYYY')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...transactions[date]]
                  .sort((a, b) => {
                    a = new Date(a.createdAt);
                    b = new Date(b.createdAt);
                    return a > b ? -1 : a < b ? 1 : 0;
                  })
                  .map(transaction => (
                    <tr
                      key={transaction._id}
                      onClick={() => handleDeleteTransaction(transaction)}
                    >
                      <td style={{ width: 55, fontSize: '0.75em' }}>
                        {format(transaction.createdAt, 'HH:mm')}
                      </td>
                      <td style={{ fontSize: '0.75em' }}>
                        {transaction.note || '—'}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          padding: '5px 0',
                          fontSize: '0.75em',
                        }}
                      >
                        {commafy(transaction.amount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ))}
      </div>
    </section>
  );
};

export default Budget;
