import { useState } from 'react';
import './index.css'; // Updated to include Tailwind CSS
import InstituteRegistration from './screens/sub-admin/InstituteRegistration';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <InstituteRegistration />
    </>
  );
}

export default App;
