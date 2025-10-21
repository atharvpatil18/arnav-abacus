'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';

export default function CreateTestPage() {
  const [step, setStep] = useState(1);
  const [testName, setTestName] = useState('');

  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">Create New Test</h1>
        <p className="text-gray-600 mt-2">Test creation page - under construction</p>
        
        <div className="mt-8">
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="border px-4 py-2 rounded"
            placeholder="Test Name"
          />
          <Button onClick={() => alert('Creating test: ' + testName)} className="ml-4">
            Create Test
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
