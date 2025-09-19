"use client";
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

// Define a type for the valid plan names that have a Stripe price ID
type PlanName = 'STARTER' | 'PRO' | 'TEAM';

// You will need to replace these with your actual Stripe price IDs
const stripePriceIds: Record<PlanName, string> = {
  STARTER: 'prod_T58ijGil7Fu6od',
  PRO: 'prod_T58lARyqtLkbz3',
  TEAM: 'prod_T58mhrXmuE7tZk',
};

// Define the pricing plan features based on your specifications
const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for developer onboarding and quick testing.',
    features: [
      { text: '1,000 rows/month', included: true },
      { text: 'Limited templates (e.g. "E-commerce Orders")', included: true },
      { text: 'Export: JSON only', included: true },
      { text: '1 project workspace', included: false },
      { text: 'Email support', included: false },
      { text: 'API access', included: false },
      { text: 'Team collaboration features', included: false },
    ],
    link: '/auth/sign-in', 
  },
  {
    name: 'Starter',
    price: '$9-15/month',
    description: 'For indie devs, students, and side projects.',
    features: [
      { text: '100,000 rows/month', included: true },
      { text: 'Access to 5-7 templates', included: true },
      { text: 'Exports: JSON + CSV', included: true },
      { text: '1 project workspace', included: true },
      { text: 'Email support', included: false },
      { text: 'API access', included: false },
      { text: 'Team collaboration features', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$39-49/month',
    description: 'The complete toolkit for data generation.',
    features: [
      { text: '5M rows/month', included: true },
      { text: 'Full template library', included: true },
      { text: 'Exports: JSON, CSV, SQL schema', included: true },
      { text: '3 project workspaces', included: true },
      { text: 'Email support', included: true },
      { text: 'API access', included: true },
      { text: 'Team collaboration features', included: false },
    ],
  },
  {
    name: 'Team',
    price: '$99-149/month',
    description: 'Advanced collaboration for growing teams.',
    features: [
      { text: '50M rows/month', included: true },
      { text: 'Everything in Pro', included: true },
      { text: 'Up to 5 seats', included: true },
      { text: 'Team collaboration features (shared templates)', included: true },
      { text: 'Priority email support', included: true },
      { text: 'API access', included: true },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom pricing',
    description: 'Tailored for large organizations with specific needs.',
    features: [
      { text: 'Unlimited rows', included: true },
      { text: 'Private/custom templates', included: true },
      { text: 'Dedicated support / SLA', included: true },
      { text: 'On-prem or VPC deployment', included: true },
      { text: 'Advanced compliance: HIPAA/PCI', included: true },
    ],
    link: 'mailto:contact@syntheticdatavault.com',
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.MouseEvent<HTMLButtonElement>, priceId: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-xl text-gray-400 mb-12">Choose the plan that fits your needs.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <div key={index} className="flex flex-col bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-4">{plan.price}</p>
              <p className="text-gray-400 mb-6">{plan.description}</p>
              <ul className="text-left flex-grow space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-400 mr-2" />
                    ) : (
                      <X className="h-5 w-5 text-gray-500 mr-2" />
                    )}
                    <span className={feature.included ? "" : "text-gray-500"}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.link ? (
                  plan.name === 'Enterprise' ? (
                    <a href={plan.link}>
                      <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition duration-300">
                        Contact Us
                      </button>
                    </a>
                  ) : (
                    <Link href={plan.link}>
                      <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition duration-300">
                        Get Started
                      </button>
                    </Link>
                  )
                ) : (
                  <button 
                    onClick={(e) => handleCheckout(e, stripePriceIds[plan.name.toUpperCase() as PlanName])}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Redirecting...' : 'Choose Plan'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}