import React from 'react';
import ReactDOM from 'react-dom/client';
import NomenclatureManager from "./component/NomenclatureManager";
import {BrowserRouter as Router, Link, Route, Routes} from "react-router-dom";
import StorageManager from "./component/StorageManager";

const root = ReactDOM.createRoot(
  document.getElementById('root')
);



root.render(
  <React.StrictMode>
      <Router>
          <div>
              <nav>
                  <ul>
                      <li><Link to="/">Главная</Link></li>
                      <li><Link to="/NomenclatureManager">Управление номенклатурой</Link></li>
                      <li><Link to="/StorageManager">Управление остатками</Link></li>
                      <li></li>
                  </ul>
              </nav>
          </div>

              <Routes>
                  <Route path="/"/>
                  <Route path="/NomenclatureManager" element={<NomenclatureManager/>} />
                  <Route path="/StorageManager" element={<StorageManager/>} />
              </Routes>
      </Router>
  </React.StrictMode>
);