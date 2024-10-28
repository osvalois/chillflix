import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import MoviePage from './pages/MoviePage';
import NotFound from './pages/NotFound';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Profile from './pages/Profile';


const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv-shows" element={<TVShows />} />
        <Route path="/movie/:tmdbId" element={<MoviePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default App;