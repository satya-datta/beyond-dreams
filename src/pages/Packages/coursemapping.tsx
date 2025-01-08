import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

interface Course {
  id: string;
  name: string;
  created_at: string;
  instructor: string;
}

const COURSEMAPPING: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>(); // Retrieve packageId from URL
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Fetch courses from the backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getallcourses`);
        if (response.ok) {
          const data = await response.json();
          console.log(data); // Log the response to check the structure
          if (data.courses && Array.isArray(data.courses)) {
            setCourses(data.courses); // Extract the courses array from the response
          } else {
            console.error('No courses array found in the response');
          }
        } else {
          console.error('Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    

    fetchCourses();
  }, []);

  const handleAddRemove = (courseId: string) => {
    setSelectedCourses((prevSelected) =>
      prevSelected.includes(courseId)
        ? prevSelected.filter((id) => id !== courseId)
        : [...prevSelected, courseId]
    );
  };

  const handleSubmit = async () => {
    const mappedData = {
      packageId,
      courses: selectedCourses,
    };

    try {
      const response = await fetch('http://localhost:5000/course-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedData),
      });

      if (response.ok) {
        console.log('Courses successfully mapped:', mappedData);
        alert('Courses successfully mapped to the package!');
        navigate('/some-next-route'); // Adjust the route as required
      } else {
        const error = await response.json();
        console.error('Failed to map courses:', error.message);
        alert(`Failed to map courses: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting course mapping:', error);
      alert('Failed to submit course mapping. Please try again.');
    }
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
                  Created At
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
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <h5 className="font-medium text-black dark:text-white">
                      {course.name}
                    </h5>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {course.created_at}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {course.instructor}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <button
                      className={`rounded px-4 py-2 font-medium ${
                        selectedCourses.includes(course.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                      onClick={() => handleAddRemove(course.id)}
                    >
                      {selectedCourses.includes(course.id)
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
