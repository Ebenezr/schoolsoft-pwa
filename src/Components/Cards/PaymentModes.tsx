import React from 'react';
import { PieChart, Cell, Pie, Tooltip } from 'recharts';
import CardLoader from '../Loaders/CardLoaders';

const KES = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KES',
});

interface PaymentModesPieProps {
  paymentModes: { name: string; value: number }[];
  isLoading: boolean;
}

const PaymentModesPie = ({ paymentModes, isLoading }: PaymentModesPieProps) => {
  const COLORS = [
    '#9F7AEA',
    '#4C51BF',
    '#38B2AC',
    '#ED8936',
    '#FC8181',
    '#4299E1',
  ];

  return (
    <div className='bg-white mt-3 lg:h-96 h-auto p-2 w-150 rounded-lg shadow'>
      <p className='text-gray-700 font-semibold'>Payment Modes Stats(Today)</p>
      <>
        {isLoading ? (
          <CardLoader />
        ) : (
          <PieChart width={500} height={400} className='mx-auto my-auto '>
            {paymentModes &&
            paymentModes.length > 0 &&
            !paymentModes.every((mode) => mode.value === 0) ? (
              <>
                <Pie
                  dataKey='value'
                  isAnimationActive={false}
                  data={paymentModes || []}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={80}
                  fill='#8884d8'
                  paddingAngle={5}
                  label={({ name, value }) => {
                    if (value === 0) {
                      return null;
                    }
                    return `${name} : ${KES.format(value)}`;
                  }}
                >
                  {paymentModes?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => KES.format(Number(value))} />
              </>
            ) : (
              <div
                style={{
                  height: '400px',
                  width: '500px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <h2>No data available</h2>
              </div>
            )}
          </PieChart>
        )}
      </>
    </div>
  );
};

export default PaymentModesPie;
