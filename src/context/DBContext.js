import { differenceInDays, differenceInMonths } from 'date-fns';
import PouchDB from 'pouchdb';
import React, { useEffect, useState } from 'react';
import { seedData } from './seed';

const DBContext = React.createContext({});

const db = new PouchDB('tesya-db');

export const DBProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [totalCash, setTotalCash] = useState(0);
  const [extraBudget, setExtraBudget] = useState({});

  async function fetchAllData() {
    try {
      const dbData = await db.get('data');
      setData(dbData);
    } catch {
      await db.put(seedData);
      const dbData = await db.get('data');
      setData(dbData);
    }
  }

  useEffect(() => {
    if (!Object.keys(data).length) return;
    let totalCash = 0;
    for (const { amount } of data.cash) {
      totalCash += amount;
    }

    const extraBudget = {};
    for (const budget of data.budgets) {
      const now = new Date();

      const multiplier =
        budget.frequency === 'D' ? differenceInDays : differenceInMonths;

      let extra =
        (multiplier(now, new Date(budget.createdAt)) + 1) * budget.amount;

      for (const transaction of budget.transactions) {
        totalCash -= transaction.amount;
        extra -= transaction.amount;
      }
      extraBudget[budget._id] = extra;
    }

    setExtraBudget(extraBudget);
    setTotalCash(totalCash);
  }, [data]);

  const updateData = async changes => {
    await db.put({
      ...data,
      ...changes,
    });
    return fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <DBContext.Provider
      value={{
        data,
        totalCash,
        setTotalCash,
        db,
        updateData,
        extraBudget,
      }}
    >
      {children}
    </DBContext.Provider>
  );
};

export default DBContext;
