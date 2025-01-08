import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const EditCourse: React.FC = () => {
  const { course_id } = useParams<{ course_id: string }>(); // Fetch course_id from the URL
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseMessage, setCourseMessage] = useState('');
  const [topics, setTopics] = useState<{ topicId?: string; topicName: string; videoUrl: string }[]>([]);
  const [newTopics, setNewTopics] = useState<{ topicName: string; videoUrl: string }[]>([]); // New topics added
  const [deletedTopics, setDeletedTopics] = useState<string[]>([]); // Track deleted topic IDs

  // Fetch course details on component mount
  useEffect(() => {
    if (course_id) {
      const fetchCourseDetails = async () => {
        try {
          // Fetch course details
          const courseResponse = await fetch(`http://localhost:5000/getspecific_course/${course_id}`);
          if (!courseResponse.ok) {
            throw new Error(`Failed to fetch course details: ${courseResponse.status}`);
          }
          const courseData = await courseResponse.json();
          
          // Update state with the course details
          setCourseName(courseData.course.name);
          setCourseDescription(courseData.course.description);
          setCourseMessage(courseData.message);

          // Fetch topics
          const topicsResponse = await fetch(`http://localhost:5000/gettopics/${course_id}`);
          if (!topicsResponse.ok) {
            throw new Error(`Failed to fetch topics: ${topicsResponse.status}`);
          }
          const topicsData = await topicsResponse.json();
          const mappedTopics = topicsData.topics.map((topic: any) => ({
            topicId: topic.topic_id,
            topicName: topic.topic_name,
            videoUrl: topic.video_url,
          }));
          setTopics(mappedTopics);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchCourseDetails();
    }
  }, [course_id]);

  // Store topics in localStorage
  useEffect(() => {
    localStorage.setItem('newTopics', JSON.stringify(newTopics));
    localStorage.setItem('deletedTopics', JSON.stringify(deletedTopics));
  }, [newTopics, deletedTopics]);

  const handleAddTopic = () => {
    const newTopic = { topicName: '', videoUrl: '' };
    setNewTopics([...newTopics, newTopic]);
  };

  const handleTopicNameChange = (index: number, value: string) => {
    if (index < topics.length) {
      const updatedTopics = [...topics];
      updatedTopics[index].topicName = value;
      setTopics(updatedTopics);
    } else {
      const newIndex = index - topics.length;
      const updatedNewTopics = [...newTopics];
      updatedNewTopics[newIndex].topicName = value;
      setNewTopics(updatedNewTopics);
    }
  };

  const handleVideoUrlChange = (index: number, value: string) => {
    if (index < topics.length) {
      const updatedTopics = [...topics];
      updatedTopics[index].videoUrl = value;
      setTopics(updatedTopics);
    } else {
      const newIndex = index - topics.length;
      const updatedNewTopics = [...newTopics];
      updatedNewTopics[newIndex].videoUrl = value;
      setNewTopics(updatedNewTopics);
    }
  };

  const handleDeleteTopic = (index: number) => {
    if (index < topics.length) {
      const topicId = topics[index].topicId;
      if (topicId) {
        setDeletedTopics([...deletedTopics, topicId]);
      }
      setTopics(topics.filter((_, i) => i !== index));
    } else {
      const newIndex = index - topics.length;
      setNewTopics(newTopics.filter((_, i) => i !== newIndex));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const courseData = {
      course_name: courseName,
      course_description: courseDescription,
      instructor: courseMessage,
      topics: topics.map(topic => ({
        topic_name: topic.topicName,
        video_url: topic.videoUrl,
      })),
    };
  
    try {
      // Update the course details
      const courseResponse = await fetch(`http://localhost:5000/updatecoursedetails/${course_id}`, {
        method: 'PUT', // Use PUT for updating course details
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
  
      if (!courseResponse.ok) {
        console.error('Error updating course');
        return;
      }
  
      // Handle new topics: create them
      for (const topic of newTopics) {
        const topicResponse = await fetch('http://localhost:5000/create-topic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic_name: topic.topicName, video_url: topic.videoUrl, course_id }),
        });
  
        if (!topicResponse.ok) {
          console.error('Error adding new topic');
        }
      }
  
      // Handle deleted topics: delete them
      for (const topicId of deletedTopics) {
        const deleteResponse = await fetch(`http://localhost:5000/delete-topic/${topicId}`, {
          method: 'DELETE',
        });
  
        if (!deleteResponse.ok) {
          console.error('Error deleting topic');
        }
      }
  
      // Fetch the updated course details and topics from the database
      const updatedCourseResponse = await fetch(`http://localhost:5000/getspecific_course/${course_id}`);
      const updatedCourseData = await updatedCourseResponse.json();
      setCourseName(updatedCourseData.course.name);
      setCourseDescription(updatedCourseData.course.description);
      setCourseMessage(updatedCourseData.message);
  
      const updatedTopicsResponse = await fetch(`http://localhost:5000/gettopics/${course_id}`);
      const updatedTopicsData = await updatedTopicsResponse.json();
      const updatedTopics = updatedTopicsData.topics.map((topic: any) => ({
        topicId: topic.topic_id,
        topicName: topic.topic_name,
        videoUrl: topic.video_url,
      }));
      setTopics(updatedTopics);
  
      // Reset local state
      setNewTopics([]);
      setDeletedTopics([]);
      localStorage.removeItem('newTopics');
      localStorage.removeItem('deletedTopics');
  
      alert('Course and topics updated successfully');
      console.log('Course and topics updated successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <>
      <Breadcrumb pageName="Edit Course" />

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
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>

                {/* Course Description Input */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="Enter course description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                {/* Course Message Input */}
                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Description
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type your message"
                    value={courseMessage}
                    onChange={(e) => setCourseMessage(e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                </div>

                {/* Dynamic Topics Section */}
                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Topics <span className="text-meta-1">*</span>
                  </label>
                  {[...topics, ...newTopics].map((topic, index) => (
                    <div key={index} className="flex gap-3 mb-4">
                      <input
                        type="text"
                        placeholder="Topic Name"
                        value={topic.topicName}
                        onChange={(e) => handleTopicNameChange(index, e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        required
                      />
                      <input
                        type="url"
                        placeholder="Video URL"
                        value={topic.videoUrl}
                        onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteTopic(index)}
                        className="text-red-500"
                      >
                                              
                        Delete
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="mt-2 text-primary hover:underline"
                  >
                    Add Topic
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <button
                    type="reset"
                    className="rounded bg-gray-500 py-2 px-6 text-white hover:bg-gray-600"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-primary py-2 px-6 text-white hover:bg-primary-dark"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCourse;

