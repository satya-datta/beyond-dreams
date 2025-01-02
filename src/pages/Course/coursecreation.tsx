import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CourseCreation: React.FC = () => {
  // State for course info
  const [course_name, setcourse_name] = useState('');
  const [instructor, setinstructor] = useState('');
  const [course_description, setcourse_description] = useState('');

  // State for dynamically added topics
  const [topics, setTopics] = useState<{ topicName: string; videoUrl: string }[]>([]);

  // Validation state
  const [errors, setErrors] = useState<{
    course_name?: string;
    instructor?: string;
    course_description?: string;
    topics?: string[];
  }>({});

  // Add a new topic
  const handleAddTopic = () => {
    setTopics([...topics, { topicName: '', videoUrl: '' }]);
  };

  // Handle topic name change
  const handleTopicNameChange = (index: number, value: string) => {
    const updatedTopics = [...topics];
    updatedTopics[index].topicName = value;
    setTopics(updatedTopics);
  };

  // Handle video URL change
  const handleVideoUrlChange = (index: number, value: string) => {
    const updatedTopics = [...topics];
    updatedTopics[index].videoUrl = value;
    setTopics(updatedTopics);
  };

  // Delete a topic
  const handleDeleteTopic = (index: number) => {
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
  };

  // Validate form data
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!course_name.trim()) newErrors.course_name = 'Course name is required.';
    if (!instructor.trim()) newErrors.instructor = 'Instructor name is required.';
    if (!course_description.trim()) newErrors.course_description = 'Course description is required.';
    if (topics.some(topic => !topic.topicName.trim() || !topic.videoUrl.trim())) {
      newErrors.topics = topics.map((topic, index) => {
        if (!topic.topicName.trim() || !topic.videoUrl.trim()) {
          return `Topic ${index + 1} must have both a name and a valid video URL.`;
        }
        return '';
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to format date
  const formatDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    const courseData = {
      course_name,
      instructor,
      course_description,
      created_time: formatDateTime(new Date()), 
    };
  
    try {
      // Send course details to /create-course
      const courseResponse = await fetch('http://localhost:5000/create-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
  
      if (courseResponse.ok) {
        const courseResult = await courseResponse.json();
        console.log('Course created successfully:', courseResult);
  
        const course_id = courseResult.course_id; // Assuming the response includes the created course ID
  
        // Send each topic to /create-topic
        for (const topic of topics) {
          const topicData = {
            topic_name: topic.topicName,
            video_url: topic.videoUrl,
            course_id, // Associate each topic with the created course
          };
  
          const topicResponse = await fetch('http://localhost:5000/create-topic', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(topicData),
          });
  
          if (!topicResponse.ok) {
            console.error('Error submitting topic:', topicData);
            continue;
          }
  
          console.log('Topic created successfully:', await topicResponse.json());
        }
  
        // Reset the form or show a success message
        setcourse_name('');
        setinstructor('');
        setcourse_description('');
        setTopics([]);
        setErrors({});
        alert('Course and topics created successfully!');
      } else {
        console.error('Error creating course');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  


  return (
    <>
      <Breadcrumb pageName="Course Creation" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-1">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Course</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-7.5">
                {/* Course Name Input */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Course Name <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter course name"
                    value={course_name}
                    onChange={(e) => setcourse_name(e.target.value)}
                    className={`w-full rounded border-[1.5px] ${errors.course_name ? 'border-red-500' : 'border-stroke'} bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white`}
                    required
                  />
                  {errors.course_name && <p className="text-red-500 text-sm">{errors.course_name}</p>}
                </div>

                {/* Course Description Input */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Instructor
                  </label>
                  <input
                    type="text"
                    placeholder="Enter course description"
                    value={instructor}
                    onChange={(e) => setinstructor(e.target.value)}
                    className={`w-full rounded border-[1.5px] ${errors.instructor ? 'border-red-500' : 'border-stroke'} bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white`}
                  />
                  {errors.instructor && <p className="text-red-500 text-sm">{errors.instructor}</p>}
                </div>

                {/* Course Message Input */}
                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Description
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type your message"
                    value={course_description}
                    onChange={(e) => setcourse_description(e.target.value)}
                    className={`w-full rounded border-[1.5px] ${errors.course_description ? 'border-red-500' : 'border-stroke'} bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white`}
                  ></textarea>
                  {errors.course_description && <p className="text-red-500 text-sm">{errors.course_description}</p>}
                </div>

                {/* Dynamic Topics Section */}
                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Topics <span className="text-meta-1">*</span>
                  </label>
                  {topics.map((topic, index) => (
                    <div key={index} className="flex gap-3 mb-4">
                      <input
                        type="text"
                        placeholder="Topic Name"
                        value={topic.topicName}
                        onChange={(e) => handleTopicNameChange(index, e.target.value)}
                        className={`w-full rounded border-[1.5px] ${errors.topics?.[index] ? 'border-red-500' : 'border-stroke'} bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white`}
                        required
                      />
                      <input
                        type="url"
                        placeholder="Video URL"
                        value={topic.videoUrl}
                        onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                        className={`w-full rounded border-[1.5px] ${errors.topics?.[index] ? 'border-red-500' : 'border-stroke'} bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteTopic(index)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                      {errors.topics?.[index] && <p className="text-red-500 text-sm">{errors.topics[index]}</p>}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="w-full rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
                  >
                    Add Topic
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Submit Course
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCreation;
