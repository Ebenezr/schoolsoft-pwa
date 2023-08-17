import React, { useCallback, useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { jsPDF } from 'jspdf';
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf';
import { format } from 'date-fns';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
import styles from '../index.css';
import 'jspdf-autotable';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PrintIcon from '@mui/icons-material/Print';
import { useIsAuthenticated } from '../utils/hooks/localstorage';
// Configure the worker source
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const KES = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KES',
});

function Invoice({ payments }) {
  const [showPreview, setShowPreview] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { name: StaffName } = useIsAuthenticated();

  const fetchData = async () => {
    try {
      const [studentResponse, classResponse, schoolResponse] =
        await Promise.all([
          axios.get(`${process.env.REACT_APP_BASE_URL}/students/all`),
          axios.get(`${process.env.REACT_APP_BASE_URL}/classes/all`),

          axios.get(`${process.env.REACT_APP_BASE_URL}/schools/all`),
        ]);

      return {
        studentList: studentResponse?.data?.student,
        classList: classResponse?.data?.grade,

        school: schoolResponse?.data,
      };
    } catch (error) {
      throw new Error('Error fetching data');
    }
  };

  const { data: dataList, isLoading: loadingData } = useQuery(
    ['data'],
    fetchData
  );

  const studentList = dataList?.studentList;
  const classList = dataList?.classList;
  const schoolData = dataList?.school;

  const getStudentName = useCallback(
    (payments) => {
      if (studentList) {
        const student = studentList?.find(
          (student) => student.id === payments?.studentId
        );

        if (student) {
          const full_name = student.first_name + ' ' + student.last_name;
          return full_name;
        } else {
          return 'Student not found';
        }
      }
    },
    [studentList]
  );

  const getGuardianName = useCallback(
    (payments) => {
      if (studentList) {
        const student = studentList?.find(
          (student) => student.id === payments?.studentId
        );

        if (student) {
          const full_name = student.guardianName;
          return full_name;
        } else {
          return 'Guardian not found';
        }
      }
    },
    [studentList]
  );

  const getStudentBalance = useCallback(
    (payments) => {
      if (studentList) {
        const student = studentList?.find(
          (student) => student.id === payments?.studentId
        );

        if (student) {
          const balance = student.feeBalance ?? 0;
          return balance;
        } else {
          return 'Balance not found';
        }
      }
    },
    [studentList]
  );

  const getClassName = useCallback(
    (payments) => {
      if (classList) {
        const classname = classList?.find(
          (classname) => classname.id === payments?.classId
        );

        if (classname) {
          const name = classname.name;
          return name;
        } else {
          return 'Class not found';
        }
      }
    },
    [classList]
  );

  const date = new Date();
  const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const [
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
    ,
    { value: hour },
    ,
    { value: minute },
    ,
    { value: second },
  ] = dateTimeFormat.formatToParts(date);

  const generatePDF = useCallback(() => {
    if (payments) {
      try {
        const doc = new jsPDF();
        const schoolName = schoolData?.name ?? 'SchoolSoft';
        const title = 'Invoice';
        const schoolAddress = schoolData?.address ?? '';
        const schoolAddress2 = schoolData?.address2 ?? '';
        const schoolPhone = schoolData?.phone ?? '';
        const schoolPhone2 = schoolData?.phone2 ?? '';
        const schoolEmail = schoolData?.email ?? '';
        const schoolTown = schoolData?.town ?? '';
        const bankName = schoolData?.bankName ?? '';
        const bankAcc = schoolData?.bankAcc ?? '';
        const mpesaInfo = schoolData?.mpesaInfo ?? '';
        const titleWidth = doc.getStringUnitWidth(title) * doc.getFontSize();
        const studentName = getStudentName(payments);
        const className = getClassName(payments);
        const guardianName = getGuardianName(payments);
        const feeBalance = getStudentBalance(payments);

        const date = new Date();
        const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        });

        const [
          { value: month },
          ,
          { value: day },
          ,
          { value: year },
          ,
          { value: hour },
          ,
          { value: minute },
          ,
          { value: second },
        ] = dateTimeFormat.formatToParts(date);
        const invoiceGeneratedText = `${day} ${month} ${year} ${hour}:${minute}:${second}`;

        doc.setFontSize(18);
        doc.text(title, 10, 10);

        doc.setFontSize(12);
        let leftMargin = 10;
        let rightMargin = doc.internal.pageSize.width - 90; // Adjust as needed
        let lineSpacing = 16;

        // Left Column
        doc.text(schoolName, leftMargin, lineSpacing);
        doc.text(schoolAddress, leftMargin, 22);
        doc.text(schoolAddress2, leftMargin, 32);

        // Right Column
        doc.text(
          `Tel: ${schoolPhone} / ${schoolPhone2}`,
          rightMargin,
          lineSpacing
        );
        doc.text(`Email: ${schoolEmail}`, rightMargin, 22);
        doc.text(`Town: ${schoolTown}`, rightMargin, 32);
        doc.setFontSize(16);
        doc.text('Student Details:', 10, 45);
        doc.setFontSize(10);
        doc.text(`Name: ${studentName}`, 10, 52);
        doc.text(`Grade: ${className}`, 10, 62);
        doc.text(`Guardian: ${guardianName}`, 10, 72);
        doc.setFontSize(16);
        doc.text('Invoice Details:', rightMargin, 45);
        doc.setFontSize(10);
        doc.text(`Date Paid: ${invoiceGeneratedText}`, rightMargin, 52);
        doc.text(`Amount: ${KES.format(payments.amount)}`, rightMargin, 62);
        doc.text(`Mode of Payment: ${payments.payment_mode}`, rightMargin, 72);

        let totalPaid = payments.amount ?? 0;

        doc.autoTable({
          startY: 82,
          head: [['Item', 'Amount']],
          body: [
            ['Amount Paid', KES.format(totalPaid)],

            ['Total Balance Due', KES.format(feeBalance)],
          ],
          foot: [['Paid Total', KES.format(payments.amount)]],
          footStyles: {
            fillColor: false,
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: false,
            textColor: [0, 0, 0],
          },
          styles: {
            fillColor: false,
            lineColor: [0, 0, 0],
          },
        });
        doc.setFontSize(10);
        const startY1 = doc.autoTable.previous.finalY + 10;

        doc.text(`Served By: ${StaffName}`, 10, startY1);
        doc.text('Bank Details:', 10, startY1 + 10);
        doc.text(`Account No: ${bankAcc}`, 10, startY1 + 20);
        doc.text(`Bank: ${bankName}`, 10, startY1 + 30);
        doc.text(`Mpesa: ${mpesaInfo}`, 10, startY1 + 40);

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setShowPreview(true);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  }, [
    payments,
    schoolData,
    getClassName,
    getStudentName,
    getGuardianName,
    getStudentBalance,
    StaffName,
  ]);

  const printPDF = () => {
    if (!pdfUrl) return;

    const windowFeatures = 'width=800,height=600,scrollbars=yes,status=yes';
    const printWindow = window.open('', '_blank', windowFeatures);
    if (printWindow) {
      printWindow.document.write(
        '<html><head><title>Print PDF</title></head><body><iframe id="printFrame" src="' +
          pdfUrl +
          '" style="width:100%;height:100%;" frameborder="0" scrolling="no"></iframe></body></html>'
      );
      printWindow.document.close();
      printWindow.focus();

      // Wait for the PDF to load in the iframe, then print
      const printFrame = printWindow.document.getElementById('printFrame');
      if (printFrame) {
        printFrame.onload = () => {
          try {
            printWindow.print();
          } catch (error) {
            console.error('Error printing PDF:', error);
          }
        };
      } else {
        console.error('Error finding printFrame element');
      }
    } else {
      console.error('Error opening print window');
    }
  };

  useEffect(() => {
    generatePDF();
  }, [payments, generatePDF]);

  return (
    <>
      {payments && (
        <div className='bg-slate-50  py-2 px-4 flex items-center justify-between'>
          <p className='text-gray-600 font-semibold text-lg'>Invoice Preview</p>
          <Tooltip arrow title='Print'>
            <IconButton onClick={printPDF}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
      {showPreview && pdfUrl ? (
        <div className='w-full h-[600px]'>
          <PDFDocument
            file={pdfUrl}
            onLoadSuccess={() => setIsLoading(false)}
            onLoadError={(error) => {
              console.error('Error loading PDF:', error);
              setIsLoading(false);
            }}
            onRenderError={(error) =>
              console.error('Error rendering PDF:', error)
            }
            onLoadProgress={() => setIsLoading(true)}
          >
            <PDFPage pageNumber={1} />
          </PDFDocument>
          {loadingData && (
            <div className='flex justify-center items-center absolute inset-0'>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>
      ) : (
        <p>No PDF to display</p>
      )}
    </>
  );
}

export default Invoice;
