import { Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Faq from './pages/Faq';
import NotFound from './pages/NotFound';
import CategoryPage from './pages/CategoryPage';
import CalculatorPage from './pages/CalculatorPage';
import { calculatorBySlug, categoryById } from './calculators/meta';

function SlugRoute() {
  const { slug } = useParams();
  const category = categoryById(slug);
  if (category) return <CategoryPage category={category} />;
  const calc = calculatorBySlug(slug);
  if (calc) return <CalculatorPage calc={calc} />;
  return <NotFound />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="faq" element={<Faq />} />
        <Route path=":slug" element={<SlugRoute />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
