import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Package } from '../../types/package';

const COURSEMAPPING: React.FC = () => {
  const navigate = useNavigate();

  // State for selected courses
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const packageData: Package[] = [
    {
      name: 'Affiliate Marketing',
      created_time: 0.0,
      invoiceDate: 'Jan 13,2023',
      status: 'Paid',
    },
    {
      name: 'Standard Package',
      created_time: 59.0,
      invoiceDate: 'Jan 13,2023',
      status: 'Paid',
    },
    {
      name: 'Business Package',
      created_time: 99.0,
      invoiceDate: 'Jan 13,2023',
      status: 'Unpaid',
    },
    {
      name: 'Standard Package',
      created_time: 59.0,
      invoiceDate: 'Jan 13,2023',
      status: 'Pending',
    },
  ];

  const handleAddRemove = (courseName: string) => {
    setSelectedCourses((prevSelected) =>
      prevSelected.includes(courseName)
        ? prevSelected.filter((name) => name !== courseName)
        : [...prevSelected, courseName]
    );
  };

  const handleSubmit = () => {
    const packageId = '12345'; // Replace with the actual package ID
    const mappedData = {
      packageId,
      courses: selectedCourses,
    };

    // Store the mapped data in localStorage
    localStorage.setItem('courseMapping', JSON.stringify(mappedData));
    console.log('Mapped Courses:', mappedData);

    // Navigate or perform additional actions if needed
    alert('Courses successfully mapped to the package!');
    navigate('/some-next-route'); // Adjust the route as required
  };

  return (
    <>
      <Breadcrumb pageName="Mapping Courses Into Packages" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Course Name
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Created at
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Instructor
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {packageData.map((packageItem, key) => (
                <tr key={key}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {packageItem.name}
                    </h5>
                    <p className="text-sm">${packageItem.created_time}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {packageItem.invoiceDate}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p
                      className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                        packageItem.status === 'Paid'
                          ? 'bg-success text-success'
                          : packageItem.status === 'Unpaid'
                          ? 'bg-danger text-danger'
                          : 'bg-warning text-warning'
                      }`}
                    >
                      {packageItem.status}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <button
                      className={`rounded px-4 py-2 font-medium ${
                        selectedCourses.includes(packageItem.name)
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                      onClick={() => handleAddRemove(packageItem.name)}
                    >
                      {selectedCourses.includes(packageItem.name)
                        ? 'Remove'
                        : 'Add'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default COURSEMAPPING;
