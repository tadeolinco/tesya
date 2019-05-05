import classnames from 'classnames';
import { differenceInDays, endOfMonth, isThisMonth, isToday } from 'date-fns';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DBContext from '../../context/DBContext';
import commafy from '../../utils/commafy';
import './Dashboard.scss';

const Dashboard = ({ history }) => {
  const {
    data: { budgets },
    totalCash,
    extraBudget,
  } = useContext(DBContext);

  const { estEOD, estEOM } = useMemo(() => {
    let estEOD = totalCash;
    let estEOM = totalCash;
    if (budgets) {
      const daysTillEndOfMonth = differenceInDays(
        endOfMonth(new Date()),
        new Date()
      );

      for (const budget of budgets) {
        for (const transaction of budget.transactions) {
          const transactionDate = new Date(transaction.createdAt);
          if (isToday(transactionDate)) {
            estEOD += transaction.amount;
          }
          if (isThisMonth(transactionDate)) {
            estEOM += transaction.amount;
          }
        }
        if (budget.frequency === 'D') {
          estEOD -= budget.amount;
          estEOM -= budget.amount * daysTillEndOfMonth;
        } else {
          estEOM -= budget.amount;
        }
      }
    }

    return { estEOD, estEOM };
  }, [budgets, totalCash]);

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
          <table style={{ textAlign: 'right', float: 'right', marginTop: 40 }}>
            <tbody>
              <tr>
                <td>Est. EOD:</td>
                <td>
                  <span
                    className={classnames('budget-extra', {
                      positive: estEOD > 0,
                      negative: estEOD < 0,
                    })}
                    style={{ marginLeft: 10 }}
                  >
                    {estEOD > 0 && '+'}
                    {commafy(estEOD)}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Est. EOM:</td>
                <td>
                  <span
                    className={classnames('budget-extra', {
                      positive: estEOM > 0,
                      negative: estEOM < 0,
                    })}
                    style={{ marginLeft: 10 }}
                  >
                    {estEOM > 0 && '+'}
                    {commafy(estEOM)}
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
