import React from 'react';
import ReactDOM from 'react-dom/client';
import NomenclatureManager from "./component/NomenclatureManager";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import StorageManager from "./component/StorageManager";
import RequestManager from "./component/RequestManager";
import './styles/Styles.css'
import UserManager from "./component/UserManager";


const root = ReactDOM.createRoot(
  document.getElementById('root')
);



root.render(
  <React.StrictMode>
      <div>

      </div>
      <BrowserRouter>
          <div>
              <nav>
                  <ul>
                      <li><Link to="/UserManager">Авторизация</Link></li>
                      <li><Link to="/NomenclatureManager">Управление номенклатурой</Link></li>
                      <li><Link to="/StorageManager">Управление остатками</Link></li>
                      <li><Link to="/RequestManager">Управление заявками</Link></li>
                      <li><Link to="/">Главная</Link></li>
                  </ul>
              </nav>
          </div>

              <Routes>
                  <Route path="/UserManager" element={<UserManager/>} />
                  <Route path="/NomenclatureManager" element={<NomenclatureManager/>} />
                  <Route path="/StorageManager" element={<StorageManager/>} />
                  <Route path="/RequestManager" element={<RequestManager/>} />
                  <Route path="/"/>
              </Routes>
      </BrowserRouter>
  </React.StrictMode>
);