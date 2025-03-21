// App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import MoviePage from './pages/MoviePage';
import NotFound from './pages/NotFound';
import  Auth  from './pages/Auth';
import { RequireAuth } from './components/Auth/RequireAuth';
import SiteSettings from './pages/SiteSettings';
import NowPlayingPage from './pages/NowPlayingPage';
import TvPageWrapper from './pages/TvPage';

const ProtectedRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:tmdbId" element={<MoviePage />} />
        <Route path="/tv/:tmdbId" element={<TvPageWrapper />} />
        <Route path="/settings" element={<SiteSettings />} />
        <Route path="/now-playing" element={<NowPlayingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <ProtectedRoutes />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

export default App;