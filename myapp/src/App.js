import logo from './logo.svg';
import './App.css';
import UserListing from './UserListing';
import toast, { Toaster } from 'react-hot-toast';
function App() {
  return (
    <>
      <Toaster />
      <UserListing />
    </>
  );
}

export default App;
