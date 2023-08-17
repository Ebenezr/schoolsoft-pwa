import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { React } from 'react';
import Stats from '../Components/Cards/Stats';
import PaymentModesPie from '../Components/Cards/PaymentModes';

import BarChart from '../Components/Cards/PaymentsPie';

const Dashboard = () => {
  const fetchData = async () => {
    try {
      const [
        studentsResponce,
        teachersResponce,
        classesResponce,

        paymentModeResponce,
      ] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BASE_URL}/students/count`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/teachers/count`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/classes/count`),
        axios.get(
          `${process.env.REACT_APP_BASE_URL}/payments/get/paymentmodes`
        ),
      ]);

      return {
        students: studentsResponce.data.totalStudents,
        teachers: teachersResponce.data.totalTeachers,
        classes: classesResponce.data.totalClasses,
        paymentModes: paymentModeResponce.data.todayRevenueByPaymentMode,
      };
    } catch (error) {
      throw new Error('Error fetching data');
    }
  };

  const { data, isLoading } = useQuery(['dashboard-data'], fetchData);

  const studentsCount = data?.students;
  const teachersCount = data?.teachers;
  const classesCount = data?.classes;
  const paymentModes = data?.paymentModes;

  console.log(studentsCount);

  return (
    <section className='p-3 '>
      <Stats
        studentsCount={studentsCount}
        teachersCount={teachersCount}
        classesCount={classesCount}
        isLoading={isLoading}
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 h-auto'>
        <PaymentModesPie paymentModes={paymentModes} isLoading={isLoading} />

        <BarChart />
      </div>
    </section>
  );
};

export default Dashboard;
