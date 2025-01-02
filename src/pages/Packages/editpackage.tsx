import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

interface Package {
  name: string;
  created_time: number;
  invoiceDate: string;
  status: string;
}

const EditPackage: React.FC = () => {
  const navigate = useNavigate();

  // State for selected courses
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const packageData: Package[] = [
    {
      name: 'Affiliate Marketing',
      created_time: 0.0,
      invoiceDate: 'Jan 13, 2023',
      status: 'Paid',
    },
    {
      name: 'Standard Package',
      created_time: 59.0,
      invoiceDate: 'Jan 13, 2023',
      status: 'Paid',
    },
    {
      name: 'Business Package',
      created_time: 99.0,
      invoiceDate: 'Jan 13, 2023',
      status: 'Unpaid',
    },
    {
      name: 'Enterprise Package',
      created_time: 149.0,
      invoiceDate: 'Jan 13, 2023',
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
    alert('Courses successfully mapped to the package!');
  };

  // State for form fields and errors
  const [formData, setFormData] = useState({
    packageName: '',
    price: '',
    description: '',
  });

  const [errors, setErrors] = useState({
    packageName: '',
    price: '',
    description: '',
  });

  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error when user types
  };

  // Function to validate form fields
  const validate = () => {
    const newErrors = {
      packageName: '',
      price: '',
      description: '',
    };
    let isValid = true;

    if (!formData.packageName.trim()) {
      newErrors.packageName = 'Package name is required.';
      isValid = false;
    }

    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a valid number.';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Function to submit data to the database
  const submitToDatabase = async () => {
    const packageId = '12345'; // Replace with the actual package ID
    const payload = {
      packageId,
      packageName: formData.packageName,
      price: parseFloat(formData.price), // Convert price to number
      description: formData.description,
      courses: selectedCourses,
    };

    try {
      const response = await fetch('https://your-backend-api.com/update-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Package successfully updated in the database!');
        navigate('/some-next-route'); // Redirect to the next page
      } else {
        const error = await response.json();
        alert(`Failed to update the package: ${error.message}`);
      }
    } catch (err) {
      console.error('Error updating package:', err);
      alert('An error occurred while updating the package.');
    }
  };

  return (
    <>
      <Breadcrumb pageName="Package" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-1">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Package</h3>
            </div>
            <form>
              <div className="p-7.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Package Name <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="packageName"
                    placeholder="Enter the package name"
                    className={`w-full rounded border-[1.5px] ${
                      errors.packageName ? 'border-red-500' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary`}
                    value={formData.packageName}
                    onChange={handleInputChange}
                  />
                  {errors.packageName && (
                    <p className="text-red-500 text-sm">{errors.packageName}</p>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">Price</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="Enter the price"
                    className={`w-full rounded border-[1.5px] ${
                      errors.price ? 'border-red-500' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary`}
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm">{errors.price}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">Description</label>
                  <textarea
                    name="description"
                    rows={6}
                    placeholder="Enter the description"
                    className={`w-full rounded border-[1.5px] ${
                      errors.description ? 'border-red-500' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary`}
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
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
                    Status
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
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
                      <p className="text-black dark:text-white">{packageItem.invoiceDate}</p>
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
                        {selectedCourses.includes(packageItem.name) ? 'Remove' : 'Add'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <button
              type="button"
              className="rounded bg-primary px-6 py-2 text-white hover:bg-primary-dark"
              onClick={() => {
                if (validate()) {
                  handleSubmit(); // Validate form and update localStorage
                  submitToDatabase(); // Send data to the database
                }
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditPackage;
