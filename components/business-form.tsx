'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BusinessData = {
  name: string;
  businessId: string;
  fiscalPermit: string;
};

interface BusinessFormProps {
  onSubmit: (data: BusinessData) => void;
  initialData?: BusinessData | null;
}

export default function BusinessForm({ onSubmit, initialData }: BusinessFormProps) {
  const [name, setName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [fiscalPermit, setFiscalPermit] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setBusinessId(initialData.businessId);
      setFiscalPermit(initialData.fiscalPermit);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !businessId || !fiscalPermit) {
      // Basic validation
      alert('Please fill all fields');
      return;
    }
    onSubmit({ name, businessId, fiscalPermit });
  };

  return (
    <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
      <h1 className="text-2xl font-bold text-slate-100 mb-4">
        Set up your Business
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600"
        />
        <Input
          type="text"
          placeholder="Business ID"
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600"
        />
        <Input
          type="text"
          placeholder="Fiscal Permit"
          value={fiscalPermit}
          onChange={(e) => setFiscalPermit(e.target.value)}
          className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600"
        />
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-lemon-400 to-lemon-500 hover:from-lemon-500 hover:to-lemon-600 text-slate-900 font-semibold h-11"
        >
          Open Business
        </Button>
      </form>
    </Card>
  );
}
