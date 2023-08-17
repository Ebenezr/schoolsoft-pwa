import React, { useState } from 'react';
import { PieChart, Pie, Cell, Text } from 'recharts';
import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import CardLoader from '../Loaders/CardLoaders';
import { capitalizeWords } from '../../utils/formartters/capitalizeWords';

const COLORS = [
  '#9F7AEA',
  '#4C51BF',
  '#38B2AC',
  '#ED8936',
  '#FC8181',
  '#4299E1',
];

function Chart() {
  const [selectedGrade, setSelectedGrade] = useState<number>();

  const fetchData = async (selectedGrade: number) => {
    try {
      if (!selectedGrade) return;
      const [feeResponce] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_BASE_URL}/students/fee-status/${selectedGrade}`
        ),
      ]);

      return {
        feePayment: feeResponce.data,
      };
    } catch (error) {
      throw new Error('Error fetching data');
    }
  };

  const { data, isLoading } = useQuery(
    ['dashboard-data', selectedGrade],
    () => fetchData(selectedGrade),
    {
      enabled: !!selectedGrade,
    }
  );
  const feePayments = data?.feePayment;

  const fetchClassList = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/classes/all`
      );
      return response.data.grade;
    } catch (error) {
      throw new Error('Error fetching class data');
    }
  };
  const { data: classList } = useQuery(['classes-data'], fetchClassList, {
    cacheTime: 10 * 60 * 1000, // cache for 10 minutes
  });
  const handleChange = (e) => {
    setSelectedGrade(e.target.value || 0);
  };

  return (
    // dropdown box for selecting the class
    <div className='bg-white mt-3 lg:h-96 h-auto p-2 w-150 rounded-lg shadow'>
      <p className='text-gray-700 font-semibold'>Payment Status Per Class</p>
      <Box>
        <div className='flex justify-between'>
          <div className='flex'>
            <select
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-10 py-2 appearance-none dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500'
              title='Select Class'
              name='grade'
              id='grade'
              value={selectedGrade ?? ''}
              onChange={handleChange}
            >
              <option value=''>Select Class</option>
              {classList?.map((grade) => (
                <option key={grade?.id} value={grade?.id}>
                  {grade?.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Box>
      <>
        {isLoading ? (
          <CardLoader />
        ) : (
          <>
            <PieChart width={450} height={300}>
              {feePayments && feePayments.length > 0 ? (
                <Pie
                  data={feePayments || []}
                  isAnimationActive={false}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, value }) => {
                    if (value === 0) {
                      return null;
                    }
                    return capitalizeWords(name);
                  }}
                  innerRadius={60}
                  outerRadius={80}
                  fill='#8884d8'
                  paddingAngle={5}
                  dataKey='value'
                >
                  {feePayments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              ) : (
                <Text
                  x={225}
                  y={150}
                  width={450}
                  textAnchor='middle'
                  verticalAnchor='middle'
                  style={{ fontSize: '1.5em' }}
                >
                  No data available
                </Text>
              )}
            </PieChart>
          </>
        )}
      </>
    </div>
  );
}
export default Chart;
