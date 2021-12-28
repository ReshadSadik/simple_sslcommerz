import React from 'react';
import { useEffect } from 'react/cjs/react.development';
import Footer from '../../Shared/Footer/Footer';
import Contacts from '../Contacts/Contacts';
import Header from '../Header/Header';
import Testimonials from '../Testimonials/Testimonials';
import Vehicles from '../Vehicles/Vehicles';

const Home = () => {
  useEffect(() => {
    fetch('http://localhost:5000/cancel', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify('hi'),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        //   window.alert(data.message);
      });
  }, []);

  return (
    <div>
      <Header></Header>
      <Vehicles></Vehicles>
      {/* <AboutCompany></AboutCompany> */}
      <Contacts />
      <Testimonials />
      <Footer></Footer>
    </div>
  );
};

export default Home;
