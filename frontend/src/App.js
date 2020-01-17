import React, { useState, useEffect } from 'react';

import './global.css';
import './App.css';
import './Sidebar.css';
import './Main.css';

import api from './services/api';

import DevForm from './components/DevForm';
import DevItem from './components/DevItem';

function App() {
  const [devs, setDevs] = useState([]);

  useEffect(() => {
    async function loadDevs() {
      const response = await api.get('/devs');

      const data = response.data.map(dev => ({
        ...dev,
        techs: dev.techs.join(', ')
      }));

      setDevs(data);
    }

    loadDevs();
  }, []);

  async function handleAddDev({ github_username, techs, latitude, longitude }) {
    const response = await api.post('/devs', {
      github_username,
      techs,
      latitude,
      longitude
    });

    setDevs([...devs, response.data]);
  }

  return (
    <div id="app">
      <aside>
        <strong>Cadastrar</strong>
        <DevForm onSubmit={handleAddDev} />
      </aside>
      <main>
        <ul>
          {devs.map(dev => (
            <DevItem key={dev._id} dev={dev} />
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
