import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const PackageCreation: React.FC = () => {
  const navigate = useNavigate();

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

  // Function to handle "Next" button click
  const handleNextClick = () => {
    if (validate()) {
      navigate('/course_mapping'); // Navigate to the CourseMapping page
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
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                    value={formData.packageName}
                    onChange={handleInputChange}
                  />
                  {errors.packageName && (
                    <p className="text-red-500 text-sm">{errors.packageName}</p>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    placeholder="Enter the price"
                    className={`w-full rounded border-[1.5px] ${
                      errors.price ? 'border-red-500' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm">{errors.price}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    placeholder="Enter the description"
                    className={`w-full rounded border-[1.5px] ${
                      errors.description ? 'border-red-500' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>

                <button
                  type="button"
                  className="w-1/2 mx-auto rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                  onClick={handleNextClick}
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PackageCreation;
