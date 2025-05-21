'use client';

import { useEffect, useState } from 'react';

export default function DashboardDataUpdater({ onData }) {
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/admin-metrics');
      const json = await res.json();
      onData(json);
    }

    fetchData();
  }, [onData]);

  return null;
}
