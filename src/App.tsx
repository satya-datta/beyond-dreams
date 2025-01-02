import { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import Calendar from './pages/Calendar';
import ECommerce from './pages/Dashboard/ECommerce';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import Content from './pages/Dashboard/Content';
import User from './pages/Dashboard/User';
import CourseCreation from './pages/Course/coursecreation';
import ManageCourse from './pages/Course/managecourse';
import EditCourse from './pages/Course/editcomponent';
import PackageCreation from './pages/Packages/addpackage';
import COURSEMAPPING from './pages/Packages/coursemapping';
import ManagePackage from './pages/Packages/managepackage';
import EditPackage from './pages/Packages/editpackage';

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token); // Set true if token exists
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // PrivateRoute component to protect routes
  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated ? children : <Navigate to="/" replace />;
  };

  return loading ? (
    <Loader />
  ) : (
    <Routes>
      {/* Public Route */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <>
              <PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <SignIn setIsAuthenticated={setIsAuthenticated} />
            </>
          ) : (
            <Navigate to="/ecommerce" replace />
          )
        }
      />

      {/* Protected Routes under DefaultLayout */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <DefaultLayout>
              <Routes>
                <Route
                  path="/ecommerce"
                  element={
                    <>
                      <PageTitle title="eCommerce Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <ECommerce />
                    </>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <>
                      <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <Calendar />
                    </>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <>
                      <PageTitle title="Profile | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <Profile />
                    </>
                  }
                />
                <Route
                  path="/user"
                  element={
                    <>
                      <PageTitle title="User Management | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <User />
                    </>
                  }
                />
                <Route
                  path="/content"
                  element={
                    <>
                      <PageTitle title="Content Management | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <Content />
                    </>
                  }
                />
                <Route
                  path="/forms/form-elements"
                  element={
                    <>
                      <PageTitle title="Form Elements | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <FormElements />
                    </>
                  }
                />
                <Route
                  path="/forms/form-layout"
                  element={
                    <>
                      <PageTitle title="Form Layout | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <FormLayout />
                    </>
                  }
                />
                <Route
                  path="/tables"
                  element={
                    <>
                      <PageTitle title="Tables" />
                      <Tables />
                    </>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <>
                      <PageTitle title="Settings | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <Settings />
                    </>
                  }
                />
                  <Route
          path="/course_creation"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <CourseCreation />
            </>
          }
        />
         <Route
          path="/package_creation"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <PackageCreation />
            </>
          }
        />
          <Route
          path="/course_mapping"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <COURSEMAPPING />
            </>
          }
        />
         <Route
          path="/manage_course"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <ManageCourse />
            </>
          }
        />
          <Route
          path="/manage_package"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <ManagePackage />
            </>
          }
        />
        <Route
          path="/edit-course/:course_id"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <EditCourse />
            </>
          }
        />
         <Route
          path="/edit_package/:id"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <EditPackage/>
            </>
          }
        />
                <Route
                  path="/ui/alerts"
                  element={
                    <>
                      <PageTitle title="Alerts | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <Alerts />
                    </>
                  }
                />
                <Route
                  path="/ui/buttons"
                  element={
                    <>
                      <PageTitle title="Buttons | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                      <Buttons />
                    </>
                  }
                />
              </Routes>
            </DefaultLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
