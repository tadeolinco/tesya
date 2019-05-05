import classnames from 'classnames';
import { getDaysInMonth } from 'date-fns';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DBContext from '../../context/DBContext';
import commafy from '../../utils/commafy';
import './Dashboard.scss';

const Dashboard = ({ history }) => {
  const {
    data: { budgets, savings },
    totalCash,
    extraBudget,
    updateData,
  } = useContext(DBContext);

  const { expenditures } = useMemo(() => {
    let expenditures = -savings;
    if (budgets) {
      const daysInMonth = getDaysInMonth(new Date());

      for (const budget of budgets) {
        if (budget.frequency === 'D') {
          expenditures -= budget.amount;
          expenditures -= budget.amount * daysInMonth;
        } else {
          expenditures -= budget.amount;
        }
      }
    }

    return { expenditures };
  }, [budgets, savings]);

  function updateSavings() {
    const newSavings = window.prompt('Savings:');
    if (newSavings !== null) updateData({ savings: newSavings });
  }

  if (!budgets) return null;

  return (
    <>
      <section className="dashboard">
        <div style={{ flex: 1 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>Budgets</h2>
            <div>
              <span>Cash: </span>
              <Link
                to={{
                  pathname: '/add-transaction',
                  state: { transaction: 'cash' },
                }}
                className={classnames('budget-extra', {
                  positive: totalCash > 0,
                  negative: totalCash < 0,
                })}
              >
                {totalCash > 0 && '+'}
                {commafy(totalCash)}
              </Link>
            </div>
          </div>
          <table className="budget-table">
            <tbody>
              {budgets.map(budget => (
                <tr key={budget._id}>
                  <td style={{ padding: '5px 0' }}>
                    <Link className="budget-name" to={`/budget/${budget._id}`}>
                      {budget.name}
                    </Link>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={{
                        pathname: '/add-transaction',
                        state: { transaction: budget._id },
                      }}
                      className={classnames('budget-extra', {
                        positive: extraBudget[budget._id] > 0,
                        negative: extraBudget[budget._id] < 0,
                      })}
                    >
                      {extraBudget[budget._id] > 0 && '+'}
                      {commafy(extraBudget[budget._id])}
                    </Link>
                  </td>
                  <td className="budget-amount">
                    {commafy(budget.amount)}/{budget.frequency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="budget-table" style={{ marginTop: 20 }}>
            <tbody>
              <tr>
                <td colSpan={2}>
                  <div
                    style={{ textDecoration: 'underline' }}
                    onClick={updateSavings}
                  >
                    Savings
                  </div>
                </td>
                <td className="budget-amount">{commafy(savings)}/M</td>
              </tr>
            </tbody>
          </table>

          <table style={{ textAlign: 'right', float: 'right', marginTop: 40 }}>
            <tbody>
              <tr>
                <td>Expenditures:</td>
                <td>
                  <span
                    className={classnames('budget-extra', {
                      positive: expenditures > 0,
                      negative: expenditures < 0,
                    })}
                    style={{ marginLeft: 10 }}
                  >
                    {expenditures > 0 && '+'}
                    {commafy(expenditures)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              history.push('/add-transaction');
            }}
          >
            Add Transaction
          </button>
          <button
            onClick={() => {
              history.push('/add-budget');
            }}
          >
            Add Budget
          </button>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
